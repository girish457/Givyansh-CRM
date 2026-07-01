import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const indexFilePath = path.resolve(__dirname, "../backend/server/index.js");
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


export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "../backend/public",
    emptyOutDir: true,
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
