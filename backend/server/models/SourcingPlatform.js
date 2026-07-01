import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const SourcingPlatform = sequelize.define("SourcingPlatform", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  url: { type: DataTypes.STRING },
  username: { type: DataTypes.STRING },
  password: { type: DataTypes.STRING },
  cost: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "Active" },
  companyId: { type: DataTypes.INTEGER, allowNull: true }
});

export default SourcingPlatform;
