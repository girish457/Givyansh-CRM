import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import Company from "./Company.js";

const Shift = sequelize.define("Shift", {
  name: { type: DataTypes.STRING, allowNull: false },
  startTime: { type: DataTypes.TIME, allowNull: false },
  endTime: { type: DataTypes.TIME, allowNull: false },
  requiredHours: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
  lunchStartTime: { type: DataTypes.TIME, allowNull: true },
  lunchEndTime: { type: DataTypes.TIME, allowNull: true },
  earlyLoginAllowed: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 60 },
  postShiftAllowed: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 120 },
  startDate: { type: DataTypes.DATEONLY, allowNull: true },
  endDate: { type: DataTypes.DATEONLY, allowNull: true }
}, {
  timestamps: true
});

Shift.belongsTo(Company, { foreignKey: "companyId", as: "company" });

export default Shift;
