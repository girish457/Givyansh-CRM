import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const UserMetrics = sequelize.define("UserMetrics", {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  totalCoins: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  totalSelections: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalJoinings: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  leadShareCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  uniqueCandidatesSourced: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  timestamps: true,
  tableName: "user_metrics"
});

import User from "./User.js";

UserMetrics.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasOne(UserMetrics, { foreignKey: "userId", as: "metrics" });

export default UserMetrics;
