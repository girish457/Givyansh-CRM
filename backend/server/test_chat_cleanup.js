import { sequelize } from "./db.js";
import ChatMessage from "./models/ChatMessage.js";
import SystemSetting from "./models/SystemSetting.js";
import { Op } from "sequelize";

async function testCleanup() {
    try {
        console.log("Setting up mock chat messages...");
        
        // 1. Delete all existing messages for clean test
        await ChatMessage.destroy({ where: {} });
        
        // 2. Create mock messages
        const now = new Date();
        
        // Message from 12 days ago (should be deleted)
        const dateOld = new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000);
        await ChatMessage.create({
            senderId: 2,
            senderName: "Test Boss",
            senderRole: "boss",
            message: "This is a very old message from 12 days ago",
            companyId: 1,
            createdAt: dateOld
        });
        
        // Message from 5 days ago (should be kept)
        const dateNew = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
        await ChatMessage.create({
            senderId: 6,
            senderName: "Test Recruiter",
            senderRole: "recruiter",
            message: "This is a recent message from 5 days ago",
            companyId: 1,
            createdAt: dateNew
        });
        
        console.log("Created 2 mock messages.");
        
        // 3. Force setting the cleanup time to 31 days ago to trigger cleanup
        const thirtyOneDaysAgo = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000);
        let [setting] = await SystemSetting.findOrCreate({ where: { key: "last_chat_cleanup_time" } });
        setting.value = thirtyOneDaysAgo.toISOString();
        await setting.save();
        
        console.log("Force set last_chat_cleanup_time to:", setting.value);
        
        // 4. Run cleanup logic manually
        const tenDaysMs = 10 * 24 * 60 * 60 * 1000;
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        
        // Check if cleanup should run
        const settingCheck = await SystemSetting.findOne({ where: { key: "last_chat_cleanup_time" } });
        const lastCleanup = new Date(settingCheck.value);
        
        if (now - lastCleanup >= thirtyDaysMs) {
            console.log("Cleanup triggered successfully!");
            const cutoffDate = new Date(now.getTime() - tenDaysMs);
            const deletedCount = await ChatMessage.destroy({
                where: {
                    createdAt: {
                        [Op.lt]: cutoffDate
                    }
                }
            });
            console.log(`Deleted ${deletedCount} chat messages older than 10 days.`);
            
            settingCheck.value = now.toISOString();
            await settingCheck.save();
        } else {
            console.log("Cleanup NOT triggered.");
        }
        
        // 5. Verify results
        const remainingMessages = await ChatMessage.findAll();
        console.log("Remaining Messages count:", remainingMessages.length);
        remainingMessages.forEach(msg => {
            console.log(`- "${msg.message}" (created at ${msg.createdAt})`);
        });
        
        if (remainingMessages.length === 1 && remainingMessages[0].message.includes("5 days ago")) {
            console.log("SUCCESS: Only the message from 5 days ago was kept!");
        } else {
            console.error("FAILURE: Incorrect messages kept.");
        }
    } catch (err) {
        console.error("Test failed:", err);
    } finally {
        process.exit();
    }
}

testCleanup();
