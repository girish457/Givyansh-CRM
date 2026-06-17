import { sequelize } from "./db.js";
import { Candidate } from "./models/Candidate.js";

async function addSourcingByColumn() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableInfo = await queryInterface.describeTable('Candidates');
    
    if (!tableInfo.sourcingBy) {
      console.log("Adding sourcingBy column to Candidates table...");
      await queryInterface.addColumn('Candidates', 'sourcingBy', {
        type: import('sequelize').DataTypes.STRING,
        allowNull: true
      });
      console.log("Column added successfully.");
    } else {
      console.log("Column sourcingBy already exists.");
    }
  } catch (err) {
    console.error("Error adding column:", err.message);
  } finally {
    process.exit();
  }
}

addSourcingByColumn();
