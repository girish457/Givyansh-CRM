import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import User from "./User.js";
import Company from "./Company.js";

const Meeting = sequelize.define("Meeting", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  hostId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  agenda: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  meetingType: {
    type: DataTypes.STRING, // "scheduled", "instant"
    defaultValue: "scheduled"
  },
  scheduledDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  scheduledTime: {
    type: DataTypes.STRING, // "15:00"
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER, // in minutes
    defaultValue: 30
  },
  priority: {
    type: DataTypes.STRING, // "normal", "important", "critical", "mandatory"
    defaultValue: "normal"
  },
  status: {
    type: DataTypes.STRING, // "scheduled", "live", "completed", "cancelled", "rejected", "expired", "missed", "rescheduled"
    defaultValue: "scheduled"
  },
  participants: {
    type: DataTypes.TEXT, // JSON string array of user IDs
    allowNull: true
  },
  recordingEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  screenshareEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  cameraEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  micEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  chatEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  aiSummaryEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  recordingUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  transcript: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  summary: {
    type: DataTypes.TEXT, // JSON string summarizing action items, tasks, deadlines
    allowNull: true
  },
  cancellationReason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  rescheduleHistory: {
    type: DataTypes.TEXT, // JSON string of reschedule logs
    allowNull: true
  },
  sharedModule: {
    type: DataTypes.STRING,
    allowNull: true
  },
  presenterId: {
    type: DataTypes.INTEGER,
    allowNull: true
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
  tableName: "meetings",
  timestamps: false
});

// Relationships
Meeting.belongsTo(User, { as: "host", foreignKey: "hostId" });
Meeting.belongsTo(Company, { as: "company", foreignKey: "companyId" });

export default Meeting;
