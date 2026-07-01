import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import User from "./User.js";

const EmployeeProfile = sequelize.define("EmployeeProfile", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: "users",
      key: "id"
    }
  },
  recruiterNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  joiningDate: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dob: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bloodGroup: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fatherName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  maritalStatus: {
    type: DataTypes.STRING,
    allowNull: true
  },
  marriageDate: {
    type: DataTypes.STRING,
    allowNull: true
  },
  spouseName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nationality: {
    type: DataTypes.STRING,
    allowNull: true
  },
  religion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  personalEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  aadhaarNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  panNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  higherEdDocPath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  higherEdDocName: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: "employee_profiles",
  timestamps: true
});

EmployeeProfile.belongsTo(User, { foreignKey: "userId", as: "user" });

export default EmployeeProfile;
