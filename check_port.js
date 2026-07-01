const { execSync } = require('child_process');
try {
  const output = execSync('C:\\Windows\\System32\\netstat.exe -ano').toString();
  const lines = output.split('\n');
  let found = false;
  lines.forEach(line => {
    if (line.includes(':5000')) {
      console.log('Found listener on port 5000:', line.trim());
      found = true;
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') {
        try {
          console.log(`Attempting to kill PID ${pid}...`);
          execSync(`C:\\Windows\\System32\\taskkill.exe /F /PID ${pid}`);
          console.log('Killed successfully.');
        } catch (e) {
          console.error('Failed to kill PID:', e.message);
        }
      }
    }
  });
  if (!found) {
    console.log('No listeners found on port 5000.');
  }
} catch (err) {
  console.error('Error running check_port:', err.message);
}
