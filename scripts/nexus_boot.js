import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

function startCommand(name, command, args, cwd = root) {
    const envPath = process.env.PATH || process.env.Path || '';
    const newPath = envPath ? `${envPath};C:\\Windows\\System32` : 'C:\\Windows\\System32';
    const child = spawn(command, args, { 
        cwd: cwd, 
        stdio: 'inherit', 
        shell: true,
        env: { 
            ...process.env, 
            PATH: newPath,
            Path: newPath
        }
    });

    child.on('error', (err) => {
        console.error(`[${name}] ERROR: Failed to start protocol. Check your system PATH.`);
        console.error(err);
    });

    return child;
}

console.log("--- GIVYANSH NEXUS: MASTER BOOT SEQUENCE ---");
console.log("Initializing Terminal (Backend) and Interface (Frontend)...");

// Start Backend
const backend = startCommand('BACKEND', 'node', ['--watch', 'backend/server/index.js']);
// Start Frontend
const frontend = startCommand('FRONTEND', 'npx', ['vite'], path.resolve(root, 'frontend'));

process.on('SIGINT', () => {
    backend.kill();
    frontend.kill();
    process.exit();
});

