import { sequelize } from "./backend/server/db.js";
import User from "./backend/server/models/User.js";
import { Candidate, Note } from "./backend/server/models/Candidate.js";
import Task from "./backend/server/models/Task.js";
import Client from "./backend/server/models/Client.js";
import Job from "./backend/server/models/Job.js";
import Vendor from "./backend/server/models/Vendor.js";
import Shift from "./backend/server/models/Shift.js";
import { Attendance, AttendanceLog, BreakLog } from "./backend/server/models/Attendance.js";
import AuditLog from "./backend/server/models/AuditLog.js";
import SourcingPlatform from "./backend/server/models/SourcingPlatform.js";
import { Op } from "sequelize";

// Copy the helper checkCandidateStatusHistory and isCandidateMatch
const checkCandidateStatusHistory = (c, keywords) => {
    if (c.InteractionNotes && Array.isArray(c.InteractionNotes)) {
        return c.InteractionNotes.some(n => {
            const txt = (n.text || "").toLowerCase();
            return keywords.some(kw => txt.includes(kw));
        });
    }
    return false;
};

const isCandidateMatch = (c, stName) => {
    if (!c) return false;
    const rmk = (c.remarks || "").toLowerCase();
    const st = stName.toLowerCase().replace(/[\s_]+/g, "");

    if (rmk === st || rmk.replace(/[\s_]+/g, "") === st) return true;

    const interviewStatuses = ["go for interview", "selected", "joined", "dropped", "process to joining", "process for joining", "hired"];
    const hasInterviewHistory = interviewStatuses.includes(rmk) || !!c.interviewDate || checkCandidateStatusHistory(c, ["go for interview", "interview scheduled", "interview rescheduled", "interviewed", "selected", "joined", "hired", "process to joining", "process for joining", "dropped"]);

    if (st === "selected") {
        if (rmk === "rejected") return false;
        const selectedStatuses = ["selected", "joined", "dropped", "process to joining", "process for joining", "hired", "after selection not interested"];
        return selectedStatuses.includes(rmk) || checkCandidateStatusHistory(c, ["selected", "hired"]);
    }
    if (st === "joined" || st === "hired") {
        if (rmk === "dropped" || rmk === "rejected") return false;
        return rmk === "joined" || rmk === "hired";
    }
    if (st === "rejected") {
        const excludeFromRejected = ["selected", "joined", "dropped", "process to joining", "process for joining", "hired"];
        if (excludeFromRejected.includes(rmk)) return false;
        return rmk === "rejected";
    }
    if (st === "notinterested") {
        return rmk === "not interested";
    }
    if (st === "interested") {
        if (rmk === "not connected") return false;
        const interestedStatuses = ["interested", "selected", "joined", "dropped", "process to joining", "process for joining", "hired", "rejected"];
        return interestedStatuses.includes(rmk) || checkCandidateStatusHistory(c, ["interested", "select", "join", "hired", "process"]);
    }
    if (st === "processtojoining" || st === "joining" || st === "processforjoining" || st === "joiningprocess") {
        const excludeFromJoining = ["joined", "dropped", "rejected", "hired"];
        if (excludeFromJoining.some(ex => rmk.includes(ex))) return false;
        return rmk === "process to joining" || 
               rmk === "process for joining" || 
               rmk === "processing" || 
               rmk.includes("joining") || 
               rmk.includes("process to join") || 
               rmk.includes("processing to join") || 
               rmk.includes("process for join") || 
               rmk.includes("processing for join");
    }
    if (st === "connected") {
        if (hasInterviewHistory) return false;
        return rmk === "connected" || checkCandidateStatusHistory(c, ["connected"]);
    }
    if (st === "notconnected") {
        return rmk === "not connected";
    }
    if (st === "revertlater") {
        return rmk === "revert later" || rmk === "call later";
    }
    if (st === "callnotpick") {
        return rmk === "call not pick" || rmk === "no response" || rmk === "busy";
    }
    if (st === "dropped") {
        return rmk === "dropped";
    }
    if (st === "goforinterview" || st === "interviewscheduled") {
        return hasInterviewHistory;
    }
    return false;
};

