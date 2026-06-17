import { sequelize } from "./server/db.js";
import { QueryTypes } from "sequelize";

async function migrate() {
    try {
        console.log("Checking partnership mandate columns in 'clients' table...");
        
        // 1. Add billingDays
        try {
            await sequelize.query("ALTER TABLE clients ADD COLUMN billingDays VARCHAR(255) DEFAULT NULL", { type: QueryTypes.RAW });
            console.log("+ Column 'billingDays' added successfully.");
        } catch (e) {
            console.log("! Column 'billingDays' already exists or could not be added.");
        }

        // 2. Add joinings
        try {
            await sequelize.query("ALTER TABLE clients ADD COLUMN joinings INT(11) DEFAULT NULL", { type: QueryTypes.RAW });
            console.log("+ Column 'joinings' added successfully.");
        } catch (e) {
            console.log("! Column 'joinings' already exists or could not be added.");
        }

        // 3. Add closingDate
        try {
            await sequelize.query("ALTER TABLE clients ADD COLUMN closingDate DATETIME DEFAULT NULL", { type: QueryTypes.RAW });
            console.log("+ Column 'closingDate' added successfully.");
        } catch (e) {
            console.log("! Column 'closingDate' already exists or could not be added.");
        }

        console.log("Migration protocols finalized. Re-initiate partnership authorization now.");
        process.exit(0);
    } catch (err) {
        console.error("FATAL: Migration failed:", err.message);
        process.exit(1);
    }
}

migrate();
