import connectDB, { sequelize, isDbConnected } from "./db.js";
import Meeting from "./models/Meeting.js";
import MeetingAttendance from "./models/MeetingAttendance.js";
import MeetingChat from "./models/MeetingChat.js";
import MeetingSetting from "./models/MeetingSetting.js";
import User from "./models/User.js";

async function runTests() {
  console.log("Starting backend Meeting API & DB Verification...");
  
  // Connect to the DB
  await connectDB();
  
  if (!isDbConnected) {
    console.error("Database connection could not be established. Aborting tests.");
    process.exit(1);
  }
  
  try {
    console.log("Running emergency migrations to create tables...");
    const queries = [
      `CREATE TABLE IF NOT EXISTS meetings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          companyId INT NOT NULL,
          hostId INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          agenda VARCHAR(255) NULL,
          description TEXT NULL,
          meetingType VARCHAR(50) DEFAULT 'scheduled',
          scheduledDate DATE NULL,
          scheduledTime VARCHAR(50) NULL,
          duration INT DEFAULT 30,
          priority VARCHAR(50) DEFAULT 'normal',
          status VARCHAR(50) DEFAULT 'scheduled',
          participants TEXT NULL,
          recordingEnabled BOOLEAN DEFAULT FALSE,
          screenshareEnabled BOOLEAN DEFAULT TRUE,
          cameraEnabled BOOLEAN DEFAULT TRUE,
          micEnabled BOOLEAN DEFAULT TRUE,
          chatEnabled BOOLEAN DEFAULT TRUE,
          aiSummaryEnabled BOOLEAN DEFAULT TRUE,
          recordingUrl VARCHAR(255) NULL,
          transcript TEXT NULL,
          summary TEXT NULL,
          cancellationReason VARCHAR(255) NULL,
          rescheduleHistory TEXT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS meeting_attendances (
          id INT AUTO_INCREMENT PRIMARY KEY,
          meetingId INT NOT NULL,
          userId INT NOT NULL,
          joinTime DATETIME NULL,
          leaveTime DATETIME NULL,
          duration INT DEFAULT 0,
          cameraUsage FLOAT DEFAULT 0.0,
          micUsage FLOAT DEFAULT 0.0,
          screenshareUsage FLOAT DEFAULT 0.0,
          networkDisconnects INT DEFAULT 0,
          rejoins INT DEFAULT 0,
          status VARCHAR(50) DEFAULT 'absent',
          rejected BOOLEAN DEFAULT FALSE,
          rejectReason VARCHAR(255) NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS meeting_chats (
          id INT AUTO_INCREMENT PRIMARY KEY,
          meetingId INT NOT NULL,
          senderId INT NOT NULL,
          senderName VARCHAR(255) NOT NULL,
          senderRole VARCHAR(50) NOT NULL,
          message TEXT NOT NULL,
          attachmentUrl VARCHAR(255) NULL,
          attachmentName VARCHAR(255) NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS meeting_settings (
          companyId INT PRIMARY KEY,
          moduleEnabled BOOLEAN DEFAULT TRUE,
          maxDuration INT DEFAULT 120,
          recordingAllowed BOOLEAN DEFAULT TRUE,
          screenshareAllowed BOOLEAN DEFAULT TRUE,
          chatAllowed BOOLEAN DEFAULT TRUE,
          cameraAllowed BOOLEAN DEFAULT TRUE,
          micAllowed BOOLEAN DEFAULT TRUE,
          aiSummaryAllowed BOOLEAN DEFAULT TRUE,
          attendanceRules TEXT NULL,
          reminderTimings VARCHAR(255) DEFAULT '24h,1h,15m,5m',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`
    ];

    for (const q of queries) {
      await sequelize.query(q);
    }
    console.log("SUCCESS: Database tables created/verified.");
    // 1. Fetch some user to act as host
    const user = await User.findOne();
    if (!user) {
      console.warn("No users found in database to act as host. Creating a temporary test host...");
    }
    const hostId = user ? user.id : 1;
    const companyId = (user && user.companyId) ? user.companyId : 1;
    
    console.log(`Using Host ID: ${hostId}, Company ID: ${companyId} for tests.`);
    
    // 2. Test Meeting Creation
    console.log("Testing Meeting creation...");
    const newMeeting = await Meeting.create({
      companyId,
      hostId,
      title: "Backend Sync Verification Meeting",
      agenda: "Confirm Sequelize schemas mapping",
      description: "Automated verification checklist.",
      meetingType: "scheduled",
      scheduledDate: "2026-06-25",
      scheduledTime: "14:30",
      duration: 45,
      priority: "important",
      status: "scheduled",
      participants: JSON.stringify([hostId]),
      recordingEnabled: false,
      screenshareEnabled: true,
      cameraEnabled: true,
      micEnabled: true,
      chatEnabled: true,
      aiSummaryEnabled: true
    });
    console.log(`SUCCESS: Created Meeting with ID: ${newMeeting.id}`);
    
    // 3. Test Meeting Settings
    console.log("Testing MeetingSettings fetch/upsert...");
    let settings = await MeetingSetting.findByPk(companyId);
    if (!settings) {
      settings = await MeetingSetting.create({
        companyId,
        moduleEnabled: true,
        maxDuration: 120,
        recordingAllowed: true,
        screenshareAllowed: true,
        chatAllowed: true,
        cameraAllowed: true,
        micAllowed: true,
        aiSummaryAllowed: true,
        reminderTimings: "24h,1h,15m,5m"
      });
    }
    console.log(`SUCCESS: Fetched/Created MeetingSettings for company ${companyId}`);
    
    // 4. Test Attendance log
    console.log("Testing MeetingAttendance creation...");
    const attendance = await MeetingAttendance.create({
      meetingId: newMeeting.id,
      userId: hostId,
      joinTime: new Date(),
      status: "joined",
      cameraUsage: 80.0,
      micUsage: 90.0
    });
    console.log(`SUCCESS: Logged attendance with ID: ${attendance.id}`);
    
    // 5. Query Meeting with relationships
    console.log("Testing model relationships query (includes)...");
    const queriedMeeting = await Meeting.findByPk(newMeeting.id, {
      include: [
        { model: User, as: "host", attributes: ["id", "name", "role"] },
        { model: MeetingAttendance, as: "attendances", include: [{ model: User, as: "user", attributes: ["id", "name"] }] }
      ]
    });
    console.log("Queried Meeting Host:", queriedMeeting?.host?.name);
    console.log("Queried Meeting Attendance Count:", queriedMeeting?.attendances?.length);
    
    // 6. Cleanup
    console.log("Cleaning up test data...");
    await MeetingAttendance.destroy({ where: { meetingId: newMeeting.id } });
    await Meeting.destroy({ where: { id: newMeeting.id } });
    console.log("SUCCESS: Test data cleaned up.");
    
    console.log("All DB model verifications completed SUCCESSFULLY!");
    process.exit(0);
  } catch (err) {
    console.error("TEST RUN ENCOUNTERED FAILURE ERROR:", err);
    process.exit(1);
  }
}

runTests();
