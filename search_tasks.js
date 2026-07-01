import fs from "fs";

const content = fs.readFileSync("./backend/server/index.js", "utf-8");
const lines = content.split("\n");

console.log("Searching for queries containing 'Task.' or 'Task.findAll' or 'Task.findOne'...");
lines.forEach((line, idx) => {
    if (line.includes("Task.") && (line.includes("find") || line.includes("query") || line.includes("where"))) {
        console.log(`${idx + 1}: ${line.trim()}`);
    }
});
