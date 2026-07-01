import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const AssetHistory = sequelize.define("AssetHistory", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  assetId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  assetName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  assetSerialNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  performedById: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  performedByName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  performedByRole: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: "asset_histories",
  timestamps: true,
  updatedAt: false
});

export default AssetHistory;
