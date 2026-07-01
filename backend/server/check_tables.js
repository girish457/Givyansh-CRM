import { sequelize } from "./db.js";

async function checkTables() {
    try {
        const tables = await sequelize.getQueryInterface().showAllTables();
        console.log("Tables in DB:", tables);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkTables();
