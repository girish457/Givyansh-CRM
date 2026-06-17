import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import User from "./User.js";

const Announcement = sequelize.define("Announcement", {
  tlId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id"
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM("normal", "important", "urgent", "critical"),
    defaultValue: "normal"
  },
  type: {
    type: DataTypes.ENUM("simple", "poll", "manual", "mixed"),
    defaultValue: "simple"
  },
  options: {
    type: DataTypes.TEXT, // JSON string array
    allowNull: true
  },
  allowManual: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  responseRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expiredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  targetAssignees: {
    type: DataTypes.TEXT, // JSON string array of recruiter IDs or "all"
    allowNull: true
  },
  attachments: {
    type: DataTypes.TEXT, // JSON string array of files [{name, url, type}]
    allowNull: true
  },
  repeatOption: {
    type: DataTypes.ENUM("none", "daily", "weekly", "monthly", "until_completed"),
    defaultValue: "none"
  }
}, {
  timestamps: true
});

Announcement.belongsTo(User, { foreignKey: "tlId", as: "sender" });

export default Announcement;
