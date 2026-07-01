import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const Client = sequelize.define("Client", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    industry: {
        type: DataTypes.STRING,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true
    },
    contactPerson: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active"
    },
    billingDays: {
        type: DataTypes.STRING,
        allowNull: true
    },
    joinings: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    closingDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    gstNo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    paymentConfig: {
        type: DataTypes.TEXT,
        allowNull: true
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
    }
}, {
    tableName: "clients",
    timestamps: false
});

export default Client;
