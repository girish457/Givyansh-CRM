import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const Company = sequelize.define("Company", {
  name: { type: DataTypes.STRING, allowNull: false },
  adminEmail: { type: DataTypes.STRING, allowNull: false, unique: true },
  adminPassword: { type: DataTypes.STRING, allowNull: false },
  plan: { 
    type: DataTypes.ENUM("Starter", "Growth Pro", "Enterprise", "Trial", "Yearly", "Monthly", "Custom Enterprise"), 
    defaultValue: "Starter" 
  },
  status: { 
    type: DataTypes.ENUM("active", "suspended", "expired"), 
    defaultValue: "active" 
  },
  portal_boss: { type: DataTypes.BOOLEAN, defaultValue: true },
  portal_manager: { type: DataTypes.BOOLEAN, defaultValue: false },
  portal_tl: { type: DataTypes.BOOLEAN, defaultValue: false },
  portal_recruiter: { type: DataTypes.BOOLEAN, defaultValue: true },
  
  logo: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.STRING, allowNull: true },
  industryType: { type: DataTypes.STRING, allowNull: true },
  monthlyPricing: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  billingCycle: { type: DataTypes.STRING, defaultValue: "Monthly" },
  accountExpiryDate: { type: DataTypes.DATEONLY, allowNull: true },
  
  maxManagers: { type: DataTypes.INTEGER, defaultValue: 5 },
  maxTls: { type: DataTypes.INTEGER, defaultValue: 20 },
  maxRecruiters: { type: DataTypes.INTEGER, defaultValue: 100 },
}, { 
  timestamps: true,
  updatedAt: false 
});

export default Company;
