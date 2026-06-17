import { sequelize } from "./server/db.js";
import connectDB from "./server/db.js";

async function main() {
    await connectDB();
    try {
        console.log("Running migration queries...");
        await sequelize.query("ALTER TABLE Jobs ADD COLUMN isHold BOOLEAN DEFAULT FALSE").catch(e => console.log("Jobs alter failed (might already exist):", e.message));
        await sequelize.query("ALTER TABLE jobs ADD COLUMN isHold BOOLEAN DEFAULT FALSE").catch(e => console.log("jobs alter failed (might already exist):", e.message));
        console.log("Migration finished.");
    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        process.exit();
    }
}
main();
