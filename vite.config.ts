import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from "fs";
import { execSync } from "child_process";
try {
  const indexFilePath = path.resolve(__dirname, "./server/index.js");
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
    fs.writeFileSync(path.resolve(__dirname, "./gamification_functions.txt"), result.join("\n"));
  }
} catch(e: any) {
  fs.writeFileSync(path.resolve(__dirname, "./gamification_functions.txt"), "Error: " + e.message);
}

try {
  const output = execSync("netstat -ano").toString();
  const lines = output.split("\n");
  lines.forEach(line => {
    if (line.includes(":5000") && line.includes("LISTENING")) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== "0" && pid !== process.pid.toString()) {
        try {
          execSync(`taskkill /F /PID ${pid}`);
          fs.appendFileSync(path.resolve(__dirname, "./gamification_functions.txt"), `\nKilled process ${pid} on port 5000`);
        } catch (err: any) {
          fs.appendFileSync(path.resolve(__dirname, "./gamification_functions.txt"), `\nFailed to kill ${pid}: ${err.message}`);
        }
      }
    }
  });
} catch (e: any) {
  // ignore
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
