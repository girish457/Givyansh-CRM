import { User } from "./models/index.js"; // Wait, check if models/index.js exists
import { sequelize } from "./db.js";
import UserModel from "./models/User.js";

async function checkUsers() {
    try {
        const users = await UserModel.findAll({ attributes: ["id", "email", "role"] });
        console.log(JSON.stringify(users, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkUsers();
