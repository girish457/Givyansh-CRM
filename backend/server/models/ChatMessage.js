import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import User from "./User.js";
import Company from "./Company.js";

const ChatMessage = sequelize.define("ChatMessage", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id"
    }
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
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "companies",
      key: "id"
    }
  },
  reactions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  replyToId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  replyToMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: "chat_messages",
  timestamps: true,
  updatedAt: false
});

// Relationships
ChatMessage.belongsTo(User, { foreignKey: "senderId", as: "sender" });
ChatMessage.belongsTo(Company, { foreignKey: "companyId", as: "company" });

export default ChatMessage;
