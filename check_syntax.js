const { exec } = require('child_process');
const fs = require('fs');

console.log('Running TypeScript syntax check...');
exec('npx tsc --noEmit', { cwd: __dirname }, (error, stdout, stderr) => {
    const output = `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}\n\nERROR:\n${error ? error.message : 'None'}`;
    fs.writeFileSync('syntax_output.txt', output, 'utf8');
    console.log('Diagnostic check completed. Output written to syntax_output.txt');
});
