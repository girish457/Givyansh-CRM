import { sequelize } from "./server/db.js";
import { Attendance, AttendanceLog } from "./server/models/Attendance.js";
import Shift from "./server/models/Shift.js";

async function main() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const att = await Attendance.findOne({
            where: { date: today },
            include: [{ model: Shift, as: "shift" }]
        });
        if (!att) {
            console.log("No attendance found for today!");
            return;
        }

        console.log("BEFORE RECALC:");
        console.log("loginTime:", att.loginTime);
        console.log("totalOvertime:", att.totalOvertime);

        const logs = await AttendanceLog.findAll({ where: { attendanceId: att.id } });
        console.log("TODAY LOGS COUNT:", logs.length);
        logs.forEach(l => console.log(`  Log ID: ${l.id}, loginTime: ${l.loginTime}, duration: ${l.duration}`));

        // Run recalculate logic
        // We will call the function or copy the logic to see what it does
        let totalWorkedMins = 0;
        const now = new Date();
        const shiftStart = att.shift ? att.shift.startTime : null;
        console.log("SHIFT START:", shiftStart);

        const firstLog = logs.reduce((earliest, log) => {
            return !earliest || new Date(log.loginTime) < new Date(earliest.loginTime) ? log : earliest;
        }, null);
        console.log("firstLog found:", firstLog ? firstLog.id : "none", "loginTime:", firstLog ? firstLog.loginTime : "none");

        // Try updating it
        await att.update({
            loginTime: firstLog ? firstLog.loginTime : null
        });

        const refreshed = await Attendance.findByPk(att.id);
        console.log("AFTER UPDATE IN DB:");
        console.log("loginTime:", refreshed.loginTime);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
main();
