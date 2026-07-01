import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import User from "./User.js";

const Asset = sequelize.define("Asset", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "users",
      key: "id"
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  serialNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  assignedDate: {
    type: DataTypes.STRING,
    allowNull: true
  },
  assignedById: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "users",
      key: "id"
    }
  },
  documentPath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  documentName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM("Active", "Returned", "Damaged", "Replaced"),
    defaultValue: "Active",
    allowNull: false
  }
}, {
  tableName: "assets",
  timestamps: true
});

Asset.belongsTo(User, { foreignKey: "userId", as: "user" });
Asset.belongsTo(User, { foreignKey: "assignedById", as: "assigner" });

export default Asset;
