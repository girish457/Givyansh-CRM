import { sequelize } from "./server/db.js";
import { Attendance, AttendanceLog } from "./server/models/Attendance.js";

async function main() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const atts = await Attendance.findAll({
            where: { date: today },
            include: [{ model: AttendanceLog, as: "logs" }]
        });
        console.log("ATTENDANCES TODAY:", JSON.stringify(atts, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
main();
