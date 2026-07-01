-- SQL Structure for Fast RMS (Recruitment Management System)
CREATE DATABASE IF NOT EXISTS fast_rms;
USE fast_rms;

-- 🏢 1. Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    adminEmail VARCHAR(255) NOT NULL UNIQUE,
    adminPassword VARCHAR(255) NOT NULL,
    plan ENUM('Starter', 'Growth Pro', 'Enterprise') DEFAULT 'Starter',
    status ENUM('active', 'suspended', 'expired') DEFAULT 'active',
    portal_boss BOOLEAN DEFAULT TRUE,
    portal_manager BOOLEAN DEFAULT FALSE,
    portal_tl BOOLEAN DEFAULT FALSE,
    portal_recruiter BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 👤 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('superadmin', 'boss', 'manager', 'tl', 'recruiter') NOT NULL DEFAULT 'recruiter',
    companyId INT DEFAULT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    createdBy INT DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
);

-- 💳 3. Pricing Plans Table
CREATE TABLE IF NOT EXISTS pricing_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price VARCHAR(255) NOT NULL,
    period VARCHAR(50) DEFAULT '/mo',
    description TEXT NOT NULL,
    features JSON NOT NULL,
    isNeuralChoice BOOLEAN DEFAULT FALSE,
    buttonText VARCHAR(255) DEFAULT 'Get Started',
    status ENUM('active', 'inactive') DEFAULT 'active',
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 📩 4. Contact Inquiries Table
CREATE TABLE IF NOT EXISTS contact_inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'resolved') DEFAULT 'new',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 👥 5. Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    jobRole VARCHAR(255),
    status ENUM('New', 'Interested', 'Not Interested', 'Call Later', 'No Response', 'Hired', 'Rejected') DEFAULT 'New',
    followUpDate DATE,
    companyId INT NOT NULL,
    assignedTo INT,
    addedBy INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (addedBy) REFERENCES users(id) ON DELETE SET NULL
);

-- 📝 6. Interaction Notes Table
CREATE TABLE IF NOT EXISTS interaction_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text TEXT NOT NULL,
    candidateId INT NOT NULL,
    authorId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidateId) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
);

-- 🔄 Seed Givyansh Master Node
-- Password: 7790813609
REPLACE INTO users (id, name, email, password, role, status) 
VALUES (1, 'Givyansh Master', 'givyansh7790@gmail.com', '$2b$10$7Z/Y3j6uP.1vQ3Yk8jG.7.9N3vK3/W/Y1W3W3W3W3W3W3W3W3W3W', 'superadmin', 'active');

-- 🔄 Seed Initial Pricing Architecture
VALUES 
(1, 'Essentials Cluster', '99', 'Precision tools for elite solo recruiters.', '["Up to 5 Nodes", "Logic Syncing", "Core Hub"]', FALSE, 'Scale Now'),
(2, 'Business Ecosystem', '299', 'The definitive operating system for teams.', '["Up to 25 Nodes", "API Access", "Neural Sorting"]', TRUE, 'Deploy Growth'),
(3, 'Enterprise Grid', 'Custom', 'Unrestricted neural capabilities for global firms.', '["Unlimited Nodes", "On-premise", "Encryption"]', FALSE, 'Contact Ops');
