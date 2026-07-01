import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const ContactInquiry = sequelize.define("ContactInquiry", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
    subject: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.ENUM("new", "read", "resolved"), defaultValue: "new" },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

export default ContactInquiry;
