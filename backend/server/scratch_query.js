import connectDB, { sequelize } from "./db.js";
import Task from "./models/Task.js";

import SystemSetting from "./models/SystemSetting.js";

async function queryMasterTasks() {
  try {
    await connectDB();
    const config = await SystemSetting.findOne({ where: { key: "gamification_economy" } });
    if (config) {
      const parsed = JSON.parse(config.value);
      const filtered = {};
      for (const k of Object.keys(parsed)) {
        if (!k.endsWith("Badges")) {
          filtered[k] = parsed[k];
        }
      }
      console.log("Filtered DB Config:", JSON.stringify(filtered, null, 2));
    } else {
      console.log("Config not found in DB");
    }
  } catch (err) {
    console.error("Error querying master tasks:", err);
  } finally {
    process.exit();
  }
}
queryMasterTasks();
