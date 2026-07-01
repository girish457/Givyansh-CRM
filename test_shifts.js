import connectDB, { sequelize } from "./backend/server/db.js";
import Shift from "./backend/server/models/Shift.js";
import User from "./backend/server/models/User.js";

async function main() {
    try {
        await connectDB();
        console.log("DB connected successfully!");

        const shifts = await Shift.findAll();
        console.log("All Shifts in DB:", shifts.map(s => s.toJSON()));

        const bossUsers = await User.findAll({ where: { role: "boss" } });
        
        console.log("Boss Users:", bossUsers.map(b => ({ id: b.id, name: b.name, email: b.email, companyId: b.companyId })));
    } catch (err) {
        console.error("DIAGNOSTIC ERROR:", err);
    } finally {
        process.exit();
    }
}

main();
