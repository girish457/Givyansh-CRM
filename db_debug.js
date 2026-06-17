import { sequelize } from "./server/db.js";
import fs from "fs";

async function main() {
    let output = "";
    try {
        output += "--- DATABASE DEBUG ---\n";
        
        // Get all tables
        const [tables] = await sequelize.query("SHOW TABLES");
        output += "Tables in DB:\n" + JSON.stringify(tables, null, 2) + "\n\n";
        
        // Describe Users or users table
        try {
            const [usersDesc] = await sequelize.query("DESCRIBE users");
            output += "DESCRIBE users:\n" + JSON.stringify(usersDesc, null, 2) + "\n\n";
        } catch (e) {
            output += "DESCRIBE users failed: " + e.message + "\n\n";
        }
        
        try {
            const [UsersDesc] = await sequelize.query("DESCRIBE Users");
            output += "DESCRIBE Users:\n" + JSON.stringify(UsersDesc, null, 2) + "\n\n";
        } catch (e) {
            output += "DESCRIBE Users failed: " + e.message + "\n\n";
        }

    } catch (err) {
        output += "FATAL ERROR: " + err.stack + "\n";
    } finally {
        fs.writeFileSync("c:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS\\db_debug.txt", output);
        process.exit();
    }
}

main();
