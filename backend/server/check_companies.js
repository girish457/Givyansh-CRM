import { sequelize } from "./db.js";
import Company from "./models/Company.js";

async function checkCompanies() {
    try {
        const companies = await Company.findAll();
        console.log(JSON.stringify(companies, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkCompanies();
