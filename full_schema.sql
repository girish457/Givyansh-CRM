-- GIVYANSH CRM FULL DATABASE SCHEMA (MySQL)
-- Created for Manual Upload

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- 1. COMPANIES TABLE
CREATE TABLE IF NOT EXISTS `companies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `adminEmail` varchar(255) NOT NULL,
  `adminPassword` varchar(255) NOT NULL,
  `plan` enum('Starter','Growth Pro','Enterprise') DEFAULT 'Starter',
  `status` enum('active','suspended','expired') DEFAULT 'active',
  `portal_boss` tinyint(1) DEFAULT 1,
  `portal_manager` tinyint(1) DEFAULT 0,
  `portal_tl` tinyint(1) DEFAULT 0,
  `portal_recruiter` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `adminEmail` (`adminEmail`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `role` enum('superadmin','boss','manager','tl','recruiter') NOT NULL DEFAULT 'recruiter',
  `status` enum('active','inactive') DEFAULT 'active',
  `companyId` int(11) DEFAULT NULL,
  `createdBy` int(11) DEFAULT NULL,
  `reportingTo` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `companyId` (`companyId`),
  KEY `createdBy` (`createdBy`),
  KEY `reportingTo` (`reportingTo`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `users_ibfk_3` FOREIGN KEY (`reportingTo`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 3. CANDIDATES TABLE
CREATE TABLE IF NOT EXISTS `candidates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `jobRole` varchar(255) DEFAULT NULL,
  `status` enum('New','Interested','Not Interested','Call Later','No Response','Hired','Rejected') DEFAULT 'New',
  `followUpDate` datetime DEFAULT NULL,
  `companyId` int(11) DEFAULT NULL,
  `assignedTo` int(11) DEFAULT NULL,
  `addedBy` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `companyId` (`companyId`),
  KEY `assignedTo` (`assignedTo`),
  KEY `addedBy` (`addedBy`),
  CONSTRAINT `candidates_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `candidates_ibfk_2` FOREIGN KEY (`assignedTo`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `candidates_ibfk_3` FOREIGN KEY (`addedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 4. INTERACTION_NOTES TABLE
CREATE TABLE IF NOT EXISTS `interaction_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `text` text NOT NULL,
  `candidateId` int(11) DEFAULT NULL,
  `authorId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `candidateId` (`candidateId`),
  KEY `authorId` (`authorId`),
  CONSTRAINT `interaction_notes_ibfk_1` FOREIGN KEY (`candidateId`) REFERENCES `candidates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `interaction_notes_ibfk_2` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 5. PRICING_PLANS TABLE
CREATE TABLE IF NOT EXISTS `pricing_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `price` varchar(255) NOT NULL,
  `description` text,
  `features` text,
  `isNeuralChoice` tinyint(1) DEFAULT 0,
  `status` varchar(255) DEFAULT 'active',
  `buttonText` varchar(255) DEFAULT 'Get Started',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 6. SYSTEM_SETTINGS TABLE
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `value` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --- SEED DATA FOR DEMO PURPOSES ---
-- Password for all demo accounts is hashed: 7790813609

INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`, `role`, `status`, `createdAt`) VALUES
(1, 'Givyansh Master', 'givyansh7790@gmail.com', '$2a$12$N9qo8uLOicrv2Z.07mK7Xey/6.Z8T43t4X.fX8Y0A.X8Y.X8Y.X8Y', 'superadmin', 'active', NOW()),
(2, 'The Boss', 'givyansh779081360977@gmail.com', '$2a$12$N9qo8uLOicrv2Z.07mK7Xey/6.Z8T43t4X.fX8Y0A.X8Y.X8Y.X8Y', 'boss', 'active', NOW()),
(3, 'Demo Manager', 'givyansh7790813609@gmail.com', '$2a$12$N9qo8uLOicrv2Z.07mK7Xey/6.Z8T43t4X.fX8Y0A.X8Y.X8Y.X8Y', 'manager', 'active', NOW()),
(4, 'Demo Team Lead', 'givyansh77908136@gmail.com', '$2a$12$N9qo8uLOicrv2Z.07mK7Xey/6.Z8T43t4X.fX8Y0A.X8Y.X8Y.X8Y', 'tl', 'active', NOW()),
(5, 'Demo Recruiter', 'givyansh779081@gmail.com', '$2a$12$N9qo8uLOicrv2Z.07mK7Xey/6.Z8T43t4X.fX8Y0A.X8Y.X8Y.X8Y', 'recruiter', 'active', NOW()),
(6, 'Demo Recruiter 2', 'hr.recruiter@example.com', '$2a$12$N9qo8uLOicrv2Z.07mK7Xey/6.Z8T43t4X.fX8Y0A.X8Y.X8Y.X8Y', 'recruiter', 'active', NOW());

-- 7. TASKS TABLE
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `priority` varchar(255) DEFAULT 'medium',
  `duration` varchar(255) DEFAULT 'today',
  `status` varchar(255) DEFAULT 'pending',
  `taskType` varchar(255) DEFAULT 'basic',
  `targetType` varchar(255) DEFAULT NULL,
  `targetQuantity` int(11) DEFAULT NULL,
  `completedQuantity` int(11) DEFAULT 0,
  `customStartDate` date DEFAULT NULL,
  `customEndDate` date DEFAULT NULL,
  `deadlineTime` varchar(255) DEFAULT NULL,
  `parentTaskId` int(11) DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `attachments` text DEFAULT NULL,
  `history` text DEFAULT NULL,
  `assignerId` int(11) NOT NULL,
  `assigneeId` int(11) NOT NULL,
  `companyId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `completedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `assignerId` (`assignerId`),
  KEY `assigneeId` (`assigneeId`),
  KEY `companyId` (`companyId`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`assignerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`assigneeId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tasks_ibfk_3` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `type` enum('task_assigned', 'team_added', 'system_alert') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text,
  `isRead` tinyint(1) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 9. CLIENTS TABLE
CREATE TABLE IF NOT EXISTS `clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `industry` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `contactPerson` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `billingDays` varchar(255) DEFAULT NULL,
  `joinings` int(11) DEFAULT NULL,
  `closingDate` datetime DEFAULT NULL,
  `companyId` int(11) DEFAULT NULL,
  `addedBy` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),

  KEY `companyId` (`companyId`),
  KEY `addedBy` (`addedBy`),
  CONSTRAINT `clients_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `clients_ibfk_2` FOREIGN KEY (`addedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


INSERT IGNORE INTO `system_settings` (`key`, `value`) VALUES ('yearly_discount', '20');

INSERT IGNORE INTO `pricing_plans` (`title`, `price`, `description`, `features`, `isNeuralChoice`, `buttonText`) VALUES
('Essentials Cluster', '99', 'Precision tools for solo recruiters.', '["5 Nodes", "Logic Sync"]', 0, 'Scale Now'),
('Business Ecosystem', '299', 'Recruitment OS for modern teams.', '["25 Nodes", "Neural Sorting"]', 1, 'Deploy Growth'),
('Enterprise Grid', 'Custom', 'Unlimited capabilities for global firms.', '["Unlimited Nodes", "Success Manager"]', 0, 'Contact Ops');
