import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const AuditLog = sequelize.define("AuditLog", {
  action: { type: DataTypes.STRING, allowNull: false },
  details: { type: DataTypes.TEXT, allowNull: true },
  performedBy: { type: DataTypes.STRING, allowNull: false },
}, { 
  timestamps: true,
  updatedAt: false 
});

export default AuditLog;
