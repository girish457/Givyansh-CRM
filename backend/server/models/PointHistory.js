import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const PointHistory = sequelize.define("PointHistory", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  candidateId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  actionType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  statusName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pointsAwarded: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  timestamps: true,
  tableName: "point_histories"
});

export default PointHistory;
