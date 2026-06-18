import connectDB, { sequelize } from "./db.js";
import ChatMessage from "./models/ChatMessage.js";
import SystemSetting from "./models/SystemSetting.js";

async function testChatDB() {
    try {
        await connectDB();
        console.log("Describing ChatMessage model table...");
        const count = await ChatMessage.count();
        console.log("ChatMessage Count:", count);
        
        console.log("Querying SystemSettings for last_chat_cleanup_time...");
        const setting = await SystemSetting.findOne({ where: { key: "last_chat_cleanup_time" } });
        console.log("last_chat_cleanup_time Setting:", setting ? setting.toJSON() : "Not Found");
        
        console.log("Test successful!");
    } catch (err) {
        console.error("Test failed:", err);
    } finally {
        process.exit();
    }
}

testChatDB();
