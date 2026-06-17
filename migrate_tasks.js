import { sequelize } from "./server/db.js";

async function run() {
  console.log("Starting tasks table migration...");
  try {
    const queries = [
      // tasks
      "ALTER TABLE tasks ADD COLUMN taskType VARCHAR(255) DEFAULT 'basic'",
      "ALTER TABLE tasks ADD COLUMN targetType VARCHAR(255) NULL",
      "ALTER TABLE tasks ADD COLUMN targetQuantity INT NULL",
      "ALTER TABLE tasks ADD COLUMN completedQuantity INT DEFAULT 0",
      "ALTER TABLE tasks ADD COLUMN customStartDate DATE NULL",
      "ALTER TABLE tasks ADD COLUMN customEndDate DATE NULL",
      "ALTER TABLE tasks ADD COLUMN deadlineTime VARCHAR(255) NULL",
      "ALTER TABLE tasks ADD COLUMN parentTaskId INT NULL",
      "ALTER TABLE tasks ADD COLUMN comments TEXT NULL",
      "ALTER TABLE tasks ADD COLUMN attachments TEXT NULL",
      "ALTER TABLE tasks ADD COLUMN history TEXT NULL",

      // Tasks (with capitalized table name just in case)
      "ALTER TABLE Tasks ADD COLUMN taskType VARCHAR(255) DEFAULT 'basic'",
      "ALTER TABLE Tasks ADD COLUMN targetType VARCHAR(255) NULL",
      "ALTER TABLE Tasks ADD COLUMN targetQuantity INT NULL",
      "ALTER TABLE Tasks ADD COLUMN completedQuantity INT DEFAULT 0",
      "ALTER TABLE Tasks ADD COLUMN customStartDate DATE NULL",
      "ALTER TABLE Tasks ADD COLUMN customEndDate DATE NULL",
      "ALTER TABLE Tasks ADD COLUMN deadlineTime VARCHAR(255) NULL",
      "ALTER TABLE Tasks ADD COLUMN parentTaskId INT NULL",
      "ALTER TABLE Tasks ADD COLUMN comments TEXT NULL",
      "ALTER TABLE Tasks ADD COLUMN attachments TEXT NULL",
      "ALTER TABLE Tasks ADD COLUMN history TEXT NULL"
    ];

    for (const q of queries) {
      try {
        await sequelize.query(q);
        console.log(`Successfully executed: ${q}`);
      } catch (err) {
        if (
          err.message.includes("Duplicate column name") ||
          err.message.includes("already exists") ||
          err.message.includes("doesn't exist") ||
          err.message.includes("Table")
        ) {
          console.log(`Skipped (Expected/Ignored): ${err.message}`);
        } else {
          console.error(`Error executing query "${q}":`, err.message);
        }
      }
    }
    console.log("Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

run();
