import { Op } from "sequelize";
import connectDB, { sequelize } from "./server/db.js";
import User from "./server/models/User.js";
import Shift from "./server/models/Shift.js";
import { Candidate } from "./server/models/Candidate.js";
import Task from "./server/models/Task.js";
import { Attendance, AttendanceLog, BreakLog } from "./server/models/Attendance.js";
import fs from "fs";

async function run() {
    let output = "";
    const log = (msg) => {
        console.log(msg);
        output += msg + "\n";
    };

    try {
        log("1. Connecting to database...");
        await connectDB();
        log("Database connected successfully.");

        log("2. Simulating User.findAll...");
        const users = await User.findAll({
            where: { role: { [Op.in]: ["manager", "tl", "recruiter"] } },
            include: [
                { model: Shift, as: "shift" },
                { model: User, as: "manager_tl", attributes: ["id", "name", "role"] }
            ],
            limit: 5
        });
        log(`Successfully fetched ${users.length} users.`);

        log("3. Simulating Attendance.findAll for today...");
        const todayStrLocal = new Date().toISOString().split('T')[0];
        const attendances = await Attendance.findAll({
            where: { date: todayStrLocal },
            include: [
                { model: BreakLog, as: 'breaks' },
                { model: AttendanceLog, as: 'logs' }
            ],
            limit: 5
        });
        log(`Successfully fetched ${attendances.length} attendances.`);

        log("4. Simulating Candidate.findAll...");
        const candidates = await Candidate.findAll({ limit: 5 });
        log(`Successfully fetched ${candidates.length} candidates.`);

        log("5. Simulating Task.findAll...");
        const tasks = await Task.findAll({ limit: 5 });
        log(`Successfully fetched ${tasks.length} tasks.`);

        log("6. Simulating AttendanceLog.findAll...");
        const attLogs = await AttendanceLog.findAll({
            limit: 5,
            include: [{ model: Attendance, as: "attendance", include: [{ model: User, as: "user", attributes: ["name", "role"] }] }]
        });
        log(`Successfully fetched ${attLogs.length} attendance logs.`);

        log("7. Simulating BreakLog.findAll...");
        const breakLogs = await BreakLog.findAll({
            limit: 5,
            include: [{ model: Attendance, as: "attendance", include: [{ model: User, as: "user", attributes: ["name", "role"] }] }]
        });
        log(`Successfully fetched ${breakLogs.length} break logs.`);

        log("All queries executed successfully. No Sequelize errors!");
    } catch (err) {
        log("!!! DIAGNOSTIC ERROR !!!");
        log(err.stack || err.message);
    } finally {
        fs.writeFileSync("db_diagnostic.txt", output, "utf8");
        process.exit(0);
    }
}

run();
