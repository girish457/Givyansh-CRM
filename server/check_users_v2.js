import { sequelize } from "./db.js";
import User from "./models/User.js";

async function checkUsers() {
    try {
        const users = await User.findAll({ attributes: ["id", "email", "role"] });
        console.log("Current Users in DB:");
        console.log(JSON.stringify(users, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkUsers();
