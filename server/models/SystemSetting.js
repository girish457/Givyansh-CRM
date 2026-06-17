import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const SystemSetting = sequelize.define("SystemSetting", {
    key: { type: DataTypes.STRING, unique: true, allowNull: false },
    value: { type: DataTypes.TEXT, allowNull: false }
});

export default SystemSetting;

