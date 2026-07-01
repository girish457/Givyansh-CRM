const { execSync } = require('child_process');
try {
  const netstatPath = 'C:\\Windows\\System32\\netstat.exe';
  const taskkillPath = 'C:\\Windows\\System32\\taskkill.exe';
  
  const output = execSync(`"${netstatPath}" -ano`).toString();
  const lines = output.split("\n");
  let killed = false;
  lines.forEach(line => {
    if (line.includes(":5000") && line.includes("LISTENING")) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== "0" && pid !== process.pid.toString()) {
        try {
          console.log(`Killing process ${pid} on port 5000...`);
          execSync(`"${taskkillPath}" /F /PID ${pid}`);
          killed = true;
        } catch (err) {
          console.error("Error killing process:", err.message);
        }
      }
    }
  });
  if (!killed) {
    console.log("No process found listening on port 5000.");
  }
} catch (e) {
  console.error("Failed to list/kill processes:", e.message);
}
