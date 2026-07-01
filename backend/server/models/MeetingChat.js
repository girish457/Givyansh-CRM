import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import User from "./User.js";
import Meeting from "./Meeting.js";

const MeetingChat = sequelize.define("MeetingChat", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  meetingId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  senderName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  senderRole: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  attachmentUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  attachmentName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "meeting_chats",
  timestamps: false
});

// Relationships
MeetingChat.belongsTo(User, { as: "sender", foreignKey: "senderId" });
MeetingChat.belongsTo(Meeting, { as: "meeting", foreignKey: "meetingId" });
Meeting.hasMany(MeetingChat, { as: "chats", foreignKey: "meetingId" });

export default MeetingChat;
