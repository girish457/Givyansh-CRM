import { Op } from "sequelize";
import { sequelize } from "./db.js";
import User from "./models/User.js";

async function testQuery() {
    try {
        console.log("Starting test query...");
        const team = await User.findAll({
            where: { 
                role: { [Op.in]: ["tl", "recruiter"] } 
            },
            include: [
                { model: User, as: "manager_tl", attributes: ["id", "name"] }
            ]
        });
        console.log("Success! Found", team.length, "members.");
    } catch (err) {
        console.error("CRASHED:", err);
    } finally {
        process.exit();
    }
}

testQuery();
