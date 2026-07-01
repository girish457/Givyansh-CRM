import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import Company from "./Company.js";

const MeetingSetting = sequelize.define("MeetingSetting", {
  companyId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  moduleEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  maxDuration: {
    type: DataTypes.INTEGER, // in minutes
    defaultValue: 120
  },
  recordingAllowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  screenshareAllowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  chatAllowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  cameraAllowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  micAllowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  aiSummaryAllowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  attendanceRules: {
    type: DataTypes.TEXT, // JSON string representing thresholds
    allowNull: true
  },
  reminderTimings: {
    type: DataTypes.STRING, // comma-separated, e.g., "24h,1h,15m,5m"
    defaultValue: "24h,1h,15m,5m"
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "meeting_settings",
  timestamps: false
});

// Relationships
MeetingSetting.belongsTo(Company, { as: "company", foreignKey: "companyId" });

export default MeetingSetting;
