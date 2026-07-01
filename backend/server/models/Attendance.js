import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import User from "./User.js";
import Shift from "./Shift.js";
import Company from "./Company.js";

export const Attendance = sequelize.define("Attendance", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  shiftId: { type: DataTypes.INTEGER, allowNull: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  loginTime: { type: DataTypes.DATE, allowNull: true },
  logoutTime: { type: DataTypes.DATE, allowNull: true },
  totalWorkingHours: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  totalBreakTime: { type: DataTypes.INTEGER, defaultValue: 0 }, // in minutes
  totalOvertime: { type: DataTypes.INTEGER, defaultValue: 0 }, // in minutes
  status: { 
    type: DataTypes.ENUM('present', 'absent', 'half_day', 'on_leave'), 
    defaultValue: 'present' 
  },
  productivityStatus: { type: DataTypes.STRING, defaultValue: 'Neutral' },
  logoutCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isIdle: { type: DataTypes.BOOLEAN, defaultValue: false },
  companyId: { type: DataTypes.INTEGER, allowNull: true }
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['userId', 'date'] }
  ]
});

export const AttendanceLog = sequelize.define("AttendanceLog", {
  attendanceId: { type: DataTypes.INTEGER, allowNull: false },
  loginTime: { type: DataTypes.DATE, allowNull: false },
  logoutTime: { type: DataTypes.DATE, allowNull: true },
  duration: { type: DataTypes.INTEGER, defaultValue: 0 }, // in minutes
  logoutReason: { type: DataTypes.TEXT, allowNull: true },
  deviceInfo: { type: DataTypes.STRING, allowNull: true },
  browser: { type: DataTypes.STRING, allowNull: true },
  ipAddress: { type: DataTypes.STRING, allowNull: true }
}, {
  timestamps: false
});

export const BreakLog = sequelize.define("BreakLog", {
  attendanceId: { type: DataTypes.INTEGER, allowNull: false },
  startTime: { type: DataTypes.DATE, allowNull: false },
  endTime: { type: DataTypes.DATE, allowNull: true },
  duration: { type: DataTypes.INTEGER, defaultValue: 0 }, // in minutes
  type: { 
    type: DataTypes.ENUM('auto', 'manual', 'lunch'), 
    defaultValue: 'auto' 
  }
}, {
  timestamps: false
});

// Relationships
Attendance.belongsTo(User, { foreignKey: "userId", as: "user" });
Attendance.belongsTo(Shift, { foreignKey: "shiftId", as: "shift" });
Attendance.belongsTo(Company, { foreignKey: "companyId", as: "company" });

Attendance.hasMany(AttendanceLog, { foreignKey: "attendanceId", as: "logs" });
AttendanceLog.belongsTo(Attendance, { foreignKey: "attendanceId", as: "attendance" });

Attendance.hasMany(BreakLog, { foreignKey: "attendanceId", as: "breaks" });
BreakLog.belongsTo(Attendance, { foreignKey: "attendanceId", as: "attendance" });

