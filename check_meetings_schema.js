const { sequelize } = require('./backend/server/db.js');

async function run() {
  try {
    const [results] = await sequelize.query("DESCRIBE meetings");
    console.log(results);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

run();
