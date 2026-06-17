import { sequelize } from "./server/db.js";
import Task from "./server/models/Task.js";
import User from "./server/models/User.js";

async function main() {
    try {
        console.log("Connecting to DB...");
        await sequelize.authenticate();
        console.log("DB connected successfully!");

        // Find users
        const users = await User.findAll({ limit: 5 });
        console.log("Users:", users.map(u => ({ id: u.id, name: u.name, role: u.role })));

        if (users.length === 0) {
            console.log("No users found to assign task!");
            process.exit(1);
        }

        // Try inserting a basic task
        console.log("Inserting test task...");
        const task = await Task.create({
            title: "Test Basic Task",
            description: "Test description",
            priority: "high",
            duration: "this_week",
            taskType: "basic",
            assignerId: users[0].id,
            assigneeId: users[0].id,
            status: "in_progress",
            history: JSON.stringify([]),
            comments: JSON.stringify([]),
            attachments: JSON.stringify([]),
            createdAt: new Date()
        });

        console.log("Task inserted successfully! ID:", task.id);
        
    } catch (err) {
        console.error("FATAL DIAGNOSTIC ERROR:", err);
    } finally {
        process.exit();
    }
}

main();