async function main() {
    try {
        let companyId = 1; // boss company ID fallback logic
        const dateMode = "last_30";
        let start = new Date();
        let end = new Date();
        const todayStr = new Date().toISOString().split("T")[0];

        const d = new Date();
        d.setDate(d.getDate() - 30);
        start = new Date(d.toISOString().split("T")[0] + "T00:00:00.000Z");
        end = new Date(todayStr + "T23:59:59.999Z");

        console.log("Fetching fundamental tables...");
        const users = await User.findAll({
            where: { companyId },
            include: [
                { model: Shift, as: "shift" },
                { model: User, as: "manager_tl", attributes: ["id", "name", "role"] }
            ]
        });

        const candidates = await Candidate.findAll({
            where: { companyId },
            include: [{ model: Note, as: "InteractionNotes" }]
        });

        const tasks = await Task.findAll({
            where: { companyId }
        });

        const clients = await Client.findAll({
            where: { companyId }
        });

        const jobs = await Job.findAll({
            where: { companyId }
        });

        const vendors = await Vendor.findAll({
            where: { companyId }
        });

        const shifts = await Shift.findAll({
            where: { companyId }
        });

        const attendances = await Attendance.findAll({
            where: {
                [Op.or]: [ { companyId }, { companyId: null } ],
                date: { [Op.between]: [start.toISOString().split("T")[0], end.toISOString().split("T")[0]] }
            },
            include: [
                { model: BreakLog, as: 'breaks' },
                { model: AttendanceLog, as: 'logs' }
            ]
        });

        const todayAttendances = await Attendance.findAll({
            where: {
                [Op.or]: [ { companyId }, { companyId: null } ],
                date: todayStr
            },
            include: [
                { model: BreakLog, as: 'breaks' }
            ]
        });

        console.log("Filtering tables...");
        let filteredUsers = [...users];
        const filteredUserIds = filteredUsers.map(u => u.id);

        let filteredCandidates = candidates.filter(c => {
            const created = new Date(c.createdAt);
            const updated = new Date(c.updatedAt);
            const createdIn = created >= start && created <= end;
            const updatedIn = (c.updatedAt && String(c.updatedAt) !== "Invalid Date") ? (updated >= start && updated <= end) : false;
            let pass = createdIn || updatedIn;

            if (filteredUserIds.length > 0) {
                pass = pass && (filteredUserIds.includes(c.assignedTo) || filteredUserIds.includes(c.addedBy));
            }
            return pass;
        });

        let filteredTasks = tasks.filter(t => {
            const created = new Date(t.createdAt);
            const updated = new Date(t.updatedAt);
            const createdIn = created >= start && created <= end;
            const updatedIn = (t.updatedAt && String(t.updatedAt) !== "Invalid Date") ? (updated >= start && updated <= end) : false;
            let pass = createdIn || updatedIn;

            if (filteredUserIds.length > 0) {
                pass = pass && filteredUserIds.includes(t.assigneeId);
            }
            return pass;
        });

        // 1. EXECUTIVE SUMMARY CALCULATIONS
        const totalManagers = users.filter(u => u.role === "manager").length;
        const totalTls = users.filter(u => u.role === "tl").length;
        const totalRecruiters = users.filter(u => u.role === "recruiter").length;
        const totalEmployees = users.length;

        const activeEmployees = users.filter(u => u.status === "active").length;
        const inactiveEmployees = users.filter(u => u.status !== "active").length;

        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
        const workingEmployees = users.filter(u => u.lastSeen && new Date(u.lastSeen) >= fiveMinsAgo && !todayAttendances.find(a => a.userId === u.id)?.breaks.find(b => !b.endTime)).length;
        const breakEmployees = users.filter(u => u.lastSeen && new Date(u.lastSeen) >= fiveMinsAgo && todayAttendances.find(a => a.userId === u.id)?.breaks.find(b => !b.endTime)).length;
        const offlineEmployees = users.filter(u => !u.lastSeen || new Date(u.lastSeen) < fiveMinsAgo).length;

        let totalWorkingMins = 0;
        let totalBreakMins = 0;
        let lateLoginCount = 0;
        let earlyLoginCount = 0;
        let logoutCount = 0;
        let overtimeCount = 0;

        attendances.forEach(att => {
            if (filteredUserIds.length > 0 && !filteredUserIds.includes(att.userId)) return;
            totalWorkingMins += parseFloat(att.totalWorkingHours || 0) * 60;
            totalBreakMins += parseInt(att.totalBreakTime || 0);
            logoutCount += att.logoutCount || 0;

            if (att.totalOvertime > 0) overtimeCount++;

            const userObj = users.find(u => u.id === att.userId);
            if (userObj && userObj.shift && att.loginTime) {
                const shiftStart = userObj.shift.startTime;
                const loginTimeStr = new Date(att.loginTime).toTimeString().split(' ')[0].substring(0, 5);
                if (loginTimeStr > shiftStart) {
                    lateLoginCount++;
                } else {
                    earlyLoginCount++;
                }
            }
        });

        const totalWorkingHours = (totalWorkingMins / 60).toFixed(2);
        const totalBreakHours = (totalBreakMins / 60).toFixed(2);
        const avgWorkingHours = attendances.length > 0 ? (totalWorkingMins / 60 / attendances.length).toFixed(2) : "0.00";
        const avgBreakTime = attendances.length > 0 ? (totalBreakMins / attendances.length).toFixed(1) + "m" : "0m";

        const regCandidates = filteredCandidates.length;
        const connected = filteredCandidates.filter(c => isCandidateMatch(c, "connected")).length;
        const notConnected = filteredCandidates.filter(c => isCandidateMatch(c, "notconnected")).length;
        const interested = filteredCandidates.filter(c => isCandidateMatch(c, "interested")).length;
        const notInterested = filteredCandidates.filter(c => isCandidateMatch(c, "notinterested")).length;
        const callNotPick = filteredCandidates.filter(c => isCandidateMatch(c, "callnotpick")).length;
        const goForInterview = filteredCandidates.filter(c => isCandidateMatch(c, "goforinterview")).length;
        const selected = filteredCandidates.filter(c => isCandidateMatch(c, "selected")).length;
        const rejected = filteredCandidates.filter(c => isCandidateMatch(c, "rejected")).length;
        const processToJoining = filteredCandidates.filter(c => isCandidateMatch(c, "processtojoining")).length;
        const joined = filteredCandidates.filter(c => isCandidateMatch(c, "joined")).length;
        const dropped = filteredCandidates.filter(c => isCandidateMatch(c, "dropped")).length;

        console.log("Recruitment summary calculated:");
        console.log({
            regCandidates,
            connected,
            notConnected,
            interested,
            notInterested,
            callNotPick,
            goForInterview,
            selected,
            rejected,
            processToJoining,
            joined,
            dropped
        });

    } catch (err) {
        console.error("Test execution failed:", err);
    } finally {
        process.exit();
    }
}
main();
