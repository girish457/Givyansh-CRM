import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import User from "./User.js";

const OtherDocument = sequelize.define("OtherDocument", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: "other_documents",
  timestamps: true
});

OtherDocument.belongsTo(User, { foreignKey: "userId", as: "user" });

export default OtherDocument;
