import { sequelize } from "./db.js";
import UserModel from "./models/User.js";

async function checkUsers() {
    try {
        const users = await UserModel.findAll({ attributes: ["id", "name", "email", "role", "companyId"] });
        console.log(JSON.stringify(users, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkUsers();
