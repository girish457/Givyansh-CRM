import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git' && f !== '.old' && f !== 'dist') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(dirPath);
    }
  });
}

console.log("Searching for 'failed to fetch' or similar in src and server...");
const srcDir = path.join(__dirname, 'src');
const serverDir = path.join(__dirname, 'server');

const searchDirs = [srcDir, serverDir];
searchDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    walkDir(dir, (filePath) => {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.js') || filePath.endsWith('.cjs')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.toLowerCase().includes('failed to fetch')) {
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (line.toLowerCase().includes('failed to fetch')) {
              console.log(`${filePath} [Line ${idx + 1}]: ${line.trim()}`);
            }
          });
        }
      }
    });
  }
});
