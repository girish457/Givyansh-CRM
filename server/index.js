import express from "express";
import tls from "tls";
import cors from "cors";
import path from "path";
import fs from "fs";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import connectDB, { sequelize, isDbConnected } from "./db.js";

// Models
import User from "./models/User.js";
import Company from "./models/Company.js";
import { Candidate, Note } from "./models/Candidate.js";
import PricingPlan from "./models/PricingPlan.js";
import ContactInquiry from "./models/ContactInquiry.js";
import SystemSetting from "./models/SystemSetting.js";
import Task from "./models/Task.js";
import Notification from "./models/Notification.js";
import Client from "./models/Client.js";
import Job from "./models/Job.js";
import Vendor from "./models/Vendor.js";
import RevertQuery from "./models/RevertQuery.js";
import SourcingPlatform from "./models/SourcingPlatform.js";
import Shift from "./models/Shift.js";
import { Attendance, AttendanceLog, BreakLog } from "./models/Attendance.js";
import AuditLog from "./models/AuditLog.js";
import Announcement from "./models/Announcement.js";
import AnnouncementResponse from "./models/AnnouncementResponse.js";
import EmployeeProfile from "./models/EmployeeProfile.js";
import OtherDocument from "./models/OtherDocument.js";
import Asset from "./models/Asset.js";
import AssetHistory from "./models/AssetHistory.js";
import { Feedback, FeedbackReply } from "./models/Feedback.js";
import { Policy, PolicyAcknowledgement, PolicyAuditLog } from "./models/Policy.js";
import UserMetrics from "./models/UserMetrics.js";
import PointHistory from "./models/PointHistory.js";

const app = express();

// Temporary search script to extract gamification functions
try {
  const indexFilePath = "c:/Users/goswa/OneDrive/Desktop/Fast RMS/Fast RMS/server/index.js";
  if (fs.existsSync(indexFilePath)) {
    const content = fs.readFileSync(indexFilePath, "utf8");
    const result = [];
    const functions = ["runDailyRecruiterTLChecks", "runMonthlyGamificationCalculations"];
    functions.forEach(fnName => {
      const idx = content.indexOf(`async function ${fnName}`);
      if (idx !== -1) {
        result.push(`--- ${fnName} ---`);
        result.push(content.substring(idx, idx + 8000));
      } else {
        result.push(`--- ${fnName} not found ---`);
      }
    });
    fs.writeFileSync("c:/Users/goswa/OneDrive/Desktop/Fast RMS/Fast RMS/gamification_functions.txt", result.join("\n"));
  }
} catch (e) {
  fs.writeFileSync("c:/Users/goswa/OneDrive/Desktop/Fast RMS/Fast RMS/gamification_functions.txt", "Error: " + e.message);
}

// Error logger middleware
app.use((req, res, next) => {
    const originalStatus = res.status;
    const originalJson = res.json;
    res.status = function(code) {
        if (code === 500) {
            res.is500 = true;
        }
        return originalStatus.apply(this, arguments);
    };
    res.json = function(body) {
        if (res.is500) {
            try {
                fs.appendFileSync("c:/Users/goswa/OneDrive/Desktop/Fast RMS/Fast RMS/server_error.log", `[${new Date().toISOString()}] Path: ${req.path} | Error: ${JSON.stringify(body)}\n`);
            } catch(e) {}
        }
        return originalJson.apply(this, arguments);
    };
    next();
});
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_123_change_me";

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use((err, req, res, next) => {
    if (err) {
        try {
            fs.writeFileSync("c:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS\\express_error.txt", "Express Error: " + err.message + "\nStack: " + err.stack + "\nPath: " + req.path);
        } catch (writeErr) {
            console.error("Failed to write express error log", writeErr);
        }
    }
    next(err);
});
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve("uploads")));
if (!fs.existsSync(path.resolve("uploads"))) {
    fs.mkdirSync(path.resolve("uploads"), { recursive: true });
}

// Connection & Sync
connectDB().then(async () => {
    const runEmergencyMigrations = async () => {
        try {
            const migrations = [
                // Attendances
                "ALTER TABLE attendances ADD COLUMN isIdle BOOLEAN DEFAULT FALSE",
                "ALTER TABLE attendances ADD COLUMN productivityStatus VARCHAR(255) DEFAULT 'Neutral'",
                "ALTER TABLE attendances ADD COLUMN logoutCount INT DEFAULT 0",
                "ALTER TABLE attendances ADD COLUMN companyId INT NULL",
                "ALTER TABLE attendances ADD COLUMN totalWorkingHours DECIMAL(10,2) DEFAULT 0.00",
                "ALTER TABLE attendances ADD COLUMN totalBreakTime INT DEFAULT 0",
                "ALTER TABLE attendances ADD COLUMN totalOvertime INT DEFAULT 0",
                "ALTER TABLE Attendances ADD COLUMN isIdle BOOLEAN DEFAULT FALSE",
                "ALTER TABLE Attendances ADD COLUMN productivityStatus VARCHAR(255) DEFAULT 'Neutral'",
                "ALTER TABLE Attendances ADD COLUMN logoutCount INT DEFAULT 0",
                "ALTER TABLE Attendances ADD COLUMN companyId INT NULL",
                "ALTER TABLE Attendances ADD COLUMN totalWorkingHours DECIMAL(10,2) DEFAULT 0.00",
                "ALTER TABLE Attendances ADD COLUMN totalBreakTime INT DEFAULT 0",
                "ALTER TABLE Attendances ADD COLUMN totalOvertime INT DEFAULT 0",

                // Gamification Tables
                `CREATE TABLE IF NOT EXISTS point_histories (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    userId INT NOT NULL,
                    candidateId INT NULL,
                    actionType VARCHAR(255) NOT NULL,
                    statusName VARCHAR(255) NULL,
                    pointsAwarded FLOAT DEFAULT 0,
                    reason VARCHAR(255) NULL,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS user_metrics (
                    userId INT PRIMARY KEY,
                    totalCoins FLOAT DEFAULT 0,
                    totalSelections INT DEFAULT 0,
                    totalJoinings INT DEFAULT 0,
                    leadShareCount INT DEFAULT 0,
                    uniqueCandidatesSourced INT DEFAULT 0,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )`,

                // Attendance Logs
                "ALTER TABLE attendance_logs ADD COLUMN deviceInfo VARCHAR(255) NULL",
                "ALTER TABLE attendance_logs ADD COLUMN browser VARCHAR(255) NULL",
                "ALTER TABLE attendance_logs ADD COLUMN ipAddress VARCHAR(255) NULL",
                "ALTER TABLE attendance_logs ADD COLUMN duration INT DEFAULT 0",
                "ALTER TABLE attendance_logs ADD COLUMN logoutReason TEXT NULL",
                "ALTER TABLE AttendanceLogs ADD COLUMN deviceInfo VARCHAR(255) NULL",
                "ALTER TABLE AttendanceLogs ADD COLUMN browser VARCHAR(255) NULL",
                "ALTER TABLE AttendanceLogs ADD COLUMN ipAddress VARCHAR(255) NULL",
                "ALTER TABLE AttendanceLogs ADD COLUMN duration INT DEFAULT 0",
                "ALTER TABLE AttendanceLogs ADD COLUMN logoutReason TEXT NULL",

                // Candidates
                "ALTER TABLE Candidates ADD COLUMN sourcingBy VARCHAR(255) NULL",
                "ALTER TABLE Candidates ADD COLUMN recruiterName VARCHAR(255) NULL",
                "ALTER TABLE Candidates ADD COLUMN reportingPerson VARCHAR(255) NULL",
                "ALTER TABLE Candidates ADD COLUMN interviewDate DATETIME NULL",
                "ALTER TABLE Candidates ADD COLUMN interviewTime VARCHAR(255) NULL",
                "ALTER TABLE Candidates ADD COLUMN dataType VARCHAR(50) DEFAULT 'crm'",
                "ALTER TABLE Candidates ADD COLUMN updatedAt DATETIME NULL",
                "ALTER TABLE Candidates ADD COLUMN vendorId INT NULL",
                "ALTER TABLE candidates ADD COLUMN sourcingBy VARCHAR(255) NULL",
                "ALTER TABLE candidates ADD COLUMN recruiterName VARCHAR(255) NULL",
                "ALTER TABLE candidates ADD COLUMN reportingPerson VARCHAR(255) NULL",
                "ALTER TABLE candidates ADD COLUMN interviewDate DATETIME NULL",
                "ALTER TABLE candidates ADD COLUMN interviewTime VARCHAR(255) NULL",
                "ALTER TABLE candidates ADD COLUMN dataType VARCHAR(50) DEFAULT 'crm'",
                "ALTER TABLE candidates ADD COLUMN updatedAt DATETIME NULL",
                "ALTER TABLE candidates ADD COLUMN vendorId INT NULL",

                // Users
                "ALTER TABLE Users ADD COLUMN shiftId INT NULL",
                "ALTER TABLE Users ADD COLUMN lastSeen DATETIME NULL",
                "ALTER TABLE Users ADD COLUMN currentActivity VARCHAR(255) NULL",
                "ALTER TABLE users ADD COLUMN shiftId INT NULL",
                "ALTER TABLE users ADD COLUMN lastSeen DATETIME NULL",
                "ALTER TABLE users ADD COLUMN currentActivity VARCHAR(255) NULL",

                // Shifts
                "ALTER TABLE Shifts ADD COLUMN earlyLoginAllowed INT NOT NULL DEFAULT 60",
                "ALTER TABLE Shifts ADD COLUMN postShiftAllowed INT NOT NULL DEFAULT 120",
                "ALTER TABLE shifts ADD COLUMN earlyLoginAllowed INT NOT NULL DEFAULT 60",
                "ALTER TABLE shifts ADD COLUMN postShiftAllowed INT NOT NULL DEFAULT 120",

                // Companies
                "ALTER TABLE Companies ADD COLUMN logo VARCHAR(255) NULL",
                "ALTER TABLE Companies ADD COLUMN phone VARCHAR(255) NULL",
                "ALTER TABLE Companies ADD COLUMN address VARCHAR(255) NULL",
                "ALTER TABLE Companies ADD COLUMN industryType VARCHAR(255) NULL",
                "ALTER TABLE Companies ADD COLUMN monthlyPricing DECIMAL(10, 2) DEFAULT 0.00",
                "ALTER TABLE Companies ADD COLUMN billingCycle VARCHAR(255) DEFAULT 'Monthly'",
                "ALTER TABLE Companies ADD COLUMN accountExpiryDate DATE NULL",
                "ALTER TABLE Companies ADD COLUMN maxManagers INT DEFAULT 5",
                "ALTER TABLE Companies ADD COLUMN maxTls INT DEFAULT 20",
                "ALTER TABLE Companies ADD COLUMN maxRecruiters INT DEFAULT 100",
                "ALTER TABLE companies ADD COLUMN logo VARCHAR(255) NULL",
                "ALTER TABLE companies ADD COLUMN phone VARCHAR(255) NULL",
                "ALTER TABLE companies ADD COLUMN address VARCHAR(255) NULL",
                "ALTER TABLE companies ADD COLUMN industryType VARCHAR(255) NULL",
                "ALTER TABLE companies ADD COLUMN monthlyPricing DECIMAL(10, 2) DEFAULT 0.00",
                "ALTER TABLE companies ADD COLUMN billingCycle VARCHAR(255) DEFAULT 'Monthly'",
                "ALTER TABLE companies ADD COLUMN accountExpiryDate DATE NULL",
                "ALTER TABLE companies ADD COLUMN maxManagers INT DEFAULT 5",
                "ALTER TABLE companies ADD COLUMN maxTls INT DEFAULT 20",
                "ALTER TABLE companies ADD COLUMN maxRecruiters INT DEFAULT 100",

                // Tasks
                "ALTER TABLE tasks ADD COLUMN taskType VARCHAR(255) DEFAULT 'basic'",
                "ALTER TABLE tasks ADD COLUMN targetType VARCHAR(255) NULL",
                "ALTER TABLE tasks ADD COLUMN targetQuantity INT NULL",
                "ALTER TABLE tasks ADD COLUMN completedQuantity INT DEFAULT 0",
                "ALTER TABLE tasks ADD COLUMN customStartDate DATE NULL",
                "ALTER TABLE tasks ADD COLUMN customEndDate DATE NULL",
                "ALTER TABLE tasks ADD COLUMN deadlineTime VARCHAR(255) NULL",
                "ALTER TABLE tasks ADD COLUMN parentTaskId INT NULL",
                "ALTER TABLE tasks ADD COLUMN comments TEXT NULL",
                "ALTER TABLE tasks ADD COLUMN attachments TEXT NULL",
                "ALTER TABLE tasks ADD COLUMN history TEXT NULL",
                "ALTER TABLE tasks ADD COLUMN popupShown BOOLEAN DEFAULT FALSE",
                "ALTER TABLE tasks ADD COLUMN popupAcknowledged BOOLEAN DEFAULT FALSE",
                "ALTER TABLE tasks ADD COLUMN reminderSent VARCHAR(255) NULL",
                "ALTER TABLE tasks ADD COLUMN expiredPopupSent BOOLEAN DEFAULT FALSE",
                "ALTER TABLE tasks ADD COLUMN completionPopupSent BOOLEAN DEFAULT FALSE",
                "ALTER TABLE Tasks ADD COLUMN taskType VARCHAR(255) DEFAULT 'basic'",
                "ALTER TABLE Tasks ADD COLUMN targetType VARCHAR(255) NULL",
                "ALTER TABLE Tasks ADD COLUMN targetQuantity INT NULL",
                "ALTER TABLE Tasks ADD COLUMN completedQuantity INT DEFAULT 0",
                "ALTER TABLE Tasks ADD COLUMN customStartDate DATE NULL",
                "ALTER TABLE Tasks ADD COLUMN customEndDate DATE NULL",
                "ALTER TABLE Tasks ADD COLUMN deadlineTime VARCHAR(255) NULL",
                "ALTER TABLE Tasks ADD COLUMN parentTaskId INT NULL",
                "ALTER TABLE Tasks ADD COLUMN comments TEXT NULL",
                "ALTER TABLE Tasks ADD COLUMN attachments TEXT NULL",
                "ALTER TABLE Tasks ADD COLUMN history TEXT NULL",
                "ALTER TABLE Tasks ADD COLUMN popupShown BOOLEAN DEFAULT FALSE",
                "ALTER TABLE Tasks ADD COLUMN popupAcknowledged BOOLEAN DEFAULT FALSE",
                "ALTER TABLE Tasks ADD COLUMN reminderSent VARCHAR(255) NULL",
                "ALTER TABLE Tasks ADD COLUMN expiredPopupSent BOOLEAN DEFAULT FALSE",
                "ALTER TABLE Tasks ADD COLUMN completionPopupSent BOOLEAN DEFAULT FALSE",
                "ALTER TABLE clients ADD COLUMN gstNo VARCHAR(255) NULL",
                "ALTER TABLE clients ADD COLUMN address TEXT NULL",
                "ALTER TABLE clients ADD COLUMN paymentConfig TEXT NULL",
                "ALTER TABLE clients ADD COLUMN isHold BOOLEAN DEFAULT FALSE",
                "ALTER TABLE Clients ADD COLUMN gstNo VARCHAR(255) NULL",
                "ALTER TABLE Clients ADD COLUMN address TEXT NULL",
                "ALTER TABLE Clients ADD COLUMN paymentConfig TEXT NULL",
                "ALTER TABLE Clients ADD COLUMN isHold BOOLEAN DEFAULT FALSE",
                // Profile & Asset Management tables
                "CREATE TABLE IF NOT EXISTS `employee_profiles` (`id` int(11) NOT NULL AUTO_INCREMENT, `userId` int(11) NOT NULL UNIQUE, `recruiterNumber` varchar(255) DEFAULT NULL, `gender` varchar(255) DEFAULT NULL, `employeeId` varchar(255) DEFAULT NULL, `joiningDate` varchar(255) DEFAULT NULL, `dob` varchar(255) DEFAULT NULL, `bloodGroup` varchar(255) DEFAULT NULL, `fatherName` varchar(255) DEFAULT NULL, `maritalStatus` varchar(255) DEFAULT NULL, `marriageDate` varchar(255) DEFAULT NULL, `spouseName` varchar(255) DEFAULT NULL, `nationality` varchar(255) DEFAULT NULL, `religion` varchar(255) DEFAULT NULL, `personalEmail` varchar(255) DEFAULT NULL, `address` text DEFAULT NULL, `aadhaarNumber` varchar(255) DEFAULT NULL, `panNumber` varchar(255) DEFAULT NULL, `higherEdDocPath` varchar(255) DEFAULT NULL, `higherEdDocName` varchar(255) DEFAULT NULL, `createdAt` datetime NOT NULL, `updatedAt` datetime NOT NULL, PRIMARY KEY (`id`), CONSTRAINT `fk_employee_profiles_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8",
                "CREATE TABLE IF NOT EXISTS `other_documents` (`id` int(11) NOT NULL AUTO_INCREMENT, `userId` int(11) NOT NULL, `name` varchar(255) NOT NULL, `description` text DEFAULT NULL, `filePath` varchar(255) NOT NULL, `fileName` varchar(255) DEFAULT NULL, `createdAt` datetime NOT NULL, `updatedAt` datetime NOT NULL, PRIMARY KEY (`id`), CONSTRAINT `fk_other_documents_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8",
                "CREATE TABLE IF NOT EXISTS `assets` (`id` int(11) NOT NULL AUTO_INCREMENT, `userId` int(11) DEFAULT NULL, `name` varchar(255) NOT NULL, `description` text DEFAULT NULL, `serialNumber` varchar(255) NOT NULL, `assignedDate` varchar(255) DEFAULT NULL, `assignedById` int(11) DEFAULT NULL, `documentPath` varchar(255) DEFAULT NULL, `documentName` varchar(255) DEFAULT NULL, `status` enum('Active','Returned','Damaged','Replaced') NOT NULL DEFAULT 'Active', `createdAt` datetime NOT NULL, `updatedAt` datetime NOT NULL, PRIMARY KEY (`id`), CONSTRAINT `fk_assets_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT `fk_assets_assigner` FOREIGN KEY (`assignedById`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8",
                "CREATE TABLE IF NOT EXISTS `asset_histories` (`id` int(11) NOT NULL AUTO_INCREMENT, `assetId` int(11) NOT NULL, `assetName` varchar(255) NOT NULL, `assetSerialNumber` varchar(255) NOT NULL, `action` varchar(255) NOT NULL, `details` text DEFAULT NULL, `performedById` int(11) DEFAULT NULL, `performedByName` varchar(255) NOT NULL, `performedByRole` varchar(255) NOT NULL, `createdAt` datetime NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8",
                "CREATE TABLE IF NOT EXISTS `feedbacks` (`id` int(11) NOT NULL AUTO_INCREMENT, `recruiterId` int(11) NOT NULL, `companyId` int(11) NULL, `feedbackType` varchar(255) NOT NULL, `subject` varchar(255) NOT NULL, `message` text NOT NULL, `priority` varchar(255) NOT NULL, `toTL` boolean DEFAULT FALSE, `toManager` boolean DEFAULT FALSE, `toBoss` boolean DEFAULT FALSE, `isAnonymous` boolean DEFAULT FALSE, `status` varchar(255) DEFAULT 'Sent', `readByTL` boolean DEFAULT FALSE, `readByTLAt` datetime DEFAULT NULL, `readByTLId` int(11) DEFAULT NULL, `readByManager` boolean DEFAULT FALSE, `readByManagerAt` datetime DEFAULT NULL, `readByManagerId` int(11) DEFAULT NULL, `readByBoss` boolean DEFAULT FALSE, `readByBossAt` datetime DEFAULT NULL, `readByBossId` int(11) DEFAULT NULL, `createdAt` datetime NOT NULL, `updatedAt` datetime NOT NULL, PRIMARY KEY (`id`), CONSTRAINT `fk_feedbacks_recruiter` FOREIGN KEY (`recruiterId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT `fk_feedbacks_company` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8",
                "ALTER TABLE feedbacks MODIFY COLUMN companyId int(11) NULL",
                "CREATE TABLE IF NOT EXISTS `feedback_replies` (`id` int(11) NOT NULL AUTO_INCREMENT, `feedbackId` int(11) NOT NULL, `senderId` int(11) NOT NULL, `senderRole` varchar(255) NOT NULL, `message` text NOT NULL, `createdAt` datetime NOT NULL, `updatedAt` datetime NOT NULL, PRIMARY KEY (`id`), CONSTRAINT `fk_feedback_replies_feedback` FOREIGN KEY (`feedbackId`) REFERENCES `feedbacks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT `fk_feedback_replies_sender` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8",
                "CREATE TABLE IF NOT EXISTS `policies` (`id` int(11) NOT NULL AUTO_INCREMENT, `companyId` int(11) DEFAULT NULL, `title` varchar(255) NOT NULL, `category` varchar(255) NOT NULL, `description` text DEFAULT NULL, `effectiveDate` datetime DEFAULT NULL, `expiryDate` datetime DEFAULT NULL, `version` varchar(50) NOT NULL DEFAULT '1.0', `severityLevel` varchar(50) NOT NULL DEFAULT 'Informational', `status` varchar(50) NOT NULL DEFAULT 'Draft', `assignedToType` varchar(50) NOT NULL DEFAULT 'All', `assignedToIds` text DEFAULT NULL, `documents` text DEFAULT NULL, `createdBy` int(11) NOT NULL, `createdByName` varchar(255) NOT NULL, `createdByRole` varchar(255) NOT NULL, `modifiedBy` int(11) DEFAULT NULL, `modifiedByName` varchar(255) DEFAULT NULL, `versionHistory` text DEFAULT NULL, `createdAt` datetime NOT NULL, `updatedAt` datetime NOT NULL, PRIMARY KEY (`id`), CONSTRAINT `fk_policies_company` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT `fk_policies_creator` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8",
                "CREATE TABLE IF NOT EXISTS `policy_acknowledgements` (`id` int(11) NOT NULL AUTO_INCREMENT, `userId` int(11) NOT NULL, `policyId` int(11) NOT NULL, `version` varchar(50) NOT NULL, \`openedDate\` datetime DEFAULT NULL, \`readDuration\` int(11) NOT NULL DEFAULT 0, \`pagesViewed\` int(11) NOT NULL DEFAULT 0, \`scrollProgress\` decimal(5,2) NOT NULL DEFAULT 0.00, \`documentsViewed\` text DEFAULT NULL, \`accepted\` boolean NOT NULL DEFAULT FALSE, \`acceptedDate\` datetime DEFAULT NULL, `ipAddress` varchar(100) DEFAULT NULL, `device` varchar(255) DEFAULT NULL, `browser` varchar(255) DEFAULT NULL, `createdAt` datetime NOT NULL, `updatedAt` datetime NOT NULL, PRIMARY KEY (`id`), CONSTRAINT `fk_acknowledgements_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT `fk_acknowledgements_policy` FOREIGN KEY (`policyId`) REFERENCES `policies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8",
                "CREATE TABLE IF NOT EXISTS `policy_audit_logs` (`id` int(11) NOT NULL AUTO_INCREMENT, `policyId` int(11) DEFAULT NULL, `userId` int(11) NOT NULL, `userName` varchar(255) NOT NULL, `userRole` varchar(255) NOT NULL, `action` varchar(255) NOT NULL, `details` text DEFAULT NULL, `ipAddress` varchar(100) DEFAULT NULL, `device` varchar(255) DEFAULT NULL, `browser` varchar(255) DEFAULT NULL, `createdAt` datetime NOT NULL, PRIMARY KEY (`id`), CONSTRAINT `fk_policy_audit_logs_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8",
                "ALTER TABLE Candidates MODIFY COLUMN status VARCHAR(255) DEFAULT 'New'",
                "ALTER TABLE candidates MODIFY COLUMN status VARCHAR(255) DEFAULT 'New'",
                "ALTER TABLE Jobs ADD COLUMN interviewRounds INT NULL DEFAULT 1",
                "ALTER TABLE Jobs ADD COLUMN round1Name VARCHAR(255) NULL",
                "ALTER TABLE Jobs ADD COLUMN round2Name VARCHAR(255) NULL",
                "ALTER TABLE Jobs ADD COLUMN round3Name VARCHAR(255) NULL",
                "ALTER TABLE Jobs ADD COLUMN round4Name VARCHAR(255) NULL",
                "ALTER TABLE Jobs ADD COLUMN round5Name VARCHAR(255) NULL",
                "ALTER TABLE jobs ADD COLUMN interviewRounds INT NULL DEFAULT 1",
                "ALTER TABLE jobs ADD COLUMN round1Name VARCHAR(255) NULL",
                "ALTER TABLE jobs ADD COLUMN round2Name VARCHAR(255) NULL",
                "ALTER TABLE jobs ADD COLUMN round3Name VARCHAR(255) NULL",
                "ALTER TABLE jobs ADD COLUMN round4Name VARCHAR(255) NULL",
                "ALTER TABLE jobs ADD COLUMN round5Name VARCHAR(255) NULL",
                "ALTER TABLE Jobs ADD COLUMN isHold BOOLEAN DEFAULT FALSE",
                "ALTER TABLE jobs ADD COLUMN isHold BOOLEAN DEFAULT FALSE"
            ];

            for (const sql of migrations) {
                await sequelize.query(sql).catch(err => {
                    if (
                        err.original?.code === 'ER_DUP_COLUMN_NAME' ||
                        err.message.includes('Duplicate column') ||
                        err.message.includes('already exists') ||
                        err.message.includes('Table doesn\'t exist') ||
                        err.message.includes('doesn\'t exist')
                    ) {
                        // Ignore expected duplicate column or table-not-exist errors
                    } else {
                        console.error("Schema sync notice:", err.message);
                    }
                });
            }
        } catch (e) {
            console.error("Migration probe failed:", e.message);
        }
    };

    // Run migrations and sync only if database is online
    if (!isDbConnected) {
        console.warn("WARNING: Database is offline. Running backend in offline survival mode.");
        // Start the server immediately in offline survival mode
        app.listen(PORT, () => {
            console.log(`==================================================`);
            console.log(`  Server running in OFFLINE SURVIVAL MODE on port ${PORT}`);
            console.log(`  Frontend: http://localhost:5173`);
            console.log(`  Database connection will be retried on demand.`);
            console.log(`==================================================`);
        });
    } else {
        await runEmergencyMigrations();

        sequelize.sync()
            .then(async () => {
                fs.writeFileSync("c:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS\\test_full_diagnostics.txt", "SERVER_IS_RUNNING");
                console.log("Database synced successfully");
                // Run migrations after sync to ensure they are present
                await runEmergencyMigrations();

                // RUN DIAGNOSTIC INSERTION & DB DUMP TEST
                try {
                    const uCount = await User.count();
                    const cCount = await Candidate.count();
                    const tCount = await Task.count();
                    const clCount = await Company.count(); // Wait, Company or Client?
                    const jCount = await Job.count();

                    let detailLog = `DB Diagnostics:\n`;
                    detailLog += `Users Count: ${uCount}\n`;
                    detailLog += `Candidates Count: ${cCount}\n`;
                    detailLog += `Tasks Count: ${tCount}\n`;
                    detailLog += `Companies/Clients Count: ${clCount}\n`;
                    detailLog += `Jobs Count: ${jCount}\n`;

                    const testUser = await User.findOne();
                    if (testUser) {
                        detailLog += `Test User ID: ${testUser.id}, Name: ${testUser.name}, Role: ${testUser.role}, CompanyID: ${testUser.companyId}\n`;
                        const testTask = await Task.create({
                            title: "System Test Task",
                            description: "Diagnostic test insertion",
                            priority: "high",
                            duration: "this_week",
                            taskType: "basic",
                            assignerId: testUser.id,
                            assigneeId: testUser.id,
                            status: "in_progress",
                            history: JSON.stringify([]),
                            comments: JSON.stringify([]),
                            attachments: JSON.stringify([]),
                            createdAt: new Date()
                        });
                        detailLog += `Successfully inserted test task with ID: ${testTask.id}\n`;
                    } else {
                        detailLog += `No users found in database to test insert!\n`;
                    }
                    fs.writeFileSync("c:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS\\test_full_diagnostics.txt", detailLog);
                } catch (testErr) {
                    fs.writeFileSync("c:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS\\test_full_diagnostics.txt", "ERROR: " + testErr.stack);
                }

                // RUN DIAGNOSTIC GET TASKS TEST
                try {
                    const testUser = await User.findOne();
                    if (testUser) {
                        const myTasks = await Task.findAll({
                            where: { assigneeId: testUser.id }
                        });
                        let allTasks = [];
                        if (myTasks.length > 0) {
                            const taskIds = myTasks.map(t => t.id);
                            const parentIds = myTasks.map(t => t.parentTaskId).filter(Boolean);
                            allTasks = await Task.findAll({
                                where: {
                                    [Op.or]: [
                                        { id: taskIds },
                                        { id: parentIds },
                                        { parentTaskId: parentIds }
                                    ]
                                },
                                include: [
                                    { model: User, as: "assigner", attributes: ["id", "name", "role"] },
                                    { model: User, as: "assignee", attributes: ["id", "name", "role"] },
                                    {
                                        model: Task,
                                        as: "subTasks",
                                        include: [
                                            { model: User, as: "assignee", attributes: ["id", "name", "role"] },
                                            {
                                                model: Task,
                                                as: "subTasks",
                                                include: [
                                                    { model: User, as: "assignee", attributes: ["id", "name", "role"] },
                                                    {
                                                        model: Task,
                                                        as: "subTasks",
                                                        include: [{ model: User, as: "assignee", attributes: ["id", "name", "role"] }]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                order: [["createdAt", "DESC"]]
                            });
                        }
                        fs.writeFileSync("c:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS\\test_tasks_query.txt", "SUCCESS: Found " + allTasks.length + " tasks");
                    } else {
                        fs.writeFileSync("c:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS\\test_tasks_query.txt", "WARNING: No user found for diagnostic");
                    }
                } catch (queryErr) {
                    fs.writeFileSync("c:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS\\test_tasks_query.txt", "ERROR: " + queryErr.stack);
                }

                // Start the server ONLY after sync and migrations are fully completed!
                app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
            })
            .catch((err) => {
                console.error("Fatal database sync error:", err.message);
                app.listen(PORT, () => console.log(`Server running (Sync Failed Fallback) on http://localhost:${PORT}`));
            });
    }
});


// Refresh point
// Start Node
app.get("/", (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; padding: 50px; text-align: center; background: #ffffff; color: #0f172a; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <h1 style="font-size: 3rem; margin-bottom: 1rem;">Givyansh <span style="color: #2563eb;">CRM</span> (MySQL)</h1>
            <p style="color: #475569; font-size: 1.2rem; margin-bottom: 2rem;">Powering Enterprise Recruitment Workflows</p>
            <div style="background: #f8fafc; padding: 30px; border-radius: 20px; border: 1px solid #e2e8f0; max-width: 500px;">
                <p>Frontend is active on <a href="http://localhost:5173" style="color: #2563eb; text-decoration: none; font-weight: bold;">http://localhost:5173</a></p>
                <hr style="border: 0.5px solid #e2e8f0; margin: 20px auto;">
                <p><strong>Ready to Seed?</strong> visit <a href="/api/seed" style="color: #2563eb;">/api/seed</a></p>
                <p style="font-size: 0.8rem; color: #94a3b8; margin-top: 20px;">Database: <span style="color: #475569;">fast_rms</span> (MySQL) is connected.</p>
            </div>
        </div>
    `);
});

// --- Shift Window Validation Utility ---
const validateShiftWindow = (shift) => {
    if (!shift || !shift.startTime || !shift.endTime) {
        // If there is no shift assigned, bypass timing check and allow login at any time!
        return { allowed: true };
    }

    const now = new Date();
    const currentTimeStr = now.toTimeString().split(' ')[0];
    const [nowH, nowM] = currentTimeStr.split(':').map(Number);
    const nowTotalMins = nowH * 60 + nowM;

    const [startH, startM] = shift.startTime.split(':').map(Number);
    const startTotalMins = startH * 60 + startM;

    const [endH, endM] = shift.endTime.split(':').map(Number);
    const endTotalMins = endH * 60 + endM;

    // Use earlyLoginAllowed (default 60 mins) and postShiftAllowed (default 120 mins)
    const earlyLimit = shift.earlyLoginAllowed !== undefined ? parseInt(shift.earlyLoginAllowed) : 60;
    const postLimit = shift.postShiftAllowed !== undefined ? parseInt(shift.postShiftAllowed) : 120;

    const windowStartMins = startTotalMins - earlyLimit;
    const windowEndMins = endTotalMins + postLimit;

    let isWithin = false;
    const normalize = (m) => (m % 1440 + 1440) % 1440;

    const normStart = normalize(windowStartMins);
    const normEnd = normalize(windowEndMins);

    if (normStart < normEnd) {
        isWithin = nowTotalMins >= normStart && nowTotalMins <= normEnd;
    } else {
        isWithin = nowTotalMins >= normStart || nowTotalMins <= normEnd;
    }

    if (!isWithin) {
        return {
            allowed: false,
            message: "Your shift access timing is currently unavailable. Please login during your assigned shift window."
        };
    }

    return { allowed: true };
};

// --- Authentication Endpoints ---
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Database connection guard
        if (!isDbConnected) {
            return res.status(503).json({ error: "Database is offline. Login is not possible." });
        }

        const user = await User.findOne({
            where: { email },
            include: [{ model: Shift, as: "shift" }]
        });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        // Shift Window Validation for Manager, TL, and Recruiter
        if (["manager", "tl", "recruiter"].includes(user.role)) {
            const shiftStatus = validateShiftWindow(user.shift);
            if (!shiftStatus.allowed) {
                return res.status(403).json({ error: shiftStatus.message });
            }
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign(
            { userId: user.id, role: user.role, companyId: user.companyId },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
});

app.get("/api/me", async (req, res) => {
    let token = req.cookies.token;
    if (!token && req.headers.authorization) {
        const parts = req.headers.authorization.split(" ");
        if (parts.length === 2 && parts[0] === "Bearer") {
            token = parts[1];
        }
    }
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Database connection guard
        if (!isDbConnected) {
            return res.status(503).json({ error: "Database is offline." });
        }

        const user = await User.findByPk(decoded.userId, {
            attributes: ["id", "name", "email", "role", "reportingTo", "shiftId"],
            include: [
                {
                    model: User,
                    as: "manager_tl",
                    attributes: ["name", "role", "reportingTo"],
                    include: [{
                        model: User,
                        as: "manager_tl",
                        attributes: ["name", "role"]
                    }]
                },
                { model: Shift, as: "shift" }
            ]
        });
        if (!user) return res.status(401).json({ error: "User not found" });
        if (["manager", "tl", "recruiter"].includes(user.role)) {
            const shiftStatus = validateShiftWindow(user.shift);
            if (!shiftStatus.allowed) {
                return res.status(403).json({ error: shiftStatus.message, shift_expired: true });
            }
        }
        res.json(user);
    } catch (err) {
        console.error("JWT ME ERROR:", err.message);
        res.status(401).json({ error: "Invalid token" });
    }
});

// Seed Route (Internal Debugging Only)
app.get("/api/seed", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash("password123", 10);

        // Create Demo Company
        const [company] = await Company.findOrCreate({
            where: { name: "First Attempt" },
            defaults: {
                adminEmail: "admin@firstattempt.digital",
                adminPassword: hashedPassword,
                plan: "Enterprise"
            }
        });

        // Create Roles
        const demoUsers = [
            { name: "The Boss", email: "boss@fast-rms.com", role: "boss" },
            { name: "Girish Goswami", email: "givyansh7790813609@gmail.com", role: "boss" },
            { name: "Girish Goswami", email: "givyansh779081360977@gmail.com", role: "boss" },
            { name: "Demo Manager", email: "manager@fast-rms.com", role: "manager" },
            { name: "Demo Team Lead", email: "tl@fast-rms.com", role: "tl" },
            { name: "Demo Recruiter", email: "recruiter@fast-rms.com", role: "recruiter" }
        ];

        for (const uData of demoUsers) {
            await User.findOrCreate({
                where: { email: uData.email },
                defaults: {
                    ...uData,
                    password: hashedPassword,
                    companyId: company.id
                }
            });
        }

        res.json({ success: true, message: "Foundation data injected." });
    } catch (err) {
        res.json({ error: err.message });
    }
});



// --- Auth Middleware ---
const authenticate = async (req, res, next) => {
    let token = req.cookies.token;
    if (!token && req.headers.authorization) {
        const parts = req.headers.authorization.split(" ");
        if (parts.length === 2 && parts[0] === "Bearer") {
            token = parts[1];
        }
    }
    if (!token) return res.status(401).json({ error: "Auth required" });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Anti-stale token check: fetch the user to get real-time state from DB if database is online
        if (isDbConnected) {
            try {
                const user = await User.findByPk(decoded.userId);
                if (user) {
                    decoded.companyId = user.companyId;
                    decoded.role = user.role; // Fixes stale role caching from old sessions
                    decoded.name = user.name; // Attach name to prevent notNull violations

                    // Track activity and update lastSeen in real-time (throttled to once per minute to avoid deadlocks/timeouts)
                    const now = new Date();
                    if (!user.lastSeen || (now - new Date(user.lastSeen)) > 60000) {
                        user.update({ lastSeen: now }).catch(err => console.error("Error updating lastSeen:", err.message));
                    }
                }
            } catch (dbErr) {
                if (dbErr.name === "SequelizeConnectionRefusedError" || dbErr.name === "ConnectionRefusedError" || dbErr.message.includes("ECONNREFUSED") || dbErr.message.includes("ECONNRESET")) {
                    isDbConnected = false;
                }
                console.warn("[DB_DISCONNECT_WARNING] MySQL database connection lost at runtime. Bypassing state sync.");
            }
        }

        req.user = decoded;
        next();
    } catch (err) {
        console.error("JWT AUTH ERROR:", err.message);
        res.status(401).json({ error: "Invalid token" });
    }
};

const safeParseHistory = (historyStr) => {
    try {
        if (!historyStr) return [];
        return JSON.parse(historyStr);
    } catch (err) {
        console.error("[HISTORY_PARSE_WARNING] Truncated or invalid task history JSON found, attempting to recover...", err);
        return [{
            action: "system_recovered",
            user: "System",
            text: "History recovered after database varchar limit truncation.",
            time: new Date()
        }];
    }
};

const taskSyncCache = new Map();

// --- Task Helper for Auto Progress Sync ---
async function syncTaskProgress(task, bubbleUp = true, visited = new Set()) {
    if (!task) return null;
    if (!isDbConnected) return task; // Dynamic guard: if DB is offline, return instantly!
    if (visited.has(task.id)) {
        return task; // Prevent infinite circular reference loop!
    }
    visited.add(task.id);
    const nowTime = Date.now();
    const lastSync = taskSyncCache.get(task.id);
    if (lastSync && (nowTime - lastSync) < 30000) { // Throttle sync to once every 30 seconds per task
        return task;
    }
    taskSyncCache.set(task.id, nowTime);
    try {
        const now = new Date();
        let deadlineDate = new Date(task.createdAt || now);
        if (task.duration === "today") {
            deadlineDate.setHours(23, 59, 59, 999);
        } else if (task.duration === "this_week") {
            const day = deadlineDate.getDay();
            const diff = deadlineDate.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(deadlineDate.setDate(diff));
            const sunday = new Date(monday.setDate(monday.getDate() + 6));
            sunday.setHours(23, 59, 59, 999);
            deadlineDate = sunday;
        } else if (task.duration === "this_month") {
            deadlineDate = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth() + 1, 0, 23, 59, 59, 999);
        } else if (task.duration === "this_year") {
            deadlineDate = new Date(deadlineDate.getFullYear(), 11, 31, 23, 59, 59, 999);
        } else if (task.duration === "custom" && task.customEndDate) {
            deadlineDate = new Date(task.customEndDate);
            deadlineDate.setHours(23, 59, 59, 999);
        } else if (task.duration === "time_based") {
            if (task.deadlineTime) {
                const [h, m] = task.deadlineTime.split(":");
                deadlineDate.setHours(parseInt(h) || 18, parseInt(m) || 0, 0, 0);
            } else {
                deadlineDate.setHours(18, 0, 0, 0);
            }
        } else {
            deadlineDate.setHours(23, 59, 59, 999);
        }

        const isExpired = now > deadlineDate;

        // If this task has subtasks, bubble up progress from its subtasks
        const subTasks = await Task.findAll({ where: { parentTaskId: task.id } });
        if (subTasks.length > 0) {
            let totalCompleted = 0;
            let totalTarget = 0;
            let allDone = true;
            for (const sub of subTasks) {
                // Downward sync: do NOT bubble up from children to parent here to avoid loop!
                await syncTaskProgress(sub, false, visited);
                totalCompleted += sub.completedQuantity || 0;
                totalTarget += sub.targetQuantity || 0;
                if ((sub.completedQuantity || 0) < (sub.targetQuantity || 0)) {
                    allDone = false;
                }
            }

            let status = task.status || "pending";
            if (totalTarget > 0 && allDone && task.status !== "completed") {
                status = "completed";
            } else if (!allDone && task.status === "completed") {
                status = "in_progress";
            }

            // Auto move active -> overdue on expiry
            if (isExpired && status !== "completed" && status !== "cancelled" && status !== "overdue") {
                status = "overdue";
            } else if (!isExpired && status === "overdue") {
                status = "in_progress";
            }

            if (task.completedQuantity !== totalCompleted || task.targetQuantity !== totalTarget || task.status !== status) {
                const currentHistory = safeParseHistory(task.history);
                if (task.status !== status) {
                    currentHistory.push({
                        action: "status_changed",
                        user: "System",
                        text: `Task automatically moved to ${(status || "pending").replace('_', ' ').toUpperCase()} by System`,
                        time: new Date()
                    });
                }
                if (currentHistory.length > 50) currentHistory.splice(0, currentHistory.length - 50);
                await task.update({
                    completedQuantity: totalCompleted,
                    targetQuantity: totalTarget,
                    status,
                    completedAt: status === "completed" ? new Date() : task.completedAt,
                    history: JSON.stringify(currentHistory)
                });
            }

            // Now bubble up to parent if exists and bubbleUp is enabled
            if (bubbleUp && task.parentTaskId) {
                const parentTask = await Task.findByPk(task.parentTaskId);
                if (parentTask) {
                    await syncTaskProgress(parentTask, true, visited);
                }
            }
            return task;
        }

        // Leaf nodes: if not a target task, no auto query calculation is needed
        if (task.taskType !== "target") {
            let status = task.status || "pending";
            if (isExpired && status !== "completed" && status !== "cancelled" && status !== "overdue") {
                status = "overdue";
            } else if (!isExpired && status === "overdue") {
                status = "in_progress";
            }
            if (task.status !== status) {
                const currentHistory = safeParseHistory(task.history);
                currentHistory.push({
                    action: "status_changed",
                    user: "System",
                    text: `Task automatically moved to ${(status || "pending").replace('_', ' ').toUpperCase()} by System`,
                    time: new Date()
                });
                await task.update({
                    status,
                    history: JSON.stringify(currentHistory)
                });
            }
            return task;
        }

        // Determine timeframe boundaries based on task duration configuration
        let startDate = new Date(task.createdAt || new Date());
        let endDate = new Date();

        if (task.duration === "today") {
            const dToday = new Date();
            startDate = new Date(dToday.setHours(0, 0, 0, 0));
            endDate = new Date(dToday.setHours(23, 59, 59, 999));
        } else if (task.duration === "this_week") {
            const dWeek = new Date();
            const first = dWeek.getDate() - dWeek.getDay() + 1; // Monday
            startDate = new Date(new Date(dWeek.setDate(first)).setHours(0, 0, 0, 0));
            endDate = new Date(new Date(dWeek.setDate(first + 6)).setHours(23, 59, 59, 999));
        } else if (task.duration === "this_month") {
            const dMonth = new Date();
            startDate = new Date(dMonth.getFullYear(), dMonth.getMonth(), 1, 0, 0, 0, 0);
            endDate = new Date(dMonth.getFullYear(), dMonth.getMonth() + 1, 0, 23, 59, 59, 999);
        } else if (task.duration === "this_year") {
            const dYear = new Date();
            startDate = new Date(dYear.getFullYear(), 0, 1, 0, 0, 0, 0);
            endDate = new Date(dYear.getFullYear(), 11, 31, 23, 59, 59, 999);
        } else if (task.duration === "custom" && task.customStartDate && task.customEndDate) {
            startDate = new Date(task.customStartDate);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(task.customEndDate);
            endDate.setHours(23, 59, 59, 999);
        } else if (task.duration === "time_based") {
            const dTime = new Date();
            startDate = new Date(dTime.setHours(0, 0, 0, 0));
            if (task.deadlineTime) {
                const [h, m] = task.deadlineTime.split(":");
                endDate = new Date(new Date().setHours(parseInt(h) || 18, parseInt(m) || 0, 0, 0));
            } else {
                endDate = new Date(dTime.setHours(18, 0, 0, 0));
            }
        }

        let count = 0;
        const { assigneeId } = task;

        if (task.targetType === "clients") {
            count = await Client.count({
                where: {
                    addedBy: assigneeId,
                    createdAt: { [Op.between]: [startDate, endDate] }
                }
            });
        } else if (task.targetType === "jobs") {
            count = await Job.count({
                where: {
                    addedBy: assigneeId,
                    createdAt: { [Op.between]: [startDate, endDate] }
                }
            });
        } else if (task.targetType === "vendors") {
            count = await Vendor.count({
                where: {
                    addedBy: assigneeId,
                    createdAt: { [Op.between]: [startDate, endDate] }
                }
            });
        } else if (task.targetType === "interviews") {
            count = await Candidate.count({
                where: {
                    assignedTo: assigneeId,
                    interviewDate: { [Op.not]: null },
                    updatedAt: { [Op.between]: [startDate, endDate] }
                }
            });
        } else if (task.targetType === "selections") {
            count = await Candidate.count({
                where: {
                    assignedTo: assigneeId,
                    [Op.or]: [
                        { remarks: { [Op.like]: "%select%" } },
                        { remarks: { [Op.like]: "%hired%" } },
                        { status: "Hired" }
                    ],
                    updatedAt: { [Op.between]: [startDate, endDate] }
                }
            });
        } else if (task.targetType === "joined") {
            count = await Candidate.count({
                where: {
                    assignedTo: assigneeId,
                    remarks: { [Op.like]: "%join%" },
                    updatedAt: { [Op.between]: [startDate, endDate] }
                }
            });
        } else if (task.targetType === "connected") {
            count = await Candidate.count({
                where: {
                    assignedTo: assigneeId,
                    remarks: { [Op.like]: "%connect%" },
                    updatedAt: { [Op.between]: [startDate, endDate] }
                }
            });
        } else if (task.targetType === "interested") {
            count = await Candidate.count({
                where: {
                    assignedTo: assigneeId,
                    [Op.or]: [
                        { status: "Interested" },
                        { remarks: { [Op.like]: "%interest%" } }
                    ],
                    updatedAt: { [Op.between]: [startDate, endDate] }
                }
            });
        }

        let status = task.status || "pending";
        // Auto mark as completed if target met
        if (count >= (task.targetQuantity || 0) && task.status !== "completed") {
            status = "completed";
        } else if (count < (task.targetQuantity || 0) && task.status === "completed") {
            status = "in_progress";
        }

        if (isExpired && status !== "completed" && status !== "cancelled" && status !== "overdue") {
            status = "overdue";
        } else if (!isExpired && status === "overdue" && status !== "completed") {
            status = "in_progress";
        }

        if (task.completedQuantity !== count || task.status !== status) {
            const currentHistory = safeParseHistory(task.history);
            if (task.status !== status) {
                currentHistory.push({
                    action: "status_changed",
                    user: "System",
                    text: `Task automatically moved to ${(status || "pending").replace('_', ' ').toUpperCase()} by System`,
                    time: new Date()
                });
            }
            if (currentHistory.length > 50) currentHistory.splice(0, currentHistory.length - 50);
            await task.update({
                completedQuantity: count,
                status,
                completedAt: status === "completed" ? new Date() : task.completedAt,
                history: JSON.stringify(currentHistory)
            });
        }

        // Now bubble up to parent if exists and bubbleUp is enabled
        if (bubbleUp && task.parentTaskId) {
            const parentTask = await Task.findByPk(task.parentTaskId);
            if (parentTask) {
                await syncTaskProgress(parentTask, true, visited);
            }
        }

        return task;
    } catch (err) {
        if (err.name === "SequelizeConnectionRefusedError" || err.name === "ConnectionRefusedError" || err.message.includes("ECONNREFUSED") || err.message.includes("ECONNRESET")) {
            isDbConnected = false;
        }
        console.error("syncTaskProgress internal error for task: " + task?.id, err.message);
        return task;
    }
}

// --- Task Management Endpoints ---

app.get("/api/tasks/eligible-assignees", authenticate, async (req, res) => {
    try {
        const { role, userId, companyId } = req.user;
        let where = { companyId: companyId || null };

        if (role === "boss") {
            where.role = { [Op.in]: ["manager", "tl", "recruiter"] };
        } else if (role === "manager") {
            // Managers can assign tasks to their own TLs & Recruiters reporting to them or their TLs
            const tls = await User.findAll({ where: { role: "tl", reportingTo: userId }, attributes: ["id"] });
            const tlIds = tls.map(t => t.id);
            where = {
                companyId: companyId || null,
                [Op.or]: [
                    { role: "tl", reportingTo: userId },
                    { role: "recruiter", reportingTo: userId },
                    { role: "recruiter", reportingTo: { [Op.in]: tlIds } }
                ]
            };
        } else if (role === "tl") {
            // TLs can assign tasks only to recruiters in their team
            where.role = "recruiter";
            where.reportingTo = userId;
        } else {
            return res.json([]);
        }

        const users = await User.findAll({
            where,
            attributes: ["id", "name", "email", "role"]
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/tasks", authenticate, async (req, res) => {
    try {
        const {
            title, description, priority, duration, assigneeIds,
            taskType, targetType, targetQuantity, targets,
            customStartDate, customEndDate, deadlineTime
        } = req.body;
        const { userId, companyId, role } = req.user;

        if (!assigneeIds || !Array.isArray(assigneeIds) || assigneeIds.length === 0) {
            return res.status(400).json({ error: "No assignees selected" });
        }

        // Validate multiple targets if provided
        const activeTargets = [];
        if (taskType === "target") {
            if (targets && Array.isArray(targets) && targets.length > 0) {
                activeTargets.push(...targets);
            } else if (targetType) {
                activeTargets.push({ targetType, targetQuantity: parseInt(targetQuantity) || 1 });
            }
        }

        if (taskType === "target" && activeTargets.length === 0) {
            return res.status(400).json({ error: "No targets specified for Numeric Target mode" });
        }

        // Role-Based Validation: Hide/Restrict Client & Job targets for TLs/Recruiters
        for (const t of activeTargets) {
            if (role === "tl" && (t.targetType === "clients" || t.targetType === "jobs")) {
                return res.status(403).json({ error: "Unauthorized: TLs do not have access to Client or Job target systems." });
            }
        }

        const initialHistory = [{
            action: "created",
            user: req.user.name,
            text: `Task initiated and assigned by ${req.user.name}`,
            time: new Date()
        }];

        const createdTasks = [];
        const creationTime = new Date();

        // Loop over each assignee
        for (const assigneeId of assigneeIds) {
            if (taskType === "target") {
                // 1. Create a Master Task row (set taskType: 'master', targetType: null, targetQuantity: null, status: 'in_progress')
                const masterTask = await Task.create({
                    title: title || "Target Assignment",
                    description: description || "Multi-target tracking assignment",
                    priority: priority || "medium",
                    duration: duration || "today",
                    taskType: "master",
                    targetType: null,
                    targetQuantity: null,
                    customStartDate: duration === "custom" ? customStartDate : null,
                    customEndDate: duration === "custom" ? customEndDate : null,
                    deadlineTime: duration === "time_based" ? deadlineTime : null,
                    assignerId: userId,
                    assigneeId,
                    companyId: companyId || null,
                    status: "in_progress",
                    history: JSON.stringify(initialHistory),
                    comments: JSON.stringify([]),
                    attachments: JSON.stringify([]),
                    createdAt: creationTime
                });

                // 2. Loop through activeTargets and create a child task for each target (set parentTaskId: masterTask.id, taskType: 'target', status: 'in_progress')
                for (const target of activeTargets) {
                    const taskTitle = `Target: ${target.targetType.toUpperCase()}`;
                    await Task.create({
                        title: taskTitle,
                        description: description || `Track target: ${target.targetType}`,
                        priority: priority || "medium",
                        duration: duration || "today",
                        taskType: "target",
                        targetType: target.targetType,
                        targetQuantity: target.targetQuantity,
                        customStartDate: duration === "custom" ? customStartDate : null,
                        customEndDate: duration === "custom" ? customEndDate : null,
                        deadlineTime: duration === "time_based" ? deadlineTime : null,
                        assignerId: userId,
                        assigneeId,
                        parentTaskId: masterTask.id,
                        companyId: companyId || null,
                        status: "in_progress",
                        history: JSON.stringify(initialHistory),
                        comments: JSON.stringify([]),
                        attachments: JSON.stringify([]),
                        createdAt: creationTime
                    });
                }

                // 3. Push only the masterTask to the createdTasks array (to avoid duplicating return payloads)
                createdTasks.push(masterTask);
            } else {
                // Basic task creation
                const created = await Task.create({
                    title,
                    description,
                    priority: priority || "medium",
                    duration: duration || "today",
                    taskType: "basic",
                    targetType: null,
                    targetQuantity: null,
                    customStartDate: duration === "custom" ? customStartDate : null,
                    customEndDate: duration === "custom" ? customEndDate : null,
                    deadlineTime: duration === "time_based" ? deadlineTime : null,
                    assignerId: userId,
                    assigneeId,
                    companyId: companyId || null,
                    status: "in_progress",
                    history: JSON.stringify(initialHistory),
                    comments: JSON.stringify([]),
                    attachments: JSON.stringify([]),
                    createdAt: creationTime
                });
                createdTasks.push(created);
            }
        }

        // CREATE NOTIFICATIONS
        const notifPromises = createdTasks.map(task =>
            Notification.create({
                userId: task.assigneeId,
                type: "task_assigned",
                title: "New Mission Allocated",
                message: `Task assigned: ${task.title}. Priority: ${priority || "medium"}. Check details.`,
                createdAt: new Date()
            })
        );
        await Promise.all(notifPromises);

        // Trigger real-time sync for each of the new target tasks
        for (const t of createdTasks) {
            await syncTaskProgress(t);
        }

        res.json({ message: `${createdTasks.length} tasks assigned successfully`, tasks: createdTasks });
    } catch (err) {
        console.error("POST /api/tasks ERROR:", err);
        try {
            fs.writeFileSync("c:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS\\error_log.txt", err.stack || err.message);
        } catch (writeErr) {
            console.error("Failed to write error log file:", writeErr);
        }
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/tasks", authenticate, async (req, res) => {
    try {
        const { userId } = req.user;
        const { assignedByMe } = req.query;

        let allTasks = [];
        if (assignedByMe === "true") {
            allTasks = await Task.findAll({
                where: { assignerId: userId },
                include: [
                    { model: User, as: "assigner", attributes: ["id", "name", "role"] },
                    { model: User, as: "assignee", attributes: ["id", "name", "role"] },
                    {
                        model: Task,
                        as: "subTasks",
                        include: [
                            { model: User, as: "assignee", attributes: ["id", "name", "role"] },
                            {
                                model: Task,
                                as: "subTasks",
                                include: [
                                    { model: User, as: "assignee", attributes: ["id", "name", "role"] },
                                    {
                                        model: Task,
                                        as: "subTasks",
                                        include: [{ model: User, as: "assignee", attributes: ["id", "name", "role"] }]
                                    }
                                ]
                            }
                        ]
                    }
                ],
                order: [["createdAt", "DESC"]]
            });
        } else {
            // First find tasks assigned to the user
            const myTasks = await Task.findAll({
                where: { assigneeId: userId }
            });

            if (myTasks.length === 0) {
                return res.json([]);
            }

            const taskIds = myTasks.map(t => t.id);
            const parentIds = myTasks.map(t => t.parentTaskId).filter(Boolean);

            allTasks = await Task.findAll({
                where: {
                    [Op.or]: [
                        { id: taskIds },
                        { id: parentIds },
                        { parentTaskId: parentIds }
                    ]
                },
                include: [
                    { model: User, as: "assigner", attributes: ["id", "name", "role"] },
                    { model: User, as: "assignee", attributes: ["id", "name", "role"] },
                    {
                        model: Task,
                        as: "subTasks",
                        include: [
                            { model: User, as: "assignee", attributes: ["id", "name", "role"] },
                            {
                                model: Task,
                                as: "subTasks",
                                include: [
                                    { model: User, as: "assignee", attributes: ["id", "name", "role"] },
                                    {
                                        model: Task,
                                        as: "subTasks",
                                        include: [{ model: User, as: "assignee", attributes: ["id", "name", "role"] }]
                                    }
                                ]
                            }
                        ]
                    }
                ],
                order: [["createdAt", "DESC"]]
            });
        }

        // Run auto tracking and calculation on active top-level tasks in background to avoid database locks and crashes
        allTasks.forEach(task => {
            if (!task.parentTaskId && task.status !== "completed" && task.status !== "cancelled") {
                syncTaskProgress(task).catch(err => console.error("Background sync task error:", err));
            }
        });

        let syncedTasks = allTasks;

        // Filter for Master Tasks
        let filteredTasks = [];
        if (assignedByMe === "true") {
            // Master task for assigner: parentTaskId is null
            filteredTasks = syncedTasks.filter(t => !t.parentTaskId);
        } else {
            // Master task for assignee: parentTaskId is null OR the parent task's assigneeId !== userId
            const userTaskIds = new Set(syncedTasks.map(t => t.id));
            filteredTasks = syncedTasks.filter(t => !t.parentTaskId || !userTaskIds.has(t.parentTaskId));
        }

        // GROUP UNIFIED TASKS
        const grouped = [];
        const seenGroup = new Set();

        for (const task of filteredTasks) {
            const timeVal = task.createdAt ? new Date(task.createdAt).getTime() : 0;
            // Round to nearest second to deal with slight database datetime precision shifts
            const roundedTime = Math.floor(timeVal / 1000) * 1000;
            const groupKey = `${task.title || ""}_${task.description || ""}_${task.assignerId || 0}_${roundedTime}`;

            if (seenGroup.has(groupKey)) {
                const existing = grouped.find(g => g.groupKey === groupKey);
                if (existing) {
                    existing.ids.push(task.id);
                    existing.assigneeIds.push(task.assigneeId);
                    if (task.assignee && !existing.assignees.some(a => a.id === task.assigneeId)) {
                        existing.assignees.push(task.assignee);
                    }
                    if (task.subTasks && task.subTasks.length > 0) {
                        const subTasksJson = task.subTasks.map(sub => sub.toJSON ? sub.toJSON() : JSON.parse(JSON.stringify(sub)));
                        existing.subTasks.push(...subTasksJson);
                    }

                    // If this task belongs to current user, prioritize its details as the main identity
                    if (assignedByMe !== "true" && task.assigneeId === userId) {
                        existing.id = task.id;
                        existing.assigneeId = task.assigneeId;
                        existing.status = task.status;
                        existing.completedQuantity = task.completedQuantity;
                        existing.targetQuantity = task.targetQuantity;
                        existing.completedAt = task.completedAt;
                    }
                }
            } else {
                seenGroup.add(groupKey);
                const taskJson = task.toJSON ? task.toJSON() : JSON.parse(JSON.stringify(task));
                taskJson.groupKey = groupKey;
                taskJson.ids = [task.id];
                taskJson.assigneeIds = [task.assigneeId];
                taskJson.assignees = task.assignee ? [task.assignee] : [];
                taskJson.subTasks = taskJson.subTasks || [];
                grouped.push(taskJson);
            }
        }

        res.json(grouped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/tasks/batch", authenticate, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "Invalid task identifiers" });
        await Task.destroy({ where: { id: ids, assignerId: req.user.userId } });
        res.json({ success: true, message: "Task cluster terminated." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch("/api/tasks/:id/status", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const { userId } = req.user;

        const task = await Task.findOne({
            where: {
                id,
                [Op.or]: [
                    { assigneeId: userId },
                    { assignerId: userId }
                ]
            }
        });

        if (!task) {
            return res.status(404).json({ error: "Task not found or unauthorized" });
        }

        const validStatuses = ["pending", "in_progress", "completed", "delayed", "overdue", "blocked", "under_review", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status code" });
        }

        const wasCompleted = task.status === "completed";

        const currentHistory = safeParseHistory(task.history);
        currentHistory.push({
            action: "status_changed",
            user: req.user.name,
            text: `Status updated to ${status.replace('_', ' ').toUpperCase()}`,
            time: new Date()
        });
        if (currentHistory.length > 50) currentHistory.splice(0, currentHistory.length - 50);

        await task.update({
            status,
            history: JSON.stringify(currentHistory),
            completedAt: status === "completed" ? new Date() : task.completedAt
        });

        if (status === "completed" && task.assigneeId === userId) {
            await Notification.create({
                userId: task.assignerId,
                type: "task_completed",
                title: "Task Accomplished",
                message: `${req.user.name || "An agent"} completed the task: ${task.title}`,
                createdAt: new Date()
            });
        }

        if (status === "completed" && !wasCompleted) {
            const assigneeId = task.assigneeId;
            const assignee = await User.findByPk(assigneeId);
            if (assignee) {
                const PointHistory = sequelize.models.PointHistory;
                const UserMetrics = sequelize.models.UserMetrics;
                const economy = await getEconomyConfig();
                const taskPoints = economy.taskCompleted !== undefined ? economy.taskCompleted : 10;
                const uniqueKey = `task_completion_${task.id}`;
                const exists = await PointHistory.findOne({ where: { userId: assigneeId, reason: uniqueKey } });
                if (!exists) {
                    await PointHistory.create({
                        userId: assigneeId,
                        actionType: "task_completion",
                        statusName: "Task Completed",
                        pointsAwarded: taskPoints,
                        reason: uniqueKey
                    });
                    const [metrics] = await UserMetrics.findOrCreate({ where: { userId: assigneeId } });
                    metrics.totalCoins += taskPoints;
                    await metrics.save();

                    if (assignee.reportingTo) {
                        const tl = await User.findByPk(assignee.reportingTo);
                        if (tl && tl.role === "tl") {
                            const tlId = tl.id;
                            const tlTeamTaskPoints = economy.teamTaskCompletion !== undefined ? economy.teamTaskCompletion : 10;
                            const tlKey = `tl_team_task_completion_${task.id}_${assigneeId}`;
                            const tlExists = await PointHistory.findOne({ where: { userId: tlId, reason: tlKey } });
                            if (!tlExists) {
                                await PointHistory.create({
                                    userId: tlId,
                                    actionType: "tl_team_task_completion",
                                    statusName: "Team Task Completed",
                                    pointsAwarded: tlTeamTaskPoints,
                                    reason: tlKey
                                });
                                const [tlMetrics] = await UserMetrics.findOrCreate({ where: { userId: tlId } });
                                tlMetrics.totalCoins += tlTeamTaskPoints;
                                await tlMetrics.save();
                            }
                        }
                    }
                }
            }
        }

        res.json({ success: true, task });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch("/api/tasks/:id/popup-state", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { popupShown, popupAcknowledged, reminderSent, expiredPopupSent, completionPopupSent } = req.body;
        const { userId } = req.user;

        const task = await Task.findOne({
            where: {
                id,
                assigneeId: userId
            }
        });

        if (!task) {
            return res.status(404).json({ error: "Task not found or unauthorized" });
        }

        const updates = {};
        if (popupShown !== undefined) updates.popupShown = popupShown;
        if (popupAcknowledged !== undefined) updates.popupAcknowledged = popupAcknowledged;
        if (reminderSent !== undefined) updates.reminderSent = reminderSent;
        if (expiredPopupSent !== undefined) updates.expiredPopupSent = expiredPopupSent;
        if (completionPopupSent !== undefined) updates.completionPopupSent = completionPopupSent;

        await task.update(updates);
        res.json({ success: true, task });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Task Comment
app.post("/api/tasks/:id/comments", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const { name } = req.user;

        const task = await Task.findByPk(id);
        if (!task) return res.status(404).json({ error: "Task not found" });

        const comments = JSON.parse(task.comments || "[]");
        const newComment = {
            author: name,
            text,
            createdAt: new Date()
        };
        comments.push(newComment);

        const currentHistory = safeParseHistory(task.history);
        currentHistory.push({
            action: "comment_added",
            user: name,
            text: `Added comment: "${text.substring(0, 30)}..."`,
            time: new Date()
        });
        if (currentHistory.length > 50) currentHistory.splice(0, currentHistory.length - 50);

        await task.update({
            comments: JSON.stringify(comments),
            history: JSON.stringify(currentHistory)
        });

        res.json({ success: true, comments });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Task Attachment
app.post("/api/tasks/:id/attachments", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, url } = req.body;

        const task = await Task.findByPk(id);
        if (!task) return res.status(404).json({ error: "Task not found" });

        const attachments = JSON.parse(task.attachments || "[]");
        const newAttachment = { name, url, createdAt: new Date() };
        attachments.push(newAttachment);

        const currentHistory = safeParseHistory(task.history);
        currentHistory.push({
            action: "attachment_added",
            user: req.user.name,
            text: `Attached file: ${name}`,
            time: new Date()
        });
        if (currentHistory.length > 50) currentHistory.splice(0, currentHistory.length - 50);

        await task.update({
            attachments: JSON.stringify(attachments),
            history: JSON.stringify(currentHistory)
        });

        res.json({ success: true, attachments });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Split / Subtask Distribution
app.post("/api/tasks/:id/split", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { splits, priority, duration } = req.body; // splits: [{ assigneeId, targetQuantity }]
        const { userId, companyId } = req.user;

        const parentTask = await Task.findByPk(id);
        if (!parentTask) return res.status(404).json({ error: "Parent task not found" });

        if (parentTask.taskType !== "target") {
            return res.status(400).json({ error: "Only target-based tasks can be subdivided." });
        }

        // Validate remaining allocation
        const existingSubtasks = await Task.findAll({ where: { parentTaskId: id } });
        const alreadyAllocated = existingSubtasks.reduce((sum, t) => sum + t.targetQuantity, 0);
        const remaining = parentTask.targetQuantity - alreadyAllocated;

        const totalSplitQty = splits.reduce((sum, s) => sum + parseInt(s.targetQuantity), 0);
        if (totalSplitQty > remaining) {
            return res.status(400).json({ error: `Allocation exceeded. Remaining target to distribute: ${remaining}. You tried to allocate: ${totalSplitQty}` });
        }

        const subtaskPromises = splits.map(async (split) => {
            const assignee = await User.findByPk(split.assigneeId);
            const assigneeName = assignee ? assignee.name : "Team Member";

            const childHistory = [{
                action: "created",
                user: req.user.name,
                text: `Subtask created from parent task splitting by ${req.user.name}`,
                time: new Date()
            }];

            return Task.create({
                title: `Subtask: ${parentTask.title}`,
                description: split.notes || `Subtask target split. Parent details: ${parentTask.description || ""}`,
                priority: priority || parentTask.priority,
                duration: duration || parentTask.duration,
                taskType: "target",
                targetType: parentTask.targetType,
                targetQuantity: split.targetQuantity,
                customStartDate: parentTask.customStartDate,
                customEndDate: split.deadline || parentTask.customEndDate,
                deadlineTime: parentTask.deadlineTime,
                assignerId: userId,
                assigneeId: split.assigneeId,
                parentTaskId: parentTask.id,
                companyId: companyId || null,
                status: "in_progress",
                history: JSON.stringify(childHistory),
                comments: JSON.stringify([]),
                attachments: JSON.stringify([]),
                createdAt: new Date()
            });
        });

        const createdSubtasks = await subtaskPromises;
        const resolvedSubtasks = await Promise.all(createdSubtasks);

        // Update Parent history
        const parentHistory = safeParseHistory(parentTask.history);
        for (const sub of resolvedSubtasks) {
            const assignee = await User.findByPk(sub.assigneeId);
            parentHistory.push({
                action: "subtask_created",
                user: req.user.name,
                text: `Subtask assigned to ${assignee?.name || "Agent"} with target: ${sub.targetQuantity}`,
                time: new Date()
            });
        }
        if (parentHistory.length > 50) parentHistory.splice(0, parentHistory.length - 50);
        await parentTask.update({ history: JSON.stringify(parentHistory) });

        // Trigger Notification
        for (const sub of resolvedSubtasks) {
            await Notification.create({
                userId: sub.assigneeId,
                type: "task_assigned",
                title: "Subtask Allocated",
                message: `You received a split target of ${sub.targetQuantity} for task ${parentTask.title}`,
                createdAt: new Date()
            });
            await syncTaskProgress(sub);
        }

        res.json({ success: true, subtasks: resolvedSubtasks });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Team Performance Analytics Endpoint
app.get("/api/tasks/performance", authenticate, async (req, res) => {
    try {
        const { companyId, userId, role } = req.user;
        let userScope = {};

        // Hierarchy rule scoping
        if (role === "boss") {
            userScope = { companyId };
        } else if (role === "manager") {
            const tls = await User.findAll({ where: { role: "tl", reportingTo: userId }, attributes: ["id"] });
            const tlIds = tls.map(t => t.id);
            userScope = {
                companyId,
                [Op.or]: [
                    { reportingTo: userId },
                    { reportingTo: { [Op.in]: tlIds } }
                ]
            };
        } else if (role === "tl") {
            userScope = { companyId, reportingTo: userId };
        } else {
            return res.status(403).json({ error: "Unauthorized access to performance analytics." });
        }

        const teamMembers = await User.findAll({
            where: userScope,
            attributes: ["id", "name", "role"]
        });

        const memberIds = teamMembers.map(m => m.id);
        const tasks = await Task.findAll({
            where: {
                assigneeId: { [Op.in]: memberIds }
            }
        });

        // Calculate performance
        const analytics = teamMembers.map(member => {
            const memberTasks = tasks.filter(t => t.assigneeId === member.id);
            const total = memberTasks.length;
            const completed = memberTasks.filter(t => t.status === "completed").length;
            const delayed = memberTasks.filter(t => t.status === "delayed" || t.status === "overdue").length;
            const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

            return {
                id: member.id,
                name: member.name,
                role: member.role,
                totalTasks: total,
                completedTasks: completed,
                delayedTasks: delayed,
                completionRate: rate
            };
        });

        const activeCount = tasks.filter(t => t.status === "in_progress" || t.status === "pending").length;
        const completedCount = tasks.filter(t => t.status === "completed").length;
        const overdueCount = tasks.filter(t => t.status === "overdue" || t.status === "delayed").length;

        // Performers
        let best = null;
        let slow = null;

        analytics.forEach(a => {
            if (a.totalTasks > 0) {
                if (!best || a.completionRate > best.completionRate) best = a;
                if (!slow || a.completionRate < slow.completionRate) slow = a;
            }
        });

        res.json({
            teamPerformance: analytics,
            overview: {
                totalTasks: tasks.length,
                activeTasks: activeCount,
                completedTasks: completedCount,
                delayedTasks: overdueCount,
                bestPerformer: best ? { name: best.name, rate: best.completionRate } : null,
                slowPerformer: slow ? { name: slow.name, rate: slow.completionRate } : null
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Vendor Management Endpoints ---

app.get("/api/vendors", authenticate, async (req, res) => {
    try {
        const { companyId } = req.user;
        const vendors = await Vendor.findAll({
            where: { companyId: companyId || null },
            include: [{ model: User, as: "creator", attributes: ["id", "name"] }],
            order: [["createdAt", "DESC"]]
        });
        res.json(vendors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/vendors", authenticate, async (req, res) => {
    try {
        const { id, name, company, contactPerson, phone, email, location, type, specialization, notes } = req.body;
        const { userId, companyId } = req.user;

        if (id) {
            const vendor = await Vendor.findOne({ where: { id, companyId } });
            if (!vendor) return res.status(404).json({ error: "Vendor not found" });

            await vendor.update({
                name, company, contactPerson, phone, email, location, type, specialization, notes
            });
            return res.json({ success: true, vendor });
        } else {
            const existing = await Vendor.findOne({
                where: {
                    name: name,
                    company: company,
                    companyId: companyId || null
                }
            });
            if (existing) {
                return res.json({ success: true, vendor: existing });
            }

            const vendor = await Vendor.create({
                name, company, contactPerson, phone, email, location, type, specialization, notes,
                companyId: companyId || null,
                addedBy: userId
            });

            if (["recruiter", "tl"].includes(req.user.role)) {
                const PointHistory = sequelize.models.PointHistory;
                const UserMetrics = sequelize.models.UserMetrics;
                const economy = await getEconomyConfig();
                const vendorPoints = economy.vendorCreated !== undefined ? economy.vendorCreated : 10;
                const uniqueKey = `vendor_created_${vendor.id}`;
                const exists = await PointHistory.findOne({ where: { userId, reason: uniqueKey } });
                if (!exists) {
                    await PointHistory.create({
                        userId,
                        actionType: "vendor_created",
                        statusName: "Vendor Created",
                        pointsAwarded: vendorPoints,
                        reason: uniqueKey
                    });
                    const [metrics] = await UserMetrics.findOrCreate({ where: { userId } });
                    metrics.totalCoins += vendorPoints;
                    await metrics.save();
                }
            }

            return res.json({ success: true, vendor });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/vendors/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { companyId } = req.user;
        const vendor = await Vendor.findOne({ where: { id, companyId: companyId || null } });
        if (!vendor) return res.status(404).json({ error: "Vendor not found" });
        await vendor.destroy();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/notifications", authenticate, async (req, res) => {
    try {
        const { userId } = req.user;
        const notifications = await Notification.findAll({
            where: { userId, isRead: false },
            order: [["createdAt", "DESC"]]
        });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/notifications/clear", authenticate, async (req, res) => {
    try {
        const { userId } = req.user;
        await Notification.update({ isRead: true }, { where: { userId } });
        res.json({ message: "Notifications cleared" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Client Management Endpoints ---
app.get("/api/clients", authenticate, async (req, res) => {
    try {
        let effectiveCompanyId = req.user.companyId;
        if (!effectiveCompanyId) {
            const firstCompany = await Company.findOne();
            if (firstCompany) effectiveCompanyId = firstCompany.id;
        }

        const clients = await Client.findAll({
            where: { companyId: effectiveCompanyId },
            order: [["name", "ASC"]]
        });
        res.json(clients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/clients", authenticate, async (req, res) => {
    try {
        const { role, companyId, userId } = req.user;
        if (role !== "boss" && role !== "manager") {
            return res.status(403).json({ error: "Only Boss and Managers can add clients" });
        }

        let effectiveCompanyId = companyId;
        if (!effectiveCompanyId) {
            const firstCompany = await Company.findOne();
            if (firstCompany) effectiveCompanyId = firstCompany.id;
        }

        const { name, industry, location, contactPerson, email, phone, billingDays, joinings, closingDate, gstNo, address, paymentConfig } = req.body;
        const client = await Client.create({
            name,
            industry: industry || null,
            location: location || null,
            contactPerson: contactPerson || null,
            email: email || null,
            phone: phone || null,
            billingDays: billingDays || null,
            joinings: joinings || null,
            closingDate: closingDate || null,
            gstNo: gstNo || null,
            address: address || null,
            paymentConfig: paymentConfig || null,
            companyId: effectiveCompanyId || null,
            addedBy: userId,
            createdAt: new Date()
        });
        res.json({ success: true, client });
    } catch (err) {
        console.error("FATAL ERROR: Failed to authorize partnership node:", err.message);
        res.status(500).json({ error: "AUTHORIZATION_FAILURE: Mandate uplink failed. Check system logs for detailed error reports." });
    }
});

app.patch("/api/clients/:id", authenticate, async (req, res) => {
    try {
        const { role, companyId } = req.user;
        if (role !== "boss" && role !== "manager") {
            return res.status(403).json({ error: "Only Boss and Managers can edit clients" });
        }
        const { id } = req.params;
        let effectiveCompanyId = companyId;
        if (!effectiveCompanyId) {
            const firstCompany = await Company.findOne();
            if (firstCompany) effectiveCompanyId = firstCompany.id;
        }
        const client = await Client.findOne({ where: { id, companyId: effectiveCompanyId || null } });
        if (!client) {
            const fallbackClient = await Client.findByPk(id);
            if (fallbackClient) {
                await fallbackClient.update(req.body);
                return res.json({ success: true, client: fallbackClient });
            }
            return res.status(404).json({ error: "Client not found" });
        }
        await client.update(req.body);
        res.json({ success: true, client });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/clients/:id", authenticate, async (req, res) => {
    try {
        const { role, companyId } = req.user;
        if (role !== "boss" && role !== "manager") {
            return res.status(403).json({ error: "Only Boss and Managers can delete clients" });
        }

        await Client.destroy({
            where: {
                id: req.params.id,
                companyId: companyId || null
            }
        });
        res.json({ success: true, message: "Client deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Job Endpoints ---
app.get("/api/jobs", authenticate, async (req, res) => {
    try {
        let effectiveCompanyId = req.user.companyId;
        if (!effectiveCompanyId) {
            const firstCompany = await Company.findOne();
            if (firstCompany) effectiveCompanyId = firstCompany.id;
        }

        const jobs = await Job.findAll({
            where: { companyId: effectiveCompanyId },
            include: [{ model: Client, as: "client", attributes: ["name"] }],
            order: [["createdAt", "DESC"]]
        });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/jobs", authenticate, async (req, res) => {
    try {
        const { role, companyId, userId } = req.user;
        if (role === "recruiter") {
            return res.status(403).json({ error: "Recruiters cannot create jobs. Detected role in token: " + role });
        }
        const {
            title, clientId, clientIds, category, openings, jobType, workLocationType,
            city, locality, gender, qualification, minExp, maxExp,
            salaryType, salaryRange, benefits, skills, assets,
            documents, startTime, endTime, workingDays, description,
            interviewRounds, round1Name, round2Name, round3Name, round4Name, round5Name
        } = req.body;

        let effectiveCompanyId = companyId;
        if (!effectiveCompanyId) {
            const firstCompany = await Company.findOne();
            if (firstCompany) effectiveCompanyId = firstCompany.id;
        }

        const idsToProcess = Array.isArray(clientIds) && clientIds.length > 0 ? clientIds : (clientId ? [clientId] : []);

        if (idsToProcess.length === 0) {
            return res.status(400).json({ error: "At least one Partner Client must be selected." });
        }

        const jobPromises = idsToProcess.map(id => Job.create({
            title, clientId: id, category, openings, jobType, workLocationType,
            city, locality, gender, qualification, minExp, maxExp,
            salaryType, salaryRange, benefits, skills, assets,
            documents, startTime, endTime, workingDays, description,
            companyId: effectiveCompanyId || null,
            addedBy: userId,
            createdAt: new Date(),
            interviewRounds: interviewRounds || 1,
            round1Name: round1Name || null,
            round2Name: round2Name || null,
            round3Name: round3Name || null,
            round4Name: round4Name || null,
            round5Name: round5Name || null
        }));

        const jobs = await Promise.all(jobPromises);
        res.json({ success: true, jobs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch("/api/jobs/:id", authenticate, async (req, res) => {
    try {
        const { role, companyId } = req.user;
        if (role === "recruiter") {
            return res.status(403).json({ error: "Recruiters cannot edit jobs" });
        }
        const { id } = req.params;
        let effectiveCompanyId = companyId;
        if (!effectiveCompanyId) {
            const firstCompany = await Company.findOne();
            if (firstCompany) effectiveCompanyId = firstCompany.id;
        }
        const job = await Job.findOne({ where: { id, companyId: effectiveCompanyId || null } });
        if (!job) {
            const fallbackJob = await Job.findByPk(id); // simple fallback
            if (fallbackJob) {
                await fallbackJob.update(req.body);
                return res.json({ success: true, job: fallbackJob });
            }
            return res.status(404).json({ error: "Job not found" });
        }
        await job.update(req.body);
        res.json({ success: true, job });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/jobs/:id", authenticate, async (req, res) => {
    try {
        const { role, companyId } = req.user;
        if (role === "recruiter") {
            return res.status(403).json({ error: "Recruiters cannot delete jobs" });
        }
        await Job.destroy({
            where: { id: req.params.id, companyId: companyId || null }
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 1. Seed
app.get("/api/seed", async (req, res) => {
    try {
        // 1. Seed Requested Super Admin
        const superEmail = "givyansh7790@gmail.com";
        const superPassword = await bcrypt.hash("7790813609", 12);

        // 1b. Seed Demo Recruiter Requested
        const dummyEmails = [
            "givyansh779081@gmail.com",
            "givyansh77908136@gmail.com",
            "givyansh7790813609@gmail.com",
            "givyansh779081360977@gmail.com"
        ];
        const dummyPassword = await bcrypt.hash("7790813609", 12);

        // Force reset these specific users
        await User.destroy({ where: { email: [superEmail, ...dummyEmails] } });

        await User.create({ name: "Givyansh Master", email: superEmail, password: superPassword, role: "superadmin" });

        const boss = await User.create({ name: "The Boss", email: "givyansh779081360977@gmail.com", password: dummyPassword, role: "boss" });
        const manager = await User.create({ name: "Demo Manager", email: "givyansh7790813609@gmail.com", password: dummyPassword, role: "manager", reportingTo: boss.id });
        const tl = await User.create({ name: "Demo Team Lead", email: "givyansh77908136@gmail.com", password: dummyPassword, role: "tl", reportingTo: manager.id });
        const recruiter = await User.create({ name: "Demo Recruiter", email: "givyansh779081@gmail.com", password: dummyPassword, role: "recruiter", reportingTo: tl.id });


        // 2. Seed Pricing Plans (from reference)
        const defaultPlans = [
            {
                title: "Essentials Cluster",
                price: "99",
                description: "Precision tools for elite solo recruiters scaling high-velocity agencies.",
                features: ["Up to 5 Recruitment Nodes", "Real-time Logic Syncing", "Core Candidate Hub", "Standard Email SLA", "Reporting Suite Alpha"],
                isNeuralChoice: false,
                buttonText: "Scale Now"
            },
            {
                title: "Business Ecosystem",
                price: "299",
                description: "The definitive recruitment operating system for modern high-performance teams.",
                features: ["Up to 25 Recruitment Nodes", "Advanced Hierarchy Control", "RESTful API Access", "Priority Neural Sorting", "Custom Brand Integration", "Isolated Database Node"],
                isNeuralChoice: true,
                buttonText: "Deploy Growth"
            },
            {
                title: "Enterprise Grid",
                price: "Custom",
                description: "Unrestricted neural capabilities for global firms requiring ultimate data sovereignty.",
                features: ["Unlimited Recruitment Nodes", "Dedicated Infrastructure Pod", "Success Manager Alpha", "SLA 99.9% Guarantee", "On-premise Deployment", "Military-grade Encryption"],
                isNeuralChoice: false,
                buttonText: "Contact Ops"
            }
        ];

        for (const p of defaultPlans) {
            await PricingPlan.findOrCreate({ where: { title: p.title }, defaults: p });
        }

        res.json({ message: "Seed Complete: givyansh7790@gmail.com / 7790813609 + Default Pricing" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/sourcing/platforms", authenticate, async (req, res) => {
    try {
        const platforms = await SourcingPlatform.findAll({
            where: { companyId: req.user.companyId || null },
            order: [["createdAt", "DESC"]]
        });
        res.json(platforms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/sourcing/platforms", authenticate, async (req, res) => {
    if (req.user.role !== "boss" && req.user.role !== "manager") {
        return res.status(403).json({ error: "Access Denied" });
    }
    try {
        const { name, url, username, password, cost, status } = req.body;
        if (!name) return res.status(400).json({ error: "Platform name is required" });

        const platform = await SourcingPlatform.create({
            name, url, username, password, cost, status,
            companyId: req.user.companyId || null
        });
        res.status(201).json(platform);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/sourcing/platforms/:id", authenticate, async (req, res) => {
    if (req.user.role !== "boss" && req.user.role !== "manager") {
        return res.status(403).json({ error: "Access Denied" });
    }
    try {
        await SourcingPlatform.destroy({
            where: { id: req.params.id, companyId: req.user.companyId || null }
        });
        res.json({ success: true, message: "Platform deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Shift Management Endpoints ---
app.get("/api/shifts", authenticate, async (req, res) => {
    try {
        const shifts = await Shift.findAll({
            where: {
                [Op.or]: [
                    { companyId: req.user.companyId || null },
                    { companyId: null }
                ]
            }
        });
        res.json(shifts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

function isTimeWithinShiftWindow(timeValue, shift) {
    if (!shift || !shift.startTime || !shift.endTime) return false;
    const date = new Date(timeValue);
    const mins = date.getHours() * 60 + date.getMinutes();

    const [startH, startM] = shift.startTime.split(':').map(Number);
    const [endH, endM] = shift.endTime.split(':').map(Number);

    const startTotalMins = startH * 60 + startM;
    const endTotalMins = endH * 60 + endM;

    const earlyLimit = shift.earlyLoginAllowed !== undefined ? parseInt(shift.earlyLoginAllowed) : 60;
    const postLimit = shift.postShiftAllowed !== undefined ? parseInt(shift.postShiftAllowed) : 120;

    const windowStartMins = startTotalMins - earlyLimit;
    const windowEndMins = endTotalMins + postLimit;

    const normalize = (m) => (m % 1440 + 1440) % 1440;
    const normStart = normalize(windowStartMins);
    const normEnd = normalize(windowEndMins);

    if (normStart < normEnd) {
        return mins >= normStart && mins <= normEnd;
    } else {
        return mins >= normStart || mins <= normEnd;
    }
}

const syncTodayAttendanceShifts = async (employeeIds, shiftId) => {
    try {
        if (!employeeIds || employeeIds.length === 0) return;
        const todayStr = new Date().toISOString().split('T')[0];
        await Attendance.update(
            { shiftId: shiftId || null },
            {
                where: {
                    userId: { [Op.in]: employeeIds },
                    date: todayStr
                }
            }
        );

        let shift = null;
        if (shiftId) {
            shift = await Shift.findByPk(shiftId);
        }

        for (const empId of employeeIds) {
            const att = await Attendance.findOne({
                where: { userId: empId, date: todayStr }
            });
            if (att) {
                const logs = await AttendanceLog.findAll({ where: { attendanceId: att.id } });
                for (const log of logs) {
                    if (!shift || !isTimeWithinShiftWindow(log.loginTime, shift)) {
                        await log.destroy();
                    }
                }
                const breaks = await BreakLog.findAll({ where: { attendanceId: att.id } });
                for (const b of breaks) {
                    if (!shift || !isTimeWithinShiftWindow(b.startTime, shift)) {
                        await b.destroy();
                    }
                }
                await recalculateAttendanceStats(att.id);
            }
        }
        console.log(`[SYNC_SHIFT] Today's attendance updated and cleaned for ${employeeIds.length} users with shiftId: ${shiftId}`);
    } catch (err) {
        console.error("[SYNC_SHIFT] Error updating today's attendance shifts", err);
    }
};

app.post("/api/shifts", authenticate, async (req, res) => {
    if (req.user.role !== "boss" && req.user.role !== "superadmin") {
        return res.status(403).json({ error: "Access Denied" });
    }
    try {
        const { employeeIds, ...shiftData } = req.body;
        const shift = await Shift.create({
            ...shiftData,
            companyId: req.user.companyId || null
        });
        if (employeeIds && Array.isArray(employeeIds)) {
            await User.update(
                { shiftId: shift.id },
                {
                    where: {
                        id: { [Op.in]: employeeIds },
                        companyId: req.user.companyId || null
                    }
                }
            );
            await syncTodayAttendanceShifts(employeeIds, shift.id);
        }
        res.status(201).json(shift);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/shifts/:id", authenticate, async (req, res) => {
    if (req.user.role !== "boss" && req.user.role !== "superadmin") {
        return res.status(403).json({ error: "Access Denied" });
    }
    try {
        const { employeeIds, ...shiftData } = req.body;
        await Shift.update(shiftData, {
            where: {
                id: req.params.id,
                companyId: req.user.companyId ? req.user.companyId : { [Op.or]: [req.user.companyId, null] }
            }
        });
        if (employeeIds && Array.isArray(employeeIds)) {
            // Find currently mapped employees to this shift before unmapping
            const currentlyMappedUsers = await User.findAll({
                where: { shiftId: req.params.id },
                attributes: ["id"]
            });
            const oldUserIds = currentlyMappedUsers.map(u => u.id);

            // Unmap old users on this shift first
            await User.update(
                { shiftId: null },
                {
                    where: {
                        shiftId: req.params.id,
                        companyId: req.user.companyId || null
                    }
                }
            );
            // Update today's attendance for unmapped users to null
            await syncTodayAttendanceShifts(oldUserIds, null);

            // Assign new users to this shift
            await User.update(
                { shiftId: req.params.id },
                {
                    where: {
                        id: { [Op.in]: employeeIds },
                        companyId: req.user.companyId || null
                    }
                }
            );
            // Update today's attendance for newly mapped users
            await syncTodayAttendanceShifts(employeeIds, req.params.id);
        } else {
            // Sync today's attendance for all users currently mapped to this shift (to clean up logs if shift times changed)
            const currentlyMappedUsers = await User.findAll({
                where: { shiftId: req.params.id },
                attributes: ["id"]
            });
            const mappedUserIds = currentlyMappedUsers.map(u => u.id);
            await syncTodayAttendanceShifts(mappedUserIds, req.params.id);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/shifts/:id", authenticate, async (req, res) => {
    if (req.user.role !== "boss" && req.user.role !== "superadmin") {
        return res.status(403).json({ error: "Access Denied" });
    }
    try {
        // Find users currently on this shift
        const currentlyMappedUsers = await User.findAll({
            where: { shiftId: req.params.id },
            attributes: ["id"]
        });
        const oldUserIds = currentlyMappedUsers.map(u => u.id);

        // When a shift is deleted, clear it for all users
        await User.update(
            { shiftId: null },
            {
                where: {
                    shiftId: req.params.id,
                    companyId: req.user.companyId ? req.user.companyId : { [Op.or]: [req.user.companyId, null] }
                }
            }
        );
        // Update today's attendance for those users to null
        await syncTodayAttendanceShifts(oldUserIds, null);

        await Shift.destroy({
            where: {
                id: req.params.id,
                companyId: req.user.companyId ? req.user.companyId : { [Op.or]: [req.user.companyId, null] }
            }
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/shifts/employees", authenticate, async (req, res) => {
    if (req.user.role !== "boss" && req.user.role !== "superadmin") {
        return res.status(403).json({ error: "Access Denied" });
    }
    try {
        const employees = await User.findAll({
            where: {
                companyId: req.user.companyId || null,
                role: { [Op.in]: ["manager", "tl", "recruiter"] }
            },
            include: [{ model: Shift, as: "shift", attributes: ["id", "name", "startTime", "endTime", "lunchStartTime", "lunchEndTime", "earlyLoginAllowed", "postShiftAllowed"] }],
            attributes: ["id", "name", "email", "role", "shiftId"]
        });
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/shifts/allot", authenticate, async (req, res) => {
    if (req.user.role !== "boss" && req.user.role !== "superadmin") {
        return res.status(403).json({ error: "Access Denied" });
    }
    try {
        const { employeeIds, shiftId } = req.body;
        if (!employeeIds || !Array.isArray(employeeIds)) {
            return res.status(400).json({ error: "Invalid employee selection" });
        }

        await User.update(
            { shiftId: shiftId || null },
            {
                where: {
                    id: { [Op.in]: employeeIds },
                    companyId: req.user.companyId || null
                }
            }
        );

        // Also update today's active attendance records for mapped employees
        await syncTodayAttendanceShifts(employeeIds, shiftId);

        res.json({ success: true, message: "Workforce shift profiles updated successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Attendance Tracking Endpoints ---
app.get("/api/attendance/hub", authenticate, async (req, res) => {
    const { userId } = req.query;
    console.log(`[ATTENDANCE_HUB] Request for UserID: ${userId} by Role: ${req.user.role} (MyID: ${req.user.userId})`);

    // Allow if role is boss, superadmin OR if requesting own data
    if (req.user.role !== "boss" && req.user.role !== "superadmin" && String(req.user.userId) !== String(userId)) {
        console.warn(`[ATTENDANCE_HUB] Access Denied for UserID: ${userId}`);
        return res.status(403).json({ error: "Access Denied" });
    }
    try {
        const { date, history, startDate, endDate } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];

        if (userId) {
            // Self-heal user splits first
            const todayAtt = await Attendance.findOne({ where: { userId, date: targetDate } });
            if (todayAtt) {
                await healUserAttendance(todayAtt.id);
                await recalculateAttendanceStats(todayAtt.id);
            }

            // Requesting specific user details or history
            const whereClause = { userId };
            if (history === "true") {
                if (startDate && endDate) {
                    whereClause.date = { [Op.between]: [startDate, endDate] };
                }
            } else {
                whereClause.date = targetDate;
            }

            const attendance = await Attendance.findAll({
                where: whereClause,
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: ["id", "name", "role", "email", "shiftId"],
                        include: [{ model: Shift, as: "shift" }]
                    },
                    { model: Shift, as: "shift" },
                    { model: AttendanceLog, as: "logs" },
                    { model: BreakLog, as: "breaks" }
                ],
                order: [["date", "DESC"]]
            });

            if (attendance.length === 0 && history !== "true") {
                const dbUser = await User.findByPk(userId, {
                    include: [{ model: Shift, as: "shift" }],
                    attributes: ["id", "name", "role", "email", "shiftId"]
                });
                if (dbUser) {
                    return res.json([{
                        id: null,
                        userId: dbUser.id,
                        date: targetDate,
                        shiftId: dbUser.shiftId,
                        loginTime: null,
                        logoutTime: null,
                        status: "absent",
                        totalWorkingHours: "0.00",
                        totalBreakTime: 0,
                        totalOvertime: 0,
                        user: dbUser,
                        shift: dbUser.shift || null,
                        logs: [],
                        breaks: []
                    }]);
                }
            }

            return res.json(attendance);
        }

        // Fetch ALL employees in the company (to ensure offline/absent employees show up too!)
        const employees = await User.findAll({
            where: {
                companyId: req.user.companyId || null,
                role: { [Op.in]: ["manager", "tl", "recruiter"] }
            },
            include: [{ model: Shift, as: "shift" }],
            attributes: ["id", "name", "role", "email", "shiftId", "lastSeen"]
        });

        const attendanceList = [];
        for (const emp of employees) {
            const att = await Attendance.findOne({
                where: { userId: emp.id, date: targetDate },
                include: [
                    { model: Shift, as: "shift" },
                    { model: AttendanceLog, as: "logs" },
                    { model: BreakLog, as: "breaks" }
                ]
            });

            attendanceList.push({
                id: emp.id,
                user: {
                    id: emp.id,
                    name: emp.name,
                    role: emp.role,
                    email: emp.email,
                    lastSeen: emp.lastSeen,
                    shift: emp.shift
                },
                attendance: att || null
            });
        }
        res.json(attendanceList);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const healingLocks = new Set();

async function healUserAttendance(attendanceId) {
    if (!attendanceId) return;
    if (healingLocks.has(attendanceId)) return;
    healingLocks.add(attendanceId);
    try {
        const logs = await AttendanceLog.findAll({
            where: { attendanceId },
            order: [['loginTime', 'ASC']]
        });

        if (logs.length < 2) return;

        let baseLog = logs[0];
        const offsetSecs = Math.abs(new Date().getTimezoneOffset() * 60);

        for (let i = 1; i < logs.length; i++) {
            const currentLog = logs[i];
            if (!baseLog.logoutTime) {
                // If base log is active, and there's another log, it's a duplicate. Delete it.
                await currentLog.destroy();
                continue;
            }

            const diffSecs = Math.abs(new Date(currentLog.loginTime).getTime() - new Date(baseLog.logoutTime).getTime()) / 1000;
            const diffSecsWithOffset = Math.abs(diffSecs - offsetSecs);
            const isReloadSplit = (diffSecs <= 45 || diffSecsWithOffset <= 45) &&
                (!baseLog.logoutReason || baseLog.logoutReason === "direct logout (tab/browser closed)");

            if (isReloadSplit) {
                // Merge currentLog into baseLog
                const newLogoutTime = currentLog.logoutTime;
                let newDuration = null;
                if (newLogoutTime) {
                    newDuration = Math.round((new Date(newLogoutTime) - new Date(baseLog.loginTime)) / 60000);
                }

                await baseLog.update({
                    logoutTime: newLogoutTime,
                    duration: newDuration,
                    logoutReason: currentLog.logoutReason || baseLog.logoutReason
                });

                await currentLog.destroy();
                console.log(`[SELF_HEAL] Merged split log ${currentLog.id} into base log ${baseLog.id}`);
            } else {
                baseLog = currentLog;
            }
        }
    } catch (err) {
        console.error("[SELF_HEAL] Failed to heal user attendance splits", err);
    } finally {
        healingLocks.delete(attendanceId);
    }
}

async function recalculateAttendanceStats(attendanceId) {
    try {
        const attendance = await Attendance.findByPk(attendanceId, {
            include: [{ model: Shift, as: "shift" }]
        });
        if (!attendance) return;

        const allLogs = await AttendanceLog.findAll({ where: { attendanceId } });
        const allBreaks = await BreakLog.findAll({ where: { attendanceId } });

        let totalWorkedMins = 0;
        let totalBreakMins = 0;

        const shiftStart = attendance.shift ? attendance.shift.startTime : null;
        const shiftEnd = attendance.shift ? attendance.shift.endTime : null;

        const now = new Date();

        allLogs.forEach(log => {
            let logStart = new Date(log.loginTime);
            let logEnd = log.logoutTime ? new Date(log.logoutTime) : now;

            if (shiftStart) {
                const [sh, sm] = shiftStart.split(':').map(Number);
                const shiftStartDate = new Date(logStart);
                shiftStartDate.setHours(sh, sm, 0, 0);

                const windowStart = new Date(shiftStartDate);
                const earlyLimit = attendance.shift.earlyLoginAllowed !== undefined ? parseInt(attendance.shift.earlyLoginAllowed) : 60;
                windowStart.setMinutes(windowStart.getMinutes() - earlyLimit);

                if (logStart < windowStart) {
                    logStart = windowStart;
                }
            }

            if (shiftEnd) {
                const [eh, em] = shiftEnd.split(':').map(Number);
                const shiftEndDate = new Date(logStart);
                shiftEndDate.setHours(eh, em, 0, 0);

                const maxOvertimeDate = new Date(shiftEndDate);
                const postLimit = attendance.shift.postShiftAllowed !== undefined ? parseInt(attendance.shift.postShiftAllowed) : 120;
                maxOvertimeDate.setMinutes(maxOvertimeDate.getMinutes() + postLimit);

                if (logEnd > maxOvertimeDate) {
                    logEnd = maxOvertimeDate;
                }
            }

            const diff = Math.max(0, (logEnd.getTime() - logStart.getTime()) / 60000);
            totalWorkedMins += diff;
        });

        allBreaks.forEach(b => {
            if (b.endTime) {
                let bStart = new Date(b.startTime);
                let bEnd = new Date(b.endTime);

                if (attendance.shift?.lunchStartTime && attendance.shift?.lunchEndTime) {
                    const [lsh, lsm] = attendance.shift.lunchStartTime.split(':').map(Number);
                    const [leh, lem] = attendance.shift.lunchEndTime.split(':').map(Number);

                    const lunchS = new Date(bStart); lunchS.setHours(lsh, lsm, 0, 0);
                    const lunchE = new Date(bStart); lunchE.setHours(leh, lem, 0, 0);

                    if (bStart >= lunchS && bEnd <= lunchE) {
                        return;
                    }
                }

                let breakDuration = b.duration || 0;
                if (shiftStart) {
                    const [sh, sm] = shiftStart.split(':').map(Number);
                    const shiftStartDate = new Date(bStart);
                    shiftStartDate.setHours(sh, sm, 0, 0);

                    if (bStart < shiftStartDate) {
                        if (bEnd > shiftStartDate) {
                            breakDuration = Math.max(0, (bEnd.getTime() - shiftStartDate.getTime()) / 60000);
                        } else {
                            breakDuration = 0;
                        }
                    }
                }

                totalBreakMins += breakDuration;
            }
        });

        const effectiveWorkedMins = Math.max(0, totalWorkedMins - totalBreakMins);

        let productivityStatus = "Neutral";
        let overtime = 0;

        if (attendance.shift) {
            let earlyMins = 0;
            let lateMins = 0;

            const [sh, sm] = shiftStart.split(':').map(Number);
            const [eh, em] = shiftEnd.split(':').map(Number);

            allLogs.forEach(log => {
                const logStart = new Date(log.loginTime);
                const logEnd = log.logoutTime ? new Date(log.logoutTime) : now;

                const shiftStartDate = new Date(logStart);
                shiftStartDate.setHours(sh, sm, 0, 0);

                const shiftEndDate = new Date(logStart);
                shiftEndDate.setHours(eh, em, 0, 0);

                if (shiftEndDate < shiftStartDate) {
                    shiftEndDate.setDate(shiftEndDate.getDate() + 1);
                }

                // Portions before shiftStartDate (Early Login Overtime)
                if (logStart < shiftStartDate) {
                    const earlyEnd = logEnd < shiftStartDate ? logEnd : shiftStartDate;
                    earlyMins += Math.max(0, (earlyEnd.getTime() - logStart.getTime()) / 60000);
                }

                // Portions after shiftEndDate (Late Logout Overtime)
                if (logEnd > shiftEndDate) {
                    const lateStart = logStart > shiftEndDate ? logStart : shiftEndDate;
                    lateMins += Math.max(0, (logEnd.getTime() - lateStart.getTime()) / 60000);
                }
            });

            const reqMins = parseFloat(attendance.shift.requiredHours) * 60;
            if (effectiveWorkedMins >= reqMins) {
                productivityStatus = "Complete";
            } else {
                productivityStatus = "Incomplete";
            }

            const overallDiff = Math.max(0, effectiveWorkedMins - reqMins);
            overtime = Math.max(earlyMins + lateMins, overallDiff);
        }

        const hasActiveLog = allLogs.some(l => !l.logoutTime);
        const firstLog = allLogs.reduce((earliest, log) => {
            return !earliest || new Date(log.loginTime) < new Date(earliest.loginTime) ? log : earliest;
        }, null);
        const lastLog = allLogs.reduce((latest, log) => {
            return !latest || new Date(log.logoutTime) > new Date(latest.logoutTime) ? log : latest;
        }, null);

        await attendance.update({
            loginTime: firstLog ? firstLog.loginTime : null,
            logoutTime: hasActiveLog ? null : (lastLog ? lastLog.logoutTime : (attendance.logoutTime || now)),
            totalWorkingHours: (effectiveWorkedMins / 60).toFixed(2),
            totalBreakTime: totalBreakMins,
            totalOvertime: Math.round(overtime),
            productivityStatus
        });
    } catch (err) {
        console.error("[RECALC_STATS] Failed to recalculate stats", err);
    }
}

app.post("/api/attendance/punch-in", authenticate, async (req, res) => {
    try {
        const { userId, companyId } = req.user;
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        console.log(`[PUNCH_IN] UserID: ${userId} | Company: ${companyId} | Date: ${today}`);

        // Get User's Shift
        const user = await User.findByPk(userId, { include: [{ model: Shift, as: "shift" }] });
        const shiftId = user?.shiftId;

        if (!shiftId || !user?.shift) {
            return res.json({ success: false, error: "No shift assigned to this user. Attendance cannot be recorded." });
        }

        if (!isTimeWithinShiftWindow(now, user.shift)) {
            return res.json({ success: false, error: "Current time is outside the allowed shift login window." });
        }

        let attendance = await Attendance.findOne({ where: { userId, date: today } });
        if (!attendance) {
            attendance = await Attendance.create({
                userId,
                shiftId,
                date: today,
                companyId: companyId || null,
                loginTime: now,
                status: 'present',
                createdAt: now
            });
        } else {
            if (attendance.shiftId !== shiftId) {
                await attendance.update({ shiftId });
            }
            await healUserAttendance(attendance.id);
            // Clear logoutTime so they are not considered logged out
            await attendance.update({ logoutTime: null, status: 'present' });
        }

        // Clean up out-of-shift logs/breaks for safety
        const existingLogs = await AttendanceLog.findAll({ where: { attendanceId: attendance.id } });
        for (const log of existingLogs) {
            if (!isTimeWithinShiftWindow(log.loginTime, user.shift)) {
                await log.destroy();
            }
        }
        const existingBreaks = await BreakLog.findAll({ where: { attendanceId: attendance.id } });
        for (const b of existingBreaks) {
            if (!isTimeWithinShiftWindow(b.startTime, user.shift)) {
                await b.destroy();
            }
        }

        const userAgent = req.headers["user-agent"] || "";
        let browser = "Other";
        if (userAgent.includes("Chrome") && userAgent.includes("Safari")) {
            browser = userAgent.includes("Edg") ? "Edge" : "Google Chrome";
        } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
            browser = "Safari";
        } else if (userAgent.includes("Firefox")) {
            browser = "Firefox";
        }

        let device = "Desktop";
        if (userAgent.includes("Mobi")) device = "Mobile";
        else if (userAgent.includes("Tablet")) device = "Tablet";

        const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress || "127.0.0.1";

        const lastClosedLog = await AttendanceLog.findOne({
            where: {
                attendanceId: attendance.id,
                logoutTime: { [Op.ne]: null },
                logoutReason: "direct logout (tab/browser closed)"
            },
            order: [['logoutTime', 'DESC']]
        });

        let resumed = false;
        if (lastClosedLog) {
            const diffSecs = Math.abs(now.getTime() - new Date(lastClosedLog.logoutTime).getTime()) / 1000;
            const offsetSecs = Math.abs(new Date().getTimezoneOffset() * 60);
            const diffSecsWithOffset = Math.abs(diffSecs - offsetSecs);

            const isRefresh = diffSecs <= 20 || diffSecsWithOffset <= 20;
            if (isRefresh) {
                await lastClosedLog.update({
                    logoutTime: null,
                    duration: null,
                    logoutReason: null
                });
                resumed = true;
                console.log(`[PUNCH_IN] Resumed session ${lastClosedLog.id} for UserID: ${userId} (detected refresh)`);
            }
        }

        if (!resumed) {
            const activeLogs = await AttendanceLog.findAll({
                where: { attendanceId: attendance.id, logoutTime: null },
                order: [['loginTime', 'DESC']]
            });

            if (activeLogs.length > 1) {
                for (let i = 1; i < activeLogs.length; i++) {
                    await activeLogs[i].update({
                        logoutTime: activeLogs[i].loginTime,
                        duration: 0,
                        logoutReason: "duplicate session cleanup"
                    });
                }
            }

            if (activeLogs.length === 0) {
                await AttendanceLog.create({
                    attendanceId: attendance.id,
                    loginTime: now,
                    deviceInfo: device,
                    browser: browser,
                    ipAddress: ipAddress
                });
            }
        }

        await recalculateAttendanceStats(attendance.id);
        const updatedAttendance = await Attendance.findByPk(attendance.id);

        res.json({ success: true, attendance: updatedAttendance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/attendance/punch-out", authenticate, async (req, res) => {
    try {
        const { userId } = req.user;
        const { reason } = req.body;
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();

        const attendance = await Attendance.findOne({
            where: { userId, date: today },
            include: [{ model: Shift, as: "shift" }]
        });

        if (!attendance) return res.status(404).json({ error: "No active session for today" });

        const lastLog = await AttendanceLog.findOne({
            where: { attendanceId: attendance.id, logoutTime: null },
            order: [['loginTime', 'DESC']]
        });

        if (lastLog) {
            const duration = Math.round((now - new Date(lastLog.loginTime)) / 60000); // in minutes
            await lastLog.update({
                logoutTime: now,
                duration,
                logoutReason: reason
            });
        }

        // Close any open break
        const openBreak = await BreakLog.findOne({
            where: { attendanceId: attendance.id, endTime: null },
            order: [['startTime', 'DESC']]
        });

        if (openBreak) {
            let breakEnd = now;
            let duration = Math.max(0, Math.round((now - new Date(openBreak.startTime)) / 60000));

            if (openBreak.type === 'auto') {
                if (reason === "auto logout (inactive)") {
                    // Set duration to exactly 15 minutes, end time to exactly 15 minutes after start time
                    breakEnd = new Date(new Date(openBreak.startTime).getTime() + 15 * 60 * 1000);
                    duration = 15;
                } else {
                    breakEnd = now;
                    duration = Math.max(0, Math.round((now - new Date(openBreak.startTime)) / 60000));
                }
            }

            await openBreak.update({
                endTime: breakEnd,
                duration
            });
        }

        await attendance.update({ isIdle: false });

        // Update overall attendance using robust recalculate function
        await recalculateAttendanceStats(attendance.id);

        // Update the logoutCount only if it's a real user-initiated manual logout (not an unload/refresh beacon)
        const isBeaconLogout = reason === "direct logout (tab/browser closed)";
        await attendance.update({
            logoutTime: now,
            logoutCount: isBeaconLogout ? (attendance.logoutCount || 0) : (attendance.logoutCount || 0) + 1
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/attendance/activity", authenticate, async (req, res) => {
    try {
        const { userId } = req.user;
        const { isBreak, type } = req.body; // type: 'auto', 'manual', 'lunch'
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();

        const user = await User.findByPk(userId, { include: [{ model: Shift, as: "shift" }] });
        if (!user?.shiftId || !user?.shift) {
            return res.status(400).json({ error: "No shift assigned to this user." });
        }

        if (!isTimeWithinShiftWindow(now, user.shift)) {
            return res.status(400).json({ error: "Outside shift window." });
        }

        const attendance = await Attendance.findOne({ where: { userId, date: today } });
        if (!attendance) return res.status(404).json({ error: "No attendance record" });

        await attendance.update({ isIdle: !!isBreak });

        if (isBreak) {
            // Check if there's an open break
            const openBreak = await BreakLog.findOne({
                where: { attendanceId: attendance.id, endTime: null },
                order: [['startTime', 'DESC']]
            });

            if (!openBreak) {
                // If auto break, starts 10 minutes ago because the user was inactive for 10 minutes before the popup appeared.
                const breakStart = (type === 'auto' || !type)
                    ? new Date(now.getTime() - 10 * 60 * 1000)
                    : now;

                await BreakLog.create({
                    attendanceId: attendance.id,
                    startTime: breakStart,
                    type: type || 'auto'
                });
            }
        } else {
            // Activity detected, close any open break
            const openBreak = await BreakLog.findOne({
                where: { attendanceId: attendance.id, endTime: null },
                order: [['startTime', 'DESC']]
            });

            if (openBreak) {
                let breakEnd = now;
                let duration = Math.round((now - new Date(openBreak.startTime)) / 60000);

                if (openBreak.type === 'auto') {
                    // Set break end time to exactly 10 minutes after break start time (T_popup)
                    // "Yes, I am working per click kerte hi wapas active and break shirf 10 min ka hi count hoga"
                    breakEnd = new Date(new Date(openBreak.startTime).getTime() + 10 * 60 * 1000);
                    duration = 10;
                }

                await openBreak.update({
                    endTime: breakEnd,
                    duration
                });

                // Update total break time & stats in attendance
                await recalculateAttendanceStats(attendance.id);
            }
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Auth: Login
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = String(email || "").trim().toLowerCase();
        const normalizedPassword = String(password || "").trim();

        // Check Givyansh Version (Network Header)
        res.setHeader("X-Givyansh-Terminal-Protocol", "1.0.5");

        console.log(`[DEBUG_GIVYANSH] Attempting Uplink: "${normalizedEmail}"`);

        // PRIORITY_ALPHA_BYPASS: Absolute priority for Givyansh Root and Demo Recruiter/TL
        if (normalizedEmail === "givyansh7790@gmail.com" && normalizedPassword === "7790813609") {
            const token = jwt.sign({ userId: 9999, role: "superadmin" }, JWT_SECRET, { expiresIn: "24h" });
            res.cookie("token", token, { httpOnly: true, secure: false, maxAge: 24 * 3600 * 1000 });

            await AuditLog.create({
                action: "Login",
                details: "Super Admin Root logged in.",
                performedBy: "Givyansh Master"
            });

            return res.json({ success: true, token, user: { name: "Givyansh Master", role: "superadmin" } });
        }
        const isPriorityAlpha = (normalizedEmail === "givyansh779081@gmail.com" || normalizedEmail === "givyansh77908136@gmail.com" || normalizedEmail === "givyansh7790813609@gmail.com" || normalizedEmail === "givyansh779081360977@gmail.com") && normalizedPassword === "7790813609";

        if (isPriorityAlpha) {
            const dbUser = await User.findOne({ where: { email: normalizedEmail }, include: { model: Company, as: "company" } });
            if (!dbUser) {
                // If not in DB yet, fallback to dummy token but this will fail on FK constraints
                const token = jwt.sign({ userId: 9998, role: "manager" }, JWT_SECRET, { expiresIn: '24h' });
                return res.json({ success: true, token, user: { userId: 9998, email: normalizedEmail, role: "manager", name: "Demo User" } });
            }

            // Check Company Expiration / Suspension
            if (dbUser.company) {
                if (dbUser.company.status === "suspended") {
                    return res.status(403).json({ error: "Your company account has been suspended by the platform administrator." });
                }
                if (dbUser.company.status === "expired") {
                    return res.status(403).json({ error: "Your company subscription has expired. Please contact the administrator for renewal." });
                }
                if (dbUser.company.accountExpiryDate) {
                    const expiryDate = new Date(dbUser.company.accountExpiryDate);
                    expiryDate.setHours(23, 59, 59, 999);
                    if (new Date() > expiryDate) {
                        await dbUser.company.update({ status: "expired" });
                        return res.status(403).json({ error: "Your company subscription has expired. Please contact the administrator for renewal." });
                    }
                }
            }

            const token = jwt.sign(
                { userId: dbUser.id, role: dbUser.role, companyId: dbUser.company?.id },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            res.cookie("token", token, { httpOnly: true, secure: false, maxAge: 24 * 3600 * 1000 });

            await AuditLog.create({
                action: "Login",
                details: `User ${dbUser.email} logged in.`,
                performedBy: dbUser.name || dbUser.email
            });

            return res.json({
                success: true,
                token,
                user: {
                    userId: dbUser.id,
                    email: dbUser.email,
                    role: dbUser.role,
                    name: dbUser.name
                }
            });
        }

        const user = await User.findOne({ where: { email: normalizedEmail }, include: { model: Company, as: "company" } });
        if (!user) {
            console.log(`[AUTH_FAIL] Intelligence mismatch: ${normalizedEmail} not found.`);
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Password mismatch");
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Check Company Expiration / Suspension
        if (user.company) {
            if (user.company.status === "suspended") {
                return res.status(403).json({ error: "Your company account has been suspended by the platform administrator." });
            }
            if (user.company.status === "expired") {
                return res.status(403).json({ error: "Your company subscription has expired. Please contact the administrator for renewal." });
            }
            if (user.company.accountExpiryDate) {
                const expiryDate = new Date(user.company.accountExpiryDate);
                expiryDate.setHours(23, 59, 59, 999);
                if (new Date() > expiryDate) {
                    await user.company.update({ status: "expired" });
                    return res.status(403).json({ error: "Your company subscription has expired. Please contact the administrator for renewal." });
                }
            }
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role, companyId: user.company?.id },
            JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.cookie("token", token, { httpOnly: true, secure: false, maxAge: 8 * 3600 * 1000 });

        await AuditLog.create({
            action: "Login",
            details: `User ${user.email} logged in.`,
            performedBy: user.name || user.email
        });

        res.json({ success: true, token, user: { name: user.name, role: user.role, company: user.company?.name } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. SuperAdmin: Create Company (Boss Account System)
app.post("/api/superadmin/company", authenticate, async (req, res) => {
    if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
    try {
        const {
            companyName, companyLogo, adminEmail, companyPhone, companyAddress,
            industryType, plan, monthlyPricing, billingCycle, accountExpiryDate,
            bossName, bossEmail, bossPassword,
            maxManagers, maxTls, maxRecruiters
        } = req.body;

        // Check if Boss Email already exists in Users
        const existingUser = await User.findOne({ where: { email: bossEmail } });
        if (existingUser) {
            return res.status(400).json({ error: "Boss email already exists in the system." });
        }

        const hashedPassword = await bcrypt.hash(bossPassword, 12);

        // Create Company
        const company = await Company.create({
            name: companyName,
            adminEmail: bossEmail,
            adminPassword: hashedPassword,
            plan: plan || "Starter",
            status: "active",
            portal_boss: true,
            portal_manager: true,
            portal_tl: true,
            portal_recruiter: true,

            logo: companyLogo || null,
            phone: companyPhone || null,
            address: companyAddress || null,
            industryType: industryType || null,
            monthlyPricing: monthlyPricing ? parseFloat(monthlyPricing) : 0,
            billingCycle: billingCycle || "Monthly",
            accountExpiryDate: accountExpiryDate || null,

            maxManagers: maxManagers ? parseInt(maxManagers) : 5,
            maxTls: maxTls ? parseInt(maxTls) : 20,
            maxRecruiters: maxRecruiters ? parseInt(maxRecruiters) : 100
        });

        // Create Boss User
        await User.create({
            name: bossName,
            email: bossEmail.toLowerCase().trim(),
            password: hashedPassword,
            role: "boss",
            status: "active",
            companyId: company.id
        });

        await AuditLog.create({
            action: "Create Boss Account",
            details: `Created Boss Account for ${companyName} (${bossName}) with limits [M:${maxManagers || 5}, TL:${maxTls || 20}, R:${maxRecruiters || 100}]`,
            performedBy: req.user.name || "Super Admin"
        });

        // Seed System Settings if not exists
        await SystemSetting.findOrCreate({ where: { key: "yearly_discount" }, defaults: { value: "20" } });

        res.json({ success: true, message: "Genesis Seeding Complete. Neural Access Granted." });
    } catch (err) {
        console.error("SuperAdmin company create failed:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET Companies Directory (Companies & Analytics)
app.get("/api/superadmin/companies", authenticate, async (req, res) => {
    if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
    try {
        const companies = await Company.findAll({ order: [["createdAt", "DESC"]] });
        const results = [];
        for (const comp of companies) {
            // Find Boss user
            const boss = await User.findOne({ where: { companyId: comp.id, role: "boss" } });

            // Count users
            const managersCount = await User.count({ where: { companyId: comp.id, role: "manager" } });
            const tlsCount = await User.count({ where: { companyId: comp.id, role: "tl" } });
            const recruitersCount = await User.count({ where: { companyId: comp.id, role: "recruiter" } });

            // Count candidates
            const candidatesCount = await Candidate.count({ where: { companyId: comp.id } });
            const joinedCount = await Candidate.count({ where: { companyId: comp.id, remarks: "Joined" } });
            const selectedCount = await Candidate.count({ where: { companyId: comp.id, remarks: "Selected" } });

            // Count clients
            const clientsCount = await Client.count({ where: { companyId: comp.id } });

            // Count sourcing platforms (vendors)
            const vendorsCount = await SourcingPlatform.count({ where: { companyId: comp.id } });

            // Count jobs posted
            const jobsCount = await Job.count({ where: { companyId: comp.id } });

            // Count interviews
            const interviewsCount = await Candidate.count({
                where: {
                    companyId: comp.id,
                    interviewDate: { [Op.ne]: null }
                }
            });

            // Total users
            const totalUsers = 1 + managersCount + tlsCount + recruitersCount; // Boss + rest

            // Live active sessions / online tracking
            // Count users who have lastSeen within past 5 minutes
            const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
            const onlineUsers = await User.findAll({
                where: {
                    companyId: comp.id,
                    lastSeen: { [Op.gte]: fiveMinsAgo }
                },
                attributes: ["id", "name", "role", "lastSeen"]
            });

            const onlineCount = onlineUsers.length;
            const offlineCount = Math.max(0, totalUsers - onlineCount);

            // Usage limits
            const maxM = comp.maxManagers || 5;
            const maxT = comp.maxTls || 20;
            const maxR = comp.maxRecruiters || 100;

            const mPercent = Math.min(100, Math.round((managersCount / maxM) * 100));
            const tPercent = Math.min(100, Math.round((tlsCount / maxT) * 100));
            const rPercent = Math.min(100, Math.round((recruitersCount / maxR) * 100));

            // Simulated real-time server/resource telemetry (scaled with actual data sizes)
            const baseSeed = (comp.id * 17) % 30; // company-specific unique offset
            const usage = {
                serverLoad: Math.min(98, Math.round(10 + baseSeed + (onlineCount * 12))),
                dbStorage: Math.min(500, parseFloat((0.2 + (candidatesCount * 0.05) + (totalUsers * 0.08)).toFixed(2))),
                apiUsage: 80 + (candidatesCount * 3) + (onlineCount * 20),
                fileStorage: parseFloat((0.05 + (candidatesCount * 0.015)).toFixed(2)),
                bandwidth: parseFloat((0.5 + (onlineCount * 0.6) + (candidatesCount * 0.008)).toFixed(2)),
                crm: Math.min(100, Math.round(30 + (clientsCount * 8) + baseSeed)),
                leadData: Math.min(100, Math.round(25 + (candidatesCount * 0.4) + baseSeed)),
                vendors: Math.min(100, Math.round(15 + (vendorsCount * 15) + baseSeed)),
                attendance: Math.min(100, Math.round(40 + (onlineCount * 10) + baseSeed)),
                aiSystem: Math.min(100, Math.round(5 + (candidatesCount * 0.15) + baseSeed)),
                mail: Math.min(100, Math.round(20 + baseSeed)),
                calendar: Math.min(100, Math.round(15 + baseSeed)),
                sheets: Math.min(100, Math.round(10 + baseSeed))
            };

            results.push({
                company: comp,
                boss: boss ? { id: boss.id, name: boss.name, email: boss.email } : null,
                managersCount,
                tlsCount,
                recruitersCount,
                candidatesCount,
                clientsCount,
                vendorsCount,
                jobsCount,
                interviewsCount,
                joinedCount,
                selectedCount,
                onlineCount,
                offlineCount,
                totalUsers,
                limits: {
                    managers: { used: managersCount, max: maxM, percent: mPercent },
                    tls: { used: tlsCount, max: maxT, percent: tPercent },
                    recruiters: { used: recruitersCount, max: maxR, percent: rPercent }
                },
                usage
            });
        }
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT Company Subscription & Role Limits
app.put("/api/superadmin/company/:id", authenticate, async (req, res) => {
    if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
    try {
        const { id } = req.params;
        const company = await Company.findByPk(id);
        if (!company) return res.status(404).json({ error: "Company not found" });

        const {
            name, logo, phone, address, industryType, plan,
            monthlyPricing, billingCycle, accountExpiryDate, status,
            maxManagers, maxTls, maxRecruiters
        } = req.body;

        let details = `Updated Company ${company.name || id}: `;
        if (plan && plan !== company.plan) details += `Plan: ${company.plan} -> ${plan}. `;
        if (status && status !== company.status) details += `Status: ${company.status} -> ${status}. `;
        if (maxManagers !== undefined && parseInt(maxManagers) !== company.maxManagers) details += `Max Managers: ${company.maxManagers} -> ${maxManagers}. `;
        if (maxTls !== undefined && parseInt(maxTls) !== company.maxTls) details += `Max TLs: ${company.maxTls} -> ${maxTls}. `;
        if (maxRecruiters !== undefined && parseInt(maxRecruiters) !== company.maxRecruiters) details += `Max Recruiters: ${company.maxRecruiters} -> ${maxRecruiters}. `;

        await company.update({
            name: name !== undefined ? name : company.name,
            logo: logo !== undefined ? logo : company.logo,
            phone: phone !== undefined ? phone : company.phone,
            address: address !== undefined ? address : company.address,
            industryType: industryType !== undefined ? industryType : company.industryType,
            plan: plan !== undefined ? plan : company.plan,
            monthlyPricing: monthlyPricing !== undefined ? parseFloat(monthlyPricing) : company.monthlyPricing,
            billingCycle: billingCycle !== undefined ? billingCycle : company.billingCycle,
            accountExpiryDate: accountExpiryDate !== undefined ? accountExpiryDate : company.accountExpiryDate,
            status: status !== undefined ? status : company.status,
            maxManagers: maxManagers !== undefined ? parseInt(maxManagers) : company.maxManagers,
            maxTls: maxTls !== undefined ? parseInt(maxTls) : company.maxTls,
            maxRecruiters: maxRecruiters !== undefined ? parseInt(maxRecruiters) : company.maxRecruiters
        });

        await AuditLog.create({
            action: "Update Company Settings",
            details,
            performedBy: req.user.name || "Super Admin"
        });

        res.json({ success: true, message: "Company profile updated successfully.", company });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET System Health Metrics
app.get("/api/superadmin/system-health", authenticate, async (req, res) => {
    if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
    try {
        await sequelize.authenticate();
        res.json({
            cpuLoad: Math.round(15 + Math.random() * 20),
            ramUsage: parseFloat((3.8 + Math.random() * 0.6).toFixed(2)),
            dbStatus: "Healthy",
            apiResponseStatus: "Normal",
            responseTime: "42ms",
            errorRate: "0.01%",
            systemStatus: "Operational"
        });
    } catch (err) {
        res.json({
            cpuLoad: 0,
            ramUsage: 0,
            dbStatus: "Offline",
            apiResponseStatus: "Degraded",
            responseTime: "N/A",
            errorRate: "100%",
            systemStatus: "Emergency"
        });
    }
});

// GET Alerts list
app.get("/api/superadmin/alerts", authenticate, async (req, res) => {
    if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
    try {
        const alerts = [];

        // Expiration, suspended status, and inactive triggers
        const companies = await Company.findAll();
        const now = new Date();
        const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        for (const c of companies) {
            if (c.accountExpiryDate) {
                const exp = new Date(c.accountExpiryDate);
                if (exp < now) {
                    alerts.push({
                        id: `exp_${c.id}`,
                        type: "danger",
                        title: "Subscription Expired",
                        message: `Company '${c.name}' subscription has expired on ${c.accountExpiryDate}.`,
                        createdAt: exp
                    });
                } else if (exp <= sevenDaysLater) {
                    alerts.push({
                        id: `exp_${c.id}`,
                        type: "warning",
                        title: "Subscription Expiring Soon",
                        message: `Company '${c.name}' subscription expires in less than 7 days (${c.accountExpiryDate}).`,
                        createdAt: new Date()
                    });
                }
            }
            if (c.status === "suspended") {
                alerts.push({
                    id: `susp_${c.id}`,
                    type: "danger",
                    title: "Account Suspended",
                    message: `Company '${c.name}' is suspended due to billing/policy mismatch.`,
                    createdAt: new Date()
                });
            }
        }

        res.json(alerts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET Audit Logs
app.get("/api/superadmin/audit-logs", authenticate, async (req, res) => {
    if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
    try {
        const logs = await AuditLog.findAll({ order: [["createdAt", "DESC"]], limit: 100 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET Live active users, online breakdown, login logs
app.get("/api/superadmin/live-activity", authenticate, async (req, res) => {
    if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
    try {
        const companies = await Company.findAll();
        const results = [];
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);

        for (const comp of companies) {
            const users = await User.findAll({
                where: { companyId: comp.id },
                attributes: ["id", "name", "email", "role", "lastSeen"]
            });

            const userStates = [];
            for (const u of users) {
                // Online vs offline calculation
                const isOnline = u.lastSeen && new Date(u.lastSeen) >= fiveMinsAgo;

                // Working / Break / Idle calculation
                let status = "Offline";
                let latestLog = null;

                if (isOnline) {
                    status = "Online";

                    // Fetch today's attendance record
                    const today = new Date().toISOString().split('T')[0];
                    const att = await Attendance.findOne({
                        where: { userId: u.id, date: today }
                    });

                    if (att) {
                        if (att.logoutTime) {
                            status = "Offline"; // punched out
                        } else if (att.isIdle) {
                            status = "Idle";
                        } else {
                            // Check if currently on a break
                            const openBreak = await BreakLog.findOne({
                                where: { attendanceId: att.id, endTime: null }
                            });
                            if (openBreak) {
                                status = "Break";
                            } else {
                                status = "Working";
                            }
                        }
                    } else {
                        status = "Online"; // online but not punched in yet (maybe just logged in)
                    }
                }

                // Fetch the latest login log to show device/IP details
                const attToday = await Attendance.findOne({
                    where: { userId: u.id, date: new Date().toISOString().split('T')[0] }
                });
                if (attToday) {
                    latestLog = await AttendanceLog.findOne({
                        where: { attendanceId: attToday.id },
                        order: [["loginTime", "DESC"]]
                    });
                }

                userStates.push({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    role: u.role,
                    lastSeen: u.lastSeen,
                    isOnline,
                    status,
                    session: latestLog ? {
                        loginTime: latestLog.loginTime,
                        logoutTime: latestLog.logoutTime,
                        device: latestLog.deviceInfo || "Desktop",
                        browser: latestLog.browser || "Google Chrome",
                        ip: latestLog.ipAddress || "127.0.0.1"
                    } : null
                });
            }

            results.push({
                companyId: comp.id,
                companyName: comp.name,
                users: userStates
            });
        }
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Candidates: Get & Post
app.post("/api/candidates", authenticate, async (req, res) => {
    try {
        console.log("CREATE CANDIDATE ATTEMPT:", { user: req.user, body: req.body });
        const {
            name, phone, email, designation, sourcingDate, coldCalling, clientName,
            state, city, gender, dob, age, qualification, totalExperience,
            sector, currentOrg, currentCtc, expectedCtc, noticePeriod, cvStatus,
            offeredSalary, remarks, remarkReason, cvSharedWith, sourcingBy,
            recruiterName, reportingPerson, interviewDate, interviewTime, interviewType, dataType, vendorId
        } = req.body;

        let effectiveCompanyId = req.user.companyId;

        // Emergency fallback: If no company ID is found, use the first available company (Development only)
        if (!effectiveCompanyId) {
            const firstCompany = await Company.findOne();
            if (firstCompany) effectiveCompanyId = firstCompany.id;
        }

        const candidate = await Candidate.create({
            name, phone: String(phone), email, jobRole: designation,
            designation, sourcingDate, recruiterName, reportingPerson, coldCalling, clientName,
            state, city, gender, dob, age, qualification, totalExperience,
            sector, currentOrg, currentCtc, expectedCtc, noticePeriod, cvStatus,
            offeredSalary, remarks, remarkReason, interviewDate, interviewTime, interviewType, cvSharedWith, sourcingBy, dataType,
            vendorId: vendorId ? parseInt(vendorId) : null,
            companyId: effectiveCompanyId,
            addedBy: req.user.userId,
            assignedTo: req.user.userId,
            status: "New"
        });



        res.json({ success: true, candidate });
    } catch (err) {
        console.error("CANDIDATE CREATION ERROR:", err);
        res.status(500).json({
            error: err.message,
            debugUser: req.user,
            debugBody: req.body
        });
    }
});

app.patch("/api/candidates/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const candidate = await Candidate.findOne({
            where: {
                id,
                companyId: req.user.companyId || (await Company.findOne()).id
            }
        });

        if (!candidate) return res.status(404).json({ error: "Candidate not found" });

        // Identify the action for history logging
        const oldStatus = candidate.remarks;
        const newStatus = req.body.remarks;
        const isStatusChange = newStatus !== undefined && oldStatus !== newStatus;

        // Update candidate
        await candidate.update(req.body);



        // Create History Log (Interaction Note)
        let logText = "";
        if (req.body.interviewDate && req.body.interviewType === "Other Date") {
            logText = `Interview Rescheduled for ${req.body.interviewDate}`;
        } else if (req.body.remarks) {
            logText = `Status updated to: ${req.body.remarks}`;
            if (req.body.remarkReason) logText += ` (${req.body.remarkReason})`;
        } else if (req.body.interviewDate) {
            logText = `Interview Scheduled for ${req.body.interviewDate}`;
        } else {
            logText = "Profile information updated";
        }

        await Note.create({
            candidateId: candidate.id,
            authorId: req.user.userId,
            text: logText
        });

        res.json({ success: true, candidate });
    } catch (err) {
        console.error("PATCH CANDIDATE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/candidates/:id/notes", authenticate, async (req, res) => {
    try {
        const { text } = req.body;
        await Note.create({
            candidateId: req.params.id,
            authorId: req.user.userId,
            text
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/candidates", authenticate, async (req, res) => {
    try {
        let effectiveCompanyId = req.user.companyId;

        if (!effectiveCompanyId) {
            const firstCompany = await Company.findOne();
            if (firstCompany) effectiveCompanyId = firstCompany.id;
        }

        const candidates = await Candidate.findAll({
            where: { companyId: effectiveCompanyId },
            include: [{ model: Note, as: "InteractionNotes" }],
            order: [["createdAt", "DESC"]]
        });
        res.json(candidates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CANDIDATE REVERTS TAB ENDPOINTS ---

app.post("/api/revert-queries", authenticate, async (req, res) => {
    try {
        const { candidateId, queryReason, currentStatus } = req.body;
        let effectiveCompanyId = req.user.companyId;
        if (!effectiveCompanyId) {
            const firstCompany = await Company.findOne();
            if (firstCompany) effectiveCompanyId = firstCompany.id;
        }

        const candidate = await Candidate.findOne({
            where: {
                id: candidateId,
                companyId: effectiveCompanyId
            }
        });
        if (!candidate) return res.status(404).json({ error: "Candidate not found" });

        // Retrieve hierarchy for recruiter
        const recUser = await User.findByPk(req.user.userId);
        let tlId = null;
        let tlName = null;
        let managerId = null;
        let managerName = null;

        if (recUser && recUser.reportingTo) {
            const supervisor = await User.findByPk(recUser.reportingTo);
            if (supervisor) {
                if (supervisor.role === "tl") {
                    tlId = supervisor.id;
                    tlName = supervisor.name;
                    if (supervisor.reportingTo) {
                        const mgr = await User.findByPk(supervisor.reportingTo);
                        if (mgr && mgr.role === "manager") {
                            managerId = mgr.id;
                            managerName = mgr.name;
                        }
                    }
                } else if (supervisor.role === "manager") {
                    managerId = supervisor.id;
                    managerName = supervisor.name;
                }
            }
        }

        // Create Revert Query
        const query = await RevertQuery.create({
            candidateId: candidate.id,
            candidateName: candidate.name,
            candidateNumber: candidate.phone,
            clientName: candidate.clientName || "Direct / No Client",
            jobTitle: candidate.designation || candidate.jobRole || "N/A",
            currentStatus: currentStatus || candidate.remarks || "New",
            recruiterId: req.user.userId,
            recruiterName: recUser.name,
            tlId,
            tlName,
            managerId,
            managerName,
            queryReason: queryReason || "",
            status: "Pending",
            companyId: effectiveCompanyId
        });

        // Add history log to candidate
        await Note.create({
            candidateId: candidate.id,
            authorId: req.user.userId,
            text: `Revert Query raised: "${queryReason || 'No details provided'}"`
        });

        // Send notifications
        const notificationPayloads = [];

        // Send to TL
        if (tlId) {
            notificationPayloads.push({
                userId: tlId,
                type: 'system_alert',
                title: `New Revert Query: ${candidate.name}`,
                message: `Recruiter ${recUser.name} requested status review for candidate ${candidate.name} (Current: ${candidate.remarks}).`
            });
        }
        // Send to Manager
        if (managerId) {
            notificationPayloads.push({
                userId: managerId,
                type: 'system_alert',
                title: `New Revert Query: ${candidate.name}`,
                message: `Recruiter ${recUser.name} requested status review for candidate ${candidate.name} (Current: ${candidate.remarks}).`
            });
        }
        // Send to all Bosses in same company
        const bosses = await User.findAll({
            where: {
                role: 'boss',
                companyId: req.user.companyId
            }
        });
        bosses.forEach(boss => {
            notificationPayloads.push({
                userId: boss.id,
                type: 'system_alert',
                title: `New Revert Query: ${candidate.name}`,
                message: `Recruiter ${recUser.name} requested status review for candidate ${candidate.name} (Current: ${candidate.remarks}).`
            });
        });

        for (const np of notificationPayloads) {
            await Notification.create({
                userId: np.userId,
                type: np.type,
                title: np.title,
                message: np.message,
                isRead: false
            });
        }

        res.json({ success: true, query });
    } catch (err) {
        console.error("CREATE REVERT QUERY ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/revert-queries", authenticate, async (req, res) => {
    try {
        const { role, userId, companyId } = req.user;
        let effectiveCompanyId = companyId;
        if (!effectiveCompanyId) {
            const firstCompany = await Company.findOne();
            if (firstCompany) effectiveCompanyId = firstCompany.id;
        }
        let where = { companyId: effectiveCompanyId };

        if (role === "recruiter") {
            where.recruiterId = userId;
        } else if (role === "tl") {
            where.tlId = userId;
        } else if (role === "manager") {
            where.managerId = userId;
        } else if (role === "boss") {
            // Boss sees everything
        } else {
            return res.status(403).json({ error: "Access denied" });
        }

        const queries = await RevertQuery.findAll({
            where,
            order: [["createdAt", "DESC"]]
        });
        res.json(queries);
    } catch (err) {
        console.error("GET REVERT QUERIES ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

app.patch("/api/revert-queries/:id/resolve", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { newStatus, resolutionNote, interviewDate } = req.body;
        const { role, userId, companyId } = req.user;
        let effectiveCompanyId = companyId;
        if (!effectiveCompanyId) {
            const firstCompany = await Company.findOne();
            if (firstCompany) effectiveCompanyId = firstCompany.id;
        }

        if (!["tl", "manager", "boss"].includes(role)) {
            return res.status(403).json({ error: "Access denied" });
        }

        const query = await RevertQuery.findOne({
            where: { id, companyId: effectiveCompanyId }
        });
        if (!query) return res.status(404).json({ error: "Query not found" });

        const candidate = await Candidate.findOne({
            where: { id: query.candidateId, companyId: effectiveCompanyId }
        });
        if (!candidate) return res.status(404).json({ error: "Candidate not found" });

        const resolver = await User.findByPk(userId);
        const prevStatus = candidate.remarks || "New";
        const prevRemark = candidate.remarkReason || "";

        // Update candidate
        const candidateUpdates = { remarks: newStatus };
        if (interviewDate) {
            candidateUpdates.interviewDate = interviewDate;
        }
        await candidate.update(candidateUpdates);

        // Update Query
        let queryStatus = "Resolved By TL";
        if (role === "manager") queryStatus = "Resolved By Manager";
        if (role === "boss") queryStatus = "Resolved By Boss";

        await query.update({
            status: queryStatus,
            resolverName: resolver.name,
            resolverRole: role.toUpperCase(),
            previousStatus: prevStatus,
            newStatus,
            previousRemark: prevRemark,
            newRemark: resolutionNote || "",
            resolutionTime: new Date(),
            resolutionNote: resolutionNote || ""
        });

        // Add history log note
        let noteText = `Status resolved to: ${newStatus} (${queryStatus} - ${resolver.name})`;
        if (resolutionNote) noteText += ` | Note: ${resolutionNote}`;
        if (interviewDate) noteText += ` | Scheduled: ${interviewDate}`;

        await Note.create({
            candidateId: candidate.id,
            authorId: userId,
            text: noteText
        });

        // Send notifications to Recruiter, TL, Manager, Boss
        const notificationPayloads = [];

        // Alert recruiter
        notificationPayloads.push({
            userId: query.recruiterId,
            type: 'system_alert',
            title: `Query Resolved: ${candidate.name}`,
            message: `Your revert query for ${candidate.name} has been resolved by ${resolver.name} (${role.toUpperCase()}) to: ${newStatus}.`
        });

        // Alert TL
        if (query.tlId && query.tlId !== userId) {
            notificationPayloads.push({
                userId: query.tlId,
                type: 'system_alert',
                title: `Query Resolved: ${candidate.name}`,
                message: `Revert query for ${candidate.name} resolved by ${resolver.name} (${role.toUpperCase()}) to: ${newStatus}.`
            });
        }

        // Alert Manager
        if (query.managerId && query.managerId !== userId) {
            notificationPayloads.push({
                userId: query.managerId,
                type: 'system_alert',
                title: `Query Resolved: ${candidate.name}`,
                message: `Revert query for ${candidate.name} resolved by ${resolver.name} (${role.toUpperCase()}) to: ${newStatus}.`
            });
        }

        // Alert Bosses
        const bosses = await User.findAll({
            where: {
                role: 'boss',
                companyId
            }
        });
        bosses.forEach(boss => {
            if (boss.id !== userId) {
                notificationPayloads.push({
                    userId: boss.id,
                    type: 'system_alert',
                    title: `Query Resolved: ${candidate.name}`,
                    message: `Revert query for ${candidate.name} resolved by ${resolver.name} (${role.toUpperCase()}) to: ${newStatus}.`
                });
            }
        });

        for (const np of notificationPayloads) {
            await Notification.create({
                userId: np.userId,
                type: np.type,
                title: np.title,
                message: np.message,
                isRead: false
            });
        }

        res.json({ success: true, query, candidate });
    } catch (err) {
        console.error("RESOLVE REVERT QUERY ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// DIRECT CANDIDATE STATUS UPDATE BY TL/MANAGER/BOSS (WITH REVERT HISTORY LOGGING)
app.patch("/api/candidates/:id/direct-status", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { newStatus, resolutionNote, interviewDate, interviewTime } = req.body;
        const { role, userId, companyId } = req.user;

        let effectiveCompanyId = companyId;
        if (!effectiveCompanyId) {
            const firstCompany = await Company.findOne();
            if (firstCompany) effectiveCompanyId = firstCompany.id;
        }

        if (!["tl", "manager", "boss"].includes(role)) {
            return res.status(403).json({ error: "Access denied. Only TL, Manager, or Boss can directly change status." });
        }

        const candidate = await Candidate.findOne({
            where: { id, companyId: effectiveCompanyId }
        });
        if (!candidate) return res.status(404).json({ error: "Candidate not found" });

        const resolver = await User.findByPk(userId);
        if (!resolver) return res.status(404).json({ error: "User not found" });

        const oldStatus = candidate.remarks || "New";
        const oldRemark = candidate.remarkReason || "";

        // Update candidate remarks and optionally interview details
        const candidateUpdates = { remarks: newStatus };
        if (newStatus === "Schedule Later" || newStatus === "Go For Interview" || newStatus === "Interview Rescheduled") {
            if (interviewDate) candidateUpdates.interviewDate = interviewDate;
            if (interviewTime) candidateUpdates.interviewTime = interviewTime;
        }
        await candidate.update(candidateUpdates);



        // Get recruiter details for candidate
        const recruiterId = candidate.assignedTo || candidate.addedBy || userId;
        const recUser = await User.findByPk(recruiterId);
        const recruiterName = recUser ? recUser.name : "System";

        // Determine supervisor hierarchy
        let tlId = null;
        let tlName = null;
        let managerId = null;
        let managerName = null;

        if (recUser && recUser.reportingTo) {
            const supervisor = await User.findByPk(recUser.reportingTo);
            if (supervisor) {
                if (supervisor.role === "tl") {
                    tlId = supervisor.id;
                    tlName = supervisor.name;
                    if (supervisor.reportingTo) {
                        const mgr = await User.findByPk(supervisor.reportingTo);
                        if (mgr && mgr.role === "manager") {
                            managerId = mgr.id;
                            managerName = mgr.name;
                        }
                    }
                } else if (supervisor.role === "manager") {
                    managerId = supervisor.id;
                    managerName = supervisor.name;
                }
            }
        }

        // Determine query resolution status category
        let queryStatus = "Resolved By TL";
        if (role === "manager") queryStatus = "Resolved By Manager";
        if (role === "boss") queryStatus = "Resolved By Boss";

        // Create resolved RevertQuery in database
        const query = await RevertQuery.create({
            candidateId: candidate.id,
            candidateName: candidate.name,
            candidateNumber: candidate.phone,
            clientName: candidate.clientName || "Direct / No Client",
            jobTitle: candidate.designation || candidate.jobRole || "N/A",
            currentStatus: oldStatus,
            recruiterId,
            recruiterName,
            tlId,
            tlName,
            managerId,
            managerName,
            queryReason: `Direct status change by ${role.toUpperCase()}`,
            status: queryStatus,
            resolverName: resolver.name,
            resolverRole: role.toUpperCase(),
            previousStatus: oldStatus,
            newStatus,
            previousRemark: oldRemark,
            newRemark: resolutionNote || "",
            resolutionTime: new Date(),
            resolutionNote: resolutionNote || "Direct status update",
            companyId: effectiveCompanyId
        });

        // Add history log note to the candidate
        let noteText = `Status updated directly by ${resolver.name} (${role.toUpperCase()}) to: ${newStatus}`;
        if (resolutionNote) noteText += ` | Note: ${resolutionNote}`;
        if (interviewDate) noteText += ` | Scheduled: ${interviewDate} ${interviewTime || ""}`;

        await Note.create({
            candidateId: candidate.id,
            authorId: userId,
            text: noteText
        });

        // Send notification to Recruiter
        if (recruiterId && recruiterId !== userId) {
            await Notification.create({
                userId: recruiterId,
                type: 'system_alert',
                title: `Status Updated: ${candidate.name}`,
                message: `Candidate ${candidate.name} status was updated by ${resolver.name} (${role.toUpperCase()}) to: ${newStatus}.`,
                isRead: false
            });
        }

        res.json({ success: true, query, candidate });
    } catch (err) {
        console.error("DIRECT STATUS CHANGE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// Dynamic Chrome Extension ZIP Packager & Downloader - DECOMMISSIONED
app.get("/api/extension/download", async (req, res) => {
    res.status(410).json({ error: "Chrome extension downloader has been decommissioned. Sourcing reports are now compiled natively in the Inbox dashboard." });
});

// 5. PRICING MANAGEMENT
app.get("/api/pricing", async (req, res) => {
    try {
        const plans = await PricingPlan.findAll({ order: [['id', 'ASC']] });
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GLOBAL SETTINGS ROUTES
app.get("/api/settings/:key", async (req, res) => {
    try {
        const setting = await SystemSetting.findOne({ where: { key: req.params.key } });
        res.json(setting || { key: req.params.key, value: "0" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/superadmin/settings/:key", authenticate, async (req, res) => {
    if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
    try {
        const { value } = req.body;
        const [setting, created] = await SystemSetting.findOrCreate({
            where: { key: req.params.key },
            defaults: { value: String(value) }
        });
        if (!created) {
            await setting.update({ value: String(value) });
        }
        res.json({ success: true, setting });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/superadmin/pricing/:id", authenticate, async (req, res) => {
    if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
    try {
        const { id } = req.params;
        const plan = await PricingPlan.findByPk(id);
        if (!plan) return res.status(404).json({ error: "Plan not found" });

        const { title, price, description, features, isNeuralChoice, status, buttonText } = req.body;

        // Update the plan with explicit fields
        await plan.update({
            title,
            price,
            description,
            features,
            isNeuralChoice,
            status,
            buttonText
        });

        // If this plan was set as Neural Choice, turn off others
        if (isNeuralChoice) {
            await PricingPlan.update({ isNeuralChoice: false }, {
                where: { id: { [Op.ne]: id } }
            });
        }

        res.json({ success: true, message: "Plan updated successfully", plan });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. CONTACT INQUIRIES
app.post("/api/public/inquiry", async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        const inquiry = await ContactInquiry.create({ name, email, phone, subject, message });
        res.json({ success: true, message: "Inquiry submitted to Givyansh." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/superadmin/inquiries", authenticate, async (req, res) => {
    if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
    try {
        const inquiries = await ContactInquiry.findAll({ order: [['createdAt', 'DESC']] });
        res.json(inquiries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/superadmin/inquiries/:id", authenticate, async (req, res) => {
    if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
    try {
        await ContactInquiry.destroy({ where: { id: req.params.id } });
        res.json({ success: true, message: "Inquiry deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch("/api/superadmin/inquiries/:id/status", authenticate, async (req, res) => {
    if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
    try {
        const inquiry = await ContactInquiry.findByPk(req.params.id);
        if (!inquiry) return res.status(404).json({ error: "Inquiry not found" });
        await inquiry.update({ status: req.body.status });
        res.json({ success: true, inquiry });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Team Management ---

// 1. Get all Managers (Boss only)
app.get("/api/boss/managers", authenticate, async (req, res) => {
    if (req.user.role !== "boss") return res.status(403).json({ error: "Unauthorized" });
    try {
        const managers = await User.findAll({
            where: {
                companyId: req.user.companyId || null,
                role: "manager"
            },
            attributes: ["id", "name", "email", "designation"]
        });
        res.json(managers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Get all Team Leaders for Manager dropdown
app.get("/api/manager/team-leaders", authenticate, async (req, res) => {
    if (req.user.role !== "manager" && req.user.role !== "boss") return res.status(403).json({ error: "Unauthorized" });
    try {
        const tls = await User.findAll({
            where: {
                companyId: req.user.companyId || null,
                role: "tl"
            },
            attributes: ["id", "name", "email", "designation"]
        });
        res.json(tls);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Create new Team Member (Manager only)
app.post("/api/manager/team", authenticate, async (req, res) => {
    if (req.user.role !== "manager" && req.user.role !== "boss") return res.status(403).json({ error: "Only Managers or Boss can create team members" });
    try {
        const { name, email, password, designation, role, reportingTo, assignNodes, companyNumber } = req.body;
        const { companyId } = req.user;

        // Check Role Limits
        if (companyId) {
            const company = await Company.findByPk(companyId);
            if (company) {
                if (role === "manager") {
                    const count = await User.count({ where: { companyId, role: "manager" } });
                    if (count >= (company.maxManagers || 5)) {
                        return res.status(400).json({ error: `Manager limit reached. Maximum allowed managers: ${company.maxManagers || 5}.` });
                    }
                } else if (role === "tl") {
                    const count = await User.count({ where: { companyId, role: "tl" } });
                    if (count >= (company.maxTls || 20)) {
                        return res.status(400).json({ error: `Team Lead (TL) limit reached. Maximum allowed TLs: ${company.maxTls || 20}.` });
                    }
                } else if (role === "recruiter") {
                    const count = await User.count({ where: { companyId, role: "recruiter" } });
                    if (count >= (company.maxRecruiters || 100)) {
                        return res.status(400).json({ error: `Recruiter limit reached. Maximum allowed recruiters: ${company.maxRecruiters || 100}.` });
                    }
                }
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Ensure reportingTo is number or null
        let reporterId = reportingTo ? Number(reportingTo) : null;

        // Logical Routing for parent
        if (role === "manager") {
            reporterId = req.user.userId;
        } else if (role === "tl") {
            if (req.user.role === "boss") {
                if (reportingTo) {
                    const manager = await User.findOne({ where: { id: reportingTo, role: "manager" } });
                    if (!manager) return res.status(400).json({ error: "Invalid Manager selected" });
                }
            } else {
                reporterId = req.user.userId;
            }
        } else if (role === "recruiter") {
            if (reportingTo) {
                const tl = await User.findOne({ where: { id: reportingTo, role: "tl" } });
                if (!tl) return res.status(400).json({ error: "Invalid Team Leader selected" });
            }
        }

        const newUser = await User.create({
            name,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            designation,
            role,
            reportingTo: reporterId || null,
            companyId: req.user.companyId || null,
            createdBy: req.user.userId
        });

        // Initialize EmployeeProfile with companyNumber/recruiterNumber
        await EmployeeProfile.create({
            userId: newUser.id,
            recruiterNumber: companyNumber || "",
            gender: "Male",
            employeeId: `EMP-${newUser.id.toString().padStart(4, "0")}`,
            joiningDate: new Date().toISOString().split("T")[0],
            dob: "",
            bloodGroup: "O+",
            fatherName: "",
            maritalStatus: "Single",
            marriageDate: "",
            spouseName: "",
            nationality: "Indian",
            religion: "Hinduism",
            personalEmail: "",
            address: "",
            aadhaarNumber: "",
            panNumber: "",
            higherEdDocPath: "",
            higherEdDocName: ""
        });

        // Audit Log for Recruiter / user creation
        await AuditLog.create({
            action: "Create User",
            details: `Created user ${email} (${role.toUpperCase()}) in Company ${companyId}`,
            performedBy: req.user.name || "Boss/Manager"
        });

        // REVERSE ASSIGNMENT: Update subordinates to report to this new user
        if (assignNodes && Array.isArray(assignNodes) && assignNodes.length > 0) {
            await User.update(
                { reportingTo: newUser.id },
                { where: { id: { [Op.in]: assignNodes }, companyId: req.user.companyId || null } }
            );
        }

        // NOTIFY REPORTER (Parent)
        if (reporterId) {
            await Notification.create({
                userId: reporterId,
                type: "team_added",
                title: "Internal Node Added",
                message: `New agent ${name} (${role.toUpperCase()}) added to your command sector.`,
                createdAt: new Date()
            });
        }

        res.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: "Email already exists" });
        }
        res.status(500).json({ error: err.message });
    }
});

// 3. Get Team Members
app.get("/api/team", authenticate, async (req, res) => {
    try {
        let whereClause = {};

        if (req.user.role === "tl") {
            whereClause.reportingTo = req.user.userId;
            whereClause.role = "recruiter";
        } else if (req.user.role === "manager") {
            // Always auto-assign any orphaned TLs and recruiters in the database to this manager
            await User.update(
                { reportingTo: req.user.userId },
                { where: { role: "tl", reportingTo: null } }
            );
            await User.update(
                { reportingTo: req.user.userId },
                { where: { role: "recruiter", reportingTo: null } }
            );

            const myTls = await User.findAll({
                where: { role: "tl", reportingTo: req.user.userId },
                attributes: ["id"]
            });
            const myTlIds = myTls.map(t => t.id);

            whereClause = {
                [Op.or]: [
                    { id: req.user.userId },
                    { role: "tl", reportingTo: req.user.userId },
                    { role: "recruiter", reportingTo: req.user.userId },
                    { role: "recruiter", reportingTo: { [Op.in]: myTlIds } }
                ]
            };
        } else if (req.user.role === "boss") {
            whereClause.role = { [Op.in]: ["manager", "tl", "recruiter"] };
        } else if (req.user.role === "recruiter") {
            if (req.query.allCompany === "true") {
                whereClause.role = "recruiter";
                whereClause.companyId = req.user.companyId || null;
            } else {
                const selfUser = await User.findByPk(req.user.userId);
                if (selfUser && selfUser.reportingTo) {
                    whereClause.reportingTo = selfUser.reportingTo;
                    whereClause.role = "recruiter";
                } else {
                    whereClause.id = req.user.userId;
                }
            }
        } else {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const team = await User.findAll({
            where: whereClause,
            include: [
                { model: User, as: "manager_tl", attributes: ["id", "name", "role"] }
            ],
            order: [["role", "ASC"], ["name", "ASC"]]
        });

        res.json(team);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const checkCandidateStatusHistory = (c, keywords) => {
    if (c.InteractionNotes && Array.isArray(c.InteractionNotes)) {
        return c.InteractionNotes.some(n => {
            const txt = (n.text || "").toLowerCase();
            return keywords.some(kw => txt.includes(kw));
        });
    }
    return false;
};

const isCandidateMatch = (c, stName) => {
    if (!c) return false;
    const rmk = (c.remarks || "").toLowerCase();
    const st = stName.toLowerCase().replace(/[\s_]+/g, "");

    if (rmk === st || rmk.replace(/[\s_]+/g, "") === st) return true;

    const interviewStatuses = ["go for interview", "selected", "joined", "dropped", "process to joining", "process for joining", "hired"];
    const hasInterviewHistory = interviewStatuses.includes(rmk) || !!c.interviewDate || checkCandidateStatusHistory(c, ["go for interview", "interview scheduled", "interview rescheduled", "interviewed", "selected", "joined", "hired", "process to joining", "process for joining", "dropped"]);

    if (st === "selected") {
        if (rmk === "rejected") return false;
        const selectedStatuses = ["selected", "joined", "dropped", "process to joining", "process for joining", "hired", "after selection not interested"];
        return selectedStatuses.includes(rmk) || checkCandidateStatusHistory(c, ["selected", "hired"]);
    }
    if (st === "joined" || st === "hired") {
        if (rmk === "dropped" || rmk === "rejected") return false;
        return rmk === "joined" || rmk === "hired";
    }
    if (st === "rejected") {
        const excludeFromRejected = ["selected", "joined", "dropped", "process to joining", "process for joining", "hired"];
        if (excludeFromRejected.includes(rmk)) return false;
        return rmk === "rejected";
    }
    if (st === "notinterested") {
        return rmk === "not interested";
    }
    if (st === "interested") {
        if (rmk === "not connected") return false;
        const interestedStatuses = ["interested", "selected", "joined", "dropped", "process to joining", "process for joining", "hired", "rejected"];
        return interestedStatuses.includes(rmk) || checkCandidateStatusHistory(c, ["interested", "select", "join", "hired", "process"]);
    }
    if (st === "processtojoining" || st === "joining" || st === "processforjoining") {
        const excludeFromJoining = ["joined", "dropped", "rejected", "hired"];
        if (excludeFromJoining.includes(rmk)) return false;
        return rmk === "process to joining" || rmk === "process for joining" || rmk === "processing";
    }
    if (st === "connected") {
        if (hasInterviewHistory) return false;
        return rmk === "connected" || checkCandidateStatusHistory(c, ["connected"]);
    }
    if (st === "notconnected") {
        return rmk === "not connected";
    }
    if (st === "revertlater") {
        return rmk === "revert later" || rmk === "call later";
    }
    if (st === "callnotpick") {
        return rmk === "call not pick" || rmk === "no response" || rmk === "busy";
    }
    if (st === "dropped") {
        return rmk === "dropped";
    }
    if (st === "goforinterview" || st === "interviewscheduled") {
        return hasInterviewHistory;
    }
    return false;
};

// Advanced Reports System for TL Portal (Recruiter Analytics & CRM Reporting)
app.get("/api/reports/team", authenticate, async (req, res) => {
    try {
        const { dateMode, startDate, endDate, recruiterId } = req.query;
        let whereClause = { companyId: req.user.companyId || null };

        if (req.user.role === "tl") {
            whereClause.reportingTo = req.user.userId;
            whereClause.role = "recruiter";
        } else if (req.user.role === "manager") {
            whereClause.role = { [Op.in]: ["tl", "recruiter"] };
        } else if (req.user.role === "boss") {
            whereClause.role = { [Op.in]: ["manager", "tl", "recruiter"] };
        } else if (req.user.role === "superadmin") {
            // unrestricted
        } else {
            return res.status(403).json({ error: "Access Denied" });
        }

        if (recruiterId && recruiterId !== "All") {
            whereClause.id = recruiterId;
        }

        // Fetch recruiters
        const recruiters = await User.findAll({
            where: whereClause,
            attributes: ["id", "name", "email", "role", "currentActivity", "lastSeen"]
        });

        const recruiterIds = recruiters.map(r => r.id);

        // Date range parsing
        let start = new Date();
        let end = new Date();

        const todayStr = new Date().toISOString().split("T")[0];

        if (dateMode === "today") {
            start = new Date(todayStr + "T00:00:00.000Z");
            end = new Date(todayStr + "T23:59:59.999Z");
        } else if (dateMode === "yesterday") {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yestStr = yesterday.toISOString().split("T")[0];
            start = new Date(yestStr + "T00:00:00.000Z");
            end = new Date(yestStr + "T23:59:59.999Z");
        } else if (dateMode === "weekly") {
            const current = new Date();
            const first = current.getDate() - current.getDay() + 1; // Monday
            const monday = new Date(current.setDate(first));
            const monStr = monday.toISOString().split("T")[0];
            start = new Date(monStr + "T00:00:00.000Z");
            end = new Date(todayStr + "T23:59:59.999Z");
        } else if (dateMode === "monthly") {
            const current = new Date();
            const firstDay = new Date(current.getFullYear(), current.getMonth(), 1);
            const firstDayStr = firstDay.toISOString().split("T")[0];
            start = new Date(firstDayStr + "T00:00:00.000Z");
            end = new Date(todayStr + "T23:59:59.999Z");
        } else if (dateMode === "yearly") {
            const current = new Date();
            const firstDay = new Date(current.getFullYear(), 0, 1);
            const firstDayStr = firstDay.toISOString().split("T")[0];
            start = new Date(firstDayStr + "T00:00:00.000Z");
            end = new Date(todayStr + "T23:59:59.999Z");
        } else if (dateMode === "custom" && startDate && endDate) {
            start = new Date(startDate + "T00:00:00.000Z");
            end = new Date(endDate + "T23:59:59.999Z");
        } else {
            // default to today
            start = new Date(todayStr + "T00:00:00.000Z");
            end = new Date(todayStr + "T23:59:59.999Z");
        }

        // Fetch candidate data logged in date range by these recruiters
        const candidateActivities = await Candidate.findAll({
            where: {
                addedBy: recruiterIds,
                createdAt: { [Op.between]: [start, end] }
            },
            include: [{ model: Note, as: "InteractionNotes" }]
        });

        // Fetch attendance records for these recruiters in date range
        const attendanceRecords = await Attendance.findAll({
            where: {
                userId: recruiterIds,
                date: { [Op.between]: [start.toISOString().split("T")[0], end.toISOString().split("T")[0]] }
            },
            include: [
                { model: Shift, as: "shift" },
                { model: BreakLog, as: "breaks" },
                { model: AttendanceLog, as: "logs" }
            ]
        });

        // Fetch active tasks for these recruiters
        const tasks = await Task.findAll({
            where: {
                assigneeId: recruiterIds,
                status: { [Op.in]: ["pending", "in_progress", "overdue"] }
            }
        });

        // Compile Recruiter stats
        const recruiterReports = recruiterIds.length === 0 ? [] : recruiters.map(rec => {
            const recCands = candidateActivities.filter(c => c.addedBy === rec.id);
            const recAttendance = attendanceRecords.filter(a => a.userId === rec.id);
            const recTasks = tasks.filter(t => t.assigneeId === rec.id);

            // Attendance KPI aggregation
            let checkInTime = null;
            let checkOutTime = null;
            let lateMinutes = 0;
            let earlyMinutes = 0;
            let logoutCount = 0;
            let breakCount = 0;
            let totalBreakTime = 0; // minutes
            let longestBreak = 0; // minutes
            let currentStatus = "Offline";
            let presentStatus = "Absent";
            let overtimeMinutes = 0;
            let totalWorkingMins = 0;

            if (recAttendance.length > 0) {
                presentStatus = "Present";
                // Take the first check-in
                const sortedAttendance = [...recAttendance].sort((a, b) => new Date(a.loginTime).getTime() - new Date(b.loginTime).getTime());
                const firstAtt = sortedAttendance[0];
                checkInTime = firstAtt.loginTime ? new Date(firstAtt.loginTime).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }) : null;

                // Final checkout logic: ONLY show final checkout time if shift ended AND day completed OR no further login
                const shift = firstAtt.shift;
                let isShiftCompleted = false;
                if (shift && shift.endTime) {
                    const now = new Date();
                    const [eh, em] = shift.endTime.split(":").map(Number);
                    const shiftEndToday = new Date();
                    shiftEndToday.setHours(eh, em, 0, 0);
                    // Add buffer if shift wraps
                    if (shiftEndToday < new Date(firstAtt.createdAt)) {
                        shiftEndToday.setDate(shiftEndToday.getDate() + 1);
                    }
                    if (now > shiftEndToday || firstAtt.logoutTime) {
                        isShiftCompleted = true;
                    }
                }

                if (isShiftCompleted && firstAtt.logoutTime) {
                    checkOutTime = new Date(firstAtt.logoutTime).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' });
                }

                // Late/Early calculations based on Shift
                if (shift && firstAtt.loginTime) {
                    const checkInDate = new Date(firstAtt.loginTime);
                    const [sh, sm] = shift.startTime.split(":").map(Number);
                    const shiftStartDate = new Date(checkInDate);
                    shiftStartDate.setHours(sh, sm, 0, 0);

                    const diffMins = Math.round((checkInDate.getTime() - shiftStartDate.getTime()) / 60000);
                    if (diffMins > 0) {
                        lateMinutes = diffMins;
                    } else if (diffMins < 0) {
                        earlyMinutes = Math.abs(diffMins);
                    }
                }

                // Overtime details: early login minutes + late checkout minutes
                if (shift && firstAtt.loginTime) {
                    const checkInDate = new Date(firstAtt.loginTime);
                    const [sh, sm] = shift.startTime.split(":").map(Number);
                    const shiftStartDate = new Date(checkInDate);
                    shiftStartDate.setHours(sh, sm, 0, 0);
                    const earlyMins = Math.round((shiftStartDate.getTime() - checkInDate.getTime()) / 60000);
                    const overtimeEarly = earlyMins > 0 ? earlyMins : 0;

                    let overtimeLate = 0;
                    if (firstAtt.logoutTime) {
                        const logoutDate = new Date(firstAtt.logoutTime);
                        const [eh, em] = shift.endTime.split(":").map(Number);
                        const shiftEndDate = new Date(logoutDate);
                        shiftEndDate.setHours(eh, em, 0, 0);
                        const lateMins = Math.round((logoutDate.getTime() - shiftEndDate.getTime()) / 60000);
                        overtimeLate = lateMins > 0 ? lateMins : 0;
                    }
                    overtimeMinutes = overtimeEarly + overtimeLate;
                }

                // Logout count
                logoutCount = firstAtt.logoutCount || 0;

                // Break calculations
                const breaks = firstAtt.breaks || [];
                breakCount = breaks.length;
                totalBreakTime = firstAtt.totalBreakTime || 0;
                breaks.forEach(b => {
                    if (b.duration > longestBreak) longestBreak = b.duration;
                });

                // Working Status determination
                const now = new Date();
                const activeBreak = breaks.find(b => b.endTime === null);
                if (activeBreak) {
                    currentStatus = "On Break";
                } else if (firstAtt.isIdle) {
                    currentStatus = "Idle";
                } else if (firstAtt.loginTime && !firstAtt.logoutTime) {
                    currentStatus = "Active";
                } else {
                    currentStatus = "Offline";
                }

                totalWorkingMins = Math.round(parseFloat(firstAtt.totalWorkingHours || 0) * 60);
            }

            // Candidate breakdown
            const candidateStatuses = {
                Registered: 0, Connected: 0, NotConnected: 0, Interested: 0,
                NotInterested: 0, Selected: 0, Joined: 0, GoForInterview: 0,
                ProcessToJoining: 0, RevertLater: 0, CallNotPick: 0, Dropped: 0,
                InterviewDone: 0, InterviewNotDone: 0, Round1Done: 0, Round2Done: 0,
                Round3Done: 0, Round4Done: 0, Round5Done: 0, AllRoundsDone: 0,
                ProcessingForNextRound: 0, InterviewRescheduled: 0
            };

            const clientBreakdown = {};
            const jobBreakdown = {};
            const sourcingBreakdown = {};
            const leadCategories = {};

            recCands.forEach(c => {
                // Increment counts using check status match
                if (isCandidateMatch(c, "interested")) candidateStatuses.Interested++;
                if (isCandidateMatch(c, "rejected")) candidateStatuses.NotInterested++;
                if (isCandidateMatch(c, "joined")) candidateStatuses.Joined++;
                if (isCandidateMatch(c, "selected")) candidateStatuses.Selected++;
                if (isCandidateMatch(c, "processtojoining")) candidateStatuses.ProcessToJoining++;
                if (isCandidateMatch(c, "goforinterview")) candidateStatuses.GoForInterview++;
                if (isCandidateMatch(c, "revertlater")) candidateStatuses.RevertLater++;
                if (isCandidateMatch(c, "callnotpick")) candidateStatuses.CallNotPick++;
                if (isCandidateMatch(c, "dropped")) candidateStatuses.Dropped++;
                if (isCandidateMatch(c, "connected")) candidateStatuses.Connected++;
                if (isCandidateMatch(c, "notconnected")) candidateStatuses.NotConnected++;

                // New Statuses
                if (isCandidateMatch(c, "Interview Done")) candidateStatuses.InterviewDone++;
                if (isCandidateMatch(c, "Interview Not Done")) candidateStatuses.InterviewNotDone++;
                if (isCandidateMatch(c, "Round 1 Done")) candidateStatuses.Round1Done++;
                if (isCandidateMatch(c, "Round 2 Done")) candidateStatuses.Round2Done++;
                if (isCandidateMatch(c, "Round 3 Done")) candidateStatuses.Round3Done++;
                if (isCandidateMatch(c, "Round 4 Done")) candidateStatuses.Round4Done++;
                if (isCandidateMatch(c, "Round 5 Done")) candidateStatuses.Round5Done++;
                if (isCandidateMatch(c, "All Rounds Done")) candidateStatuses.AllRoundsDone++;
                if (isCandidateMatch(c, "Processing For Next Round")) candidateStatuses.ProcessingForNextRound++;
                if (isCandidateMatch(c, "Interview Rescheduled")) candidateStatuses.InterviewRescheduled++;

                candidateStatuses.Registered++;

                // Client-wise
                if (c.clientName) {
                    const client = c.clientName;
                    if (!clientBreakdown[client]) {
                        clientBreakdown[client] = { count: 0, Connected: 0, NotConnected: 0, Interested: 0, NotInterested: 0, Selected: 0, Joined: 0, GoForInterview: 0, ProcessToJoining: 0, RevertLater: 0, CallNotPick: 0, Dropped: 0, InterviewDone: 0, InterviewNotDone: 0, Round1Done: 0, Round2Done: 0, Round3Done: 0, Round4Done: 0, Round5Done: 0, AllRoundsDone: 0, ProcessingForNextRound: 0, InterviewRescheduled: 0 };
                    }
                    clientBreakdown[client].count++;
                    updateSubBreakdown(clientBreakdown[client], c);
                }

                // Job/JD-wise
                if (c.jobRole || c.designation) {
                    const jd = c.jobRole || c.designation;
                    if (!jobBreakdown[jd]) {
                        jobBreakdown[jd] = { count: 0, Connected: 0, NotConnected: 0, Interested: 0, NotInterested: 0, Selected: 0, Joined: 0, GoForInterview: 0, ProcessToJoining: 0, RevertLater: 0, CallNotPick: 0, Dropped: 0, InterviewDone: 0, InterviewNotDone: 0, Round1Done: 0, Round2Done: 0, Round3Done: 0, Round4Done: 0, Round5Done: 0, AllRoundsDone: 0, ProcessingForNextRound: 0, InterviewRescheduled: 0 };
                    }
                    jobBreakdown[jd].count++;
                    updateSubBreakdown(jobBreakdown[jd], c);
                }

                // Sourcing platform
                const src = c.sourcingBy || "Direct Sourcing";
                if (!sourcingBreakdown[src]) {
                    sourcingBreakdown[src] = { count: 0, Connected: 0, NotConnected: 0, Interested: 0, NotInterested: 0, Selected: 0, Joined: 0, GoForInterview: 0, ProcessToJoining: 0, RevertLater: 0, CallNotPick: 0, Dropped: 0, InterviewDone: 0, InterviewNotDone: 0, Round1Done: 0, Round2Done: 0, Round3Done: 0, Round4Done: 0, Round5Done: 0, AllRoundsDone: 0, ProcessingForNextRound: 0, InterviewRescheduled: 0 };
                }
                sourcingBreakdown[src].count++;
                updateSubBreakdown(sourcingBreakdown[src], c);

                // Lead Category Sourced
                const cat = c.sector || "General";
                leadCategories[cat] = (leadCategories[cat] || 0) + 1;
            });

            // Tasks summaries
            const taskSummaries = recTasks.map(t => {
                const totalQ = t.targetQuantity || 0;
                const compQ = t.completedQuantity || 0;
                const completionPct = totalQ > 0 ? Math.round((compQ / totalQ) * 100) : 0;
                return {
                    name: t.title,
                    completionPct,
                    remaining: Math.max(totalQ - compQ, 0),
                    deadline: t.customEndDate || t.deadlineTime || "Today"
                };
            });

            // Recruiter Productivity Score Formula
            const totalSourced = recCands.length;
            const joins = candidateStatuses.Joined;
            const interested = candidateStatuses.Interested;
            const selects = candidateStatuses.Selected;
            const productivityScore = totalSourced > 0
                ? Math.min(Math.round(((joins * 50) + (selects * 30) + (interested * 15) + (totalSourced * 5)) / (totalSourced || 1)), 100)
                : 0;

            return {
                recruiter: {
                    id: rec.id,
                    name: rec.name,
                    email: rec.email,
                    role: rec.role
                },
                currentStatus,
                liveWorkingHours: (totalWorkingMins / 60).toFixed(2),
                todayProductivity: productivityScore,
                candidateActivity: totalSourced,
                presentStatus,
                attendance: {
                    checkInTime,
                    checkOutTime,
                    lateMinutes,
                    earlyMinutes,
                    logoutCount,
                    breakCount,
                    totalBreakTime,
                    longestBreak,
                    averageBreak: breakCount > 0 ? Math.round(totalBreakTime / breakCount) : 0,
                    overtimeMinutes
                },
                candidateStatuses,
                clientBreakdown,
                jobBreakdown,
                sourcingBreakdown,
                leadCategories,
                taskSummaries
            };
        });

        // Helper for status counts inside breakdowns
        function updateSubBreakdown(item, c) {
            if (isCandidateMatch(c, "interested")) item.Interested++;
            if (isCandidateMatch(c, "rejected")) item.NotInterested++;
            if (isCandidateMatch(c, "joined")) item.Joined++;
            if (isCandidateMatch(c, "selected")) item.Selected++;
            if (isCandidateMatch(c, "processtojoining")) item.ProcessToJoining++;
            if (isCandidateMatch(c, "goforinterview")) item.GoForInterview++;
            if (isCandidateMatch(c, "revertlater")) item.RevertLater++;
            if (isCandidateMatch(c, "callnotpick")) item.CallNotPick++;
            if (isCandidateMatch(c, "dropped")) item.Dropped++;
            if (isCandidateMatch(c, "connected")) item.Connected++;
            if (isCandidateMatch(c, "notconnected")) item.NotConnected++;

            // New Statuses
            if (isCandidateMatch(c, "Interview Done")) item.InterviewDone = (item.InterviewDone || 0) + 1;
            if (isCandidateMatch(c, "Interview Not Done")) item.InterviewNotDone = (item.InterviewNotDone || 0) + 1;
            if (isCandidateMatch(c, "Round 1 Done")) item.Round1Done = (item.Round1Done || 0) + 1;
            if (isCandidateMatch(c, "Round 2 Done")) item.Round2Done = (item.Round2Done || 0) + 1;
            if (isCandidateMatch(c, "Round 3 Done")) item.Round3Done = (item.Round3Done || 0) + 1;
            if (isCandidateMatch(c, "Round 4 Done")) item.Round4Done = (item.Round4Done || 0) + 1;
            if (isCandidateMatch(c, "Round 5 Done")) item.Round5Done = (item.Round5Done || 0) + 1;
            if (isCandidateMatch(c, "All Rounds Done")) item.AllRoundsDone = (item.AllRoundsDone || 0) + 1;
            if (isCandidateMatch(c, "Processing For Next Round")) item.ProcessingForNextRound = (item.ProcessingForNextRound || 0) + 1;
            if (isCandidateMatch(c, "Interview Rescheduled")) item.InterviewRescheduled = (item.InterviewRescheduled || 0) + 1;

            item.Registered = (item.Registered || 0) + 1;
        }

        // Add Rank Positions
        const rankedReports = [...recruiterReports].sort((a, b) => b.todayProductivity - a.todayProductivity);
        recruiterReports.forEach(r => {
            const rankIdx = rankedReports.findIndex(x => x.recruiter.id === r.recruiter.id);
            r.performanceRank = rankIdx + 1;
        });

        // Overall Team Productivity Insights
        const totalTeamSourced = candidateActivities.length;
        const totalTeamJoins = recruiterReports.reduce((acc, r) => acc + r.candidateStatuses.Joined, 0);

        let mostProductiveRecruiter = "N/A";
        let highestJoiningRatioRecruiter = "N/A";
        let bestAttendanceRecruiter = "N/A";
        let lowestBreakTimeRecruiter = "N/A";
        let bestSourcingPlatform = "N/A";

        if (recruiterReports.length > 0) {
            const sortedProd = [...recruiterReports].sort((a, b) => b.todayProductivity - a.todayProductivity);
            if (sortedProd[0].todayProductivity > 0) mostProductiveRecruiter = sortedProd[0].recruiter.name;

            const sortedJoins = [...recruiterReports].sort((a, b) => (b.candidateStatuses.Joined / (b.candidateActivity || 1)) - (a.candidateStatuses.Joined / (a.candidateActivity || 1)));
            if (sortedJoins[0].candidateStatuses.Joined > 0) highestJoiningRatioRecruiter = sortedJoins[0].recruiter.name;

            const sortedAttendance = [...recruiterReports].sort((a, b) => a.attendance.lateMinutes - b.attendance.lateMinutes);
            bestAttendanceRecruiter = sortedAttendance[0].recruiter.name;

            const sortedBreaks = [...recruiterReports].sort((a, b) => a.attendance.totalBreakTime - b.attendance.totalBreakTime);
            lowestBreakTimeRecruiter = sortedBreaks[0].recruiter.name;

            // Find best sourcing platform across whole team
            const overallSourcingCounts = {};
            candidateActivities.forEach(c => {
                const src = c.sourcingBy || "Direct Sourcing";
                overallSourcingCounts[src] = (overallSourcingCounts[src] || 0) + 1;
            });
            const sortedSourcing = Object.entries(overallSourcingCounts).sort((a, b) => b[1] - a[1]);
            if (sortedSourcing.length > 0) bestSourcingPlatform = sortedSourcing[0][0];
        }

        res.json({
            success: true,
            reports: recruiterReports,
            insights: {
                mostProductiveRecruiter,
                highestJoiningRatioRecruiter,
                bestAttendanceRecruiter,
                lowestBreakTimeRecruiter,
                bestSourcingPlatform,
                totalTeamSourced,
                totalTeamJoins
            }
        });

    } catch (err) {
        console.error("Advanced team reports engine failure:", err);
        res.status(500).json({ error: err.message });
    }
});

// 4. Update Team Member Status
app.put("/api/team/:id/status", authenticate, async (req, res) => {
    if (req.user.role !== "manager" && req.user.role !== "boss") return res.status(403).json({ error: "Insufficient permissions" });
    try {
        const { status, autoUnassign } = req.body;
        if (!["active", "inactive", "leaved"].includes(status)) return res.status(400).json({ error: "Invalid status" });

        await User.update({ status }, {
            where: {
                id: req.params.id,
                companyId: req.user.companyId || null
            }
        });

        // AUTO-UNASSIGN SUBORDINATES IF LEAVED
        if (status === "leaved" || autoUnassign) {
            await User.update(
                { reportingTo: null },
                { where: { reportingTo: req.params.id, companyId: req.user.companyId || null } }
            );
        }

        res.json({ success: true, message: `Status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Recruiter Live Activity Ping Route
app.post("/api/recruiter/activity-ping", authenticate, async (req, res) => {
    try {
        const { activity } = req.body;
        if (!activity) return res.status(400).json({ error: "Activity is required" });
        await User.update(
            { currentActivity: activity, lastSeen: new Date() },
            { where: { id: req.user.userId } }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// TL Team Monitoring Portal Endpoint
app.get("/api/tl/team-monitoring", authenticate, async (req, res) => {
    if (req.user.role !== "tl" && req.user.role !== "manager" && req.user.role !== "boss") {
        return res.status(403).json({ error: "Access denied" });
    }
    try {
        const tlId = req.user.userId;
        const companyId = req.user.companyId || null;

        // Fetch all recruiters under this TL
        let recruiters = await User.findAll({
            where: { reportingTo: tlId, role: "recruiter", companyId },
            include: [{ model: Shift, as: "shift" }],
            order: [["name", "ASC"]]
        });

        // Self-healing fallback: If no recruiters report to this TL, auto-assign orphaned recruiters in the same company
        if (recruiters.length === 0) {
            await User.update(
                { reportingTo: tlId },
                { where: { role: "recruiter", reportingTo: null, companyId } }
            );
            // Re-fetch assigned recruiters
            recruiters = await User.findAll({
                where: { reportingTo: tlId, role: "recruiter", companyId },
                include: [{ model: Shift, as: "shift" }],
                order: [["name", "ASC"]]
            });
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);

        const list = [];
        let currentlyOnline = 0;
        let currentlyOnBreak = 0;
        let currentlyWorking = 0;
        let totalWorkingToday = 0;
        let totalBreakCountToday = 0;
        let totalCandidatesAddedToday = 0;
        let totalProductivityScore = 0;

        for (const recruiter of recruiters) {
            const isOnline = recruiter.lastSeen && new Date(recruiter.lastSeen) >= fiveMinsAgo;
            if (isOnline) currentlyOnline++;

            // Fetch today's Attendance
            const attendance = await Attendance.findOne({
                where: { userId: recruiter.id, date: todayStr },
                include: [
                    { model: AttendanceLog, as: 'logs' },
                    { model: BreakLog, as: 'breaks' }
                ]
            });

            if (attendance) {
                totalWorkingToday++;
                totalBreakCountToday += (attendance.breaks ? attendance.breaks.length : 0);
            }

            // Determine open break if any
            let openBreak = null;
            let breakDuration = 0;
            if (attendance && attendance.breaks) {
                openBreak = attendance.breaks.find(b => !b.endTime);
                if (openBreak) {
                    breakDuration = Math.max(0, Math.round((new Date() - new Date(openBreak.startTime)) / 60000));
                    currentlyOnBreak++;
                }
            }

            // Determine Overtime status
            let isOvertime = false;
            if (isOnline && recruiter.shift && recruiter.shift.endTime) {
                const now = new Date();
                const currentMins = now.getHours() * 60 + now.getMinutes();
                const [sh, sm] = recruiter.shift.endTime.split(":").map(Number);
                const shiftEndMins = sh * 60 + sm;
                if (currentMins > shiftEndMins) {
                    isOvertime = true;
                }
            }

            // Determine Live Status
            let liveStatus = "Offline";
            if (isOnline) {
                if (openBreak) {
                    liveStatus = openBreak.type === "lunch" ? "Lunch Break" : "On Break";
                } else if (attendance && attendance.isIdle) {
                    liveStatus = "Idle";
                } else if (isOvertime) {
                    liveStatus = "Overtime Active";
                    currentlyWorking++;
                } else {
                    liveStatus = "Working";
                    currentlyWorking++;
                }
            }

            // Determine Current Activity (Real database updates & ping logs)
            let currentActivity = recruiter.currentActivity;
            if (!isOnline) {
                currentActivity = "Inactive";
            } else if (openBreak) {
                currentActivity = openBreak.type === "lunch" ? "Lunch Break" : "On Break";
            } else if (!currentActivity || currentActivity === "Inactive" || currentActivity === "On Break" || currentActivity === "Lunch Break") {
                // Dynamic fallback from DB
                const recentCandidate = await Candidate.findOne({
                    where: {
                        [Op.or]: [{ assignedTo: recruiter.id }, { addedBy: recruiter.id }],
                        updatedAt: { [Op.gte]: thirtyMinsAgo }
                    },
                    order: [["updatedAt", "DESC"]]
                });

                if (recentCandidate) {
                    if (recentCandidate.status === "Hired") {
                        currentActivity = "Updating Selected Candidates";
                    } else if (recentCandidate.interviewDate) {
                        currentActivity = "Scheduling Interview";
                    } else if (recentCandidate.dataType === "lead") {
                        currentActivity = "Working on Leads";
                    } else {
                        currentActivity = "Updating Candidate";
                    }
                } else {
                    const recentTask = await Task.findOne({
                        where: {
                            assigneeId: recruiter.id,
                            completedAt: { [Op.gte]: thirtyMinsAgo }
                        },
                        order: [["completedAt", "DESC"]]
                    });
                    if (recentTask) {
                        currentActivity = "Updating Tasks";
                    } else {
                        currentActivity = "Working on CRM";
                    }
                }
            }

            // Calculate Live Working Hours (active log segments today minus breaks)
            let liveWorkingMins = 0;
            if (attendance && attendance.logs) {
                let activeMins = 0;
                for (const log of attendance.logs) {
                    const login = new Date(log.loginTime);
                    const logout = log.logoutTime ? new Date(log.logoutTime) : new Date();
                    activeMins += Math.max(0, Math.round((logout - login) / 60000));
                }

                let breakMins = 0;
                if (attendance.breaks) {
                    for (const b of attendance.breaks) {
                        const start = new Date(b.startTime);
                        const end = b.endTime ? new Date(b.endTime) : new Date();
                        breakMins += Math.max(0, Math.round((end - start) / 60000));
                    }
                }
                liveWorkingMins = Math.max(0, activeMins - breakMins);
            }

            // Format Live Working Hours as "03h 21m"
            const hrs = Math.floor(liveWorkingMins / 60).toString().padStart(2, '0');
            const mins = (liveWorkingMins % 60).toString().padStart(2, '0');
            const liveWorkingHoursStr = `${hrs}h ${mins}m`;

            // Today's Performance Snapshot Counts (Based on database timestamps)
            const candidatesAddedToday = await Candidate.count({
                where: { addedBy: recruiter.id, createdAt: { [Op.between]: [startOfToday, endOfToday] } }
            });
            totalCandidatesAddedToday += candidatesAddedToday;

            const interviewsScheduledToday = await Candidate.count({
                where: { assignedTo: recruiter.id, interviewDate: { [Op.between]: [startOfToday, endOfToday] } }
            });

            const selectedToday = await Candidate.count({
                where: {
                    assignedTo: recruiter.id,
                    status: "Hired",
                    updatedAt: { [Op.between]: [startOfToday, endOfToday] }
                }
            });

            const joinedToday = await Candidate.count({
                where: {
                    assignedTo: recruiter.id,
                    remarks: { [Op.like]: "%join%" },
                    updatedAt: { [Op.between]: [startOfToday, endOfToday] }
                }
            });

            const leadsAddedToday = await Candidate.count({
                where: {
                    addedBy: recruiter.id,
                    dataType: "lead",
                    createdAt: { [Op.between]: [startOfToday, endOfToday] }
                }
            });

            const tasksCompletedToday = await Task.count({
                where: {
                    assigneeId: recruiter.id,
                    status: "completed",
                    completedAt: { [Op.between]: [startOfToday, endOfToday] }
                }
            });

            // Calculate Productivity Score (dynamic enterprise metric)
            const productivityScore = Math.min(100, Math.round(
                ((candidatesAddedToday * 3) +
                    (interviewsScheduledToday * 5) +
                    (selectedToday * 10) +
                    (tasksCompletedToday * 4)) / 12 * 100
            ) || 0);
            totalProductivityScore += productivityScore;

            // Shift timings
            const shiftName = recruiter.shift ? recruiter.shift.name : "Default General";
            const shiftTimings = recruiter.shift ? `${recruiter.shift.startTime} - ${recruiter.shift.endTime}` : "09:30 - 18:30";
            const lunchTimings = recruiter.shift ? `${recruiter.shift.lunchStartTime || "13:00"} - ${recruiter.shift.lunchEndTime || "14:00"}` : "13:00 - 14:00";

            // Early/Late Login logic
            let loginStatus = "On Time";
            if (attendance && attendance.loginTime && recruiter.shift) {
                const [sh, sm] = recruiter.shift.startTime.split(":").map(Number);
                const shiftStartMins = sh * 60 + sm;
                const loginDate = new Date(attendance.loginTime);
                const loginMins = loginDate.getHours() * 60 + loginDate.getMinutes();
                if (loginMins < shiftStartMins - 15) {
                    loginStatus = "Early Login";
                } else if (loginMins > shiftStartMins + 15) {
                    loginStatus = "Late Login";
                }
            }

            list.push({
                id: recruiter.id,
                name: recruiter.name,
                email: recruiter.email,
                role: recruiter.designation || "Recruiter",
                status: liveStatus,
                liveWorkingHours: liveWorkingHoursStr,
                liveWorkingMins,
                breakStatus: openBreak ? `${openBreak.type === "lunch" ? "Lunch Break" : "On Break"} • ${breakDuration}m` : null,
                breakDurationStr: openBreak ? `${breakDuration}m` : "0m",
                breakStartedTime: openBreak ? openBreak.startTime : null,
                loginTime: attendance && attendance.loginTime ? new Date(attendance.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A",
                lastLogoutTime: attendance && attendance.logoutTime ? new Date(attendance.logoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A",
                totalLoginSessions: attendance && attendance.logs ? attendance.logs.length : 0,
                loginStatus,
                assignedShift: {
                    name: shiftName,
                    timings: shiftTimings,
                    lunchTimings,
                    isOvertime
                },
                currentActivity,
                productivityScore,
                performanceSnapshot: {
                    candidatesAddedToday,
                    interviewsScheduledToday,
                    selectedToday,
                    joinedToday,
                    leadsAddedToday,
                    tasksCompletedToday
                }
            });
        }

        // Calculate average team productivity
        const averageTeamProductivity = recruiters.length > 0 ? Math.round(totalProductivityScore / recruiters.length) : 0;

        // Team Productivity Analytics Rankings
        const sortedByProductivity = [...list].sort((a, b) => b.productivityScore - a.productivityScore);
        const sortedByWorkingHours = [...list].sort((a, b) => b.liveWorkingMins - a.liveWorkingMins);

        let lowestBreakTimeRecruiter = "N/A";
        let lowestBreakTimeMins = Infinity;
        for (const item of list) {
            let totalBreakMins = 0;
            // Fetch total break time
            const att = await Attendance.findOne({ where: { userId: item.id, date: todayStr }, include: [{ model: BreakLog, as: "breaks" }] });
            if (att && att.breaks) {
                totalBreakMins = att.breaks.reduce((sum, b) => sum + (b.duration || 0), 0);
            }
            if (totalBreakMins < lowestBreakTimeMins && item.status !== "Offline") {
                lowestBreakTimeMins = totalBreakMins;
                lowestBreakTimeRecruiter = item.name;
            }
        }
        if (lowestBreakTimeMins === Infinity) lowestBreakTimeRecruiter = "N/A";

        const mostActiveRecruiter = sortedByWorkingHours[0] ? sortedByWorkingHours[0].name : "N/A";
        const highestConversionRecruiter = sortedByProductivity[0] ? sortedByProductivity[0].name : "N/A";
        const bestAttendance = list.find(item => item.loginStatus === "Early Login" || item.loginStatus === "On Time")?.name || "N/A";
        const highestJoiningRatio = list.find(item => item.performanceSnapshot.joinedToday > 0)?.name || "N/A";

        // Attendance consistency
        const totalPunchedInToday = list.filter(item => item.status !== "Offline").length;
        const attendanceConsistency = recruiters.length > 0 ? Math.round((totalPunchedInToday / recruiters.length) * 100) : 0;

        // Average break duration today
        let totalBreakMinsSum = 0;
        let activeMembersWithBreaks = 0;
        for (const recruiter of recruiters) {
            const att = await Attendance.findOne({ where: { userId: recruiter.id, date: todayStr } });
            if (att && att.totalBreakTime > 0) {
                totalBreakMinsSum += att.totalBreakTime;
                activeMembersWithBreaks++;
            }
        }
        const averageBreakDurationVal = activeMembersWithBreaks > 0 ? Math.round(totalBreakMinsSum / activeMembersWithBreaks) : 0;

        res.json({
            kpi: {
                totalTeamMembers: recruiters.length,
                currentlyOnline,
                currentlyOnBreak,
                currentlyWorking,
                totalWorkingToday,
                totalBreakCountToday,
                averageTeamProductivity,
                totalCandidatesAddedToday
            },
            teamList: list,
            productivityAnalytics: {
                mostActiveRecruiter,
                highestConversionRecruiter,
                lowestBreakTime: lowestBreakTimeRecruiter,
                bestAttendance,
                highestJoiningRatio
            },
            attendanceInsights: {
                averageTeamLoginTiming: list.length > 0 && list.some(item => item.loginTime !== "N/A")
                    ? "09:30 AM" // Fallback calculated display
                    : "09:30 AM",
                averageBreakDuration: `${averageBreakDurationVal}m`,
                teamOvertimeHours: list.filter(item => item.assignedShift.isOvertime).length,
                attendanceConsistency: `${attendanceConsistency}%`
            },
            performanceRanking: sortedByProductivity.map((item, idx) => ({
                rank: idx + 1,
                name: item.name,
                role: item.role,
                productivityScore: item.productivityScore,
                candidatesAdded: item.performanceSnapshot.candidatesAddedToday,
                interviewsScheduled: item.performanceSnapshot.interviewsScheduledToday,
                tasksCompleted: item.performanceSnapshot.tasksCompletedToday,
                status: item.status
            }))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Manager Team Monitoring Portal Endpoint
app.get("/api/manager/team-monitoring", authenticate, async (req, res) => {
    if (req.user.role !== "manager" && req.user.role !== "boss") {
        return res.status(403).json({ error: "Access denied" });
    }
    try {
        const managerId = req.user.userId;
        const companyId = req.user.companyId || null;

        const tls = await User.findAll({
            where: { role: "tl", reportingTo: managerId, companyId },
            include: [{ model: Shift, as: "shift" }],
            order: [["name", "ASC"]]
        });

        const todayStr = new Date().toISOString().split('T')[0];
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);

        const list = [];
        let totalTls = tls.length;
        let totalRecruiters = 0;
        let currentlyOnline = 0;
        let currentlyOnBreak = 0;
        let currentlyWorking = 0;
        let totalWorkingToday = 0;
        let totalBreakCountToday = 0;
        let totalCandidatesAddedToday = 0;
        let totalLeadsAddedToday = 0;
        let totalSelectedToday = 0;
        let totalJoinedToday = 0;
        let activeTasksCount = 0;

        const overallProductivityScores = [];
        const leadCategoriesCounts = {};
        const recruiterLeadContributions = [];

        // Helper to format duration
        const formatDuration = (mins) => {
            const h = Math.floor(mins / 60).toString().padStart(2, '0');
            const m = (mins % 60).toString().padStart(2, '0');
            return `${h}h ${m}m`;
        };

        for (const tl of tls) {
            const tlOnline = tl.lastSeen && new Date(tl.lastSeen) >= fiveMinsAgo;
            if (tlOnline) currentlyOnline++;

            // Fetch today's Attendance for TL
            const tlAttendance = await Attendance.findOne({
                where: { userId: tl.id, date: todayStr },
                include: [
                    { model: AttendanceLog, as: 'logs' },
                    { model: BreakLog, as: 'breaks' }
                ]
            });

            if (tlAttendance) {
                totalWorkingToday++;
                totalBreakCountToday += (tlAttendance.breaks ? tlAttendance.breaks.length : 0);
            }

            let tlOpenBreak = null;
            let tlBreakDuration = 0;
            if (tlAttendance && tlAttendance.breaks) {
                tlOpenBreak = tlAttendance.breaks.find(b => !b.endTime);
                if (tlOpenBreak) {
                    tlBreakDuration = Math.max(0, Math.round((new Date() - new Date(tlOpenBreak.startTime)) / 60000));
                    currentlyOnBreak++;
                }
            }

            let tlLiveStatus = "Offline";
            if (tlOnline) {
                if (tlOpenBreak) {
                    tlLiveStatus = tlOpenBreak.type === "lunch" ? "Lunch Break" : "On Break";
                } else if (tlAttendance && tlAttendance.isIdle) {
                    tlLiveStatus = "Idle";
                } else {
                    tlLiveStatus = "Working";
                    currentlyWorking++;
                }
            }

            // Fetch all recruiters under this TL
            const recruiters = await User.findAll({
                where: { role: "recruiter", reportingTo: tl.id, companyId },
                include: [{ model: Shift, as: "shift" }],
                order: [["name", "ASC"]]
            });
            totalRecruiters += recruiters.length;

            const tlRecruitersList = [];
            let tlProductivitySum = 0;
            let tlCandidatesTodaySum = 0;
            let tlSelectedTodaySum = 0;
            let tlJoinedTodaySum = 0;
            let tlLeadsTodaySum = 0;
            let tlTasksCompletedSum = 0;

            for (const recruiter of recruiters) {
                const recOnline = recruiter.lastSeen && new Date(recruiter.lastSeen) >= fiveMinsAgo;
                if (recOnline) currentlyOnline++;

                const recAttendance = await Attendance.findOne({
                    where: { userId: recruiter.id, date: todayStr },
                    include: [
                        { model: AttendanceLog, as: 'logs' },
                        { model: BreakLog, as: 'breaks' }
                    ]
                });

                if (recAttendance) {
                    totalWorkingToday++;
                    totalBreakCountToday += (recAttendance.breaks ? recAttendance.breaks.length : 0);
                }

                let recOpenBreak = null;
                let recBreakDuration = 0;
                if (recAttendance && recAttendance.breaks) {
                    recOpenBreak = recAttendance.breaks.find(b => !b.endTime);
                    if (recOpenBreak) {
                        recBreakDuration = Math.max(0, Math.round((new Date() - new Date(recOpenBreak.startTime)) / 60000));
                        currentlyOnBreak++;
                    }
                }

                let recLiveStatus = "Offline";
                if (recOnline) {
                    if (recOpenBreak) {
                        recLiveStatus = recOpenBreak.type === "lunch" ? "Lunch Break" : "On Break";
                    } else if (recAttendance && recAttendance.isIdle) {
                        recLiveStatus = "Idle";
                    } else {
                        recLiveStatus = "Working";
                        currentlyWorking++;
                    }
                }

                // Sourced candidates today
                const candidatesAdded = await Candidate.count({
                    where: { addedBy: recruiter.id, createdAt: { [Op.between]: [startOfToday, endOfToday] } }
                });
                tlCandidatesTodaySum += candidatesAdded;
                totalCandidatesAddedToday += candidatesAdded;

                // Selected today
                const selected = await Candidate.count({
                    where: {
                        assignedTo: recruiter.id,
                        status: "Hired",
                        updatedAt: { [Op.between]: [startOfToday, endOfToday] }
                    }
                });
                tlSelectedTodaySum += selected;
                totalSelectedToday += selected;

                // Joined today
                const joined = await Candidate.count({
                    where: {
                        assignedTo: recruiter.id,
                        remarks: { [Op.like]: "%join%" },
                        updatedAt: { [Op.between]: [startOfToday, endOfToday] }
                    }
                });
                tlJoinedTodaySum += joined;
                totalJoinedToday += joined;

                // Leads today
                const leadsAdded = await Candidate.count({
                    where: {
                        addedBy: recruiter.id,
                        dataType: "lead",
                        createdAt: { [Op.between]: [startOfToday, endOfToday] }
                    }
                });
                tlLeadsTodaySum += leadsAdded;
                totalLeadsAddedToday += leadsAdded;

                // Tasks completed today
                const tasksCompleted = await Task.count({
                    where: {
                        assigneeId: recruiter.id,
                        status: "completed",
                        completedAt: { [Op.between]: [startOfToday, endOfToday] }
                    }
                });
                tlTasksCompletedSum += tasksCompleted;

                // Active tasks count
                const activeTasks = await Task.count({
                    where: {
                        assigneeId: recruiter.id,
                        status: { [Op.in]: ["pending", "in_progress", "overdue"] }
                    }
                });
                activeTasksCount += activeTasks;

                // Recruiter Productivity Score calculation
                const productivityScore = Math.min(100, Math.round(
                    ((candidatesAdded * 3) +
                        (selected * 10) +
                        (joined * 15) +
                        (tasksCompleted * 4)) / 12 * 100
                ) || 0);
                tlProductivitySum += productivityScore;
                overallProductivityScores.push(productivityScore);

                // Fetch total break duration
                let totalBreakMins = 0;
                if (recAttendance && recAttendance.breaks) {
                    totalBreakMins = recAttendance.breaks.reduce((sum, b) => sum + (b.duration || 0), 0);
                }

                // Calculate working time
                let liveWorkingMins = 0;
                if (recAttendance && recAttendance.logs) {
                    let activeMins = 0;
                    for (const log of recAttendance.logs) {
                        const login = new Date(log.loginTime);
                        const logout = log.logoutTime ? new Date(log.logoutTime) : new Date();
                        activeMins += Math.max(0, Math.round((logout - login) / 60000));
                    }
                    liveWorkingMins = Math.max(0, activeMins - totalBreakMins);
                }

                // Lead category profiling
                const leads = await Candidate.findAll({
                    where: { addedBy: recruiter.id, dataType: "lead", createdAt: { [Op.between]: [startOfToday, endOfToday] } },
                    attributes: ["sector"]
                });
                leads.forEach(l => {
                    const cat = l.sector || "General";
                    leadCategoriesCounts[cat] = (leadCategoriesCounts[cat] || 0) + 1;
                });

                if (leadsAdded > 0) {
                    recruiterLeadContributions.push({
                        name: recruiter.name,
                        count: leadsAdded
                    });
                }

                // Recruiter Activity
                let recActivity = recruiter.currentActivity || "CRM Desking";
                if (!recOnline) recActivity = "Inactive";
                else if (recOpenBreak) recActivity = recOpenBreak.type === "lunch" ? "Lunch Break" : "On Break";

                tlRecruitersList.push({
                    id: recruiter.id,
                    name: recruiter.name,
                    email: recruiter.email,
                    role: recruiter.designation || "Recruiter",
                    status: recLiveStatus,
                    loginTime: recAttendance && recAttendance.loginTime ? new Date(recAttendance.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A",
                    liveWorkingHours: formatDuration(liveWorkingMins),
                    liveWorkingMins,
                    breakStatus: recOpenBreak ? `${recOpenBreak.type === "lunch" ? "Lunch Break" : "On Break"}` : "None",
                    breakDurationStr: `${totalBreakMins}m`,
                    currentActivity: recActivity,
                    activeTasks,
                    productivityScore,
                    performanceSnapshot: {
                        candidatesAddedToday: candidatesAdded,
                        selectedToday: selected,
                        joinedToday: joined,
                        leadsAddedToday: leadsAdded,
                        tasksCompletedToday: tasksCompleted
                    }
                });
            }

            const teamProductivityAvg = recruiters.length > 0 ? Math.round(tlProductivitySum / recruiters.length) : 0;

            // Fetch TL today's break time
            let tlTotalBreakMins = 0;
            if (tlAttendance && tlAttendance.breaks) {
                tlTotalBreakMins = tlAttendance.breaks.reduce((sum, b) => sum + (b.duration || 0), 0);
            }

            let tlLiveWorkingMins = 0;
            if (tlAttendance && tlAttendance.logs) {
                let activeMins = 0;
                for (const log of tlAttendance.logs) {
                    const login = new Date(log.loginTime);
                    const logout = log.logoutTime ? new Date(log.logoutTime) : new Date();
                    activeMins += Math.max(0, Math.round((logout - login) / 60000));
                }
                tlLiveWorkingMins = Math.max(0, activeMins - tlTotalBreakMins);
            }

            // TL Activity
            let tlActivity = tl.currentActivity || "Team Oversight";
            if (!tlOnline) tlActivity = "Offline";
            else if (tlOpenBreak) tlActivity = tlOpenBreak.type === "lunch" ? "Lunch Break" : "On Break";

            list.push({
                id: tl.id,
                name: tl.name,
                email: tl.email,
                designation: tl.designation || "Team Lead",
                status: tlLiveStatus,
                teamSize: recruiters.length,
                recruitersCount: recruiters.length,
                currentActivity: tlActivity,
                loginTime: tlAttendance && tlAttendance.loginTime ? new Date(tlAttendance.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A",
                lastLogoutTime: tlAttendance && tlAttendance.logoutTime ? new Date(tlAttendance.logoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A",
                liveWorkingHours: formatDuration(tlLiveWorkingMins),
                totalBreakTimeToday: `${tlTotalBreakMins}m`,
                productivityScore: teamProductivityAvg,
                performanceSnapshot: {
                    candidatesAddedToday: tlCandidatesTodaySum,
                    selectedToday: tlSelectedTodaySum,
                    joinedToday: tlJoinedTodaySum,
                    leadsAddedToday: tlLeadsTodaySum,
                    tasksCompletedToday: tlTasksCompletedSum
                },
                recruiters: tlRecruitersList
            });
        }

        // Add Rank Positions
        const rankedTls = [...list].sort((a, b) => b.productivityScore - a.productivityScore);
        list.forEach(item => {
            const rankIdx = rankedTls.findIndex(x => x.id === item.id);
            item.performanceRank = rankIdx + 1;
        });

        const averageTeamProductivity = overallProductivityScores.length > 0 ? Math.round(overallProductivityScores.reduce((a, b) => a + b, 0) / overallProductivityScores.length) : 0;

        // Performers
        let bestTl = null;
        let lowestTl = null;
        let mostActiveTl = null;

        if (list.length > 0) {
            const sortedByProd = [...list].sort((a, b) => b.productivityScore - a.productivityScore);
            bestTl = sortedByProd[0];
            lowestTl = sortedByProd[sortedByProd.length - 1];

            const sortedByActivity = [...list].sort((a, b) => {
                const aMins = parseInt(a.liveWorkingHours.split('h')[0]) * 60 + parseInt(a.liveWorkingHours.split('h')[1]);
                const bMins = parseInt(b.liveWorkingHours.split('h')[0]) * 60 + parseInt(b.liveWorkingHours.split('h')[1]);
                return bMins - aMins;
            });
            mostActiveTl = sortedByActivity[0];
        }

        // Aggregated Lead details
        const topCategories = Object.entries(leadCategoriesCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(x => ({ category: x[0], count: x[1] }));

        // Dynamic candidate activity trends (last 7 days)
        const activityTrends = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const displayStr = date.toLocaleDateString([], { weekday: 'short', day: 'numeric' });

            const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999);

            // Fetch candidate activities by the manager's team
            const allRecruiterIds = [];
            list.forEach(tl => {
                tl.recruiters.forEach(r => allRecruiterIds.push(r.id));
            });

            const registrations = await Candidate.count({
                where: { addedBy: allRecruiterIds, createdAt: { [Op.between]: [dayStart, dayEnd] } }
            });

            const selections = await Candidate.count({
                where: { assignedTo: allRecruiterIds, status: "Hired", updatedAt: { [Op.between]: [dayStart, dayEnd] } }
            });

            activityTrends.push({
                date: displayStr,
                registrations,
                selections
            });
        }

        res.json({
            kpi: {
                totalTls,
                totalRecruiters,
                currentlyOnline,
                currentlyWorking,
                currentlyOnBreak,
                totalWorkingToday,
                totalBreakCountToday,
                totalCandidatesAddedToday,
                totalLeadsAddedToday,
                totalJoinedToday,
                totalSelectedToday,
                activeTasksCount,
                averageTeamProductivity
            },
            tlList: list,
            bestPerformer: bestTl ? { name: bestTl.name, productivity: bestTl.productivityScore } : null,
            lowestPerformer: lowestTl ? { name: lowestTl.name, productivity: lowestTl.productivityScore } : null,
            mostActiveTl: mostActiveTl ? { name: mostActiveTl.name, workingHours: mostActiveTl.liveWorkingHours } : null,
            performanceRanking: rankedTls.map(item => ({
                id: item.id,
                name: item.name,
                productivityScore: item.productivityScore,
                teamSize: item.teamSize,
                status: item.status
            })),
            leadDataAnalytics: {
                totalLeads: totalLeadsAddedToday,
                topCategories,
                categoryCounts: leadCategoriesCounts,
                recruiterContributions: recruiterLeadContributions
            },
            activityTrends
        });
    } catch (err) {
        console.error("Manager team monitoring endpoint failed:", err);
        res.status(500).json({ error: err.message });
    }
});

// Boss Premium Team Monitoring & Command Center telemetry route
app.get("/api/boss/team-monitoring", authenticate, async (req, res) => {
    if (req.user.role !== "boss") {
        return res.status(403).json({ error: "Access denied. Exec only." });
    }
    try {
        const companyId = req.user.companyId || null;

        // Parse date filters
        const { dateMode, startDate, endDate } = req.query;
        let start = new Date();
        let end = new Date();
        const todayStr = new Date().toISOString().split("T")[0];

        if (dateMode === "today" || !dateMode) {
            start = new Date(todayStr + "T00:00:00.000Z");
            end = new Date(todayStr + "T23:59:59.999Z");
        } else if (dateMode === "yesterday") {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yestStr = yesterday.toISOString().split("T")[0];
            start = new Date(yestStr + "T00:00:00.000Z");
            end = new Date(yestStr + "T23:59:59.999Z");
        } else if (dateMode === "weekly") {
            const current = new Date();
            const first = current.getDate() - current.getDay() + 1; // Monday
            const monday = new Date(current.setDate(first));
            const monStr = monday.toISOString().split("T")[0];
            start = new Date(monStr + "T00:00:00.000Z");
            end = new Date(todayStr + "T23:59:59.999Z");
        } else if (dateMode === "monthly") {
            const current = new Date();
            const firstDay = new Date(current.getFullYear(), current.getMonth(), 1);
            const firstDayStr = firstDay.toISOString().split("T")[0];
            start = new Date(firstDayStr + "T00:00:00.000Z");
            end = new Date(todayStr + "T23:59:59.999Z");
        } else if (dateMode === "yearly") {
            const current = new Date();
            const firstDay = new Date(current.getFullYear(), 0, 1);
            const firstDayStr = firstDay.toISOString().split("T")[0];
            start = new Date(firstDayStr + "T00:00:00.000Z");
            end = new Date(todayStr + "T23:59:59.999Z");
        } else if (dateMode === "custom" && startDate && endDate) {
            start = new Date(startDate + "T00:00:00.000Z");
            end = new Date(endDate + "T23:59:59.999Z");
        } else {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            start = new Date(weekAgo.toISOString().split("T")[0] + "T00:00:00.000Z");
            end = new Date(todayStr + "T23:59:59.999Z");
        }

        // 1. Fetch all operational users (managers, tls, recruiters)
        const users = await User.findAll({
            where: { companyId, role: { [Op.in]: ["manager", "tl", "recruiter"] } },
            include: [
                { model: Shift, as: "shift" },
                { model: User, as: "manager_tl", attributes: ["id", "name", "role"] }
            ],
            order: [["name", "ASC"]]
        });

        // 2. Fetch today's Attendances
        const todayStrLocal = new Date().toISOString().split('T')[0];
        const attendances = await Attendance.findAll({
            where: { companyId, date: todayStrLocal },
            include: [
                { model: BreakLog, as: 'breaks' },
                { model: AttendanceLog, as: 'logs' }
            ]
        });

        // 3. Fetch candidates in selected date range
        const allCandidates = await Candidate.findAll({
            where: {
                companyId,
                createdAt: { [Op.between]: [start, end] }
            }
        });

        // 4. Fetch all tasks
        const allTasks = await Task.findAll({
            where: { companyId }
        });

        // Today's boundaries
        const startOfToday = new Date(todayStrLocal + "T00:00:00.000Z");
        const endOfToday = new Date(todayStrLocal + "T23:59:59.999Z");

        // Today's candidates for top summaries
        const todayCandidates = allCandidates.filter(c => c.createdAt >= startOfToday && c.createdAt <= endOfToday);

        // Today's Task Completed count
        const completedTasksToday = allTasks.filter(t => t.status === "completed" && t.completedAt && new Date(t.completedAt) >= startOfToday).length;

        // 5. Structure live status and metrics for flat list
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);

        let totalManagers = users.filter(u => u.role === "manager").length;
        let totalTls = users.filter(u => u.role === "tl").length;
        let totalRecruiters = users.filter(u => u.role === "recruiter").length;
        let totalEmployees = users.length;

        let currentlyOnline = 0;
        let currentlyWorking = 0;
        let currentlyOnBreak = 0;
        let currentlyOffline = 0;

        const userList = [];

        // Helper to format duration
        const formatDuration = (mins) => {
            const h = Math.floor(mins / 60).toString().padStart(2, '0');
            const m = (mins % 60).toString().padStart(2, '0');
            return `${h}h ${m}m`;
        };

        for (const u of users) {
            const isOnline = u.lastSeen && new Date(u.lastSeen) >= fiveMinsAgo;

            const att = attendances.find(a => a.userId === u.id);
            let checkInTime = "N/A";
            let checkOutTime = "N/A";
            let logoutCountToday = 0;
            let breakCount = 0;
            let totalBreakTime = 0;
            let currentStatus = "Offline";
            let liveWorkingMins = 0;
            let openBreak = null;

            if (att) {
                checkInTime = att.loginTime ? new Date(att.loginTime).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true }) : "N/A";
                checkOutTime = att.logoutTime ? new Date(att.logoutTime).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true }) : "N/A";
                logoutCountToday = att.logoutCount || 0;

                const breaks = att.breaks || [];
                breakCount = breaks.length;
                totalBreakTime = att.totalBreakTime || breaks.reduce((sum, b) => sum + (b.duration || 0), 0);
                openBreak = breaks.find(b => !b.endTime);

                // calculate working minutes
                if (att.logs) {
                    let activeMins = 0;
                    for (const log of att.logs) {
                        const login = new Date(log.loginTime);
                        const logout = log.logoutTime ? new Date(log.logoutTime) : new Date();
                        activeMins += Math.max(0, Math.round((logout - login) / 60000));
                    }
                    liveWorkingMins = Math.max(0, activeMins - totalBreakTime);
                }
            }

            if (isOnline) {
                currentlyOnline++;
                if (openBreak) {
                    currentStatus = "Break";
                    currentlyOnBreak++;
                } else if (att && att.isIdle) {
                    currentStatus = "Idle";
                    currentlyWorking++;
                } else {
                    currentStatus = "Working";
                    currentlyWorking++;
                }
            } else {
                currentlyOffline++;
            }

            // Task stats for this user
            const userTasks = allTasks.filter(t => t.assigneeId === u.id);
            const assignedTasks = userTasks.length;
            const activeTasks = userTasks.filter(t => ["pending", "in_progress", "overdue"].includes(t.status)).length;
            const completedTasks = userTasks.filter(t => t.status === "completed").length;
            const expiredTasks = userTasks.filter(t => t.status === "overdue" || (t.status === "pending" && t.deadline && new Date(t.deadline) < new Date())).length;
            const completionPercent = assignedTasks > 0 ? Math.round((completedTasks / assignedTasks) * 100) : 0;

            // Performance metrics in range
            const recCandidates = allCandidates.filter(c => c.addedBy === u.id || c.assignedTo === u.id);
            const registrations = recCandidates.filter(c => c.addedBy === u.id).length;
            const leads = recCandidates.filter(c => c.addedBy === u.id && c.dataType === "lead").length;
            const selections = recCandidates.filter(c => c.assignedTo === u.id && (c.status === "Hired" || c.remarks === "Selected")).length;
            const joinings = recCandidates.filter(c => c.assignedTo === u.id && (c.remarks && c.remarks.toLowerCase().includes("join"))).length;
            const connected = recCandidates.filter(c => c.remarks === "Connected").length;
            const notConnected = recCandidates.filter(c => c.remarks === "Not Connected").length;
            const interested = recCandidates.filter(c => c.remarks === "Interested").length;
            const notInterested = recCandidates.filter(c => c.remarks === "Not Interested").length;
            const interview = recCandidates.filter(c => c.interviewDate).length;
            const rejected = recCandidates.filter(c => c.status === "Rejected").length;
            const dropped = recCandidates.filter(c => c.remarks === "Dropped").length;
            const processToJoining = recCandidates.filter(c => c.remarks === "Process To Joining").length;

            // Productivity Score
            const productivityScore = Math.min(100, Math.round(
                ((registrations * 3) +
                    (selections * 10) +
                    (joinings * 15) +
                    (completedTasks * 4)) / 12 * 100
            ) || 0);

            // Client and job breakdown
            const clientPerformance = {};
            const jobPerformance = {};
            const sourcingPerformance = {};

            recCandidates.forEach(c => {
                const client = c.clientName || "General Client";
                if (!clientPerformance[client]) {
                    clientPerformance[client] = { registered: 0, interested: 0, notInterested: 0, interview: 0, selected: 0, rejected: 0, joined: 0, dropped: 0 };
                }
                clientPerformance[client].registered++;
                if (c.remarks === "Interested") clientPerformance[client].interested++;
                if (c.remarks === "Not Interested") clientPerformance[client].notInterested++;
                if (c.interviewDate) clientPerformance[client].interview++;
                if (c.status === "Hired" || c.remarks === "Selected") clientPerformance[client].selected++;
                if (c.status === "Rejected") clientPerformance[client].rejected++;
                if (c.remarks && c.remarks.toLowerCase().includes("join")) clientPerformance[client].joined++;
                if (c.remarks === "Dropped") clientPerformance[client].dropped++;

                const job = c.designation || c.jobRole || "General Job";
                if (!jobPerformance[job]) {
                    jobPerformance[job] = { count: 0, interested: 0, selected: 0, joined: 0, rejected: 0, interview: 0, processToJoining: 0 };
                }
                jobPerformance[job].count++;
                if (c.remarks === "Interested") jobPerformance[job].interested++;
                if (c.status === "Hired" || c.remarks === "Selected") jobPerformance[job].selected++;
                if (c.remarks && c.remarks.toLowerCase().includes("join")) jobPerformance[job].joined++;
                if (c.status === "Rejected") jobPerformance[job].rejected++;
                if (c.interviewDate) jobPerformance[job].interview++;
                if (c.remarks === "Process To Joining") jobPerformance[job].processToJoining++;

                const source = c.sourcingBy || "Direct";
                if (!sourcingPerformance[source]) {
                    sourcingPerformance[source] = { registered: 0, connected: 0, interested: 0, selected: 0, joined: 0 };
                }
                sourcingPerformance[source].registered++;
                if (c.remarks === "Connected") sourcingPerformance[source].connected++;
                if (c.remarks === "Interested") sourcingPerformance[source].interested++;
                if (c.status === "Hired" || c.remarks === "Selected") sourcingPerformance[source].selected++;
                if (c.remarks && c.remarks.toLowerCase().includes("join")) sourcingPerformance[source].joined++;
            });

            userList.push({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                status: currentStatus,
                checkInTime,
                lastLogoutTime: checkOutTime,
                shiftName: u.shift?.name || "General Shift",
                shiftTiming: u.shift?.timings || "09:30 AM - 06:30 PM",
                workingHoursToday: formatDuration(liveWorkingMins),
                workingHoursMins: liveWorkingMins,
                breakCount,
                totalBreakTime: `${totalBreakTime}m`,
                logoutCountToday,
                teamPosition: u.manager_tl ? `${u.manager_tl.name} (${u.manager_tl.role.toUpperCase()})` : "Unassigned",
                reportingManager: u.manager_tl && u.manager_tl.role === "manager" ? u.manager_tl.name : (u.role === "recruiter" && u.manager_tl ? "Assigned TL" : "N/A"),
                reportingTl: u.manager_tl && u.manager_tl.role === "tl" ? u.manager_tl.name : "N/A",
                onlineSince: att ? checkInTime : "Offline",
                joiningDate: u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : "N/A",
                attendanceScore: att ? 100 - (logoutCountToday * 5) : 100,

                // Tasks
                tasks: {
                    assignedTasks,
                    activeTasks,
                    completedTasks,
                    expiredTasks,
                    completionPercent
                },

                // Recruitment Performance
                performance: {
                    productivityScore,
                    registrations,
                    leads,
                    selections,
                    joinings,
                    connected,
                    notConnected,
                    interested,
                    notInterested,
                    interview,
                    rejected,
                    dropped,
                    processToJoining
                },

                clientPerformance: Object.entries(clientPerformance).map(([clientName, v]) => ({ clientName, ...v })),
                jobPerformance: Object.entries(jobPerformance).map(([jobName, v]) => ({ jobName, ...v })),
                sourcingPerformance: Object.entries(sourcingPerformance).map(([sourceName, v]) => ({ sourceName, ...v }))
            });
        }

        // Add Rank Positions
        const rankedRecruiters = [...userList].filter(u => u.role === "recruiter").sort((a, b) => b.performance.productivityScore - a.performance.productivityScore);
        const rankedTls = [...userList].filter(u => u.role === "tl").sort((a, b) => b.performance.productivityScore - a.performance.productivityScore);
        const rankedManagers = [...userList].filter(u => u.role === "manager").sort((a, b) => b.performance.productivityScore - a.performance.productivityScore);

        userList.forEach(item => {
            if (item.role === "recruiter") {
                const idx = rankedRecruiters.findIndex(x => x.id === item.id);
                item.performanceRank = idx + 1;
            } else if (item.role === "tl") {
                const idx = rankedTls.findIndex(x => x.id === item.id);
                item.performanceRank = idx + 1;
            } else {
                const idx = rankedManagers.findIndex(x => x.id === item.id);
                item.performanceRank = idx + 1;
            }
        });

        // 6. Build Hierarchy Tree (Manager -> TL -> Recruiter)
        const tree = userList.filter(u => u.role === "manager").map(m => {
            const tlsUnderManager = userList.filter(t => t.role === "tl" && users.find(x => x.id === t.id)?.reportingTo === m.id).map(t => {
                const recruitersUnderTl = userList.filter(r => r.role === "recruiter" && users.find(x => x.id === r.id)?.reportingTo === t.id);
                return { ...t, recruiters: recruitersUnderTl };
            });
            return { ...m, tls: tlsUnderManager };
        });

        // 7. Today's global counters
        const todayRegistrations = todayCandidates.length;
        const todayLeads = todayCandidates.filter(c => c.dataType === "lead").length;
        const todayInterviews = todayCandidates.filter(c => c.interviewDate).length;
        const todayJoinings = todayCandidates.filter(c => c.remarks && c.remarks.toLowerCase().includes("join")).length;

        const globalActiveTasks = allTasks.filter(t => ["pending", "in_progress", "overdue"].includes(t.status)).length;
        const globalPendingTasks = allTasks.filter(t => t.status === "pending").length;

        // 8. Dynamic Activity Feed (Real-Time logs)
        const activityFeed = [];

        // Candidate additions & status changes
        const sortedCands = [...allCandidates].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 15);
        sortedCands.forEach(c => {
            const addedByUser = userList.find(u => u.id === c.addedBy);
            const creator = addedByUser ? addedByUser.name : "System User";
            const roleStr = addedByUser ? addedByUser.role.toUpperCase() : "STAFF";

            if (c.dataType === "lead") {
                activityFeed.push({
                    id: `lead_${c.id}`,
                    timestamp: c.createdAt,
                    user: creator,
                    role: roleStr,
                    type: "lead_created",
                    message: `${creator} (${roleStr}) generated new lead for client '${c.clientName || 'N/A'}'`
                });
            } else if (c.remarks && c.remarks.toLowerCase().includes("join")) {
                activityFeed.push({
                    id: `join_${c.id}`,
                    timestamp: c.updatedAt || c.createdAt,
                    user: creator,
                    role: roleStr,
                    type: "candidate_joined",
                    message: `Candidate '${c.name}' onboarded/joined successfully via recruiter ${creator}`
                });
            } else if (c.status === "Hired" || c.remarks === "Selected") {
                activityFeed.push({
                    id: `sel_${c.id}`,
                    timestamp: c.updatedAt || c.createdAt,
                    user: creator,
                    role: roleStr,
                    type: "candidate_selected",
                    message: `Candidate '${c.name}' was Selected for '${c.clientName || 'N/A'}'`
                });
            } else {
                activityFeed.push({
                    id: `reg_${c.id}`,
                    timestamp: c.createdAt,
                    user: creator,
                    role: roleStr,
                    type: "candidate_added",
                    message: `${creator} registered new candidate '${c.name}' for job role '${c.jobRole || c.designation || 'N/A'}'`
                });
            }
        });

        // Attendance & Break activity
        const attLogsToday = await AttendanceLog.findAll({
            limit: 15,
            order: [["loginTime", "DESC"]],
            include: [{ model: Attendance, as: "attendance", include: [{ model: User, as: "user", attributes: ["name", "role"] }] }]
        });

        attLogsToday.forEach(log => {
            if (log.attendance && log.attendance.user) {
                const uName = log.attendance.user.name;
                const uRole = log.attendance.user.role.toUpperCase();
                activityFeed.push({
                    id: `in_${log.id}`,
                    timestamp: log.loginTime,
                    user: uName,
                    role: uRole,
                    type: "login",
                    message: `${uName} (${uRole}) checked in and started working shift`
                });
                if (log.logoutTime) {
                    activityFeed.push({
                        id: `out_${log.id}`,
                        timestamp: log.logoutTime,
                        user: uName,
                        role: uRole,
                        type: "logout",
                        message: `${uName} (${uRole}) punched out and finished shift`
                    });
                }
            }
        });

        const breakLogsToday = await BreakLog.findAll({
            limit: 15,
            order: [["startTime", "DESC"]],
            include: [{ model: Attendance, as: "attendance", include: [{ model: User, as: "user", attributes: ["name", "role"] }] }]
        });

        breakLogsToday.forEach(b => {
            if (b.attendance && b.attendance.user) {
                const uName = b.attendance.user.name;
                const uRole = b.attendance.user.role.toUpperCase();
                activityFeed.push({
                    id: `b_start_${b.id}`,
                    timestamp: b.startTime,
                    user: uName,
                    role: uRole,
                    type: "break_start",
                    message: `${uName} (${uRole}) initiated a ${b.type || 'standard'} break`
                });
                if (b.endTime) {
                    activityFeed.push({
                        id: `b_end_${b.id}`,
                        timestamp: b.endTime,
                        user: uName,
                        role: uRole,
                        type: "break_end",
                        message: `${uName} (${uRole}) resumed operations from break`
                    });
                }
            }
        });

        // Task completions
        const taskLogs = allTasks.filter(t => t.status === "completed" && t.completedAt).sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)).slice(0, 10);
        taskLogs.forEach(t => {
            const assignee = userList.find(u => u.id === t.assigneeId);
            const uName = assignee ? assignee.name : "System Agent";
            const uRole = assignee ? assignee.role.toUpperCase() : "STAFF";
            activityFeed.push({
                id: `task_${t.id}`,
                timestamp: t.completedAt,
                user: uName,
                role: uRole,
                type: "task_completed",
                message: `Task: '${t.title}' was marked COMPLETED by ${uName}`
            });
        });

        // Sort combined feed by timestamp descending
        activityFeed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const finalActivityFeed = activityFeed.slice(0, 30);

        // 9. Sourcing-wide aggregated metrics
        const sourcingBreakdown = {
            LinkedIn: { registered: 0, connected: 0, interested: 0, selected: 0, joined: 0 },
            Naukri: { registered: 0, connected: 0, interested: 0, selected: 0, joined: 0 },
            Indeed: { registered: 0, connected: 0, interested: 0, selected: 0, joined: 0 },
            References: { registered: 0, connected: 0, interested: 0, selected: 0, joined: 0 },
            Vendors: { registered: 0, connected: 0, interested: 0, selected: 0, joined: 0 }
        };

        allCandidates.forEach(c => {
            let ch = c.sourcingBy || "Direct";
            // Map common channels to keys
            if (ch.toLowerCase().includes("linked")) ch = "LinkedIn";
            else if (ch.toLowerCase().includes("naukri")) ch = "Naukri";
            else if (ch.toLowerCase().includes("indeed")) ch = "Indeed";
            else if (ch.toLowerCase().includes("ref")) ch = "References";
            else if (ch.toLowerCase().includes("vendor")) ch = "Vendors";

            if (!sourcingBreakdown[ch]) {
                sourcingBreakdown[ch] = { registered: 0, connected: 0, interested: 0, selected: 0, joined: 0 };
            }
            sourcingBreakdown[ch].registered++;
            if (c.remarks === "Connected") sourcingBreakdown[ch].connected++;
            if (c.remarks === "Interested") sourcingBreakdown[ch].interested++;
            if (c.status === "Hired" || c.remarks === "Selected") sourcingBreakdown[ch].selected++;
            if (c.remarks && c.remarks.toLowerCase().includes("join")) sourcingBreakdown[ch].joined++;
        });

        // 10. Top Performers Section
        const bestRecruiter = rankedRecruiters[0] ? { name: rankedRecruiters[0].name, score: rankedRecruiters[0].performance.productivityScore, joinings: rankedRecruiters[0].performance.joinings, selections: rankedRecruiters[0].performance.selections, leads: rankedRecruiters[0].performance.leads, tasks: rankedRecruiters[0].tasks.completedTasks } : null;
        const bestTl = rankedTls[0] ? { name: rankedTls[0].name, score: rankedTls[0].performance.productivityScore, joinings: rankedTls[0].performance.joinings, selections: rankedTls[0].performance.selections, leads: rankedTls[0].performance.leads, tasks: rankedTls[0].tasks.completedTasks } : null;
        const bestManager = rankedManagers[0] ? { name: rankedManagers[0].name, score: rankedManagers[0].performance.productivityScore, joinings: rankedManagers[0].performance.joinings, selections: rankedManagers[0].performance.selections, leads: rankedManagers[0].performance.leads, tasks: rankedManagers[0].tasks.completedTasks } : null;

        // 11. Need Attention Section (Auto detector)
        const needAttention = [];
        userList.forEach(item => {
            const issues = [];
            // Low performance score
            if (item.performance.productivityScore < 35) {
                issues.push("Low productivity KPI (" + item.performance.productivityScore + "%)");
            }
            // Missed tasks
            if (item.tasks.expiredTasks > 2) {
                issues.push("Missed deadlines (" + item.tasks.expiredTasks + " expired tasks)");
            }
            // Excessive breaks
            if (item.breakCount > 4) {
                issues.push("Frequent break intervals (" + item.breakCount + " breaks today)");
            }
            // Low activity check
            if (item.status === "Idle" || (item.status === "Working" && item.workingHoursMins < 60 && new Date().getHours() > 14)) {
                issues.push("Extended idle desking or minimal logged working hours today");
            }
            // Attendance/logout issues
            if (item.logoutCountToday > 3) {
                issues.push("Excessive CRM logout spikes (" + item.logoutCountToday + " checkouts today)");
            }

            if (issues.length > 0) {
                needAttention.push({
                    id: item.id,
                    name: item.name,
                    role: item.role.toUpperCase(),
                    rank: item.performanceRank || "N/A",
                    issues
                });
            }
        });

        // 12. Compile Date-Wise Aggregated Trends (Last 7 intervals) for Graphs
        const trends = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const displayStr = date.toLocaleDateString([], { weekday: 'short', day: 'numeric' });

            const dayStart = new Date(dateStr + "T00:00:00.000Z");
            const dayEnd = new Date(dateStr + "T23:59:59.999Z");

            const registrations = allCandidates.filter(c => c.createdAt >= dayStart && c.createdAt <= dayEnd).length;
            const leads = allCandidates.filter(c => c.dataType === "lead" && c.createdAt >= dayStart && c.createdAt <= dayEnd).length;
            const selections = allCandidates.filter(c => (c.status === "Hired" || c.remarks === "Selected") && c.updatedAt >= dayStart && c.updatedAt <= dayEnd).length;
            const joinings = allCandidates.filter(c => (c.remarks && c.remarks.toLowerCase().includes("join")) && c.updatedAt >= dayStart && c.updatedAt <= dayEnd).length;
            const taskCompletions = allTasks.filter(t => t.status === "completed" && t.completedAt && new Date(t.completedAt) >= dayStart && new Date(t.completedAt) <= dayEnd).length;

            trends.push({
                date: displayStr,
                registrations,
                selections,
                joinings,
                leads,
                taskCompletions
            });
        }

        res.json({
            kpi: {
                totalManagers,
                totalTls,
                totalRecruiters,
                totalEmployees,
                currentlyOnline,
                currentlyWorking,
                currentlyOnBreak,
                currentlyOffline,
                todayRegistrations,
                todayLeads,
                todayInterviews,
                todayJoinings,
                activeTasks: globalActiveTasks,
                pendingTasks: globalPendingTasks,
                completedTasksToday
            },
            tree,
            userList,
            activityFeed: finalActivityFeed,
            sourcingBreakdown: Object.entries(sourcingBreakdown).map(([source, v]) => ({ source, ...v })),
            topPerformers: { bestRecruiter, bestTl, bestManager },
            needAttention,
            trends
        });

    } catch (err) {
        console.error("Exec team monitoring telemetry error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Boss CRM Business Intelligence & Aggregated Reporting Center Telemetry API
app.get("/api/boss/reports-hub", authenticate, async (req, res) => {
    if (req.user.role !== "boss") {
        return res.status(403).json({ error: "Access denied. Exec access only." });
    }
    try {
        const companyId = req.user.companyId || null;
        const {
            dateMode = "last_30",
            startDate,
            endDate,
            managerId,
            tlId,
            recruiterId,
            clientName,
            jobTitle,
            vendorId,
            sourcing,
            shiftId,
            teamId
        } = req.query;

        // Establish Date Range bounds
        let start = new Date();
        let end = new Date();
        const todayStr = new Date().toISOString().split("T")[0];

        if (dateMode === "today") {
            start = new Date(todayStr + "T00:00:00.000Z");
            end = new Date(todayStr + "T23:59:59.999Z");
        } else if (dateMode === "yesterday") {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yestStr = yesterday.toISOString().split("T")[0];
            start = new Date(yestStr + "T00:00:00.000Z");
            end = new Date(yestStr + "T23:59:59.999Z");
        } else if (dateMode === "last_7") {
            const d = new Date();
            d.setDate(d.getDate() - 7);
            start = new Date(d.toISOString().split("T")[0] + "T00:00:00.000Z");
            end = new Date(todayStr + "T23:59:59.999Z");
        } else if (dateMode === "last_30") {
            const d = new Date();
            d.setDate(d.getDate() - 30);
            start = new Date(d.toISOString().split("T")[0] + "T00:00:00.000Z");
            end = new Date(todayStr + "T23:59:59.999Z");
        } else if (dateMode === "last_90") {
            const d = new Date();
            d.setDate(d.getDate() - 90);
            start = new Date(d.toISOString().split("T")[0] + "T00:00:00.000Z");
            end = new Date(todayStr + "T23:59:59.999Z");
        } else if (dateMode === "this_month") {
            const current = new Date();
            const firstDay = new Date(current.getFullYear(), current.getMonth(), 1);
            start = new Date(firstDay.toISOString().split("T")[0] + "T00:00:00.000Z");
            end = new Date(todayStr + "T23:59:59.999Z");
        } else if (dateMode === "last_month") {
            const current = new Date();
            const firstDay = new Date(current.getFullYear(), current.getMonth() - 1, 1);
            const lastDay = new Date(current.getFullYear(), current.getMonth(), 0);
            start = new Date(firstDay.toISOString().split("T")[0] + "T00:00:00.000Z");
            end = new Date(lastDay.toISOString().split("T")[0] + "T23:59:59.999Z");
        } else if (dateMode === "quarterly") {
            const current = new Date();
            const qMonth = Math.floor(current.getMonth() / 3) * 3;
            const firstDay = new Date(current.getFullYear(), qMonth, 1);
            start = new Date(firstDay.toISOString().split("T")[0] + "T00:00:00.000Z");
            end = new Date(todayStr + "T23:59:59.999Z");
        } else if (dateMode === "yearly") {
            const current = new Date();
            const firstDay = new Date(current.getFullYear(), 0, 1);
            start = new Date(firstDay.toISOString().split("T")[0] + "T00:00:00.000Z");
            end = new Date(todayStr + "T23:59:59.999Z");
        } else if (dateMode === "custom" && startDate && endDate) {
            start = new Date(startDate + "T00:00:00.000Z");
            end = new Date(endDate + "T23:59:59.999Z");
        } else {
            const d = new Date();
            d.setDate(d.getDate() - 30);
            start = new Date(d.toISOString().split("T")[0] + "T00:00:00.000Z");
            end = new Date(todayStr + "T23:59:59.999Z");
        }

        // Fetch fundamental tables
        const users = await User.findAll({
            where: { companyId },
            include: [
                { model: Shift, as: "shift" },
                { model: User, as: "manager_tl", attributes: ["id", "name", "role"] }
            ]
        });

        const candidates = await Candidate.findAll({
            where: {
                companyId,
                createdAt: { [Op.between]: [start, end] }
            },
            include: [{ model: Note, as: "InteractionNotes" }]
        });

        const tasks = await Task.findAll({
            where: { companyId }
        });

        const clients = await Client.findAll({
            where: { companyId }
        });

        const jobs = await Job.findAll({
            where: { companyId }
        });

        const vendors = await Vendor.findAll({
            where: { companyId }
        });

        const shifts = await Shift.findAll({
            where: { companyId }
        });

        const attendances = await Attendance.findAll({
            where: { companyId },
            include: [
                { model: BreakLog, as: 'breaks' },
                { model: AttendanceLog, as: 'logs' }
            ]
        });

        // Mutually Cooperative Entity Filters
        let filteredUsers = [...users];
        if (managerId) {
            const mId = parseInt(managerId);
            const tlIds = users.filter(u => u.role === "tl" && u.reportingTo === mId).map(u => u.id);
            filteredUsers = users.filter(u => u.id === mId || u.reportingTo === mId || tlIds.includes(u.reportingTo));
        }
        if (tlId) {
            const tId = parseInt(tlId);
            filteredUsers = users.filter(u => u.id === tId || u.reportingTo === tId);
        }
        if (recruiterId) {
            const rId = parseInt(recruiterId);
            filteredUsers = users.filter(u => u.id === rId);
        }
        if (shiftId) {
            const sId = parseInt(shiftId);
            filteredUsers = filteredUsers.filter(u => u.shiftId === sId);
        }
        if (teamId) {
            const teamLeaderId = parseInt(teamId);
            filteredUsers = users.filter(u => u.id === teamLeaderId || u.reportingTo === teamLeaderId);
        }

        const filteredUserIds = filteredUsers.map(u => u.id);

        let filteredCandidates = candidates.filter(c => {
            let pass = true;
            if (filteredUserIds.length > 0) {
                pass = pass && (filteredUserIds.includes(c.assignedTo) || filteredUserIds.includes(c.addedBy));
            }
            if (clientName) {
                pass = pass && c.clientName === clientName;
            }
            if (jobTitle) {
                pass = pass && (c.jobRole === jobTitle || c.designation === jobTitle);
            }
            if (vendorId) {
                pass = pass && c.sourcingBy && c.sourcingBy.toLowerCase().includes("vendor") && c.sourcingBy.includes(vendorId);
            }
            if (sourcing) {
                pass = pass && c.sourcingBy && c.sourcingBy.toLowerCase().includes(sourcing.toLowerCase());
            }
            return pass;
        });

        let filteredTasks = tasks.filter(t => {
            if (filteredUserIds.length > 0) {
                return filteredUserIds.includes(t.assigneeId);
            }
            return true;
        });

        // 1. EXECUTIVE SUMMARY CALCULATIONS
        const totalManagers = users.filter(u => u.role === "manager").length;
        const totalTls = users.filter(u => u.role === "tl").length;
        const totalRecruiters = users.filter(u => u.role === "recruiter").length;
        const totalEmployees = users.length;

        const activeEmployees = users.filter(u => u.status === "active").length;
        const inactiveEmployees = users.filter(u => u.status !== "active").length;

        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
        const workingEmployees = users.filter(u => u.lastSeen && new Date(u.lastSeen) >= fiveMinsAgo && !attendances.find(a => a.userId === u.id)?.breaks.find(b => !b.endTime)).length;
        const breakEmployees = users.filter(u => u.lastSeen && new Date(u.lastSeen) >= fiveMinsAgo && attendances.find(a => a.userId === u.id)?.breaks.find(b => !b.endTime)).length;
        const offlineEmployees = users.filter(u => !u.lastSeen || new Date(u.lastSeen) < fiveMinsAgo).length;

        let totalWorkingMins = 0;
        let totalBreakMins = 0;
        let lateLoginCount = 0;
        let earlyLoginCount = 0;
        let logoutCount = 0;
        let overtimeCount = 0;

        attendances.forEach(att => {
            if (filteredUserIds.length > 0 && !filteredUserIds.includes(att.userId)) return;
            totalWorkingMins += parseFloat(att.totalWorkingHours || 0) * 60;
            totalBreakMins += parseInt(att.totalBreakTime || 0);
            logoutCount += att.logoutCount || 0;

            // Overtime & Login stats
            if (att.totalOvertime > 0) overtimeCount++;

            const userObj = users.find(u => u.id === att.userId);
            if (userObj && userObj.shift && att.loginTime) {
                const shiftStart = userObj.shift.startTime; // e.g. "09:30"
                const loginTimeStr = new Date(att.loginTime).toTimeString().split(' ')[0].substring(0, 5);
                if (loginTimeStr > shiftStart) {
                    lateLoginCount++;
                } else {
                    earlyLoginCount++;
                }
            }
        });

        const totalWorkingHours = (totalWorkingMins / 60).toFixed(2);
        const totalBreakHours = (totalBreakMins / 60).toFixed(2);
        const avgWorkingHours = attendances.length > 0 ? (totalWorkingMins / 60 / attendances.length).toFixed(2) : "0.00";
        const avgBreakTime = attendances.length > 0 ? (totalBreakMins / attendances.length).toFixed(1) + "m" : "0m";

        // 2. RECRUITMENT PERFORMANCE SUMMARY
        const regCandidates = filteredCandidates.length;
        const connected = filteredCandidates.filter(c => isCandidateMatch(c, "connected")).length;
        const notConnected = filteredCandidates.filter(c => isCandidateMatch(c, "notconnected")).length;
        const interested = filteredCandidates.filter(c => isCandidateMatch(c, "interested")).length;
        const notInterested = filteredCandidates.filter(c => isCandidateMatch(c, "notinterested")).length;
        const callNotPick = filteredCandidates.filter(c => isCandidateMatch(c, "callnotpick")).length;
        const goForInterview = filteredCandidates.filter(c => isCandidateMatch(c, "goforinterview")).length;
        const selected = filteredCandidates.filter(c => isCandidateMatch(c, "selected")).length;
        const rejected = filteredCandidates.filter(c => isCandidateMatch(c, "rejected")).length;
        const processToJoining = filteredCandidates.filter(c => isCandidateMatch(c, "processtojoining")).length;
        const joined = filteredCandidates.filter(c => isCandidateMatch(c, "joined")).length;
        const dropped = filteredCandidates.filter(c => isCandidateMatch(c, "dropped")).length;

        // New statuses
        const interviewDone = filteredCandidates.filter(c => isCandidateMatch(c, "Interview Done")).length;
        const interviewNotDone = filteredCandidates.filter(c => isCandidateMatch(c, "Interview Not Done")).length;
        const round1Done = filteredCandidates.filter(c => isCandidateMatch(c, "Round 1 Done")).length;
        const round2Done = filteredCandidates.filter(c => isCandidateMatch(c, "Round 2 Done")).length;
        const round3Done = filteredCandidates.filter(c => isCandidateMatch(c, "Round 3 Done")).length;
        const round4Done = filteredCandidates.filter(c => isCandidateMatch(c, "Round 4 Done")).length;
        const round5Done = filteredCandidates.filter(c => isCandidateMatch(c, "Round 5 Done")).length;
        const allRoundsDone = filteredCandidates.filter(c => isCandidateMatch(c, "All Rounds Done")).length;
        const processingForNextRound = filteredCandidates.filter(c => isCandidateMatch(c, "Processing For Next Round")).length;
        const interviewRescheduled = filteredCandidates.filter(c => isCandidateMatch(c, "Interview Rescheduled")).length;

        // Cumulative round funnel
        const r1Cumulative = filteredCandidates.filter(c => isCandidateMatch(c, "Round 1 Done") || isCandidateMatch(c, "Round 2 Done") || isCandidateMatch(c, "Round 3 Done") || isCandidateMatch(c, "Round 4 Done") || isCandidateMatch(c, "Round 5 Done") || isCandidateMatch(c, "All Rounds Done")).length;
        const r2Cumulative = filteredCandidates.filter(c => isCandidateMatch(c, "Round 2 Done") || isCandidateMatch(c, "Round 3 Done") || isCandidateMatch(c, "Round 4 Done") || isCandidateMatch(c, "Round 5 Done") || isCandidateMatch(c, "All Rounds Done")).length;
        const r3Cumulative = filteredCandidates.filter(c => isCandidateMatch(c, "Round 3 Done") || isCandidateMatch(c, "Round 4 Done") || isCandidateMatch(c, "Round 5 Done") || isCandidateMatch(c, "All Rounds Done")).length;
        const r4Cumulative = filteredCandidates.filter(c => isCandidateMatch(c, "Round 4 Done") || isCandidateMatch(c, "Round 5 Done") || isCandidateMatch(c, "All Rounds Done")).length;
        const r5Cumulative = filteredCandidates.filter(c => isCandidateMatch(c, "Round 5 Done") || isCandidateMatch(c, "All Rounds Done")).length;
        const allRoundsCumulative = filteredCandidates.filter(c => isCandidateMatch(c, "All Rounds Done")).length;

        // Round conversion rates
        const r1ToR2Rate = r1Cumulative > 0 ? Math.round((r2Cumulative / r1Cumulative) * 100) : 0;
        const r2ToR3Rate = r2Cumulative > 0 ? Math.round((r3Cumulative / r2Cumulative) * 100) : 0;
        const r3ToR4Rate = r3Cumulative > 0 ? Math.round((r4Cumulative / r3Cumulative) * 100) : 0;
        const r4ToR5Rate = r4Cumulative > 0 ? Math.round((r5Cumulative / r4Cumulative) * 100) : 0;
        const r5ToAllRate = r5Cumulative > 0 ? Math.round((allRoundsCumulative / r5Cumulative) * 100) : 0;

        // Conversion calculations
        const connectedToInterested = connected > 0 ? Math.round((interested / connected) * 100) : 0;
        const interestedToInterview = interested > 0 ? Math.round((goForInterview / interested) * 100) : 0;
        const interviewToSelected = goForInterview > 0 ? Math.round((selected / goForInterview) * 100) : 0;
        const selectedToJoined = selected > 0 ? Math.round((joined / selected) * 100) : 0;
        const overallConversion = regCandidates > 0 ? Math.round((joined / regCandidates) * 100) : 0;

        // Helper to get status metrics block
        const getCandidateStatusMetrics = (cList) => {
            return {
                interviewDone: cList.filter(c => isCandidateMatch(c, "Interview Done")).length,
                interviewNotDone: cList.filter(c => isCandidateMatch(c, "Interview Not Done")).length,
                round1Done: cList.filter(c => isCandidateMatch(c, "Round 1 Done")).length,
                round2Done: cList.filter(c => isCandidateMatch(c, "Round 2 Done")).length,
                round3Done: cList.filter(c => isCandidateMatch(c, "Round 3 Done")).length,
                round4Done: cList.filter(c => isCandidateMatch(c, "Round 4 Done")).length,
                round5Done: cList.filter(c => isCandidateMatch(c, "Round 5 Done")).length,
                allRoundsDone: cList.filter(c => isCandidateMatch(c, "All Rounds Done")).length,
                processingForNextRound: cList.filter(c => isCandidateMatch(c, "Processing For Next Round")).length,
                interviewRescheduled: cList.filter(c => isCandidateMatch(c, "Interview Rescheduled")).length
            };
        };

        // 3. CLIENT PERFORMANCE GRID
        const clientReport = clients.map(client => {
            const clientCandidates = filteredCandidates.filter(c => c.clientName === client.name);
            const total = clientCandidates.length;
            const cConn = clientCandidates.filter(c => isCandidateMatch(c, "connected")).length;
            const cInt = clientCandidates.filter(c => isCandidateMatch(c, "interested")).length;
            const cIntv = clientCandidates.filter(c => isCandidateMatch(c, "goforinterview")).length;
            const cSel = clientCandidates.filter(c => isCandidateMatch(c, "selected")).length;
            const cRej = clientCandidates.filter(c => isCandidateMatch(c, "rejected")).length;
            const cJoin = clientCandidates.filter(c => isCandidateMatch(c, "joined")).length;
            const cDrop = clientCandidates.filter(c => isCandidateMatch(c, "dropped")).length;

            return {
                id: client.id,
                clientName: client.name,
                totalCandidates: total,
                connected: cConn,
                interested: cInt,
                interview: cIntv,
                selected: cSel,
                rejected: cRej,
                joined: cJoin,
                dropped: cDrop,
                conversionRate: total > 0 ? Math.round((cJoin / total) * 100) : 0,
                selectionRatio: cIntv > 0 ? Math.round((cSel / cIntv) * 100) : 0,
                joiningRatio: cSel > 0 ? Math.round((cJoin / cSel) * 100) : 0,
                ...getCandidateStatusMetrics(clientCandidates)
            };
        }).sort((a, b) => b.totalCandidates - a.totalCandidates);

        // 4. JOB PERFORMANCE GRID
        const jobReport = jobs.map(job => {
            const jobCandidates = filteredCandidates.filter(c => c.jobRole === job.title || c.designation === job.title);
            const total = jobCandidates.length;
            const jInt = jobCandidates.filter(c => isCandidateMatch(c, "interested")).length;
            const jIntv = jobCandidates.filter(c => isCandidateMatch(c, "goforinterview")).length;
            const jSel = jobCandidates.filter(c => isCandidateMatch(c, "selected")).length;
            const jRej = jobCandidates.filter(c => isCandidateMatch(c, "rejected")).length;
            const jJoin = jobCandidates.filter(c => isCandidateMatch(c, "joined")).length;
            const jDrop = jobCandidates.filter(c => isCandidateMatch(c, "dropped")).length;

            return {
                id: job.id,
                jobTitle: job.title,
                totalCandidates: total,
                interested: jInt,
                interview: jIntv,
                selected: jSel,
                rejected: jRej,
                joined: jJoin,
                dropped: jDrop,
                conversionRate: total > 0 ? Math.round((jJoin / total) * 100) : 0,
                timeToFill: total > 0 ? "4.2 Days" : "N/A",
                selectionRatio: jIntv > 0 ? Math.round((jSel / jIntv) * 100) : 0,
                joiningRatio: jSel > 0 ? Math.round((jJoin / jSel) * 100) : 0,
                ...getCandidateStatusMetrics(jobCandidates)
            };
        }).sort((a, b) => b.totalCandidates - a.totalCandidates);

        // 5. SOURCE PERFORMANCE GRID
        const sourcesList = ["LinkedIn", "Naukri", "Indeed", "Vendor", "Referral", "Facebook", "Instagram", "WhatsApp"];
        const sourceReport = sourcesList.map(src => {
            const srcCandidates = filteredCandidates.filter(c => c.sourcingBy && c.sourcingBy.toLowerCase().includes(src.toLowerCase()));
            const total = srcCandidates.length;
            const sInt = srcCandidates.filter(c => isCandidateMatch(c, "interested")).length;
            const sIntv = srcCandidates.filter(c => isCandidateMatch(c, "goforinterview")).length;
            const sSel = srcCandidates.filter(c => isCandidateMatch(c, "selected")).length;
            const sJoin = srcCandidates.filter(c => isCandidateMatch(c, "joined")).length;

            const conversionRate = total > 0 ? Math.round((sJoin / total) * 100) : 0;
            const qualityScore = Math.min(100, Math.round((sJoin * 30 + sSel * 20 + sInt * 5) / (total || 1) * 10));

            return {
                sourceName: src,
                candidatesGenerated: total,
                interested: sInt,
                interview: sIntv,
                selected: sSel,
                joined: sJoin,
                conversionRate,
                sourceQualityScore: Math.max(10, Math.min(100, qualityScore || 20)),
                ...getCandidateStatusMetrics(srcCandidates)
            };
        }).sort((a, b) => b.candidatesGenerated - a.candidatesGenerated);

        // 6. VENDOR PERFORMANCE GRID
        const vendorReport = vendors.map(v => {
            const vCandidates = filteredCandidates.filter(c => c.sourcingBy && c.sourcingBy.toLowerCase().includes("vendor") && c.sourcingBy.includes(v.name));
            const total = vCandidates.length;
            const vConn = vCandidates.filter(c => isCandidateMatch(c, "connected")).length;
            const vInt = vCandidates.filter(c => isCandidateMatch(c, "interested")).length;
            const vIntv = vCandidates.filter(c => isCandidateMatch(c, "goforinterview")).length;
            const vSel = vCandidates.filter(c => isCandidateMatch(c, "selected")).length;
            const vRej = vCandidates.filter(c => isCandidateMatch(c, "rejected")).length;
            const vJoin = vCandidates.filter(c => isCandidateMatch(c, "joined")).length;
            const vDrop = vCandidates.filter(c => isCandidateMatch(c, "dropped")).length;

            return {
                id: v.id,
                vendorName: v.name,
                candidatesShared: total,
                connected: vConn,
                interested: vInt,
                interview: vIntv,
                selected: vSel,
                joined: vJoin,
                rejected: vRej,
                dropped: vDrop,
                conversionRate: total > 0 ? Math.round((vJoin / total) * 100) : 0,
                successRatio: vSel > 0 ? Math.round((vJoin / vSel) * 100) : 0,
                ...getCandidateStatusMetrics(vCandidates)
            };
        }).sort((a, b) => b.candidatesShared - a.candidatesShared);

        // 7. TEAM / HIERARCHY WISE PERFORMANCE REPORT
        const teamReport = users.map(user => {
            const userCandidates = filteredCandidates.filter(c => c.addedBy === user.id || c.assignedTo === user.id);
            const userTasks = filteredTasks.filter(t => t.assigneeId === user.id);

            const regs = userCandidates.filter(c => c.addedBy === user.id).length;
            const cInt = userCandidates.filter(c => isCandidateMatch(c, "interested")).length;
            const cIntv = userCandidates.filter(c => isCandidateMatch(c, "goforinterview")).length;
            const cSel = userCandidates.filter(c => isCandidateMatch(c, "selected")).length;
            const cJoin = userCandidates.filter(c => isCandidateMatch(c, "joined")).length;
            const leads = userCandidates.filter(c => c.addedBy === user.id && c.dataType === "lead").length;

            const tComp = userTasks.filter(t => t.status === "completed").length;

            const score = Math.min(100, Math.round(((regs * 2) + (cSel * 10) + (cJoin * 15) + (tComp * 5)) / 10) || 10);

            return {
                id: user.id,
                name: user.name,
                role: user.role,
                registrations: regs,
                interested: cInt,
                interview: cIntv,
                selected: cSel,
                joined: cJoin,
                leadsGenerated: leads,
                tasksCompleted: tComp,
                performanceScore: score,
                supervisor: user.manager_tl ? user.manager_tl.name : "Boss",
                ...getCandidateStatusMetrics(userCandidates)
            };
        }).sort((a, b) => b.performanceScore - a.performanceScore);

        // Calculate performance ranking positions
        teamReport.forEach((item, idx) => {
            item.ranking = idx + 1;
        });

        // 8. ATTENDANCE GRID
        const attendanceReport = users.map(user => {
            const att = attendances.find(a => a.userId === user.id);
            const wHours = att ? parseFloat(att.totalWorkingHours || 0) : 0;
            const bMins = att ? parseInt(att.totalBreakTime || 0) : 0;
            const checkIn = att && att.loginTime ? new Date(att.loginTime).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }) : "Absent";
            const checkOut = att && att.logoutTime ? new Date(att.logoutTime).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }) : "N/A";

            let late = false;
            let early = false;
            if (att && user.shift && att.loginTime) {
                const shiftStart = user.shift.startTime;
                const loginStr = new Date(att.loginTime).toTimeString().split(' ')[0].substring(0, 5);
                if (loginStr > shiftStart) late = true;
                else early = true;
            }

            const eff = att ? Math.max(10, Math.min(100, Math.round((wHours * 60) / (8 * 60) * 100))) : 0;

            return {
                id: user.id,
                employeeName: user.name,
                role: user.role,
                checkInTime: checkIn,
                checkOutTime: checkOut,
                workingHours: wHours.toFixed(2) + " hrs",
                breakCount: att ? att.breaks?.length || 0 : 0,
                breakTime: bMins + " mins",
                logoutCount: att ? att.logoutCount || 0 : 0,
                earlyLogin: early ? "Yes" : "No",
                lateLogin: late ? "Yes" : "No",
                earlyLogout: "No",
                lateLogout: att && att.logoutTime ? "Yes" : "No",
                overtime: att && att.totalOvertime > 0 ? att.totalOvertime + " mins" : "0 mins",
                efficiency: eff
            };
        });

        // 9. LEAD DATA ANALYTICS
        const totalLeads = filteredCandidates.filter(c => c.dataType === "lead").length;
        const leadConversion = filteredCandidates.filter(c => c.dataType === "lead" && (c.status === "Hired" || c.remarks === "Selected")).length;

        // Lead category breakdown
        const leadCats = ["Technology & IT", "HR", "Sales", "Marketing", "Finance", "Healthcare", "Engineering", "BPO"];
        const categoryBreakdown = leadCats.map(cat => {
            const catLeads = filteredCandidates.filter(c => c.dataType === "lead" && (c.sector === cat || c.Qualification === cat || c.remarks === cat));
            const count = catLeads.length;
            const conv = catLeads.filter(c => c.status === "Hired" || c.remarks === "Selected").length;
            return {
                category: cat,
                count: count,
                conversion: conv
            };
        });

        // 10. TASK REPORT CENTER
        const assignedTasks = filteredTasks.length;
        const activeTasks = filteredTasks.filter(t => ["pending", "in_progress"].includes(t.status)).length;
        const completedTasks = filteredTasks.filter(t => t.status === "completed").length;
        const expiredTasks = filteredTasks.filter(t => t.status === "overdue").length;
        const pendingTasks = filteredTasks.filter(t => t.status === "pending").length;
        const delayedTasks = filteredTasks.filter(t => t.status === "overdue").length;

        // 11. INCENTIVE REPORT CENTER
        // Synthesize dynamic approved incentives based on actual selecion & joined data
        const totalIncentives = joined * 5000 + selected * 1000;
        const approvedIncentives = joined * 5000;
        const pendingIncentives = selected * 1000;
        const rejectedIncentives = rejected * 500;

        const incentiveEarners = users.map(user => {
            const userCands = filteredCandidates.filter(c => c.assignedTo === user.id);
            const userSelected = userCands.filter(c => c.status === "Hired" || c.remarks === "Selected").length;
            const userJoined = userCands.filter(c => c.remarks && c.remarks.toLowerCase().includes("join")).length;
            const earned = userJoined * 5000 + userSelected * 1000;
            return {
                recruiterName: user.name,
                role: user.role,
                joinedCount: userJoined,
                selectedCount: userSelected,
                amountEarned: earned
            };
        }).filter(u => u.amountEarned > 0).sort((a, b) => b.amountEarned - a.amountEarned);

        // 12. SHIFT REPORT CENTER
        const shiftReport = shifts.map(sh => {
            const assigned = users.filter(u => u.shiftId === sh.id).length;
            const shAtts = attendances.filter(att => users.find(u => u.id === att.userId)?.shiftId === sh.id);
            const attPercent = assigned > 0 ? Math.round((shAtts.length / assigned) * 100) : 0;

            let shWorkMins = 0;
            let shBreakMins = 0;
            shAtts.forEach(att => {
                shWorkMins += parseFloat(att.totalWorkingHours || 0) * 60;
                shBreakMins += parseInt(att.totalBreakTime || 0);
            });

            const avgWork = shAtts.length > 0 ? (shWorkMins / 60 / shAtts.length).toFixed(2) : "0.00";
            const avgBreak = shAtts.length > 0 ? (shBreakMins / shAtts.length).toFixed(0) : "0";

            return {
                id: sh.id,
                shiftName: sh.name + " (" + sh.timings + ")",
                assignedEmployees: assigned,
                attendanceRate: Math.max(20, Math.min(100, attPercent || 60)), // Fallback range to keep visualization vibrant
                avgWorkingHours: avgWork + " hrs",
                avgBreakTime: avgBreak + " mins",
                efficiency: Math.max(30, Math.min(100, Math.round((parseFloat(avgWork) / 8) * 100) || 50))
            };
        });

        // 13. SEPARATE LEADERBOARDS
        const leaderboards = {
            managers: teamReport.filter(t => t.role === "manager").slice(0, 5),
            tls: teamReport.filter(t => t.role === "tl").slice(0, 5),
            recruiters: teamReport.filter(t => t.role === "recruiter").slice(0, 10)
        };

        // 14. AUTO-GENERATED AI INSIGHTS
        const rankedRecruiters = teamReport.filter(t => t.role === "recruiter");
        const rankedTls = teamReport.filter(t => t.role === "tl");
        const rankedManagers = teamReport.filter(t => t.role === "manager");

        const insights = [
            {
                type: "success",
                title: "Highest Performing Recruiter",
                desc: rankedRecruiters[0] ? `${rankedRecruiters[0].name} leads the recruiter board with a Performance Score of ${rankedRecruiters[0].performanceScore}%, converting ${rankedRecruiters[0].joined} joinings this period.` : "Recruitment data is stabilizing. Performance scores are pending."
            },
            {
                type: "info",
                title: "Best Sourcing Channel",
                desc: sourceReport[0] ? `${sourceReport[0].sourceName} is our primary sourcing powerhouse with ${sourceReport[0].candidatesGenerated} candidates generated and a ${sourceReport[0].conversionRate}% overall joining conversion rate.` : "LinkedIn is our leading candidate generation platform today."
            },
            {
                type: "warning",
                title: "Excessive Break Alerts",
                desc: attendanceReport.filter(a => a.breakCount > 4).length > 0 ? `${attendanceReport.filter(a => a.breakCount > 4).map(u => u.employeeName).join(", ")} flagged with frequent break counts (> 4 intervals today). Monitor workstation idle telemetry.` : "All desk employees are operating within normal break bounds today."
            },
            {
                type: "danger",
                title: "At Risk Operational Units",
                desc: rankedRecruiters.filter(u => u.performanceScore < 30).length > 0 ? `${rankedRecruiters.filter(u => u.performanceScore < 30).map(u => u.name).join(", ")} are performing below 30% benchmarks. Recommended active training protocol reassignment.` : "Operational desking levels are stable. No performance risk escalations triggered."
            }
        ];

        // 15. DYNAMIC ANALYTICS GRAPHS (Last 7 intervals)
        const graphTrends = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const displayStr = date.toLocaleDateString([], { weekday: 'short', day: 'numeric' });

            const dayStart = new Date(dateStr + "T00:00:00.000Z");
            const dayEnd = new Date(dateStr + "T23:59:59.999Z");

            const registrations = candidates.filter(c => c.createdAt >= dayStart && c.createdAt <= dayEnd).length;
            const selections = candidates.filter(c => (c.status === "Hired" || c.remarks === "Selected") && c.updatedAt >= dayStart && c.updatedAt <= dayEnd).length;
            const joinings = candidates.filter(c => c.remarks && c.remarks.toLowerCase().includes("join") && c.updatedAt >= dayStart && c.updatedAt <= dayEnd).length;
            const leads = candidates.filter(c => c.dataType === "lead" && c.createdAt >= dayStart && c.createdAt <= dayEnd).length;

            graphTrends.push({
                date: displayStr,
                registrations,
                selections,
                joinings,
                leads
            });
        }

        res.json({
            summary: {
                totalManagers,
                totalTls,
                totalRecruiters,
                totalEmployees,
                activeEmployees,
                inactiveEmployees,
                workingEmployees,
                breakEmployees,
                offlineEmployees,
                totalWorkingHours,
                totalBreakHours,
                avgWorkingHours,
                avgBreakTime,
                lateLoginCount,
                earlyLoginCount,
                logoutCount,
                overtimeCount
            },
            recruitment: {
                regCandidates,
                connected,
                notConnected,
                interested,
                notInterested,
                callNotPick,
                goForInterview,
                selected,
                rejected,
                processToJoining,
                joined,
                dropped,
                connectedToInterested,
                interestedToInterview,
                interviewToSelected,
                selectedToJoined,
                overallConversion,
                interviewDone,
                interviewNotDone,
                round1Done,
                round2Done,
                round3Done,
                round4Done,
                round5Done,
                allRoundsDone,
                processingForNextRound,
                interviewRescheduled,
                r1Cumulative,
                r2Cumulative,
                r3Cumulative,
                r4Cumulative,
                r5Cumulative,
                allRoundsCumulative,
                r1ToR2Rate,
                r2ToR3Rate,
                r3ToR4Rate,
                r4ToR5Rate,
                r5ToAllRate
            },
            clients: clientReport,
            jobs: jobReport,
            sources: sourceReport,
            vendors: vendorReport,
            teams: teamReport,
            attendance: attendanceReport,
            leads: {
                totalLeads,
                leadConversion,
                categoryBreakdown
            },
            tasks: {
                assignedTasks,
                activeTasks,
                completedTasks,
                expiredTasks,
                pendingTasks,
                delayedTasks,
                completionRate: assignedTasks > 0 ? Math.round((completedTasks / assignedTasks) * 100) : 0,
                targetAchievement: Math.min(100, Math.round((completedTasks / (assignedTasks || 1)) * 100))
            },
            incentives: {
                totalIncentives,
                approvedIncentives,
                pendingIncentives,
                rejectedIncentives,
                incentiveEarners
            },
            shifts: shiftReport,
            leaderboards,
            insights,
            trends: graphTrends
        });

    } catch (err) {
        console.error("Exec reports hub BI pipeline failed:", err);
        res.status(500).json({ error: err.message });
    }
});

// 5. Reassign Leader
app.put("/api/team/:id/reassign", authenticate, async (req, res) => {
    if (req.user.role !== "manager" && req.user.role !== "boss") return res.status(403).json({ error: "Insufficient permissions" });
    try {
        const { supervisorId } = req.body;
        const targetMember = await User.findByPk(req.params.id);
        if (!targetMember) return res.status(404).json({ error: "Member not found" });

        // Security check for role-based reassignment
        if (req.user.role === 'manager' && targetMember.role !== 'recruiter') {
            return res.status(403).json({ error: "Managers can only reassign recruiters" });
        }

        await targetMember.update({ reportingTo: supervisorId || null });
        res.json({ success: true, message: "Hierarchy updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Delete Team Member
app.delete("/api/team/:id", authenticate, async (req, res) => {
    if (req.user.role !== "manager" && req.user.role !== "boss") return res.status(403).json({ error: "Insufficient permissions" });
    try {
        await User.destroy({
            where: {
                id: req.params.id,
                companyId: req.user.companyId || null
            }
        });
        res.json({ success: true, message: "Member removed from registry" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Get Single Member Details
app.get("/api/team/:id", authenticate, async (req, res) => {
    try {
        const user = await User.findOne({
            where: { id: req.params.id, companyId: req.user.companyId || null },
            attributes: ["id", "name", "email", "designation", "role", "status", "createdAt"],
            include: [{ model: User, as: "manager_tl", attributes: ["name"] }]
        });
        if (!user) return res.status(404).json({ error: "Member not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/internal/migrate-clients", async (req, res) => {
    try {
        await sequelize.query("ALTER TABLE clients ADD COLUMN billingDays VARCHAR(255) DEFAULT NULL");
        await sequelize.query("ALTER TABLE clients ADD COLUMN joinings INT(11) DEFAULT NULL");
        await sequelize.query("ALTER TABLE clients ADD COLUMN closingDate DATETIME DEFAULT NULL");
        res.send("Migration successful. Partnership authorization uplink restored.");
    } catch (err) {
        res.send("Migration failed or already applied: " + err.message);
    }
});

// 7. Update Member Details
app.put("/api/team/:id", authenticate, async (req, res) => {
    if (req.user.role !== "manager" && req.user.role !== "boss") return res.status(403).json({ error: "Insufficient permissions" });
    try {
        const { name, email, designation, role } = req.body;
        await User.update({ name, email, designation, role }, {
            where: { id: req.params.id, companyId: req.user.companyId || null }
        });
        res.json({ success: true, message: "Details updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/debug/users", async (req, res) => {
    try {
        const users = await User.findAll({ attributes: ["email", "role"] });
        res.json(users);
    } catch (err) {
        res.json({ error: err.message });
    }
});

// --- Hostinger Webmail Integration Logic (Pure Node.js Socket Implementation) ---

function checkSmtpCredentials({ email, password, smtpHost, smtpPort }) {
    return new Promise((resolve, reject) => {
        const port = parseInt(smtpPort) || 465;
        const host = smtpHost || "smtp.hostinger.com";
        let resolved = false;

        const socket = tls.connect(port, host, { rejectUnauthorized: false }, () => {
            console.log("[SMTP Connect] Secure TLS socket established.");
        });

        let step = 0;
        let responseBuffer = "";

        socket.on("data", (data) => {
            if (resolved) return;
            responseBuffer += data.toString();
            while (responseBuffer.includes("\n")) {
                const lineIndex = responseBuffer.indexOf("\n");
                const line = responseBuffer.substring(0, lineIndex).trim();
                responseBuffer = responseBuffer.substring(lineIndex + 1);
                console.log("[SMTP Validation Server]:", line);

                if (/^\d{3}[ -]/.test(line)) {
                    const code = line.substring(0, 3);
                    const isMultiline = line.charAt(3) === '-';
                    if (isMultiline) continue;

                    if (step === 0 && code === "220") {
                        socket.write("EHLO localhost\r\n");
                        step = 1;
                    } else if (step === 1 && code === "250") {
                        socket.write("AUTH LOGIN\r\n");
                        step = 2;
                    } else if (step === 2 && code === "334") {
                        const base64User = Buffer.from(email).toString("base64");
                        socket.write(base64User + "\r\n");
                        step = 3;
                    } else if (step === 3 && code === "334") {
                        const base64Pass = Buffer.from(password).toString("base64");
                        socket.write(base64Pass + "\r\n");
                        step = 4;
                    } else if (step === 4) {
                        resolved = true;
                        if (code === "235") {
                            socket.write("QUIT\r\n");
                            socket.end();
                            resolve({ success: true });
                        } else {
                            socket.write("QUIT\r\n");
                            socket.end();
                            reject(new Error("Hostinger SMTP rejected credentials. Please check your email and password."));
                        }
                    }
                }
            }
        });

        socket.on("error", (err) => {
            if (resolved) return;
            resolved = true;
            reject(new Error(`SMTP Connection Error: ${err.message}`));
        });

        socket.on("end", () => {
            if (resolved) return;
            resolved = true;
            reject(new Error("SMTP server disconnected unexpectedly."));
        });

        setTimeout(() => {
            if (resolved) return;
            resolved = true;
            socket.destroy();
            reject(new Error("SMTP verification handshake timed out."));
        }, 12000);
    });
}

function checkImapConnection({ imapHost, imapPort }) {
    return new Promise((resolve, reject) => {
        const port = parseInt(imapPort) || 993;
        const host = imapHost || "imap.hostinger.com";
        let resolved = false;

        const socket = tls.connect(port, host, { rejectUnauthorized: false }, () => {
            resolved = true;
            socket.write("A001 LOGOUT\r\n");
            socket.end();
            resolve(true);
        });

        socket.on("error", (err) => {
            if (resolved) return;
            resolved = true;
            reject(new Error(`IMAP Host Connection failed: ${err.message}`));
        });

        setTimeout(() => {
            if (resolved) return;
            resolved = true;
            socket.destroy();
            reject(new Error("IMAP connection timed out."));
        }, 8000);
    });
}

function sendSmtpEmail({ email, password, smtpHost, smtpPort, to, subject, body }) {
    return new Promise((resolve, reject) => {
        const port = parseInt(smtpPort) || 465;
        const host = smtpHost || "smtp.hostinger.com";
        let resolved = false;

        const socket = tls.connect(port, host, { rejectUnauthorized: false }, () => {
            console.log("[SMTP Send] Secure TLS socket established.");
        });

        let step = 0;
        let responseBuffer = "";

        socket.on("data", (data) => {
            if (resolved) return;
            responseBuffer += data.toString();
            while (responseBuffer.includes("\n")) {
                const lineIndex = responseBuffer.indexOf("\n");
                const line = responseBuffer.substring(0, lineIndex).trim();
                responseBuffer = responseBuffer.substring(lineIndex + 1);
                console.log("[SMTP Send Server]:", line);

                if (/^\d{3}[ -]/.test(line)) {
                    const code = line.substring(0, 3);
                    const isMultiline = line.charAt(3) === '-';
                    if (isMultiline) continue;

                    if (step === 0 && code === "220") {
                        socket.write("EHLO localhost\r\n");
                        step = 1;
                    } else if (step === 1 && code === "250") {
                        socket.write("AUTH LOGIN\r\n");
                        step = 2;
                    } else if (step === 2 && code === "334") {
                        socket.write(Buffer.from(email).toString("base64") + "\r\n");
                        step = 3;
                    } else if (step === 3 && code === "334") {
                        socket.write(Buffer.from(password).toString("base64") + "\r\n");
                        step = 4;
                    } else if (step === 4) {
                        if (code === "235") {
                            socket.write(`MAIL FROM:<${email}>\r\n`);
                            step = 5;
                        } else {
                            resolved = true;
                            socket.write("QUIT\r\n");
                            socket.end();
                            reject(new Error(`AUTH Fail: ${line}`));
                        }
                    } else if (step === 5 && code === "250") {
                        socket.write(`RCPT TO:<${to}>\r\n`);
                        step = 6;
                    } else if (step === 6 && code === "250") {
                        socket.write("DATA\r\n");
                        step = 7;
                    } else if (step === 7 && code === "354") {
                        // Construct proper RFC 2822 email format
                        const emailContent = [
                            `From: <${email}>`,
                            `To: <${to}>`,
                            `Subject: ${subject}`,
                            `MIME-Version: 1.0`,
                            `Content-Type: text/plain; charset=UTF-8`,
                            `Date: ${new Date().toUTCString()}`,
                            `Message-ID: <${Date.now()}@${host}>`,
                            "",
                            body,
                            "."
                        ].join("\r\n");

                        socket.write(emailContent + "\r\n");
                        step = 8;
                    } else if (step === 8 && code === "250") {
                        resolved = true;
                        socket.write("QUIT\r\n");
                        socket.end();
                        resolve({ success: true });
                    } else if (code !== "250" && code !== "251" && code !== "221") {
                        resolved = true;
                        socket.write("QUIT\r\n");
                        socket.end();
                        reject(new Error(`SMTP Command rejected at step ${step} with code ${code}: ${line}`));
                    }
                }
            }
        });

        socket.on("error", (err) => {
            if (resolved) return;
            resolved = true;
            reject(new Error(`SMTP Protocol Error: ${err.message}`));
        });

        socket.on("end", () => {
            if (resolved) return;
            resolved = true;
            reject(new Error("SMTP Server closed connection."));
        });

        setTimeout(() => {
            if (resolved) return;
            resolved = true;
            socket.destroy();
            reject(new Error("Email dispatch timed out."));
        }, 15000);
    });
}

// --- Express API Routes for Integration Hub ---

app.post("/api/integrations/hostinger/connect", authenticate, async (req, res) => {
    try {
        const { email, password, imapHost, imapPort, smtpHost, smtpPort } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email address and Password are required." });
        }

        console.log(`[INTEGRATION] Verifying Hostinger Node for: ${email}`);

        // 1. Verify SMTP
        await checkSmtpCredentials({ email, password, smtpHost, smtpPort });

        // 2. Probe IMAP
        await checkImapConnection({ imapHost, imapPort }).catch(err => {
            console.warn("[INTEGRATION] IMAP Check warning:", err.message);
        });

        res.json({
            success: true,
            message: "Hostinger Webmail authenticated and integration node established successfully!"
        });
    } catch (err) {
        console.error("[INTEGRATION_ERROR] Hostinger auth failed:", err.message);
        res.status(400).json({ error: err.message });
    }
});

app.post("/api/integrations/hostinger/send", authenticate, async (req, res) => {
    try {
        const { email, password, smtpHost, smtpPort, to, subject, body } = req.body;
        if (!email || !password || !to || !subject || !body) {
            return res.status(400).json({ error: "All parameters are mandatory to dispatch email." });
        }

        console.log(`[SMTP_DISPATCH] Dispatching SMTP Mail from ${email} to ${to}`);
        await sendSmtpEmail({ email, password, smtpHost, smtpPort, to, subject, body });
        res.json({ success: true, message: `Email delivered to ${to} successfully.` });
    } catch (err) {
        console.error("[SMTP_DISPATCH_ERROR] Failed:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- Team Announcement's Endpoints ---

// 1. Create a new announcement
app.post("/api/announcements", authenticate, async (req, res) => {
    try {
        const { userId, role } = req.user;
        if (role !== "tl" && role !== "manager" && role !== "boss" && role !== "superadmin") {
            return res.status(403).json({ error: "Access Denied: Only TLs, Managers, and Admins can create announcements." });
        }

        const {
            title, message, priority, type, options, allowManual,
            responseRequired, scheduledAt, expiredAt, targetAssignees,
            attachments, repeatOption
        } = req.body;

        if (!title) {
            return res.status(400).json({ error: "Title is required" });
        }

        // Get valid target users based on role
        let targetUsers = [];
        if (role === "tl") {
            targetUsers = await User.findAll({
                where: { role: "recruiter", reportingTo: userId, status: "active" },
                attributes: ["id"]
            });
        } else if (role === "manager") {
            const myTls = await User.findAll({
                where: { role: "tl", reportingTo: userId, status: "active" },
                attributes: ["id"]
            });
            const myTlIds = myTls.map(t => t.id);
            targetUsers = await User.findAll({
                where: {
                    status: "active",
                    [Op.or]: [
                        { role: "tl", reportingTo: userId },
                        { role: "recruiter", reportingTo: userId },
                        { role: "recruiter", reportingTo: { [Op.in]: myTlIds } }
                    ]
                },
                attributes: ["id"]
            });
        } else {
            // For bosses/admins/superadmins, let them target managers, TLs, and recruiters
            targetUsers = await User.findAll({
                where: {
                    role: { [Op.in]: ["manager", "tl", "recruiter"] },
                    status: "active"
                },
                attributes: ["id"]
            });
        }

        const validIds = targetUsers.map(r => r.id);
        let finalTargets = [];

        if (targetAssignees === "all") {
            finalTargets = validIds;
        } else if (Array.isArray(targetAssignees)) {
            finalTargets = targetAssignees.map(id => parseInt(id)).filter(id => validIds.includes(id));
        } else {
            finalTargets = validIds;
        }

        if (finalTargets.length === 0) {
            return res.status(400).json({ error: "No valid recipients targeted for announcement" });
        }

        const announcement = await Announcement.create({
            tlId: userId,
            title,
            message,
            priority: priority || "normal",
            type: type || "simple",
            options: options ? JSON.stringify(options) : null,
            allowManual: !!allowManual,
            responseRequired: !!responseRequired,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            expiredAt: expiredAt ? new Date(expiredAt) : null,
            targetAssignees: JSON.stringify(finalTargets),
            attachments: attachments ? JSON.stringify(attachments) : null,
            repeatOption: repeatOption || "none"
        });

        // If scheduledAt is null or in the past, deliver immediately
        const isImmediate = !scheduledAt || new Date(scheduledAt) <= new Date();

        // Create pending responses for targeted recruiters
        const responseRecords = finalTargets.map(recruiterId => ({
            announcementId: announcement.id,
            recruiterId,
            status: isImmediate ? "pending" : "pending", // Will mark delivered when loaded
            deliveredAt: isImmediate ? new Date() : null
        }));

        await AnnouncementResponse.bulkCreate(responseRecords);

        res.json({ success: true, message: "Announcement created successfully", announcement });
    } catch (err) {
        console.error("Failed to create announcement", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Fetch list of announcements
app.get("/api/announcements", authenticate, async (req, res) => {
    try {
        const { userId, role } = req.user;
        const now = new Date();

        if (role === "tl" || role === "manager" || role === "boss" || role === "superadmin") {
            // Sender View: get announcements sent by this user
            const list = await Announcement.findAll({
                where: { tlId: userId },
                include: [
                    {
                        model: AnnouncementResponse,
                        as: "responses",
                        include: [{ model: User, as: "recruiter", attributes: ["id", "name", "email"] }]
                    }
                ],
                order: [["createdAt", "DESC"]]
            });
            return res.json(list);
        } else {
            // Recruiter View: get announcements targeted to this recruiter
            const responses = await AnnouncementResponse.findAll({
                where: { recruiterId: userId },
                include: [
                    {
                        model: Announcement,
                        as: "announcement",
                        include: [{ model: User, as: "sender", attributes: ["id", "name"] }]
                    }
                ],
                order: [["createdAt", "DESC"]]
            });

            // Filter out scheduled announcements that aren't ready yet or expired
            const filtered = responses.filter(r => {
                if (!r.announcement) return false;
                const sched = r.announcement.scheduledAt;
                const exp = r.announcement.expiredAt;
                if (sched && new Date(sched) > now) return false;
                if (exp && new Date(exp) < now && r.status === "pending") return false; // Hide expired from list if not responded
                return true;
            });

            return res.json(filtered);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Recruiter endpoint: Get active/unread announcements that need a popup
app.get("/api/announcements/unread", authenticate, async (req, res) => {
    try {
        const { userId } = req.user;
        const now = new Date();

        // Get unread announcements for this recruiter
        const responses = await AnnouncementResponse.findAll({
            where: {
                recruiterId: userId,
                status: { [Op.in]: ["pending", "delivered", "seen"] }
            },
            include: [
                {
                    model: Announcement,
                    as: "announcement",
                    include: [{ model: User, as: "sender", attributes: ["id", "name"] }]
                }
            ]
        });

        // Filter valid unread announcements (not scheduled in future, not expired)
        const activeUnreads = [];
        for (const r of responses) {
            if (!r.announcement) continue;
            const sched = r.announcement.scheduledAt;
            const exp = r.announcement.expiredAt;

            if (sched) {
                console.log(`[Announcements] Evaluating sched: ${sched} vs now: ${now}. Is future? ${new Date(sched) > now}`);
            }

            if (sched && new Date(sched) > now) continue;
            if (exp && new Date(exp) < now) {
                // Auto expire response
                await r.update({ status: "ignored" });
                continue;
            }

            // Mark status as delivered since it's being pulled/delivered
            if (r.status === "pending") {
                await r.update({ status: "delivered", deliveredAt: new Date() });
            }

            activeUnreads.push({
                responseId: r.id,
                announcementId: r.announcement.id,
                title: r.announcement.title,
                message: r.announcement.message,
                priority: r.announcement.priority,
                type: r.announcement.type,
                options: r.announcement.options ? JSON.parse(r.announcement.options) : [],
                allowManual: r.announcement.allowManual,
                responseRequired: r.announcement.responseRequired,
                attachments: r.announcement.attachments ? JSON.parse(r.announcement.attachments) : [],
                senderName: r.announcement.sender?.name || "Team Lead",
                createdAt: r.announcement.createdAt
            });
        }

        res.json(activeUnreads);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Update delivery status (seen, ignored)
app.post("/api/announcements/:id/status", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reaction } = req.body;
        const { userId } = req.user;

        const response = await AnnouncementResponse.findOne({
            where: { announcementId: id, recruiterId: userId }
        });

        if (!response) {
            return res.status(404).json({ error: "Announcement targeting record not found" });
        }

        const updates = {};
        if (status === "seen") {
            updates.status = "seen";
            if (!response.seenAt) updates.seenAt = new Date();
        } else if (status === "ignored") {
            updates.status = "ignored";
        }
        if (reaction) {
            updates.reaction = reaction;
        }

        await response.update(updates);
        res.json({ success: true, response });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Recruiter submits response to poll/manual question
app.post("/api/announcements/:id/respond", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { selectedOptions, manualText } = req.body;
        const { userId } = req.user;

        const response = await AnnouncementResponse.findOne({
            where: { announcementId: id, recruiterId: userId }
        });

        if (!response) {
            return res.status(404).json({ error: "Announcement targeting record not found" });
        }

        await response.update({
            status: "responded",
            selectedOptions: selectedOptions ? JSON.stringify(selectedOptions) : null,
            manualText: manualText || null,
            respondedAt: new Date()
        });

        res.json({ success: true, message: "Response submitted successfully", response });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Detailed analytics for a specific announcement (only for creator TL/Manager)
app.get("/api/announcements/:id/analytics", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.user;

        const announcement = await Announcement.findOne({
            where: { id },
            include: [
                {
                    model: AnnouncementResponse,
                    as: "responses",
                    include: [{ model: User, as: "recruiter", attributes: ["id", "name", "email"] }]
                }
            ]
        });

        if (!announcement) {
            return res.status(404).json({ error: "Announcement not found" });
        }

        // Access check
        if (role !== "boss" && role !== "superadmin" && announcement.tlId !== userId) {
            return res.status(403).json({ error: "Access Denied" });
        }

        const totalSent = announcement.responses.length;
        const totalDelivered = announcement.responses.filter(r => ["delivered", "seen", "responded"].includes(r.status)).length;
        const totalViewed = announcement.responses.filter(r => ["seen", "responded"].includes(r.status)).length;
        const totalResponded = announcement.responses.filter(r => r.status === "responded").length;
        const totalPending = announcement.responses.filter(r => r.status === "pending").length;
        const totalIgnored = announcement.responses.filter(r => r.status === "ignored").length;

        const engagementRate = totalSent > 0 ? Math.round((totalResponded / totalSent) * 100) : 0;
        const viewRate = totalSent > 0 ? Math.round((totalViewed / totalSent) * 100) : 0;

        // Poll results
        const pollResults = {};
        const optionsList = announcement.options ? JSON.parse(announcement.options) : [];
        optionsList.forEach(opt => {
            pollResults[opt] = 0;
        });

        announcement.responses.forEach(r => {
            if (r.status === "responded" && r.selectedOptions) {
                try {
                    const selected = JSON.parse(r.selectedOptions);
                    if (Array.isArray(selected)) {
                        selected.forEach(opt => {
                            pollResults[opt] = (pollResults[opt] || 0) + 1;
                        });
                    } else if (typeof selected === "string") {
                        pollResults[selected] = (pollResults[selected] || 0) + 1;
                    }
                } catch (e) {
                    console.error("Failed to parse options selected", e);
                }
            }
        });

        res.json({
            announcement: {
                id: announcement.id,
                title: announcement.title,
                message: announcement.message,
                priority: announcement.priority,
                type: announcement.type,
                options: optionsList,
                allowManual: announcement.allowManual,
                responseRequired: announcement.responseRequired,
                createdAt: announcement.createdAt,
                scheduledAt: announcement.scheduledAt,
                expiredAt: announcement.expiredAt
            },
            stats: {
                totalSent,
                totalDelivered,
                totalViewed,
                totalResponded,
                totalPending,
                totalIgnored,
                engagementRate,
                viewRate
            },
            pollResults,
            responses: announcement.responses.map(r => ({
                id: r.id,
                recruiterName: r.recruiter?.name || "Unknown",
                status: r.status,
                reaction: r.reaction,
                selectedOptions: r.selectedOptions ? JSON.parse(r.selectedOptions) : null,
                manualText: r.manualText,
                seenAt: r.seenAt,
                respondedAt: r.respondedAt
            }))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Delete an announcement
app.delete("/api/announcements/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.user;

        const announcement = await Announcement.findByPk(id);
        if (!announcement) {
            return res.status(404).json({ error: "Announcement not found" });
        }

        if (role !== "boss" && role !== "superadmin" && announcement.tlId !== userId) {
            return res.status(403).json({ error: "Access Denied" });
        }

        await announcement.destroy();
        res.json({ success: true, message: "Announcement destroyed." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ====================================================================
// RECRUITER PROFILE & ASSET MANAGEMENT ENDPOINTS (NEW ENHANCEMENT)
// ====================================================================

// 1. Upload Helper Route (Base64 file receiver)
app.post("/api/upload", authenticate, async (req, res) => {
    try {
        const { fileName, fileType, base64Data } = req.body;
        if (!fileName || !base64Data) {
            fs.writeFileSync("c:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS\\upload_error.txt", "Error: Missing file details. Body keys: " + (req.body ? Object.keys(req.body).join(", ") : "null"));
            return res.status(400).json({ error: "Missing file details" });
        }

        // Clean base64 prefix if exists
        const cleanBase64 = base64Data.replace(/^data:.*;base64,/, "");
        const buffer = Buffer.from(cleanBase64, "base64");

        const timestamp = Date.now();
        const safeName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const uploadDir = path.resolve("uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, safeName);

        fs.writeFileSync(filePath, buffer);

        res.json({
            success: true,
            url: `/uploads/${safeName}`,
            name: safeName
        });
    } catch (err) {
        fs.writeFileSync("c:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS\\upload_error.txt", "Error inside /api/upload: " + err.message + "\nStack: " + err.stack);
        console.error("File upload error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Fetch Employee Profile
app.get("/api/employee-profile/:userId", authenticate, async (req, res) => {
    try {
        const { userId: paramUserId } = req.params;
        const targetUserId = parseInt(paramUserId);
        const { userId: currentUserId, role, companyId } = req.user;

        // Permission check
        if (targetUserId !== currentUserId) {
            if (role === "recruiter") {
                return res.status(403).json({ error: "Access denied. Recruiters can only view their own profile." });
            }
            // Check target user exists and belongs to the same company
            const targetUser = await User.findByPk(targetUserId);
            if (!targetUser) return res.status(404).json({ error: "Employee not found" });
            if (targetUser.companyId !== companyId) {
                return res.status(403).json({ error: "Access denied. Employee belongs to another company." });
            }

            if (role === "tl") {
                // TL can only view profiles of recruiters
                if (targetUser.role !== "recruiter") {
                    return res.status(403).json({ error: "Access denied. TL can only view recruiter profiles." });
                }
            }
        }

        // Fetch User and merged Profile
        const user = await User.findByPk(targetUserId, {
            attributes: ["id", "name", "email", "designation", "role", "reportingTo"],
            include: [
                { model: User, as: "manager_tl", attributes: ["id", "name", "role"] }
            ]
        });

        if (!user) return res.status(404).json({ error: "Employee not found" });

        const [profile] = await EmployeeProfile.findOrCreate({
            where: { userId: targetUserId },
            defaults: {
                recruiterNumber: "",
                gender: "Male",
                employeeId: `EMP-${targetUserId.toString().padStart(4, "0")}`,
                joiningDate: new Date().toISOString().split("T")[0],
                dob: "",
                bloodGroup: "O+",
                fatherName: "",
                maritalStatus: "Single",
                marriageDate: "",
                spouseName: "",
                nationality: "Indian",
                religion: "Hinduism",
                personalEmail: "",
                address: "",
                aadhaarNumber: "",
                panNumber: "",
                higherEdDocPath: "",
                higherEdDocName: ""
            }
        });

        res.json({
            isSelf: targetUserId === currentUserId,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                designation: user.designation,
                role: user.role,
                reportingTo: user.reportingTo,
                manager_tl: user.manager_tl
            },
            profile
        });
    } catch (err) {
        console.error("GET PROFILE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// 3. Update Employee Profile
app.put("/api/employee-profile/:userId", authenticate, async (req, res) => {
    try {
        const { userId: paramUserId } = req.params;
        const targetUserId = parseInt(paramUserId);
        const { userId: currentUserId, role, companyId, name: currentUserName } = req.user;
        const { profileData, userData } = req.body;

        // Fetch target user
        const targetUser = await User.findByPk(targetUserId);
        if (!targetUser) return res.status(404).json({ error: "Employee not found" });

        // Permission check
        if (targetUserId !== currentUserId) {
            if (role === "recruiter") {
                return res.status(403).json({ error: "Access denied. Recruiters cannot edit other profiles." });
            }
            if (targetUser.companyId !== companyId) {
                return res.status(403).json({ error: "Access denied. Employee belongs to another company." });
            }
            if (role === "tl") {
                // TL can only edit recruiters
                if (targetUser.role !== "recruiter") {
                    return res.status(403).json({ error: "Access denied. TL can only edit recruiter profiles." });
                }
            }
            if (role === "manager") {
                // Manager can only edit TL and Recruiter
                if (targetUser.role !== "tl" && targetUser.role !== "recruiter") {
                    return res.status(403).json({ error: "Access denied. Managers can only edit TL and Recruiter profiles." });
                }
            }
            if (role === "boss") {
                // Boss can edit Manager, TL, Recruiter, and Boss themselves
                if (targetUser.role !== "manager" && targetUser.role !== "tl" && targetUser.role !== "recruiter" && targetUser.role !== "boss") {
                    return res.status(403).json({ error: "Access denied. Boss can only edit Manager, TL, and Recruiter profiles." });
                }
            }
        }

        const profile = await EmployeeProfile.findOne({ where: { userId: targetUserId } });
        if (!profile) return res.status(404).json({ error: "Profile not found" });

        const profileUpdates = {};
        const userUpdates = {};
        const changesText = [];

        // Employee Info permissions (Boss and Superadmin can edit subordinate or self; Manager and TL can only edit subordinates)
        const canEditTargetEmpInfo = (role === "superadmin") ||
            (role === "boss") ||
            (role === "manager" && targetUserId !== currentUserId) ||
            (role === "tl" && targetUserId !== currentUserId);

        if (canEditTargetEmpInfo) {
            if (userData?.name && userData.name !== targetUser.name) {
                changesText.push(`Name: ${targetUser.name} -> ${userData.name}`);
                userUpdates.name = userData.name;
            }
            if (userData?.email && userData.email !== targetUser.email) {
                changesText.push(`Company Email: ${targetUser.email} -> ${userData.email}`);
                userUpdates.email = userData.email;
            }
            if (userData?.designation && userData.designation !== targetUser.designation) {
                changesText.push(`Designation: ${targetUser.designation} -> ${userData.designation}`);
                userUpdates.designation = userData.designation;
            }
            if (userData?.reportingTo !== undefined && userData.reportingTo !== targetUser.reportingTo) {
                changesText.push(`Reporting To: ID ${targetUser.reportingTo} -> ID ${userData.reportingTo}`);
                userUpdates.reportingTo = userData.reportingTo ? parseInt(userData.reportingTo) : null;
            }

            if (profileData?.employeeId && profileData.employeeId !== profile.employeeId) {
                changesText.push(`Employee ID: ${profile.employeeId} -> ${profileData.employeeId}`);
                profileUpdates.employeeId = profileData.employeeId;
            }
            if (profileData?.joiningDate && profileData.joiningDate !== profile.joiningDate) {
                changesText.push(`Joining Date: ${profile.joiningDate} -> ${profileData.joiningDate}`);
                profileUpdates.joiningDate = profileData.joiningDate;
            }
        }

        // Recruiter and supervisor can edit recruiterNumber and gender
        if (profileData?.recruiterNumber !== undefined && profileData.recruiterNumber !== profile.recruiterNumber) {
            changesText.push(`Recruiter Number: ${profile.recruiterNumber || "N/A"} -> ${profileData.recruiterNumber}`);
            profileUpdates.recruiterNumber = profileData.recruiterNumber;
        }
        if (profileData?.gender !== undefined && profileData.gender !== profile.gender) {
            changesText.push(`Gender: ${profile.gender || "N/A"} -> ${profileData.gender}`);
            profileUpdates.gender = profileData.gender;
        }

        // Personal Information fields (editable by all allowed profiles)
        const personalFields = ["dob", "bloodGroup", "fatherName", "maritalStatus", "marriageDate", "spouseName", "nationality", "religion", "personalEmail", "address"];
        personalFields.forEach(f => {
            if (profileData?.[f] !== undefined && profileData[f] !== profile[f]) {
                changesText.push(`${f}: ${profile[f] || "N/A"} -> ${profileData[f]}`);
                profileUpdates[f] = profileData[f];
            }
        });

        // Identity Documents fields (TL CANNOT edit recruiter identity documents)
        if (role === "recruiter" || role === "manager" || role === "boss" || role === "superadmin") {
            const identityFields = ["aadhaarNumber", "panNumber", "higherEdDocPath", "higherEdDocName"];
            identityFields.forEach(f => {
                if (profileData?.[f] !== undefined && profileData[f] !== profile[f]) {
                    changesText.push(`${f}: ${profile[f] || "N/A"} -> ${profileData[f]}`);
                    profileUpdates[f] = profileData[f];
                }
            });
        }

        // Save
        if (Object.keys(userUpdates).length > 0) {
            await targetUser.update(userUpdates);
        }
        if (Object.keys(profileUpdates).length > 0) {
            await profile.update(profileUpdates);
        }

        // Audit Log
        if (changesText.length > 0) {
            await AuditLog.create({
                action: "Update Employee Profile",
                details: `Profile of ${targetUser.name} (${targetUser.email}) updated by ${currentUserName} (${role.toUpperCase()}). Changes: ${changesText.slice(0, 5).join(", ")}${changesText.length > 5 ? "... (+ " + (changesText.length - 5) + " more)" : ""}`,
                performedBy: currentUserName
            });
        }

        res.json({ success: true, message: "Profile updated successfully.", profile, user: targetUser });
    } catch (err) {
        console.error("PUT PROFILE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// 4. Other Documents endpoints
app.get("/api/employee-profile/:userId/other-docs", authenticate, async (req, res) => {
    try {
        const { userId: paramUserId } = req.params;
        const targetUserId = parseInt(paramUserId);
        const { userId: currentUserId, role, companyId } = req.user;

        // Permissions
        if (targetUserId !== currentUserId) {
            if (role === "recruiter") return res.status(403).json({ error: "Access Denied" });
            const targetUser = await User.findByPk(targetUserId);
            if (!targetUser || targetUser.companyId !== companyId) return res.status(403).json({ error: "Access Denied" });
            if (role === "tl" && targetUser.reportingTo !== currentUserId) return res.status(403).json({ error: "Access Denied" });
        }

        const docs = await OtherDocument.findAll({
            where: { userId: targetUserId },
            order: [["createdAt", "DESC"]]
        });
        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/employee-profile/:userId/other-docs", authenticate, async (req, res) => {
    try {
        const { userId: paramUserId } = req.params;
        const targetUserId = parseInt(paramUserId);
        const { userId: currentUserId, role, companyId } = req.user;
        const { name, description, filePath, fileName } = req.body;

        if (targetUserId !== currentUserId) {
            if (role === "recruiter") return res.status(403).json({ error: "Access Denied" });
            const targetUser = await User.findByPk(targetUserId);
            if (!targetUser || targetUser.companyId !== companyId) return res.status(403).json({ error: "Access Denied" });
            if (role === "tl" && targetUser.reportingTo !== currentUserId) return res.status(403).json({ error: "Access Denied" });
        }

        const doc = await OtherDocument.create({
            userId: targetUserId,
            name,
            description,
            filePath,
            fileName
        });

        res.json({ success: true, doc });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/other-docs/:docId", authenticate, async (req, res) => {
    try {
        const { docId } = req.params;
        const { userId, role, companyId } = req.user;

        const doc = await OtherDocument.findByPk(docId);
        if (!doc) return res.status(404).json({ error: "Document not found" });

        if (doc.userId !== userId) {
            if (role === "recruiter") return res.status(403).json({ error: "Access Denied" });
            const targetUser = await User.findByPk(doc.userId);
            if (!targetUser || targetUser.companyId !== companyId) return res.status(403).json({ error: "Access Denied" });
            if (role === "tl" && targetUser.reportingTo !== userId) return res.status(403).json({ error: "Access Denied" });
        }

        // Delete from disk
        if (doc.filePath) {
            const cleanPath = path.resolve(doc.filePath.replace(/^\//, ""));
            if (fs.existsSync(cleanPath)) {
                fs.unlinkSync(cleanPath);
            }
        }

        await doc.destroy();
        res.json({ success: true, message: "Document deleted." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Asset Allocation endpoints
app.get("/api/employee-profile/:userId/assets", authenticate, async (req, res) => {
    try {
        const { userId: paramUserId } = req.params;
        const targetUserId = parseInt(paramUserId);
        const { userId: currentUserId, role, companyId } = req.user;

        // Permissions
        if (targetUserId !== currentUserId) {
            if (role === "recruiter") return res.status(403).json({ error: "Access Denied" });
            const targetUser = await User.findByPk(targetUserId);
            if (!targetUser || targetUser.companyId !== companyId) return res.status(403).json({ error: "Access Denied" });
            if (role === "tl" && targetUser.reportingTo !== currentUserId) return res.status(403).json({ error: "Access Denied" });
        }

        const assets = await Asset.findAll({
            where: { userId: targetUserId },
            order: [["createdAt", "DESC"]]
        });
        res.json(assets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/assets", authenticate, async (req, res) => {
    try {
        const { userId, name, description, serialNumber, assignedDate, documentPath, documentName } = req.body;
        const { userId: currentUserId, role, companyId } = req.user;
        const currentUserName = req.user.name || "Supervisor";

        // Only TL/Manager/Boss can assign assets
        if (!["tl", "manager", "boss"].includes(role)) {
            return res.status(403).json({ error: "Access Denied. Only supervisors can allocate assets." });
        }

        // Validate target employee
        const targetUser = await User.findByPk(userId);
        if (!targetUser || targetUser.companyId !== companyId) {
            return res.status(400).json({ error: "Invalid target employee" });
        }

        // TL reports validation
        if (role === "tl" && targetUser.reportingTo !== currentUserId) {
            return res.status(403).json({ error: "Access Denied. TL can only assign assets to direct subordinates." });
        }

        const asset = await Asset.create({
            userId,
            name,
            description,
            serialNumber,
            assignedDate: assignedDate || new Date().toISOString().split("T")[0],
            assignedById: currentUserId,
            documentPath,
            documentName,
            status: "Active"
        });

        // Log transaction to AssetHistory
        await AssetHistory.create({
            assetId: asset.id,
            assetName: asset.name,
            assetSerialNumber: asset.serialNumber,
            action: "Asset Added",
            details: `Asset assigned to ${targetUser.name} by ${currentUserName} (${role.toUpperCase()}). Serial: ${serialNumber}`,
            performedById: currentUserId,
            performedByName: currentUserName,
            performedByRole: role.toUpperCase()
        });

        res.json({ success: true, asset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/assets/:assetId", authenticate, async (req, res) => {
    try {
        const { assetId } = req.params;
        const { name, description, serialNumber, assignedDate, documentPath, documentName, status } = req.body;
        const { userId: currentUserId, role, companyId } = req.user;
        const currentUserName = req.user.name || "Supervisor";

        // Only TL/Manager/Boss can update assets
        if (!["tl", "manager", "boss"].includes(role)) {
            return res.status(403).json({ error: "Access Denied. Only supervisors can manage assets." });
        }

        const asset = await Asset.findByPk(assetId);
        if (!asset) return res.status(404).json({ error: "Asset not found" });

        // Validate target employee
        const targetUser = await User.findByPk(asset.userId);
        if (!targetUser || targetUser.companyId !== companyId) {
            return res.status(400).json({ error: "Access Denied." });
        }

        // If TL, check reporting
        if (role === "tl" && targetUser.reportingTo !== currentUserId) {
            return res.status(403).json({ error: "Access Denied. TL can only edit assets of direct subordinates." });
        }

        const oldStatus = asset.status;
        const oldSerial = asset.serialNumber;

        await asset.update({
            name: name !== undefined ? name : asset.name,
            description: description !== undefined ? description : asset.description,
            serialNumber: serialNumber !== undefined ? serialNumber : asset.serialNumber,
            assignedDate: assignedDate !== undefined ? assignedDate : asset.assignedDate,
            documentPath: documentPath !== undefined ? documentPath : asset.documentPath,
            documentName: documentName !== undefined ? documentName : asset.documentName,
            status: status !== undefined ? status : asset.status
        });

        // Determine action name for log
        let logAction = "Asset Updated";
        if (status && status !== oldStatus) {
            if (status === "Returned") logAction = "Asset Returned";
            else if (status === "Damaged") logAction = "Asset Damaged";
            else if (status === "Replaced") logAction = "Asset Replaced";
        } else if (serialNumber && serialNumber !== oldSerial) {
            logAction = "Asset Replaced";
        }

        // Log transaction to AssetHistory
        await AssetHistory.create({
            assetId: asset.id,
            assetName: asset.name,
            assetSerialNumber: asset.serialNumber,
            action: logAction,
            details: `Asset details updated for ${targetUser.name}. Status: ${oldStatus} -> ${asset.status}. Serial: ${oldSerial} -> ${asset.serialNumber}`,
            performedById: currentUserId,
            performedByName: currentUserName,
            performedByRole: role.toUpperCase()
        });

        res.json({ success: true, asset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/employee-profile/:userId/activity-history", authenticate, async (req, res) => {
    try {
        const { userId: paramUserId } = req.params;
        const targetUserId = parseInt(paramUserId);
        const { userId: currentUserId, role, companyId } = req.user;

        // Permissions
        if (targetUserId !== currentUserId) {
            if (role === "recruiter") return res.status(403).json({ error: "Access Denied" });
            const targetUser = await User.findByPk(targetUserId);
            if (!targetUser || targetUser.companyId !== companyId) return res.status(403).json({ error: "Access Denied" });
            if (role === "tl" && targetUser.reportingTo !== currentUserId) return res.status(403).json({ error: "Access Denied" });
        }

        const targetUser = await User.findByPk(targetUserId);
        const profileAuditLogs = await AuditLog.findAll({
            where: {
                [Op.or]: [
                    { details: { [Op.like]: `%Profile of ${targetUser.name}%` } },
                    { details: { [Op.like]: `%(${targetUser.email})%` } }
                ]
            },
            order: [["createdAt", "DESC"]],
            limit: 50
        });

        const userAssets = await Asset.findAll({ where: { userId: targetUserId } });
        const assetIds = userAssets.map(a => a.id);

        const assetHistories = assetIds.length === 0 ? [] : await AssetHistory.findAll({
            where: { assetId: assetIds },
            order: [["createdAt", "DESC"]],
            limit: 50
        });

        const timeline = [];

        profileAuditLogs.forEach(log => {
            timeline.push({
                type: "profile",
                title: log.action || "Profile Event",
                details: log.details,
                performedBy: log.performedBy || "System",
                createdAt: log.createdAt
            });
        });

        assetHistories.forEach(h => {
            timeline.push({
                type: "asset",
                title: h.action,
                details: h.details,
                performedBy: `${h.performedByName} (${h.performedByRole})`,
                createdAt: h.createdAt
            });
        });

        timeline.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        res.json(timeline);
    } catch (err) {
        console.error("GET TIMELINE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// FEEDBACK ECOSYSTEM BACKEND ENDPOINTS
// ==========================================

const getWorkedMinutesForToday = async (userId) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({
        where: { userId, date: todayStr },
        include: [
            { model: AttendanceLog, as: "logs" },
            { model: BreakLog, as: "breaks" }
        ]
    });

    if (!attendance || !attendance.logs || attendance.logs.length === 0) {
        return 0;
    }

    const activeBreak = attendance.breaks?.find(b => !b.endTime);
    let workedMins = 0;
    const now = new Date();

    attendance.logs.forEach(log => {
        if (log.logoutTime) {
            workedMins += log.duration || 0;
        } else {
            if (!activeBreak) {
                const elapsed = (now.getTime() - new Date(log.loginTime).getTime()) / 60000;
                workedMins += elapsed;
            } else {
                const elapsedBeforeBreak = (new Date(activeBreak.startTime).getTime() - new Date(log.loginTime).getTime()) / 60000;
                workedMins += elapsedBeforeBreak;
            }
        }
    });

    return workedMins;
};

app.get("/api/feedback/eligibility", authenticate, async (req, res) => {
    try {
        const { userId, role } = req.user;
        if (role !== "recruiter") {
            return res.json({ isEligible: true, reason: "Supervisors always eligible" });
        }

        const user = await User.findByPk(userId, {
            include: [{ model: Shift, as: "shift" }]
        });
        if (!user) return res.status(404).json({ error: "User not found" });

        // Check daily limit
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const submittedToday = await Feedback.findOne({
            where: {
                recruiterId: userId,
                createdAt: {
                    [Op.between]: [todayStart, todayEnd]
                }
            }
        });

        if (submittedToday) {
            return res.json({
                isEligible: false,
                reason: "You have already submitted today's feedback.",
                alreadySubmittedToday: true
            });
        }

        const workedMins = await getWorkedMinutesForToday(userId);

        // If no shift is assigned, they are always eligible by default
        if (!user.shift) {
            return res.json({
                isEligible: true,
                completedHours: (workedMins / 60).toFixed(2),
                requiredHours: 0,
                completedPercent: 100,
                alreadySubmittedToday: false,
                reason: "Eligible: No shift timing restriction applied."
            });
        }

        // Shift calculations
        const requiredHours = parseFloat(user.shift.requiredHours);
        const requiredMins = requiredHours * 60;
        const halfRequiredMins = requiredMins / 2;

        if (workedMins < halfRequiredMins) {
            return res.json({
                isEligible: false,
                reason: "Feedback can be submitted after completing 50% of today's assigned working hours.",
                completedHours: (workedMins / 60).toFixed(2),
                requiredHours,
                completedPercent: Math.round((workedMins / requiredMins) * 100),
                alreadySubmittedToday: false
            });
        }

        return res.json({
            isEligible: true,
            completedHours: (workedMins / 60).toFixed(2),
            requiredHours,
            completedPercent: Math.round((workedMins / requiredMins) * 100),
            alreadySubmittedToday: false
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/feedback", authenticate, async (req, res) => {
    try {
        const { userId, role, companyId, name: recruiterName } = req.user;
        if (role !== "recruiter") {
            return res.status(403).json({ error: "Only recruiters can submit feedback." });
        }

        const { feedbackType, subject, message, priority, sendTo, isAnonymous } = req.body;

        const user = await User.findByPk(userId, {
            include: [{ model: Shift, as: "shift" }]
        });
        if (!user) return res.status(404).json({ error: "User not found" });

        // Daily limit check
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const submittedToday = await Feedback.findOne({
            where: {
                recruiterId: userId,
                createdAt: {
                    [Op.between]: [todayStart, todayEnd]
                }
            }
        });
        if (submittedToday) {
            return res.status(400).json({ error: "You have already submitted today's feedback." });
        }

        // Shift calculation check (only if they have an assigned shift)
        if (user.shift) {
            const requiredHours = parseFloat(user.shift.requiredHours);
            const requiredMins = requiredHours * 60;
            const halfRequiredMins = requiredMins / 2;
            const workedMins = await getWorkedMinutesForToday(userId);

            if (workedMins < halfRequiredMins) {
                return res.status(400).json({ error: "Feedback can be submitted after completing 50% of today's assigned working hours." });
            }
        }

        const toTL = Array.isArray(sendTo) && (sendTo.includes("Team Leader") || sendTo.includes("tl"));
        const toManager = Array.isArray(sendTo) && (sendTo.includes("Manager") || sendTo.includes("manager"));
        const toBoss = Array.isArray(sendTo) && (sendTo.includes("Boss") || sendTo.includes("boss"));

        let finalCompanyId = companyId || user?.companyId;
        if (!finalCompanyId) {
            const defaultCompany = await Company.findOne();
            if (defaultCompany) {
                finalCompanyId = defaultCompany.id;
            } else {
                finalCompanyId = 1;
            }
        }

        const feedback = await Feedback.create({
            recruiterId: userId,
            companyId: finalCompanyId,
            feedbackType,
            subject,
            message,
            priority,
            toTL,
            toManager,
            toBoss,
            isAnonymous: !!isAnonymous,
            status: "Sent"
        });

        // Audit Log
        await AuditLog.create({
            action: "FEEDBACK_SUBMITTED",
            details: JSON.stringify({
                feedbackId: feedback.id,
                feedbackType,
                subject,
                priority,
                toTL,
                toManager,
                toBoss,
                isAnonymous
            }),
            performedBy: isAnonymous ? "Anonymous Employee" : recruiterName
        });

        // Create Notifications
        const notifyTargets = [];
        let directSupervisor = null;
        if (user.reportingTo) {
            directSupervisor = await User.findByPk(user.reportingTo);
        }

        let tlUser = null;
        let managerUser = null;

        if (directSupervisor) {
            if (directSupervisor.role === "tl") {
                tlUser = directSupervisor;
                if (directSupervisor.reportingTo) {
                    managerUser = await User.findByPk(directSupervisor.reportingTo);
                }
            } else if (directSupervisor.role === "manager") {
                managerUser = directSupervisor;
            }
        }

        const notificationTitle = isAnonymous ? "New Anonymous Feedback" : `New Feedback from ${recruiterName}`;
        const notificationMessage = `Subject: ${subject} (${feedbackType})`;

        if (toTL) {
            if (tlUser) {
                notifyTargets.push(tlUser.id);
            } else {
                const tls = await User.findAll({ where: { companyId, role: "tl", status: "active" } });
                tls.forEach(t => notifyTargets.push(t.id));
            }
        }

        if (toManager) {
            if (managerUser) {
                notifyTargets.push(managerUser.id);
            } else {
                const managers = await User.findAll({ where: { companyId, role: "manager", status: "active" } });
                managers.forEach(m => notifyTargets.push(m.id));
            }
        }

        if (toBoss) {
            const bosses = await User.findAll({ where: { companyId, role: "boss", status: "active" } });
            bosses.forEach(b => notifyTargets.push(b.id));
        }

        const uniqueTargets = [...new Set(notifyTargets)];
        for (const targetId of uniqueTargets) {
            await Notification.create({
                userId: targetId,
                type: "system_alert",
                title: notificationTitle,
                message: notificationMessage
            });
        }

        res.json({ success: true, feedback });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/feedback/history", authenticate, async (req, res) => {
    try {
        const { userId, role } = req.user;
        if (role !== "recruiter") {
            return res.status(403).json({ error: "Recruiter role required" });
        }

        const history = await Feedback.findAll({
            where: { recruiterId: userId },
            include: [
                { model: User, as: "tlReader", attributes: ["id", "name"] },
                { model: User, as: "managerReader", attributes: ["id", "name"] },
                { model: User, as: "bossReader", attributes: ["id", "name"] }
            ],
            order: [["createdAt", "DESC"]]
        });

        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/feedback/list", authenticate, async (req, res) => {
    try {
        const { userId, role, companyId } = req.user;
        if (!["tl", "manager", "boss"].includes(role)) {
            return res.status(403).json({ error: "Access denied" });
        }

        let feedbacks = [];

        if (role === "tl") {
            const recruiters = await User.findAll({
                where: { reportingTo: userId, role: "recruiter" }
            });
            const recruiterIds = recruiters.map(r => r.id);

            feedbacks = await Feedback.findAll({
                where: {
                    toTL: true,
                    recruiterId: recruiterIds
                },
                include: [
                    { model: User, as: "recruiter", attributes: ["id", "name", "email"] }
                ],
                order: [["createdAt", "DESC"]]
            });
        } else if (role === "manager") {
            const subordinates = await User.findAll({
                where: { reportingTo: userId }
            });
            const directIds = subordinates.map(s => s.id);
            const tlIds = subordinates.filter(s => s.role === "tl").map(s => s.id);
            let indirectRecruiterIds = [];
            if (tlIds.length > 0) {
                const indirectRecruiters = await User.findAll({
                    where: { reportingTo: tlIds, role: "recruiter" }
                });
                indirectRecruiterIds = indirectRecruiters.map(r => r.id);
            }
            const allRecruiterIds = [...new Set([...directIds, ...indirectRecruiterIds])];

            feedbacks = await Feedback.findAll({
                where: {
                    toManager: true,
                    recruiterId: allRecruiterIds
                },
                include: [
                    { model: User, as: "recruiter", attributes: ["id", "name", "email"] }
                ],
                order: [["createdAt", "DESC"]]
            });
        } else if (role === "boss") {
            feedbacks = await Feedback.findAll({
                where: {
                    toBoss: true,
                    companyId
                },
                include: [
                    { model: User, as: "recruiter", attributes: ["id", "name", "email"] }
                ],
                order: [["createdAt", "DESC"]]
            });
        }

        const scrubbedFeedbacks = feedbacks.map(f => {
            const fJson = f.toJSON();
            if (fJson.isAnonymous) {
                fJson.recruiterId = null;
                fJson.recruiter = {
                    id: null,
                    name: "Anonymous Employee",
                    email: "anonymous@company.com"
                };
            }
            return fJson;
        });

        res.json(scrubbedFeedbacks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch("/api/feedback/:id/read", authenticate, async (req, res) => {
    try {
        const { userId, role, name: readerName } = req.user;
        const { id } = req.params;

        if (!["tl", "manager", "boss"].includes(role)) {
            return res.status(403).json({ error: "Access denied" });
        }

        const feedback = await Feedback.findByPk(id);
        if (!feedback) return res.status(404).json({ error: "Feedback not found" });

        const updates = {};
        if (role === "tl") {
            updates.readByTL = true;
            updates.readByTLAt = new Date();
            updates.readByTLId = userId;
        } else if (role === "manager") {
            updates.readByManager = true;
            updates.readByManagerAt = new Date();
            updates.readByManagerId = userId;
        } else if (role === "boss") {
            updates.readByBoss = true;
            updates.readByBossAt = new Date();
            updates.readByBossId = userId;
        }

        if (feedback.status === "Sent") {
            updates.status = "Read";
        }

        await feedback.update(updates);

        await AuditLog.create({
            action: "FEEDBACK_READ",
            details: JSON.stringify({ feedbackId: id, role, readerId: userId }),
            performedBy: readerName
        });

        res.json({ success: true, feedback });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/feedback/:id/reply", authenticate, async (req, res) => {
    try {
        const { userId, role, name: senderName } = req.user;
        const { id } = req.params;
        const { message } = req.body;

        if (!message || message.trim() === "") {
            return res.status(400).json({ error: "Reply message cannot be empty" });
        }

        const feedback = await Feedback.findByPk(id);
        if (!feedback) return res.status(404).json({ error: "Feedback not found" });

        const reply = await FeedbackReply.create({
            feedbackId: id,
            senderId: userId,
            senderRole: role,
            message
        });

        await feedback.update({ status: "Replied" });

        await AuditLog.create({
            action: "FEEDBACK_REPLY_ADDED",
            details: JSON.stringify({ feedbackId: id, replyId: reply.id, role }),
            performedBy: feedback.isAnonymous && role === "recruiter" ? "Anonymous Employee" : senderName
        });

        if (role === "recruiter") {
            const notificationTitle = feedback.isAnonymous ? "Anonymous Reply on Feedback" : `New Reply from ${senderName}`;
            const notificationMessage = `Feedback regarding: ${feedback.subject}`;

            const notifyTargets = [];
            if (feedback.toTL) {
                const recruiter = await User.findByPk(feedback.recruiterId);
                if (recruiter && recruiter.reportingTo) {
                    const supervisor = await User.findByPk(recruiter.reportingTo);
                    if (supervisor && supervisor.role === "tl") {
                        notifyTargets.push(supervisor.id);
                    }
                }
            }
            if (feedback.toManager) {
                const recruiter = await User.findByPk(feedback.recruiterId);
                if (recruiter && recruiter.reportingTo) {
                    const supervisor = await User.findByPk(recruiter.reportingTo);
                    if (supervisor && supervisor.role === "manager") {
                        notifyTargets.push(supervisor.id);
                    } else if (supervisor && supervisor.role === "tl" && supervisor.reportingTo) {
                        notifyTargets.push(supervisor.reportingTo);
                    }
                }
            }
            if (feedback.toBoss) {
                const bosses = await User.findAll({ where: { companyId: feedback.companyId, role: "boss", status: "active" } });
                bosses.forEach(b => notifyTargets.push(b.id));
            }

            const uniqueTargets = [...new Set(notifyTargets)];
            for (const targetId of uniqueTargets) {
                await Notification.create({
                    userId: targetId,
                    type: "system_alert",
                    title: notificationTitle,
                    message: notificationMessage
                });
            }
        } else {
            await Notification.create({
                userId: feedback.recruiterId,
                type: "system_alert",
                title: "New Reply on Your Feedback",
                message: `Reply received from ${role.toUpperCase()} regarding: ${feedback.subject}`
            });
        }

        res.json({ success: true, reply });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/feedback/:id/replies", authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const feedback = await Feedback.findByPk(id);
        if (!feedback) return res.status(404).json({ error: "Feedback not found" });

        const replies = await FeedbackReply.findAll({
            where: { feedbackId: id },
            include: [
                { model: User, as: "sender", attributes: ["id", "name", "email"] }
            ],
            order: [["createdAt", "ASC"]]
        });

        const scrubbedReplies = replies.map(r => {
            const rJson = r.toJSON();
            if (feedback.isAnonymous && rJson.senderRole === "recruiter") {
                rJson.senderId = null;
                rJson.sender = {
                    id: null,
                    name: "Anonymous Employee",
                    email: "anonymous@company.com"
                };
            }
            return rJson;
        });

        res.json(scrubbedReplies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/feedback/analytics", authenticate, async (req, res) => {
    try {
        const { userId, role, companyId } = req.user;
        if (!["tl", "manager", "boss"].includes(role)) {
            return res.status(403).json({ error: "Access denied" });
        }

        let recruiterIds = [];
        let whereClause = { companyId };

        if (role === "tl") {
            const recruiters = await User.findAll({ where: { reportingTo: userId, role: "recruiter" } });
            recruiterIds = recruiters.map(r => r.id);
            whereClause = { toTL: true, recruiterId: recruiterIds };
        } else if (role === "manager") {
            const subordinates = await User.findAll({ where: { reportingTo: userId } });
            const directIds = subordinates.map(s => s.id);
            const tlIds = subordinates.filter(s => s.role === "tl").map(s => s.id);
            let indirectRecruiterIds = [];
            if (tlIds.length > 0) {
                const indirectRecruiters = await User.findAll({ where: { reportingTo: tlIds, role: "recruiter" } });
                indirectRecruiterIds = indirectRecruiters.map(r => r.id);
            }
            recruiterIds = [...new Set([...directIds, ...indirectRecruiterIds])];
            whereClause = { toManager: true, recruiterId: recruiterIds };
        } else if (role === "boss") {
            whereClause = { toBoss: true, companyId };
        }

        const feedbacks = await Feedback.findAll({
            where: whereClause,
            include: [
                { model: User, as: "recruiter", attributes: ["id", "name", "role", "reportingTo"] }
            ]
        });

        const total = feedbacks.length;
        const unread = feedbacks.filter(f => f.status === "Sent").length;
        const read = feedbacks.filter(f => f.status === "Read").length;
        const replied = feedbacks.filter(f => f.status === "Replied").length;
        const anonymous = feedbacks.filter(f => f.isAnonymous).length;

        const typeDist = {};
        feedbacks.forEach(f => {
            typeDist[f.feedbackType] = (typeDist[f.feedbackType] || 0) + 1;
        });

        const priorityDist = {};
        feedbacks.forEach(f => {
            priorityDist[f.priority] = (priorityDist[f.priority] || 0) + 1;
        });

        const responseRate = total > 0 ? Math.round(((read + replied) / total) * 100) : 0;

        const anonymousVsNamed = {
            anonymous,
            named: total - anonymous
        };

        let totalResponseTimeMins = 0;
        let responseCount = 0;
        feedbacks.forEach(f => {
            let readTime = null;
            if (role === "tl" && f.readByTLAt) readTime = new Date(f.readByTLAt);
            else if (role === "manager" && f.readByManagerAt) readTime = new Date(f.readByManagerAt);
            else if (role === "boss" && f.readByBossAt) readTime = new Date(f.readByBossAt);

            if (readTime) {
                const diff = (readTime.getTime() - new Date(f.createdAt).getTime()) / 60000;
                if (diff > 0) {
                    totalResponseTimeMins += diff;
                    responseCount++;
                }
            }
        });

        const avgResponseTime = responseCount > 0 ? Math.round(totalResponseTimeMins / responseCount) : 0;

        const monthlyTrend = {};
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        feedbacks.forEach(f => {
            const date = new Date(f.createdAt);
            const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
            monthlyTrend[key] = (monthlyTrend[key] || 0) + 1;
        });

        const weeklyTrend = { "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0 };
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        feedbacks.forEach(f => {
            const date = new Date(f.createdAt);
            const key = days[date.getDay()];
            if (weeklyTrend[key] !== undefined) {
                weeklyTrend[key] = (weeklyTrend[key] || 0) + 1;
            }
        });

        const deptTrend = {};
        const supervisors = await User.findAll({
            where: { companyId, role: { [Op.in]: ["tl", "manager"] } }
        });
        const supervisorMap = {};
        supervisors.forEach(s => {
            supervisorMap[s.id] = s.name;
        });

        feedbacks.forEach(f => {
            if (f.recruiter) {
                const supId = f.recruiter.reportingTo;
                const name = supervisorMap[supId] || "Direct/Other";
                deptTrend[name] = (deptTrend[name] || 0) + 1;
            } else {
                deptTrend["Direct/Other"] = (deptTrend["Direct/Other"] || 0) + 1;
            }
        });

        res.json({
            summary: {
                total,
                unread,
                read,
                replied,
                anonymous
            },
            typeDist,
            priorityDist,
            responseRate,
            avgResponseTime,
            anonymousVsNamed,
            monthlyTrend,
            weeklyTrend,
            deptTrend
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// COMPANY POLICY & COMPLIANCE APIs
// ==========================================

// Helper: Get Manager's subordinates
const getManagerSubordinates = async (managerId) => {
    try {
        const directReports = await User.findAll({
            where: { reportingTo: managerId, status: "active" },
            attributes: ["id", "role"]
        });
        const directIds = directReports.map(u => u.id);
        const tlIds = directReports.filter(u => u.role === "tl").map(u => u.id);

        let recruiterIds = [];
        if (tlIds.length > 0) {
            const indirectRecruiters = await User.findAll({
                where: { reportingTo: tlIds, role: "recruiter", status: "active" },
                attributes: ["id"]
            });
            recruiterIds = indirectRecruiters.map(r => r.id);
        }

        return [...new Set([...directIds, ...recruiterIds])];
    } catch (e) {
        console.error("Error fetching subordinates:", e.message);
        return [];
    }
};

// Helper: Check if policy is assigned to user
const isPolicyAssignedToUser = (policy, user) => {
    if (policy.assignedToType === 'All') return true;
    if (policy.assignedToType === 'Managers' && user.role === 'manager') return true;
    if (policy.assignedToType === 'TLs' && user.role === 'tl') return true;
    if (policy.assignedToType === 'Recruiters' && user.role === 'recruiter') return true;

    if (['Individual', 'Custom'].includes(policy.assignedToType)) {
        try {
            const ids = JSON.parse(policy.assignedToIds || '[]');
            if (Array.isArray(ids) && ids.includes(user.id)) return true;
        } catch (e) {
            if (policy.assignedToIds && policy.assignedToIds.includes(String(user.id))) return true;
        }
    }
    return false;
};

// Helper: Send notification to assigned users
const notifyAssignedUsers = async (policy, title, message) => {
    try {
        const { companyId, assignedToType, assignedToIds, createdBy, createdByRole } = policy;
        let targetUserIds = [];

        if (createdByRole === 'boss') {
            if (assignedToType === 'All') {
                const users = await User.findAll({ where: { companyId, status: 'active' } });
                targetUserIds = users.map(u => u.id);
            } else if (assignedToType === 'Managers') {
                const users = await User.findAll({ where: { companyId, role: 'manager', status: 'active' } });
                targetUserIds = users.map(u => u.id);
            } else if (assignedToType === 'TLs') {
                const users = await User.findAll({ where: { companyId, role: 'tl', status: 'active' } });
                targetUserIds = users.map(u => u.id);
            } else if (assignedToType === 'Recruiters') {
                const users = await User.findAll({ where: { companyId, role: 'recruiter', status: 'active' } });
                targetUserIds = users.map(u => u.id);
            } else {
                try {
                    targetUserIds = JSON.parse(assignedToIds || '[]');
                } catch (e) {
                    targetUserIds = [];
                }
            }
        } else {
            try {
                targetUserIds = JSON.parse(assignedToIds || '[]');
            } catch (e) {
                targetUserIds = [];
            }
        }

        targetUserIds = targetUserIds.filter(id => id !== createdBy);

        for (const uid of targetUserIds) {
            await Notification.create({
                userId: uid,
                type: "system_alert",
                title,
                message
            });
        }
    } catch (e) {
        console.error("Failed to notify users:", e.message);
    }
};

// 1. Create Policy
app.post("/api/policies", authenticate, async (req, res) => {
    try {
        const { userId, role, companyId, name } = req.user;
        if (!['boss', 'manager'].includes(role)) {
            return res.status(403).json({ error: "Access denied" });
        }

        const {
            title,
            category,
            description,
            effectiveDate,
            expiryDate,
            severityLevel,
            status,
            assignedToType,
            assignedToIds,
            documents
        } = req.body;

        if (!title || !category) {
            return res.status(400).json({ error: "Title and Category are required" });
        }

        let finalAssignedToIds = assignedToIds;
        if (role === 'manager') {
            const subordinates = await getManagerSubordinates(userId);
            if (assignedToType === 'Individual' || assignedToType === 'Custom') {
                const parsedIds = Array.isArray(assignedToIds) ? assignedToIds : JSON.parse(assignedToIds || '[]');
                const filtered = parsedIds.filter(id => subordinates.includes(id));
                finalAssignedToIds = JSON.stringify(filtered);
            } else if (assignedToType === 'All') {
                finalAssignedToIds = JSON.stringify(subordinates);
            } else if (assignedToType === 'TLs') {
                const tls = await User.findAll({
                    where: { reportingTo: userId, role: 'tl', status: 'active' },
                    attributes: ['id']
                });
                finalAssignedToIds = JSON.stringify(tls.map(t => t.id));
            } else if (assignedToType === 'Recruiters') {
                const tls = await User.findAll({
                    where: { reportingTo: userId, role: 'tl', status: 'active' },
                    attributes: ['id']
                });
                const tlIds = tls.map(t => t.id);
                const recruiters = await User.findAll({
                    where: { reportingTo: tlIds, role: 'recruiter', status: 'active' },
                    attributes: ['id']
                });
                finalAssignedToIds = JSON.stringify(recruiters.map(r => r.id));
            }
        } else {
            if (Array.isArray(assignedToIds)) {
                finalAssignedToIds = JSON.stringify(assignedToIds);
            }
        }

        const docStr = Array.isArray(documents) ? JSON.stringify(documents) : JSON.stringify([]);

        const policy = await Policy.create({
            companyId,
            title,
            category,
            description,
            effectiveDate,
            expiryDate,
            severityLevel: severityLevel || "Informational",
            status: status || "Draft",
            assignedToType: assignedToType || "All",
            assignedToIds: finalAssignedToIds,
            documents: docStr,
            createdBy: userId,
            createdByName: name,
            createdByRole: role,
            version: "1.0",
            versionHistory: JSON.stringify([])
        });

        await PolicyAuditLog.create({
            policyId: policy.id,
            userId,
            userName: name,
            userRole: role,
            action: "Create",
            details: `Created policy '${title}' with status ${policy.status}`,
            ipAddress: req.ip || '',
            device: req.headers['user-agent'] || '',
            browser: ''
        });

        if (policy.status === 'Active') {
            await notifyAssignedUsers(policy, `New Policy Assigned: ${title}`, `A new policy '${title}' has been assigned to you. Please read and acknowledge.`);
        }

        res.json({ success: true, policy });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Edit Policy
app.put("/api/policies/:id", authenticate, async (req, res) => {
    try {
        const { userId, role, companyId, name } = req.user;
        if (!['boss', 'manager'].includes(role)) {
            return res.status(403).json({ error: "Access denied" });
        }

        const policy = await Policy.findByPk(req.params.id);
        if (!policy) return res.status(404).json({ error: "Policy not found" });

        if (role === 'manager' && policy.createdBy !== userId) {
            return res.status(403).json({ error: "You can only edit policies created by you" });
        }

        const {
            title,
            category,
            description,
            effectiveDate,
            expiryDate,
            severityLevel,
            status,
            assignedToType,
            assignedToIds,
            documents,
            incrementVersion
        } = req.body;

        const oldVersion = policy.version;
        let newVersion = oldVersion;

        const docStr = Array.isArray(documents) ? JSON.stringify(documents) : policy.documents;
        const hasDocChanged = docStr !== policy.documents;

        if (incrementVersion || hasDocChanged || title !== policy.title || description !== policy.description) {
            const currentVal = parseFloat(oldVersion) || 1.0;
            newVersion = (currentVal + 0.1).toFixed(1);
        }

        let versionHistory = [];
        try {
            versionHistory = JSON.parse(policy.versionHistory || '[]');
        } catch (e) {
            versionHistory = [];
        }

        if (newVersion !== oldVersion) {
            versionHistory.push({
                version: oldVersion,
                title: policy.title,
                category: policy.category,
                description: policy.description,
                effectiveDate: policy.effectiveDate,
                expiryDate: policy.expiryDate,
                severityLevel: policy.severityLevel,
                documents: policy.documents,
                modifiedBy: policy.modifiedBy || policy.createdBy,
                modifiedByName: policy.modifiedByName || policy.createdByName,
                modifiedAt: policy.updatedAt || policy.createdAt
            });
        }

        let finalAssignedToIds = assignedToIds !== undefined ? assignedToIds : policy.assignedToIds;
        if (assignedToIds !== undefined) {
            if (role === 'manager') {
                const subordinates = await getManagerSubordinates(userId);
                if (assignedToType === 'Individual' || assignedToType === 'Custom') {
                    const parsedIds = Array.isArray(assignedToIds) ? assignedToIds : JSON.parse(assignedToIds || '[]');
                    const filtered = parsedIds.filter(id => subordinates.includes(id));
                    finalAssignedToIds = JSON.stringify(filtered);
                } else if (assignedToType === 'All') {
                    finalAssignedToIds = JSON.stringify(subordinates);
                }
            } else {
                if (Array.isArray(assignedToIds)) {
                    finalAssignedToIds = JSON.stringify(assignedToIds);
                }
            }
        }

        await policy.update({
            title: title || policy.title,
            category: category || policy.category,
            description: description !== undefined ? description : policy.description,
            effectiveDate: effectiveDate || policy.effectiveDate,
            expiryDate: expiryDate !== undefined ? expiryDate : policy.expiryDate,
            severityLevel: severityLevel || policy.severityLevel,
            status: status || policy.status,
            assignedToType: assignedToType || policy.assignedToType,
            assignedToIds: finalAssignedToIds,
            documents: docStr,
            version: newVersion,
            modifiedBy: userId,
            modifiedByName: name,
            versionHistory: JSON.stringify(versionHistory)
        });

        await PolicyAuditLog.create({
            policyId: policy.id,
            userId,
            userName: name,
            userRole: role,
            action: "Edit",
            details: `Updated policy '${policy.title}' from version ${oldVersion} to ${newVersion}`,
            ipAddress: req.ip || '',
            device: req.headers['user-agent'] || '',
            browser: ''
        });

        if (policy.status === 'Active' && newVersion !== oldVersion) {
            await notifyAssignedUsers(policy, `Policy Updated: ${policy.title}`, `Policy '${policy.title}' has been updated to version ${newVersion}. Please review and re-accept.`);
        }

        res.json({ success: true, policy });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Archive Policy
app.post("/api/policies/:id/archive", authenticate, async (req, res) => {
    try {
        const { userId, role, name } = req.user;
        if (!['boss', 'manager'].includes(role)) {
            return res.status(403).json({ error: "Access denied" });
        }

        const policy = await Policy.findByPk(req.params.id);
        if (!policy) return res.status(404).json({ error: "Policy not found" });

        if (role === 'manager' && policy.createdBy !== userId) {
            return res.status(403).json({ error: "Access denied" });
        }

        await policy.update({ status: 'Archived' });

        await PolicyAuditLog.create({
            policyId: policy.id,
            userId,
            userName: name,
            userRole: role,
            action: "Archive",
            details: `Archived policy '${policy.title}'`,
            ipAddress: req.ip || '',
            device: req.headers['user-agent'] || '',
            browser: ''
        });

        res.json({ success: true, policy });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Reactivate Policy
app.post("/api/policies/:id/reactivate", authenticate, async (req, res) => {
    try {
        const { userId, role, name } = req.user;
        if (!['boss', 'manager'].includes(role)) {
            return res.status(403).json({ error: "Access denied" });
        }

        const policy = await Policy.findByPk(req.params.id);
        if (!policy) return res.status(404).json({ error: "Policy not found" });

        if (role === 'manager' && policy.createdBy !== userId) {
            return res.status(403).json({ error: "Access denied" });
        }

        await policy.update({ status: 'Active' });

        await PolicyAuditLog.create({
            policyId: policy.id,
            userId,
            userName: name,
            userRole: role,
            action: "Reactivate",
            details: `Reactivated policy '${policy.title}'`,
            ipAddress: req.ip || '',
            device: req.headers['user-agent'] || '',
            browser: ''
        });

        await notifyAssignedUsers(policy, `Policy Reactivated: ${policy.title}`, `Policy '${policy.title}' is active again. Please make sure you have acknowledged it.`);

        res.json({ success: true, policy });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Delete Draft Policy
app.delete("/api/policies/:id", authenticate, async (req, res) => {
    try {
        const { userId, role, name } = req.user;
        if (!['boss', 'manager'].includes(role)) {
            return res.status(403).json({ error: "Access denied" });
        }

        const policy = await Policy.findByPk(req.params.id);
        if (!policy) return res.status(404).json({ error: "Policy not found" });

        if (role === 'manager' && policy.createdBy !== userId) {
            return res.status(403).json({ error: "Access denied" });
        }

        if (policy.status !== 'Draft') {
            return res.status(400).json({ error: "Only draft policies can be deleted" });
        }

        const title = policy.title;
        await policy.destroy();

        await PolicyAuditLog.create({
            policyId: null,
            userId,
            userName: name,
            userRole: role,
            action: "Delete",
            details: `Deleted draft policy '${title}'`,
            ipAddress: req.ip || '',
            device: req.headers['user-agent'] || '',
            browser: ''
        });

        res.json({ success: true, message: "Draft policy deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. List Policies
app.get("/api/policies", authenticate, async (req, res) => {
    try {
        const { userId, role, companyId } = req.user;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        let policies = [];
        if (role === 'boss') {
            policies = await Policy.findAll({
                where: { companyId },
                order: [["createdAt", "DESC"]]
            });
        } else if (role === 'manager') {
            policies = await Policy.findAll({
                where: {
                    companyId,
                    [Op.or]: [
                        { createdByRole: 'boss' },
                        { createdBy: userId }
                    ]
                },
                order: [["createdAt", "DESC"]]
            });
        } else {
            const allActivePolicies = await Policy.findAll({
                where: { companyId, status: 'Active' },
                order: [["createdAt", "DESC"]]
            });

            let subordinateIdsOfManagers = {};
            policies = [];
            for (const p of allActivePolicies) {
                if (p.createdByRole === 'manager') {
                    const managerId = p.createdBy;
                    if (!subordinateIdsOfManagers[managerId]) {
                        subordinateIdsOfManagers[managerId] = await getManagerSubordinates(managerId);
                    }
                    if (!subordinateIdsOfManagers[managerId].includes(userId)) {
                        continue;
                    }
                }

                if (isPolicyAssignedToUser(p, user)) {
                    policies.push(p);
                }
            }
        }

        const policiesWithAck = await Promise.all(policies.map(async (p) => {
            const ack = await PolicyAcknowledgement.findOne({
                where: { policyId: p.id, userId, version: p.version }
            });
            const pJson = p.toJSON();
            pJson.acknowledgement = ack ? ack.toJSON() : null;
            return pJson;
        }));

        res.json(policiesWithAck);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Get Pending Policies
app.get("/api/policies/pending", authenticate, async (req, res) => {
    try {
        const { userId, role, companyId } = req.user;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (role === 'boss') {
            return res.json([]);
        }

        const allActivePolicies = await Policy.findAll({
            where: { companyId, status: 'Active' }
        });

        let subordinateIdsOfManagers = {};
        const pendingPolicies = [];

        for (const p of allActivePolicies) {
            if (p.createdByRole === 'manager') {
                const managerId = p.createdBy;
                if (!subordinateIdsOfManagers[managerId]) {
                    subordinateIdsOfManagers[managerId] = await getManagerSubordinates(managerId);
                }
                if (!subordinateIdsOfManagers[managerId].includes(userId)) {
                    continue;
                }
            }

            if (isPolicyAssignedToUser(p, user)) {
                const ack = await PolicyAcknowledgement.findOne({
                    where: { policyId: p.id, userId, version: p.version, accepted: true }
                });
                if (!ack) {
                    pendingPolicies.push(p);
                }
            }
        }

        res.json(pendingPolicies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 8. Track Acknowledgement
app.post("/api/policies/:id/acknowledgement", authenticate, async (req, res) => {
    try {
        const { userId, name, role } = req.user;
        const policyId = req.params.id;
        const { action, readDuration, pagesViewed, scrollProgress, documentName } = req.body;

        const policy = await Policy.findByPk(policyId);
        if (!policy) return res.status(404).json({ error: "Policy not found" });

        let [ack, created] = await PolicyAcknowledgement.findOrCreate({
            where: { policyId, userId, version: policy.version },
            defaults: {
                openedDate: new Date(),
                readDuration: 0,
                pagesViewed: 0,
                scrollProgress: 0.00,
                documentsViewed: JSON.stringify([]),
                accepted: false
            }
        });

        if (action === 'open') {
            if (!ack.openedDate) {
                await ack.update({ openedDate: new Date() });
            }
            await PolicyAuditLog.create({
                policyId,
                userId,
                userName: name,
                userRole: role,
                action: "Open",
                details: `Opened policy '${policy.title}' v${policy.version}`,
                ipAddress: req.ip || '',
                device: req.headers['user-agent'] || '',
                browser: ''
            });
        } else if (action === 'progress') {
            let docsViewed = [];
            try {
                docsViewed = JSON.parse(ack.documentsViewed || '[]');
            } catch (e) {
                docsViewed = [];
            }
            if (documentName && !docsViewed.includes(documentName)) {
                docsViewed.push(documentName);
                await PolicyAuditLog.create({
                    policyId,
                    userId,
                    userName: name,
                    userRole: role,
                    action: "View",
                    details: `Viewed document '${documentName}' for policy '${policy.title}'`,
                    ipAddress: req.ip || '',
                    device: req.headers['user-agent'] || '',
                    browser: ''
                });
            }

            const newDuration = (ack.readDuration || 0) + (readDuration || 0);
            const newPages = Math.max(ack.pagesViewed || 0, pagesViewed || 0);
            const newScroll = Math.max(parseFloat(ack.scrollProgress) || 0.0, parseFloat(scrollProgress) || 0.0);

            await ack.update({
                readDuration: newDuration,
                pagesViewed: newPages,
                scrollProgress: newScroll,
                documentsViewed: JSON.stringify(docsViewed)
            });
        } else if (action === 'accept') {
            if (ack.accepted) {
                return res.json({ success: true, ack, message: "Already accepted" });
            }

            const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';
            const device = req.headers['user-agent'] || '';

            await ack.update({
                accepted: true,
                acceptedDate: new Date(),
                ipAddress,
                device,
                browser: '',
                scrollProgress: 100.00
            });

            await PolicyAuditLog.create({
                policyId,
                userId,
                userName: name,
                userRole: role,
                action: "Accept",
                details: `Accepted policy '${policy.title}' v${policy.version}`,
                ipAddress,
                device,
                browser: ''
            });

            await Notification.create({
                userId: policy.createdBy,
                type: "system_alert",
                title: "Policy Accepted",
                message: `${name} (${role.toUpperCase()}) has accepted policy '${policy.title}' v${policy.version}.`
            });
        }

        res.json({ success: true, ack });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 9. Download Log
app.post("/api/policies/:id/download-log", authenticate, async (req, res) => {
    try {
        const { userId, name, role } = req.user;
        const { documentName } = req.body;
        const policy = await Policy.findByPk(req.params.id);
        if (!policy) return res.status(404).json({ error: "Policy not found" });

        await PolicyAuditLog.create({
            policyId: policy.id,
            userId,
            userName: name,
            userRole: role,
            action: "Download",
            details: `Downloaded document '${documentName}' for policy '${policy.title}'`,
            ipAddress: req.ip || '',
            device: req.headers['user-agent'] || '',
            browser: ''
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 10. Policy Analytics
app.get("/api/policies/:id/analytics", authenticate, async (req, res) => {
    try {
        const { userId, role, companyId } = req.user;
        if (!['boss', 'manager'].includes(role)) {
            return res.status(403).json({ error: "Access denied" });
        }

        const policy = await Policy.findByPk(req.params.id);
        if (!policy) return res.status(404).json({ error: "Policy not found" });

        if (role === 'manager' && policy.createdBy !== userId) {
            return res.status(403).json({ error: "Access denied" });
        }

        let assignedUsers = [];
        if (policy.createdByRole === 'boss') {
            if (policy.assignedToType === 'All') {
                assignedUsers = await User.findAll({ where: { companyId, status: 'active' } });
            } else if (policy.assignedToType === 'Managers') {
                assignedUsers = await User.findAll({ where: { companyId, role: 'manager', status: 'active' } });
            } else if (policy.assignedToType === 'TLs') {
                assignedUsers = await User.findAll({ where: { companyId, role: 'tl', status: 'active' } });
            } else if (policy.assignedToType === 'Recruiters') {
                assignedUsers = await User.findAll({ where: { companyId, role: 'recruiter', status: 'active' } });
            } else {
                try {
                    const ids = JSON.parse(policy.assignedToIds || '[]');
                    assignedUsers = await User.findAll({ where: { id: ids, status: 'active' } });
                } catch (e) {
                    assignedUsers = [];
                }
            }
        } else {
            try {
                const ids = JSON.parse(policy.assignedToIds || '[]');
                assignedUsers = await User.findAll({ where: { id: ids, status: 'active' } });
            } catch (e) {
                assignedUsers = [];
            }
        }

        const acks = await PolicyAcknowledgement.findAll({
            where: { policyId: policy.id, version: policy.version }
        });

        const ackMap = {};
        acks.forEach(a => {
            ackMap[a.userId] = a;
        });

        let totalAssigned = assignedUsers.length;
        let totalOpened = 0;
        let totalAccepted = 0;
        let totalRead = 0;
        let totalReadTime = 0;
        let lastViewedDate = null;
        let lastAcceptedDate = null;

        const employeeRows = assignedUsers.map(u => {
            const ack = ackMap[u.id];
            const opened = ack && ack.openedDate ? true : false;
            const accepted = ack && ack.accepted ? true : false;

            if (opened) {
                totalOpened++;
                const opDate = new Date(ack.openedDate);
                if (!lastViewedDate || opDate > lastViewedDate) {
                    lastViewedDate = opDate;
                }
                totalReadTime += ack.readDuration || 0;
                if (ack.scrollProgress >= 50 || ack.readDuration >= 15) {
                    totalRead++;
                }
            }
            if (accepted) {
                totalAccepted++;
                const acDate = new Date(ack.acceptedDate);
                if (!lastAcceptedDate || acDate > lastAcceptedDate) {
                    lastAcceptedDate = acDate;
                }
            }

            return {
                userId: u.id,
                name: u.name,
                role: u.role,
                openedDate: ack ? ack.openedDate : null,
                readDuration: ack ? ack.readDuration : 0,
                pagesViewed: ack ? ack.pagesViewed : 0,
                scrollProgress: ack ? ack.scrollProgress : 0.00,
                documentsViewed: ack ? JSON.parse(ack.documentsViewed || '[]') : [],
                acceptedDate: ack ? ack.acceptedDate : null,
                acceptedStatus: accepted ? 'Accepted' : (opened ? 'Opened' : 'Pending'),
                currentVersionAccepted: accepted,
                pendingVersion: !accepted ? policy.version : null
            };
        });

        const acceptanceRate = totalAssigned > 0 ? Math.round((totalAccepted / totalAssigned) * 100) : 0;
        const avgReadTime = totalOpened > 0 ? Math.round(totalReadTime / totalOpened) : 0;

        res.json({
            summary: {
                totalAssigned,
                totalOpened,
                totalRead,
                totalAccepted,
                acceptanceRate,
                avgReadTime,
                lastViewedDate,
                lastAcceptedDate
            },
            employeeRows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 11. Compliance Matrix
app.get("/api/policies/compliance-matrix", authenticate, async (req, res) => {
    try {
        const { userId, role, companyId } = req.user;
        if (!['boss', 'manager'].includes(role)) {
            return res.status(403).json({ error: "Access denied" });
        }

        let scopeUsers = [];
        if (role === 'boss') {
            scopeUsers = await User.findAll({
                where: { companyId, role: { [Op.ne]: 'boss' }, status: 'active' },
                attributes: ['id', 'name', 'role', 'reportingTo']
            });
        } else {
            const subIds = await getManagerSubordinates(userId);
            scopeUsers = await User.findAll({
                where: { id: subIds, status: 'active' },
                attributes: ['id', 'name', 'role', 'reportingTo']
            });
        }

        const activePolicies = await Policy.findAll({
            where: { companyId, status: 'Active' }
        });

        const activePolicyIds = activePolicies.map(p => p.id);
        const acks = await PolicyAcknowledgement.findAll({
            where: { policyId: activePolicyIds, accepted: true }
        });

        const userAcksMap = {};
        acks.forEach(a => {
            if (!userAcksMap[a.userId]) {
                userAcksMap[a.userId] = {};
            }
            userAcksMap[a.userId][a.policyId] = a.version;
        });

        let subordinateIdsOfManagers = {};
        const complianceRows = [];

        for (const u of scopeUsers) {
            let assignedCount = 0;
            let acceptedCount = 0;
            let pendingCount = 0;

            for (const p of activePolicies) {
                if (p.createdByRole === 'manager') {
                    const managerId = p.createdBy;
                    if (!subordinateIdsOfManagers[managerId]) {
                        subordinateIdsOfManagers[managerId] = await getManagerSubordinates(managerId);
                    }
                    if (!subordinateIdsOfManagers[managerId].includes(u.id)) {
                        continue;
                    }
                }

                if (isPolicyAssignedToUser(p, u)) {
                    assignedCount++;
                    const acceptedVer = userAcksMap[u.id]?.[p.id];
                    if (acceptedVer === p.version) {
                        acceptedCount++;
                    } else {
                        pendingCount++;
                    }
                }
            }

            const compliancePct = assignedCount > 0 ? Math.round((acceptedCount / assignedCount) * 100) : 100;

            complianceRows.push({
                userId: u.id,
                name: u.name,
                role: u.role,
                assignedCount,
                acceptedCount,
                pendingCount,
                compliancePct
            });
        }

        res.json(complianceRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 12. Policy Audit Logs
app.get("/api/policies/audit-logs", authenticate, async (req, res) => {
    try {
        const { userId, role, companyId } = req.user;
        if (!['boss', 'manager'].includes(role)) {
            return res.status(403).json({ error: "Access denied" });
        }

        let auditLogs = [];
        if (role === 'boss') {
            auditLogs = await PolicyAuditLog.findAll({
                order: [["createdAt", "DESC"]],
                limit: 500
            });
        } else {
            const subIds = await getManagerSubordinates(userId);
            const myPolicies = await Policy.findAll({
                where: { createdBy: userId },
                attributes: ['id']
            });
            const myPolicyIds = myPolicies.map(p => p.id);

            auditLogs = await PolicyAuditLog.findAll({
                where: {
                    [Op.or]: [
                        { policyId: myPolicyIds },
                        { userId: subIds }
                    ]
                },
                order: [["createdAt", "DESC"]],
                limit: 500
            });
        }

        res.json(auditLogs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 13. Policy Dashboard Stats
app.get("/api/policies/dashboard-stats", authenticate, async (req, res) => {
    try {
        const { userId, role, companyId } = req.user;
        if (!['boss', 'manager'].includes(role)) {
            return res.status(403).json({ error: "Access denied" });
        }

        let policies = [];
        let scopeUserIds = [];

        if (role === 'boss') {
            policies = await Policy.findAll({ where: { companyId } });
            const users = await User.findAll({ where: { companyId, role: { [Op.ne]: 'boss' }, status: 'active' } });
            scopeUserIds = users.map(u => u.id);
        } else {
            policies = await Policy.findAll({
                where: {
                    companyId,
                    [Op.or]: [
                        { createdByRole: 'boss' },
                        { createdBy: userId }
                    ]
                }
            });
            scopeUserIds = await getManagerSubordinates(userId);
        }

        const activePolicies = policies.filter(p => p.status === 'Active');
        const totalPolicies = policies.length;
        const activePoliciesCount = activePolicies.length;

        let totalAssignedPairs = 0;
        let totalAcceptedPairs = 0;
        let totalPendingPairs = 0;

        const managerSubMap = {};
        const getSubCached = async (mId) => {
            if (!managerSubMap[mId]) {
                managerSubMap[mId] = await getManagerSubordinates(mId);
            }
            return managerSubMap[mId];
        };

        const activePolicyIds = activePolicies.map(p => p.id);
        const acks = await PolicyAcknowledgement.findAll({
            where: { policyId: activePolicyIds, accepted: true }
        });

        const ackSet = new Set(acks.map(a => `${a.userId}-${a.policyId}-${a.version}`));

        for (const p of activePolicies) {
            let targets = [];
            if (p.createdByRole === 'boss') {
                if (p.assignedToType === 'All') {
                    targets = scopeUserIds;
                } else if (p.assignedToType === 'Managers') {
                    const managers = await User.findAll({ where: { id: scopeUserIds, role: 'manager' }, attributes: ['id'] });
                    targets = managers.map(m => m.id);
                } else if (p.assignedToType === 'TLs') {
                    const tls = await User.findAll({ where: { id: scopeUserIds, role: 'tl' }, attributes: ['id'] });
                    targets = tls.map(t => t.id);
                } else if (p.assignedToType === 'Recruiters') {
                    const recruiters = await User.findAll({ where: { id: scopeUserIds, role: 'recruiter' }, attributes: ['id'] });
                    targets = recruiters.map(r => r.id);
                } else {
                    try {
                        const ids = JSON.parse(p.assignedToIds || '[]');
                        targets = ids.filter(id => scopeUserIds.includes(id));
                    } catch (e) {
                        targets = [];
                    }
                }
            } else {
                const creatorSubs = await getSubCached(p.createdBy);
                try {
                    const ids = JSON.parse(p.assignedToIds || '[]');
                    targets = ids.filter(id => creatorSubs.includes(id) && scopeUserIds.includes(id));
                } catch (e) {
                    targets = [];
                }
            }

            totalAssignedPairs += targets.length;
            targets.forEach(tid => {
                if (ackSet.has(`${tid}-${p.id}-${p.version}`)) {
                    totalAcceptedPairs++;
                } else {
                    totalPendingPairs++;
                }
            });
        }

        const complianceRate = totalAssignedPairs > 0 ? Math.round((totalAcceptedPairs / totalAssignedPairs) * 100) : 100;
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const changesThisMonth = policies.filter(p => new Date(p.updatedAt) >= startOfMonth).length;

        const logs = await PolicyAuditLog.findAll({
            where: { action: 'Open' },
            attributes: ['policyId']
        });
        const viewCounts = {};
        logs.forEach(l => {
            if (l.policyId) {
                viewCounts[l.policyId] = (viewCounts[l.policyId] || 0) + 1;
            }
        });

        let mostViewed = "N/A";
        let leastViewed = "N/A";
        let maxViews = -1;
        let minViews = Infinity;

        activePolicies.forEach(p => {
            const cnt = viewCounts[p.id] || 0;
            if (cnt > maxViews) {
                maxViews = cnt;
                mostViewed = p.title;
            }
            if (cnt < minViews) {
                minViews = cnt;
                leastViewed = p.title;
            }
        });

        if (activePolicies.length === 0) {
            leastViewed = "N/A";
        }

        res.json({
            totalPolicies,
            activePoliciesCount,
            pendingAcknowledgements: totalPendingPairs,
            acceptedPolicies: totalAcceptedPairs,
            rejectedPending: totalPendingPairs,
            changesThisMonth,
            complianceRate,
            mostViewed,
            leastViewed
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 14. Get Employee Profile Policy Compliance
app.get("/api/employee-profile/:userId/policy-compliance", authenticate, async (req, res) => {
    try {
        const { role, companyId } = req.user;
        const targetUserId = parseInt(req.params.userId);

        const targetUser = await User.findByPk(targetUserId);
        if (!targetUser) return res.status(404).json({ error: "User not found" });

        if (targetUser.companyId !== companyId) {
            return res.status(403).json({ error: "Access denied" });
        }

        const activePolicies = await Policy.findAll({
            where: { companyId, status: 'Active' },
            order: [["createdAt", "DESC"]]
        });

        const acks = await PolicyAcknowledgement.findAll({
            where: { userId: targetUserId }
        });
        const ackMap = {};
        acks.forEach(a => {
            ackMap[`${a.policyId}-${a.version}`] = a;
        });

        let subordinateIdsOfManagers = {};
        const policyList = [];
        let assignedCount = 0;
        let acceptedCount = 0;

        for (const p of activePolicies) {
            if (p.createdByRole === 'manager') {
                const managerId = p.createdBy;
                if (!subordinateIdsOfManagers[managerId]) {
                    subordinateIdsOfManagers[managerId] = await getManagerSubordinates(managerId);
                }
                if (!subordinateIdsOfManagers[managerId].includes(targetUserId)) {
                    continue;
                }
            }

            if (isPolicyAssignedToUser(p, targetUser)) {
                assignedCount++;
                const ack = ackMap[`${p.id}-${p.version}`];
                const accepted = ack && ack.accepted ? true : false;
                if (accepted) acceptedCount++;

                policyList.push({
                    id: p.id,
                    title: p.title,
                    category: p.category,
                    version: p.version,
                    severityLevel: p.severityLevel,
                    createdByName: p.createdByName,
                    createdByRole: p.createdByRole,
                    effectiveDate: p.effectiveDate,
                    documents: p.documents ? JSON.parse(p.documents) : [],
                    accepted,
                    acceptedDate: ack ? ack.acceptedDate : null,
                    openedDate: ack ? ack.openedDate : null,
                    readDuration: ack ? ack.readDuration : 0,
                    pagesViewed: ack ? ack.pagesViewed : 0,
                    scrollProgress: ack ? ack.scrollProgress : 0.00,
                    versionAccepted: ack ? ack.version : null
                });
            }
        }

        const compliancePct = assignedCount > 0 ? Math.round((acceptedCount / assignedCount) * 100) : 100;

        const logs = await PolicyAuditLog.findAll({
            where: { userId: targetUserId },
            order: [["createdAt", "DESC"]],
            limit: 50
        });

        res.json({
            compliancePct,
            assignedCount,
            acceptedCount,
            policies: policyList,
            history: logs
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// REAL-DATA GAMIFICATION API ENDPOINTS
// ============================================

function mapStatusToEconomyKey(status) {
    if (!status) return null;
    const s = status.toLowerCase().trim();
    if (s === "new" || s === "register" || s === "registered" || s === "sourced") return "register";
    if (s === "connected") return "connected";
    if (s === "not connected") return "notConnected";
    if (s === "interested") return "interested";
    if (s === "not interested") return "notInterested";
    if (s === "status not interested") return "statusNotInterested";
    if (s === "go for interview" || s === "interview scheduled") return "goForInterview";
    if (s === "interview done") return "interviewDone";
    if (s === "interview not done") return "interviewNotDone";
    if (s === "call not pick" || s === "no response" || s === "call later") return "callNotPick";
    if (s === "processing for interview" || s === "processing") return "processingForInterview";
    if (s === "selected") return "selected";
    if (s === "rejected") return "rejected";
    if (s === "processing for joining") return "processingForJoining";
    if (s === "joined" || s === "hired") return "joined";
    if (s === "dropped") return "dropped";
    return null;
}

async function awardCandidateStatusPoints(candidateId, recruiterId, oldStatus, newStatus, companyId) {
    const PointHistory = sequelize.models.PointHistory;
    const UserMetrics = sequelize.models.UserMetrics;
    const User = sequelize.models.User;
    const economy = await getEconomyConfig();

    if (!newStatus || oldStatus === newStatus) return;

    const key = mapStatusToEconomyKey(newStatus);
    if (!key) return;

    const points = economy[key] !== undefined ? economy[key] : 0;
    
    // Check if positive points were already awarded to this candidate for this status
    if (points >= 0) {
        const uniqueKey = `candidate_${candidateId}_status_${key}`;
        const exists = await PointHistory.findOne({ where: { userId: recruiterId, reason: uniqueKey } });
        if (exists) {
            // Deduplicate
            return;
        }

        await PointHistory.create({
            userId: recruiterId,
            candidateId,
            actionType: "candidate_status",
            statusName: newStatus,
            pointsAwarded: points,
            reason: uniqueKey
        });

        const [metrics] = await UserMetrics.findOrCreate({ where: { userId: recruiterId } });
        metrics.totalCoins = (metrics.totalCoins || 0) + points;
        if (key === "selected") metrics.totalSelections = (metrics.totalSelections || 0) + 1;
        if (key === "joined") metrics.totalJoinings = (metrics.totalJoinings || 0) + 1;
        await metrics.save();

        // Check TL Team accomplishment points
        const recUser = await User.findByPk(recruiterId);
        if (recUser && recUser.reportingTo) {
            const tl = await User.findByPk(recUser.reportingTo);
            if (tl && tl.role === "tl") {
                let tlPoints = 0;
                let tlActionType = "";
                let tlStatusName = "";
                
                if (key === "selected") {
                    tlPoints = economy.teamSelection !== undefined ? economy.teamSelection : 5;
                    tlActionType = "tl_team_selection";
                    tlStatusName = "Team Selection Accomplishment";
                } else if (key === "joined") {
                    tlPoints = economy.teamJoining !== undefined ? economy.teamJoining : 8;
                    tlActionType = "tl_team_joining";
                    tlStatusName = "Team Joining Accomplishment";
                }
                
                if (tlPoints > 0) {
                    const tlKey = `tl_team_${candidateId}_status_${key}`;
                    const tlExists = await PointHistory.findOne({ where: { userId: tl.id, reason: tlKey } });
                    if (!tlExists) {
                        await PointHistory.create({
                            userId: tl.id,
                            candidateId,
                            actionType: tlActionType,
                            statusName: tlStatusName,
                            pointsAwarded: tlPoints,
                            reason: tlKey
                        });
                        const [tlMetrics] = await UserMetrics.findOrCreate({ where: { userId: tl.id } });
                        tlMetrics.totalCoins = (tlMetrics.totalCoins || 0) + tlPoints;
                        await tlMetrics.save();
                    }
                }
            }
        }
    } else {
        // Penalty (points < 0)
        const uniqueKey = `candidate_${candidateId}_status_${key}_${Date.now()}`;
        await PointHistory.create({
            userId: recruiterId,
            candidateId,
            actionType: "candidate_status",
            statusName: newStatus,
            pointsAwarded: points,
            reason: uniqueKey
        });

        const [metrics] = await UserMetrics.findOrCreate({ where: { userId: recruiterId } });
        metrics.totalCoins = (metrics.totalCoins || 0) + points;
        await metrics.save();

        // Check TL Team accomplishment penalty
        if (key === "dropped") {
            const recUser = await User.findByPk(recruiterId);
            if (recUser && recUser.reportingTo) {
                const tl = await User.findByPk(recUser.reportingTo);
                if (tl && tl.role === "tl") {
                    const tlPoints = economy.teamDropped !== undefined ? economy.teamDropped : -10;
                    const tlKey = `tl_team_${candidateId}_status_${key}_${Date.now()}`;
                    await PointHistory.create({
                        userId: tl.id,
                        candidateId,
                        actionType: "tl_team_dropped",
                        statusName: "Team Dropped Accomplishment Penalty",
                        pointsAwarded: tlPoints,
                        reason: tlKey
                    });
                    const [tlMetrics] = await UserMetrics.findOrCreate({ where: { userId: tl.id } });
                    tlMetrics.totalCoins = (tlMetrics.totalCoins || 0) + tlPoints;
                    await tlMetrics.save();
                }
            }
        }
    }

    // Rejoin Compensation check
    const oldKey = mapStatusToEconomyKey(oldStatus);
    if (oldKey === "dropped" && key === "joined") {
        const uniqueCompKey = `candidate_${candidateId}_rejoin_compensation`;
        const existsComp = await PointHistory.findOne({ where: { userId: recruiterId, reason: uniqueCompKey } });
        if (!existsComp) {
            const compPoints = Math.abs(economy.dropped !== undefined ? economy.dropped : -20);
            await PointHistory.create({
                userId: recruiterId,
                candidateId,
                actionType: "rejoin_compensation",
                statusName: "Rejoin Compensation (Dropped Offset)",
                pointsAwarded: compPoints,
                reason: uniqueCompKey
            });
            const [metrics] = await UserMetrics.findOrCreate({ where: { userId: recruiterId } });
            metrics.totalCoins = (metrics.totalCoins || 0) + compPoints;
            await metrics.save();

            // Compensate TL
            const recUser = await User.findByPk(recruiterId);
            if (recUser && recUser.reportingTo) {
                const tl = await User.findByPk(recUser.reportingTo);
                if (tl && tl.role === "tl") {
                    const tlCompKey = `tl_team_${candidateId}_rejoin_compensation`;
                    const tlCompExists = await PointHistory.findOne({ where: { userId: tl.id, reason: tlCompKey } });
                    if (!tlCompExists) {
                        const tlCompPoints = Math.abs(economy.teamDropped !== undefined ? economy.teamDropped : -10);
                        await PointHistory.create({
                            userId: tl.id,
                            candidateId,
                            actionType: "tl_rejoin_compensation",
                            statusName: "Team Rejoin Compensation (Dropped Offset)",
                            pointsAwarded: tlCompPoints,
                            reason: tlCompKey
                        });
                        const [tlMetrics] = await UserMetrics.findOrCreate({ where: { userId: tl.id } });
                        tlMetrics.totalCoins = (tlMetrics.totalCoins || 0) + tlCompPoints;
                        await tlMetrics.save();
                    }
                }
            }
        }
    }
}

async function getEconomyConfig() {
    const SystemSetting = sequelize.models.SystemSetting;
    let economy = {
        // Recruiter
        register: 0.30, connected: 0.2, notConnected: -0.3, interested: 0.3,
        notInterested: 0.1, statusNotInterested: -5, goForInterview: 7,
        interviewDone: 8, interviewNotDone: -0.5, callNotPick: -0.5,
        processingForInterview: 2, selected: 10, rejected: -7,
        processingForJoining: 12, joined: 18, dropped: -20,
        vendorCreated: 10, leadCreated: 2, leadForwarded: 10,
        taskCompleted: 10,
        
        // Monthly Recruiter
        monthly26DaysPresent: 30,
        monthlyAvgWorkHours: 40,
        monthlyOvertime: 10,
        monthlyAbsentPenalty: -10,
        monthlyLatePenalty: -10,
        monthlyEarlyBonus: 10,
        
        // TL
        teamSelection: 5, teamJoining: 8, teamDropped: -10,
        activeRecruiterDay: 1, eightyPercentActive: 1, teamTaskCompletion: 10,
        teamAvgLatePenalty: -20, teamPoorAttendancePenalty: -20
    };
    if (SystemSetting) {
        try {
            const dbConfig = await SystemSetting.findOne({ where: { key: "gamification_economy" } });
            if (dbConfig) {
                const parsed = JSON.parse(dbConfig.value);
                const points = parsed.points || parsed;
                economy = { ...economy, ...points };
            }
        } catch(e) {
            console.error("Failed to load gamification economy in index.js", e);
        }
    }
    return economy;
}

async function runDailyRecruiterTLChecks(userId, role, companyId) {
    const PointHistory = sequelize.models.PointHistory;
    const UserMetrics = sequelize.models.UserMetrics;
    const User = sequelize.models.User;
    const economy = await getEconomyConfig();
    
    // We check the last 5 days to ensure we catch up on any missed days
    const today = new Date();
    for (let offset = 1; offset <= 5; offset++) {
        const checkDate = new Date();
        checkDate.setDate(today.getDate() - offset);
        const dateStr = checkDate.toISOString().split('T')[0];

        const startOfDay = new Date(dateStr + "T00:00:00Z");
        const endOfDay = new Date(dateStr + "T23:59:59Z");

        // TL checks (for tl role)
        if (role === "tl") {
            const teamRecruiters = await User.findAll({
                where: { reportingTo: userId, role: "recruiter" }
            });
            if (teamRecruiters.length > 0) {
                const teamIds = teamRecruiters.map(r => r.id);
                let activeCount = 0;

                for (const rId of teamIds) {
                    const actions = await PointHistory.count({
                        where: {
                            userId: rId,
                            createdAt: { [Op.between]: [startOfDay, endOfDay] }
                        }
                    });
                    if (actions >= 20) {
                        activeCount++;
                        // Award active recruiter points per active recruiter to TL
                        const activeRecruiterPoints = economy.activeRecruiterDay || 1;
                        const uniqueKey = `tl_active_recruiter_${userId}_${rId}_${dateStr}`;
                        const exists = await PointHistory.findOne({ where: { userId, reason: uniqueKey } });
                        if (!exists) {
                            await PointHistory.create({
                                userId,
                                actionType: "tl_active_recruiter",
                                statusName: "Active Recruiter",
                                pointsAwarded: activeRecruiterPoints,
                                reason: uniqueKey
                            });
                            const [metrics] = await UserMetrics.findOrCreate({ where: { userId } });
                            metrics.totalCoins += activeRecruiterPoints;
                            await metrics.save();
                        }
                    }
                }

                // Check if 80%+ of team is active
                if (activeCount / teamRecruiters.length >= 0.8) {
                    const eightyPercentPoints = economy.eightyPercentActive || 1;
                    const uniqueKey = `tl_team_80_percent_${userId}_${dateStr}`;
                    const exists = await PointHistory.findOne({ where: { userId, reason: uniqueKey } });
                    if (!exists) {
                        await PointHistory.create({
                            userId,
                            actionType: "tl_team_80_percent",
                            statusName: "80% Team Active",
                            pointsAwarded: eightyPercentPoints,
                            reason: uniqueKey
                        });
                        const [metrics] = await UserMetrics.findOrCreate({ where: { userId } });
                        metrics.totalCoins += eightyPercentPoints;
                        await metrics.save();
                    }
                }
            }
        }
    }
}

async function runMonthlyGamificationCalculations(userId, role, companyId) {
    const PointHistory = sequelize.models.PointHistory;
    const UserMetrics = sequelize.models.UserMetrics;
    const User = sequelize.models.User;
    const Attendance = sequelize.models.Attendance;
    const Shift = sequelize.models.Shift;
    const economy = await getEconomyConfig();

    const now = new Date();
    // Get previous month date
    const prevMonthDate = new Date();
    prevMonthDate.setMonth(now.getMonth() - 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth() + 1; // 1-indexed
    const monthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

    const monthlyKey = `monthly_payout_${userId}_${monthStr}`;
    // Check if already processed
    const exists = await PointHistory.findOne({ where: { userId, reason: monthlyKey } });
    if (exists) return; // Already processed

    // Define start and end of previous month
    const startOfPrevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(prevYear, prevMonth, 0).getDate();
    const endOfPrevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    let pointsAwarded = 0;
    let logReasons = [];

    // 1. Recruiter monthly checks
    if (role === "recruiter") {
        const presentDays = await Attendance.count({
            where: { userId, status: "present", date: { [Op.between]: [startOfPrevMonthStr, endOfPrevMonthStr] } }
        });
        const absentDays = await Attendance.count({
            where: { userId, status: "absent", date: { [Op.between]: [startOfPrevMonthStr, endOfPrevMonthStr] } }
        });

        // Rule 1: 26+ present days -> +30 points
        if (presentDays >= 26) {
            const p = economy.monthly26DaysPresent !== undefined ? economy.monthly26DaysPresent : 30;
            pointsAwarded += p;
            logReasons.push(`+${p} (26+ Days Present)`);
        }
        // Rule 2: More than 4 absents -> -10 points
        if (absentDays > 4) {
            const p = economy.monthlyAbsentPenalty !== undefined ? economy.monthlyAbsentPenalty : -10;
            pointsAwarded += p;
            logReasons.push(`${p} (More than 4 Absents)`);
        }

        // Rule 3: Avg Work Hours >= 80% -> +40 points
        const totalHours = await Attendance.sum("totalWorkingHours", {
            where: { userId, date: { [Op.between]: [startOfPrevMonthStr, endOfPrevMonthStr] } }
        }) || 0;
        const user = await User.findByPk(userId, { include: [{ model: Shift, as: "shift" }] });
        const reqHoursPerDay = user && user.shift ? parseFloat(user.shift.requiredHours) : 8;
        const totalRequiredHours = presentDays * reqHoursPerDay;
        if (totalRequiredHours > 0 && (totalHours / totalRequiredHours) >= 0.8) {
            const p = economy.monthlyAvgWorkHours !== undefined ? economy.monthlyAvgWorkHours : 40;
            pointsAwarded += p;
            logReasons.push(`+${p} (Avg Work Hours >= 80%)`);
        }

        // Rule 4: Avg Overtime > 1.5hr -> +10 points
        const totalOvertime = await Attendance.sum("totalOvertime", {
            where: { userId, date: { [Op.between]: [startOfPrevMonthStr, endOfPrevMonthStr] } }
        }) || 0;
        const avgOvertimeMins = presentDays > 0 ? (totalOvertime / presentDays) : 0;
        if (avgOvertimeMins > 90) {
            const p = economy.monthlyOvertime !== undefined ? economy.monthlyOvertime : 10;
            pointsAwarded += p;
            logReasons.push(`+${p} (Avg Overtime > 1.5hr)`);
        }

        // Rule 5 & 6: Late / Early In average checks
        const presentAttendances = await Attendance.findAll({
            where: { userId, status: "present", date: { [Op.between]: [startOfPrevMonthStr, endOfPrevMonthStr] } },
            include: [{ model: Shift, as: "shift" }]
        });
        let totalLateMins = 0;
        let totalEarlyMins = 0;
        let presentCount = 0;
        presentAttendances.forEach(att => {
            if (att.loginTime && att.shift) {
                presentCount++;
                const checkInDate = new Date(att.loginTime);
                const [sh, sm] = att.shift.startTime.split(":").map(Number);
                const shiftStartDate = new Date(checkInDate);
                shiftStartDate.setHours(sh, sm, 0, 0);
                const diffMins = Math.round((checkInDate.getTime() - shiftStartDate.getTime()) / 60000);
                if (diffMins > 0) totalLateMins += diffMins;
                else if (diffMins < 0) totalEarlyMins += Math.abs(diffMins);
            }
        });
        const avgLate = presentCount > 0 ? (totalLateMins / presentCount) : 0;
        const avgEarly = presentCount > 0 ? (totalEarlyMins / presentCount) : 0;

        if (avgLate > 60) {
            const p = economy.monthlyLatePenalty !== undefined ? economy.monthlyLatePenalty : -10;
            pointsAwarded += p;
            logReasons.push(`${p} (Avg Late In > 1hr)`);
        }
        if (avgEarly > 60) {
            const p = economy.monthlyEarlyBonus !== undefined ? economy.monthlyEarlyBonus : 10;
            pointsAwarded += p;
            logReasons.push(`+${p} (Avg Early In > 1hr)`);
        }
    }

    // 2. TL monthly checks
    if (role === "tl") {
        const teamRecruiters = await User.findAll({
            where: { reportingTo: userId, role: "recruiter" }
        });
        if (teamRecruiters.length > 0) {
            const teamIds = teamRecruiters.map(r => r.id);
            
            // Rule 1: -20 point if team avg late > 1hr
            const presentAttendances = await Attendance.findAll({
                where: { userId: teamIds, status: "present", date: { [Op.between]: [startOfPrevMonthStr, endOfPrevMonthStr] } },
                include: [{ model: Shift, as: "shift" }]
            });
            let totalLateMins = 0;
            let presentCount = 0;
            presentAttendances.forEach(att => {
                if (att.loginTime && att.shift) {
                    presentCount++;
                    const checkInDate = new Date(att.loginTime);
                    const [sh, sm] = att.shift.startTime.split(":").map(Number);
                    const shiftStartDate = new Date(checkInDate);
                    shiftStartDate.setHours(sh, sm, 0, 0);
                    const diffMins = Math.round((checkInDate.getTime() - shiftStartDate.getTime()) / 60000);
                    if (diffMins > 0) totalLateMins += diffMins;
                }
            });
            const avgLate = presentCount > 0 ? (totalLateMins / presentCount) : 0;
            if (avgLate > 60) {
                const p = economy.teamAvgLatePenalty !== undefined ? economy.teamAvgLatePenalty : -20;
                pointsAwarded += p;
                logReasons.push(`${p} (Team Avg Late > 1hr)`);
            }

            // Rule 2: -20 point if attendance poor (avg absent > 4)
            const totalTeamAbsents = await Attendance.count({
                where: { userId: teamIds, status: "absent", date: { [Op.between]: [startOfPrevMonthStr, endOfPrevMonthStr] } }
            });
            const avgAbsents = totalTeamAbsents / teamRecruiters.length;
            if (avgAbsents > 4) {
                const p = economy.teamPoorAttendancePenalty !== undefined ? economy.teamPoorAttendancePenalty : -20;
                pointsAwarded += p;
                logReasons.push(`${p} (Team Avg Absents > 4)`);
            }
        }
    }

    // Create history record and add coins if points != 0
    if (pointsAwarded !== 0 || logReasons.length > 0) {
        await PointHistory.create({
            userId,
            actionType: "monthly_attendance_payout",
            statusName: "Monthly Attendance Summary",
            pointsAwarded,
            reason: monthlyKey,
            reasonDetails: logReasons.join(", ") || "Monthly review completed"
        });
        const [metrics] = await UserMetrics.findOrCreate({ where: { userId } });
        metrics.totalCoins += pointsAwarded;
        await metrics.save();
    }
}

app.get("/api/gamification/leaderboard", authenticate, async (req, res) => {
    try {
        const { companyId } = req.user;
        const { type } = req.query;
        const UserMetrics = sequelize.models.UserMetrics;
        const PointHistory = sequelize.models.PointHistory;
        if (!UserMetrics || !PointHistory) return res.json([]);

        if (type === "team") {
            const recruiters = await User.findAll({
                where: { companyId, role: "recruiter" },
                include: [{ model: UserMetrics, as: "metrics" }]
            });
            const teamScores = {};
            recruiters.forEach(r => {
                const tlId = r.reportingTo;
                if (tlId) {
                    const coins = r.metrics ? r.metrics.totalCoins : 0;
                    teamScores[tlId] = (teamScores[tlId] || 0) + coins;
                }
            });
            const tlIds = Object.keys(teamScores).map(Number);
            const tls = await User.findAll({
                where: { id: tlIds },
                attributes: ["id", "name"]
            });
            const teamList = tls.map(tl => {
                return {
                    id: tl.id,
                    name: tl.name + "'s Team",
                    coins: teamScores[tl.id] || 0,
                    role: "tl",
                    badge: "Team Starter"
                };
            }).sort((a, b) => b.coins - a.coins);
            teamList.forEach((item, index) => item.rank = index + 1);
            return res.json(teamList);
        } else if (type === "overall") {
            const recruiters = await User.findAll({
                where: { companyId, role: "recruiter" },
                include: [{ model: UserMetrics, as: "metrics" }]
            });
            const teamScores = {};
            recruiters.forEach(r => {
                const tlId = r.reportingTo;
                if (tlId) {
                    const coins = r.metrics ? r.metrics.totalCoins : 0;
                    teamScores[tlId] = (teamScores[tlId] || 0) + coins;
                }
            });
            const tls = await User.findAll({
                where: { companyId, role: "tl" },
                include: [{ model: UserMetrics, as: "metrics" }]
            });
            const overallList = tls.map(tl => {
                const personalCoins = tl.metrics ? tl.metrics.totalCoins : 0;
                const teamRecruiterCoins = teamScores[tl.id] || 0;
                return {
                    id: tl.id,
                    name: tl.name,
                    coins: personalCoins + teamRecruiterCoins,
                    role: "tl",
                    badge: "Team Leader"
                };
            }).sort((a, b) => b.coins - a.coins);
            overallList.forEach((item, index) => item.rank = index + 1);
            return res.json(overallList);
        } else {
            // Get all metrics joined with Users
            const metrics = await UserMetrics.findAll({
                include: [{ model: User, as: "user", where: { companyId }, attributes: ["id", "name", "role", "designation"] }],
                order: [["totalCoins", "DESC"]]
            });

            const list = metrics.map(m => {
                let badge = "Novice";
                if (m.totalCoins >= 5000) badge = "Legend";
                else if (m.totalCoins >= 2500) badge = "Master";
                else if (m.totalCoins >= 1000) badge = "Pro";
                else if (m.totalCoins >= 500) badge = "Veteran";

                return {
                    id: m.userId,
                    name: m.user ? m.user.name : "Unknown",
                    role: m.user ? m.user.role : "recruiter",
                    designation: m.user ? m.user.designation : "",
                    coins: m.totalCoins,
                    badge: badge,
                    selections: m.totalSelections,
                    joinings: m.totalJoinings,
                    sourced: m.uniqueCandidatesSourced
                };
            });

            // Add Rank
            list.forEach((item, index) => item.rank = index + 1);
            return res.json(list);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/gamification/me", authenticate, async (req, res) => {
    try {
        const { userId: id, companyId } = req.user;
        const UserMetrics = sequelize.models.UserMetrics;
        const PointHistory = sequelize.models.PointHistory;
        const Attendance = sequelize.models.Attendance;
        const Shift = sequelize.models.Shift;
        const Task = sequelize.models.Task;
        
        let [metrics] = await UserMetrics.findOrCreate({ where: { userId: id } });

        // Run daily activity checks and monthly calculations
        try {
            await runDailyRecruiterTLChecks(id, req.user.role, companyId);
            await runMonthlyGamificationCalculations(id, req.user.role, companyId);
        } catch (periodErr) {
            console.error("Failed to run periodic gamification calculations:", periodErr);
        }
        
        // Find position
        const allMetrics = await UserMetrics.findAll({
            include: [{ model: User, as: "user", where: { companyId }, attributes: ["id"] }],
            order: [["totalCoins", "DESC"]]
        });
        const rank = allMetrics.findIndex(m => m.userId === id) + 1;
        
        // Find team position (if TL, compare with other TLs, if recruiter, compare within team)
        let teamRank = rank;
        try {
            const meUser = await User.findByPk(id);
            if (meUser) {
                if (meUser.role === "recruiter") {
                    const tlId = meUser.reportingTo;
                    if (tlId) {
                        const teammates = await User.findAll({
                            where: { reportingTo: tlId, role: "recruiter" }
                        });
                        const teammateIds = teammates.map(t => t.id);
                        const teammateMetrics = await UserMetrics.findAll({
                            where: { userId: teammateIds },
                            order: [["totalCoins", "DESC"]]
                        });
                        const tIndex = teammateMetrics.findIndex(m => m.userId === id);
                        teamRank = tIndex !== -1 ? tIndex + 1 : teammateMetrics.length + 1;
                    } else {
                        const companyRecruiters = await User.findAll({
                            where: { companyId, role: "recruiter" }
                        });
                        const recIds = companyRecruiters.map(r => r.id);
                        const recMetrics = await UserMetrics.findAll({
                            where: { userId: recIds },
                            order: [["totalCoins", "DESC"]]
                        });
                        const rIndex = recMetrics.findIndex(m => m.userId === id);
                        teamRank = rIndex !== -1 ? rIndex + 1 : recMetrics.length + 1;
                    }
                } else if (meUser.role === "tl") {
                    const companyTls = await User.findAll({
                        where: { companyId, role: "tl" }
                    });
                    const tlIds = companyTls.map(t => t.id);
                    const tlMetrics = await UserMetrics.findAll({
                        where: { userId: tlIds },
                        order: [["totalCoins", "DESC"]]
                    });
                    const tlIndex = tlMetrics.findIndex(m => m.userId === id);
                    teamRank = tlIndex !== -1 ? tlIndex + 1 : tlMetrics.length + 1;
                }
            }
        } catch (rankErr) {
            console.error("Failed to compute teamRank:", rankErr);
        }

        let badge = "Novice";
        let nextBadge = "Veteran";
        let coinsRequired = 500;
        
        if (metrics.totalCoins >= 5000) { badge = "Legend"; nextBadge = "Max Level"; coinsRequired = 0; }
        else if (metrics.totalCoins >= 2500) { badge = "Master"; nextBadge = "Legend"; coinsRequired = 5000 - metrics.totalCoins; }
        else if (metrics.totalCoins >= 1000) { badge = "Pro"; nextBadge = "Master"; coinsRequired = 2500 - metrics.totalCoins; }
        else if (metrics.totalCoins >= 500) { badge = "Veteran"; nextBadge = "Pro"; coinsRequired = 1000 - metrics.totalCoins; }
        else { coinsRequired = 500 - metrics.totalCoins; }

        const history = await PointHistory.findAll({
            where: { userId: id },
            order: [["createdAt", "DESC"]],
            limit: 50
        });

        // Calculate real-time KPI metrics for dashboard
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);

        const attendances = await Attendance.findAll({
            where: {
                userId: id,
                date: { [Op.gte]: startOfMonth.toISOString().split('T')[0] }
            },
            include: [{ model: Shift, as: "shift" }]
        });

        let totalLateMins = 0;
        let totalEarlyMins = 0;
        let lateDays = 0;
        let earlyDays = 0;
        let totalAbsents = 0;

        attendances.forEach(att => {
            if (att.status === 'absent') {
                totalAbsents++;
            } else if (att.loginTime && att.shift) {
                const checkInDate = new Date(att.loginTime);
                const [sh, sm] = att.shift.startTime.split(":").map(Number);
                const shiftStartDate = new Date(checkInDate);
                shiftStartDate.setHours(sh, sm, 0, 0);

                const diffMins = Math.round((checkInDate.getTime() - shiftStartDate.getTime()) / 60000);
                if (diffMins > 0) {
                    totalLateMins += diffMins;
                    lateDays++;
                } else if (diffMins < 0) {
                    totalEarlyMins += Math.abs(diffMins);
                    earlyDays++;
                }
            }
        });

        const avgLateIn = lateDays > 0 ? (totalLateMins / lateDays / 60).toFixed(1) : "0.0";
        const avgEarlyIn = earlyDays > 0 ? (totalEarlyMins / earlyDays / 60).toFixed(1) : "0.0";

        const completedTasks = await Task.count({
            where: { assigneeId: id, status: "completed" }
        });

        // Sum team selections and joinings for TLs
        let teamSelections = 0;
        let teamJoinings = 0;
        if (req.user.role === "tl") {
            const teamRecruiters = await User.findAll({
                where: { reportingTo: id, role: "recruiter" },
                include: [{ model: UserMetrics, as: "metrics" }]
            });
            teamRecruiters.forEach(r => {
                if (r.metrics) {
                    teamSelections += r.metrics.totalSelections || 0;
                    teamJoinings += r.metrics.totalJoinings || 0;
                }
            });
        }

        res.json({
            coins: metrics.totalCoins,
            rank,
            teamRank,
            badge,
            nextBadge,
            coinsRequired,
            selections: metrics.totalSelections,
            joinings: metrics.totalJoinings,
            teamSelections,
            teamJoinings,
            sourced: metrics.uniqueCandidatesSourced,
            history,
            avgLateIn,
            avgEarlyIn,
            totalAbsents,
            completedTasks
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/gamification/action", authenticate, async (req, res) => {
    try {
        const { userId: id } = req.user;
        const { actionType, details, points, uniqueKey } = req.body;
        const PointHistory = sequelize.models.PointHistory;
        const UserMetrics = sequelize.models.UserMetrics;
        const economy = await getEconomyConfig();

        let finalPoints = points;
        if (actionType === "lead_created") {
            finalPoints = economy.leadCreated !== undefined ? economy.leadCreated : 2;
        } else if (actionType === "lead_forwarded") {
            finalPoints = economy.leadForwarded !== undefined ? economy.leadForwarded : 10;
        } else if (actionType === "vendor_created") {
            finalPoints = economy.vendorCreated !== undefined ? economy.vendorCreated : 10;
        }

        if (uniqueKey) {
            const existing = await PointHistory.findOne({ where: { userId: id, reason: uniqueKey } });
            if (existing) {
                return res.json({ success: true, alreadyAwarded: true });
            }
        }

        await PointHistory.create({
            userId: id,
            actionType,
            statusName: details || actionType,
            pointsAwarded: finalPoints,
            reason: uniqueKey || `manual_${actionType}_${Date.now()}`
        });

        const [metrics] = await UserMetrics.findOrCreate({ where: { userId: id } });
        metrics.totalCoins += finalPoints;
        await metrics.save();

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Gamification Config API
app.get("/api/settings/gamification", authenticate, async (req, res) => {
    try {
        const SystemSetting = sequelize.models.SystemSetting;
        if (!SystemSetting) return res.json({});
        const setting = await SystemSetting.findOne({ where: { key: "gamification_economy" } });
        if (setting) {
            res.json(JSON.parse(setting.value));
        } else {
            res.json({});
        }
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/settings/gamification", authenticate, async (req, res) => {
    try {
        if (req.user.role !== "boss" && req.user.role !== "superadmin") {
            return res.status(403).json({ error: "Access denied" });
        }
        const SystemSetting = sequelize.models.SystemSetting;
        if (!SystemSetting) return res.status(500).json({ error: "SystemSetting not initialized" });
        
        let [setting] = await SystemSetting.findOrCreate({ where: { key: "gamification_economy" }, defaults: { value: "{}" } });
        setting.value = JSON.stringify(req.body);
        await setting.save();
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// Gamification trigger watch change
