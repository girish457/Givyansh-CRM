import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const PricingPlan = sequelize.define("PricingPlan", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.STRING, allowNull: false },
    period: { type: DataTypes.STRING, defaultValue: "/mo" },
    description: { type: DataTypes.TEXT, allowNull: false },
    features: { type: DataTypes.JSON, allowNull: false }, // Store as array of strings
    isNeuralChoice: { type: DataTypes.BOOLEAN, defaultValue: false },
    buttonText: { type: DataTypes.STRING, defaultValue: "Get Started" },
    status: { type: DataTypes.ENUM("active", "inactive"), defaultValue: "active" }
});

export default PricingPlan;
