const fs = require('fs');
const content = fs.readFileSync('server/index.js', 'utf8');

const regex = /app\.(get|post|put|delete|patch)\((['"`])([^'"`]+)\2/g;
let match;
const endpoints = [];
while ((match = regex.exec(content)) !== null) {
    endpoints.push(`${match[1].toUpperCase()} ${match[3]}`);
}

fs.writeFileSync('endpoints_output.txt', endpoints.join('\n'));
console.log("Done writing endpoints to endpoints_output.txt");
