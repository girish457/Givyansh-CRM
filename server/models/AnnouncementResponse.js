import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import User from "./User.js";
import Announcement from "./Announcement.js";

const AnnouncementResponse = sequelize.define("AnnouncementResponse", {
  announcementId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "announcements",
      key: "id"
    },
    onDelete: "CASCADE"
  },
  recruiterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id"
    }
  },
  status: {
    type: DataTypes.ENUM("delivered", "seen", "responded", "ignored", "pending"),
    defaultValue: "pending"
  },
  selectedOptions: {
    type: DataTypes.TEXT, // JSON string array of options selected
    allowNull: true
  },
  manualText: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reaction: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  seenAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  respondedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

AnnouncementResponse.belongsTo(Announcement, { foreignKey: "announcementId", as: "announcement" });
AnnouncementResponse.belongsTo(User, { foreignKey: "recruiterId", as: "recruiter" });
Announcement.hasMany(AnnouncementResponse, { foreignKey: "announcementId", as: "responses" });

export default AnnouncementResponse;
