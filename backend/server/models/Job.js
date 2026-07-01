import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import Client from "./Client.js";

const Job = sequelize.define("Job", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING, 
        allowNull: false
    },  
    category: {
        type: DataTypes.STRING,
        allowNull: true
    },
    openings: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    jobType: {
        type: DataTypes.ENUM("Full time", "Part time", "Internship", "Freelancing"),
        defaultValue: "Full time"
    },
    workLocationType: {
        type: DataTypes.ENUM("Work from home", "Field Job", "Work from office"),
        defaultValue: "Work from office"
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true
    },
    locality: {
        type: DataTypes.STRING,
        allowNull: true
    },
    gender: {
        type: DataTypes.ENUM("Any", "Male", "Female"),
        defaultValue: "Any"
    },
    qualification: {
        type: DataTypes.ENUM("Any", "10th pass", "12th pass", "Diploma", "Graduate", "Post Graduate"),
        defaultValue: "Any"
    },
    minExp: {
        type: DataTypes.STRING,
        allowNull: true
    },
    maxExp: {
        type: DataTypes.STRING,
        allowNull: true
    },
    salaryType: {
        type: DataTypes.ENUM("Fixed", "Fixed + Incentives"),
        defaultValue: "Fixed"
    },
    salaryRange: {
        type: DataTypes.STRING,
        allowNull: true
    },
    benefits: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    skills: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    assets: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    documents: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    startTime: {
        type: DataTypes.STRING,
        defaultValue: "09:00"
    },
    endTime: {
        type: DataTypes.STRING,
        defaultValue: "18:00"
    },
    workingDays: {
        type: DataTypes.STRING,
        defaultValue: "6 days working"
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    clientId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM("active", "closed"),
        defaultValue: "active"
    },
    isHold: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
    },
    interviewRounds: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1
    },
    round1Name: { type: DataTypes.STRING, allowNull: true },
    round2Name: { type: DataTypes.STRING, allowNull: true },
    round3Name: { type: DataTypes.STRING, allowNull: true },
    round4Name: { type: DataTypes.STRING, allowNull: true },
    round5Name: { type: DataTypes.STRING, allowNull: true }
}, {
    tableName: "jobs",
    timestamps: false
});

// Relationships
Job.belongsTo(Client, { foreignKey: "clientId", as: "client" });

export default Job;


