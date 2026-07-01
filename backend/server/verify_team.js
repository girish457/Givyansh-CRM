import { sequelize } from "./db.js";
import User from "./models/User.js";

async function checkTeam() {
    try {
        // Find the Manager first
        const manager = await User.findOne({ where: { email: "givyansh7790813609@gmail.com" } });
        console.log("Manager Info:", JSON.stringify(manager, null, 2));

        const team = await User.findAll({
            where: {
                companyId: manager.companyId,
                role: ["tl", "recruiter"]
            }
        });
        console.log("Team Members found in DB:", JSON.stringify(team, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkTeam();
