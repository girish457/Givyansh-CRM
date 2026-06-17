import { sequelize } from "./db.js";
import User from "./models/User.js";

async function checkSchema() {
    try {
        const [results] = await sequelize.query("DESCRIBE Users");
        console.log(JSON.stringify(results, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkSchema();
