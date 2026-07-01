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
  ownerName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  vendorCode: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  altPhone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "India"
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  companyType: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gstNo: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  panNo: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  bankDetails: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contractStart: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  contractEnd: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  commissionRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: "active"
  },
  canSubmitCandidates: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  },
  tlPermission: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  assignedJobs: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lastLoginAt: {
    type: DataTypes.DATE,
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
