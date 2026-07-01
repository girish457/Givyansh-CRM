import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import User from "./User.js";
import Meeting from "./Meeting.js";

const MeetingAttendance = sequelize.define("MeetingAttendance", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  meetingId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  joinTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  leaveTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER, // in seconds
    defaultValue: 0
  },
  cameraUsage: {
    type: DataTypes.FLOAT, // percentage 0.0 to 100.0
    defaultValue: 0.0
  },
  micUsage: {
    type: DataTypes.FLOAT, // percentage 0.0 to 100.0
    defaultValue: 0.0
  },
  screenshareUsage: {
    type: DataTypes.FLOAT, // percentage 0.0 to 100.0
    defaultValue: 0.0
  },
  networkDisconnects: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rejoins: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING, // "joined", "late_joined", "absent", "left_early", "disconnected", "rejoined", "completed"
    defaultValue: "absent"
  },
  rejected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  rejectReason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cameraActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  micActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  screenshareActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastHeartbeat: {
    type: DataTypes.DATE,
    allowNull: true
  },
  handRaised: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  mutedByHost: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  videoDisabledByHost: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  tableName: "meeting_attendances",
  timestamps: false
});

// Relationships
MeetingAttendance.belongsTo(User, { as: "user", foreignKey: "userId" });
MeetingAttendance.belongsTo(Meeting, { as: "meeting", foreignKey: "meetingId" });
Meeting.hasMany(MeetingAttendance, { as: "attendances", foreignKey: "meetingId" });

export default MeetingAttendance;
