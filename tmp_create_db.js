import { Sequelize } from "sequelize";
const sequelize = new Sequelize("", "root", "", {
    host: "localhost",
    dialect: "mysql",
    logging: false,
});

async function create() {
    try {
        await sequelize.query("CREATE DATABASE IF NOT EXISTS fast_rms;");
        console.log("Database 'fast_rms' created or already exists.");
        process.exit(0);
    } catch (err) {
        console.error("FAIL:", err.message);
        process.exit(1);
    }
}
create();
