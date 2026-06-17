const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'dashboard', 'Recruiter.tsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Fixing JSX Fragment error...');

// Wrap the ReminderSystem and the container in a Fragment
const oldPart = `<ReminderSystem candidates={candidates} onRefresh={fetchCandidates} />
    <div className="full-pool-container">`;

const newPart = `<>
      <ReminderSystem candidates={candidates} onRefresh={fetchCandidates} />
      <div className="full-pool-container">`;

if (content.includes(oldPart)) {
    content = content.replace(oldPart, newPart);
    // Find the end of that specific div and close the fragment
    // We'll just append it to the end of the return of CRMView
    content = content.replace('      </div>\n    );\n  }\n\n  if (viewState === "profile"', '      </div>\n    </>\n    );\n  }\n\n  if (viewState === "profile"');
} else {
    // Try with CRLF
    const oldPartCRLF = oldPart.replace(/\n/g, '\r\n');
    if (content.includes(oldPartCRLF)) {
        content = content.replace(oldPartCRLF, newPart.replace(/\n/g, '\r\n'));
        content = content.replace('      </div>\r\n    );\r\n  }\r\n\r\n  if (viewState === "profile"', '      </div>\r\n    </>\r\n    );\r\n  }\r\n\r\n  if (viewState === "profile"');
    }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('JSX Fragment error fixed.');
