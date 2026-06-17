import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import User from "./User.js";
import Company from "./Company.js";

const Vendor = sequelize.define("Vendor", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contactPerson: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
     type: DataTypes.STRING,
     allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  addedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "vendors",
  timestamps: false
});

Vendor.belongsTo(Company, { as: "companyRef", foreignKey: "companyId" });
Vendor.belongsTo(User, { as: "creator", foreignKey: "addedBy" });

export default Vendor;
