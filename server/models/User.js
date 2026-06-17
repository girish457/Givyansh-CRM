import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import Company from "./Company.js";
import Shift from "./Shift.js";


const User = sequelize.define("User", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  designation: { type: DataTypes.STRING, allowNull: true },
  role: { 
    type: DataTypes.ENUM("superadmin", "boss", "manager", "tl", "recruiter"), 
    allowNull: false,
    defaultValue: "recruiter"
  },
  status: { 
    type: DataTypes.ENUM("active", "inactive", "leaved"), 
    defaultValue: "active" 
  },
  reportingTo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "users",
      key: "id"
    }
  },
  shiftId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "shifts",
      key: "id"
    }
  },
  lastSeen: {
    type: DataTypes.DATE,
    allowNull: true
  },
  currentActivity: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, { 
  timestamps: true,
  updatedAt: false 
});

// Relationships
User.belongsTo(Company, { foreignKey: "companyId", as: "company" });
User.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
User.belongsTo(User, { foreignKey: "reportingTo", as: "manager_tl" });
User.hasMany(User, { foreignKey: "reportingTo", as: "reports" });
User.belongsTo(Shift, { foreignKey: "shiftId", as: "shift" });

export default User;
