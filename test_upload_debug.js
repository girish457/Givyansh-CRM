import jwt from "jsonwebtoken";
import http from "http";
import dotenv from "dotenv";
import { sequelize } from "./server/db.js";
import User from "./server/models/User.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_123_change_me";

async function main() {
    try {
        console.log("Locating Boss user in DB...");
        const boss = await User.findOne({ where: { role: "boss" } });
        if (!boss) {
            console.error("No Boss user found!");
            process.exit(1);
        }
        console.log(`Found Boss: ${boss.name} (ID: ${boss.id})`);

        // Generate a valid JWT token
        const token = jwt.sign({ userId: boss.id, email: boss.email, role: boss.role }, JWT_SECRET, { expiresIn: "1h" });
        console.log("Generated JWT Token successfully!");

        // Prepare the upload payload
        const payload = JSON.stringify({
            fileName: "test_policy_doc.txt",
            fileType: "text/plain",
            base64Data: "data:text/plain;base64,SGVsbG8gV29ybGQ="
        });

        console.log("Sending POST request to http://127.0.0.1:5000/api/upload...");
        
        const req = http.request({
            hostname: "127.0.0.1",
            port: 5000,
            path: "/api/upload",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "Content-Length": Buffer.byteLength(payload)
            }
        }, (res) => {
            console.log(`STATUS CODE: ${res.statusCode}`);
            let body = "";
            res.on("data", (chunk) => {
                body += chunk;
            });
            res.on("end", () => {
                console.log("RESPONSE BODY:");
                console.log(body);
                process.exit(0);
            });
        });

        req.on("error", (e) => {
            console.error("HTTP Request Error:", e);
            process.exit(1);
        });

        req.write(payload);
        req.end();

    } catch (err) {
        console.error("DIAGNOSTIC CRASHED:", err);
        process.exit(1);
    }
}

main();
