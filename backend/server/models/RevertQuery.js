import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const RevertQuery = sequelize.define("RevertQuery", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  candidateId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  candidateName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  candidateNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  clientName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  jobTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  currentStatus: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recruiterId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  recruiterName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tlId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  tlName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  managerId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  managerName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  queryCreatedTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  queryReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM("Pending", "Resolved By TL", "Resolved By Manager", "Resolved By Boss"),
    defaultValue: "Pending"
  },
  resolverName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resolverRole: {
    type: DataTypes.STRING,
    allowNull: true
  },
  previousStatus: {
    type: DataTypes.STRING,
    allowNull: true
  },
  newStatus: {
    type: DataTypes.STRING,
    allowNull: true
  },
  previousRemark: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  newRemark: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resolutionTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolutionNote: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: "revert_queries",
  timestamps: true
});

export default RevertQuery;
