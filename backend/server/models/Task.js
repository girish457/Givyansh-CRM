import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import User from "./User.js";
import Company from "./Company.js";

const Task = sequelize.define("Task", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  priority: {
    type: DataTypes.STRING, // "low", "medium", "high", "critical", "urgent"
    defaultValue: "medium"
  },
  duration: {
    type: DataTypes.STRING, // "today", "this_week", "this_month", "this_year", "custom", "time_based"
    defaultValue: "today"
  },
  status: {
    type: DataTypes.STRING, // "pending", "in_progress", "completed", "delayed", "overdue", "blocked", "under_review"
    defaultValue: "pending"
  },
  taskType: {
    type: DataTypes.STRING, // "basic", "target"
    defaultValue: "basic"
  },
  targetType: {
    type: DataTypes.STRING, // "clients", "jobs", "vendors", "interviews", "selections", "joined", "connected", "interested"
    allowNull: true
  },
  targetQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  completedQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  customStartDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  customEndDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  deadlineTime: {
    type: DataTypes.STRING, // e.g. "18:00"
    allowNull: true
  },
  parentTaskId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  comments: {
    type: DataTypes.TEXT, // JSON string of comments array
    allowNull: true
  },
  attachments: {
    type: DataTypes.TEXT, // JSON string of attachments array
    allowNull: true
  },
  history: {
    type: DataTypes.TEXT, // JSON string of history array
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  popupShown: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  popupAcknowledged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reminderSent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  expiredPopupSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completionPopupSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: "tasks",
  timestamps: false
});

// Relationships
Task.belongsTo(User, { as: "assigner", foreignKey: "assignerId" });
Task.belongsTo(User, { as: "assignee", foreignKey: "assigneeId" });
Task.belongsTo(Company, { as: "company", foreignKey: "companyId" });
Task.belongsTo(Task, { as: "parent", foreignKey: "parentTaskId" });
Task.hasMany(Task, { as: "subTasks", foreignKey: "parentTaskId" });

export default Task;
