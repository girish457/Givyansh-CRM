import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sequelize } from "./server/db.js";
import bcrypt from "bcryptjs";

// Import all models
import User from "./server/models/User.js";
import Company from "./server/models/Company.js";
import Shift from "./server/models/Shift.js";
import { Candidate, Note } from "./server/models/Candidate.js";
import Task from "./server/models/Task.js";
import Client from "./server/models/Client.js";
import Vendor from "./server/models/Vendor.js";
import SourcingPlatform from "./server/models/SourcingPlatform.js";
import RevertQuery from "./server/models/RevertQuery.js";
import { Feedback, FeedbackReply } from "./server/models/Feedback.js";
import Announcement from "./server/models/Announcement.js";
import AnnouncementResponse from "./server/models/AnnouncementResponse.js";
import Asset from "./server/models/Asset.js";
import AssetHistory from "./server/models/AssetHistory.js";
import { Attendance, AttendanceLog, BreakLog } from "./server/models/Attendance.js";
import AuditLog from "./server/models/AuditLog.js";
import ChatMessage from "./server/models/ChatMessage.js";
import EmployeeProfile from "./server/models/EmployeeProfile.js";
import Meeting from "./server/models/Meeting.js";
import MeetingAttendance from "./server/models/MeetingAttendance.js";
import MeetingChat from "./server/models/MeetingChat.js";
import MeetingSetting from "./server/models/MeetingSetting.js";
import Notification from "./server/models/Notification.js";
import OtherDocument from "./server/models/OtherDocument.js";
import PointHistory from "./server/models/PointHistory.js";
import { Policy, PolicyAcknowledgement, PolicyAuditLog } from "./server/models/Policy.js";
import PricingPlan from "./server/models/PricingPlan.js";
import SystemSetting from "./server/models/SystemSetting.js";
import UserMetrics from "./server/models/UserMetrics.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const models = [
    Company,
    Shift,
    User,
    Candidate,
    Note,
    Task,
    Client,
    Vendor,
    SourcingPlatform,
    RevertQuery,
    Feedback,
    FeedbackReply,
    Announcement,
    AnnouncementResponse,
    Asset,
    AssetHistory,
    Attendance,
    AttendanceLog,
    BreakLog,
    AuditLog,
    ChatMessage,
    EmployeeProfile,
    Meeting,
    MeetingAttendance,
    MeetingChat,
    MeetingSetting,
    Notification,
    OtherDocument,
    PointHistory,
    Policy,
    PolicyAcknowledgement,
    PolicyAuditLog,
    PricingPlan,
    SystemSetting,
    UserMetrics
  ];

  let sqlDump = `-- GIVYANSH CRM CLEAN PRODUCTION SCHEMA (MySQL)\n`;
  sqlDump += `-- Generated Dynamically from Sequelize Models\n\n`;
  sqlDump += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

  const queryGenerator = sequelize.getQueryInterface().queryGenerator;

  for (const model of models) {
    const tableName = model.tableName;
    console.log(`Generating schema for table: ${tableName}`);
    const sql = queryGenerator.createTableQuery(
      tableName,
      model.rawAttributes,
      model.options
    );
    sqlDump += `-- Table: ${tableName}\n`;
    sqlDump += `${sql};\n\n`;
  }

  // Generate Hashed Password for SuperAdmin
  const superPasswordHash = await bcrypt.hash("7790813609", 12);
  
  sqlDump += `-- Seeding SuperAdmin User\n`;
  sqlDump += `INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`password\`, \`role\`, \`status\`, \`createdAt\`) VALUES\n`;
  sqlDump += `(1, 'Givyansh Master', 'givyansh7790@gmail.com', '${superPasswordHash}', 'superadmin', 'active', NOW());\n\n`;

  sqlDump += `-- Seeding Initial Pricing Plans\n`;
  sqlDump += `INSERT INTO \`pricing_plans\` (\`id\`, \`title\`, \`price\`, \`description\`, \`features\`, \`isNeuralChoice\`, \`buttonText\`, \`createdAt\`, \`updatedAt\`) VALUES\n`;
  sqlDump += `(1, 'Essentials Cluster', '99', 'Precision tools for solo recruiters.', '["5 Nodes", "Logic Sync"]', 0, 'Scale Now', NOW(), NOW()),\n`;
  sqlDump += `(2, 'Business Ecosystem', '299', 'Recruitment OS for modern teams.', '["25 Nodes", "Neural Sorting"]', 1, 'Deploy Growth', NOW(), NOW()),\n`;
  sqlDump += `(3, 'Enterprise Grid', 'Custom', 'Unlimited capabilities for global firms.', '["Unlimited Nodes", "Success Manager"]', 0, 'Contact Ops', NOW(), NOW());\n\n`;

  sqlDump += `-- Seeding System Settings\n`;
  sqlDump += `INSERT INTO \`system_settings\` (\`key\`, \`value\`) VALUES ('yearly_discount', '20');\n\n`;

  sqlDump += `SET FOREIGN_KEY_CHECKS = 1;\n`;

  const outPath = path.resolve(__dirname, "./clean_database.sql");
  fs.writeFileSync(outPath, sqlDump);
  console.log(`Successfully generated clean database SQL dump at: ${outPath}`);
  process.exit(0);
}

main().catch(err => {
  console.error("Failed to generate SQL dump:", err);
  process.exit(1);
});
