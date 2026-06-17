import fs from "fs";
import path from "path";

const content = fs.readFileSync("c:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS\\server\\index.js", "utf8");
const lines = content.split("\n");
let output = "";

lines.forEach((line, index) => {
    if (line.includes("/api/tasks") || line.includes("Task.") || line.includes("TaskAssignment")) {
        output += `Line ${index + 1}: ${line.trim()}\n`;
    }
});

fs.writeFileSync("c:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS\\tasks_output.txt", output);
console.log("Written output to tasks_output.txt");
