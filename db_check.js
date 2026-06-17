import { sequelize } from "./server/db.js";
import SystemSetting from "./server/models/SystemSetting.js";

async function run() {
  try {
    const s = await SystemSetting.findOne({where: {key: 'gamification_economy'}});
    console.log('DB Config:', s ? s.value : 'None');
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

run();
