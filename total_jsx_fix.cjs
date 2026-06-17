const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'dashboard', 'Recruiter.tsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Performing Total JSX Structure Fix...');

// 1. Remove any stray Fragment tags I might have added
content = content.replace(/<>\s*<ReminderSystem/g, '<ReminderSystem');
content = content.replace(/<\/div>\s*<\/?>\s*\);\s*};\s*const InboxView/g, '</div>\n  );\n};\n\nconst InboxView');
content = content.replace(/<\/div>\s*<\/?>\s*\);\s*};\s*const PlaceholderView/g, '</div>\n  );\n};\n\nconst PlaceholderView');

// 2. Properly wrap CRMView return
const crmReturnStart = 'return (';
const crmReminder = '<ReminderSystem candidates={candidates} onRefresh={fetchCandidates} />';

// Find the CRMView component's return
const crmViewIndex = content.indexOf('const CRMView =');
const returnIndex = content.indexOf(crmReturnStart, crmViewIndex);

if (returnIndex !== -1) {
    // We want to replace the return (...) with return (<> ... </>)
    // Find the matching closing ); for this return
    let openParens = 0;
    let closeIndex = -1;
    for (let i = returnIndex + 7; i < content.length; i++) {
        if (content[i] === '(') openParens++;
        if (content[i] === ')') {
            if (openParens === 0) {
                closeIndex = i;
                break;
            }
            openParens--;
        }
    }

    if (closeIndex !== -1) {
        let returnBody = content.substring(returnIndex + 8, closeIndex);
        // Ensure ReminderSystem is inside
        if (!returnBody.includes('<ReminderSystem')) {
            returnBody = `\n      <>\n        <ReminderSystem candidates={candidates} onRefresh={fetchCandidates} />\n        ${returnBody.trim()}\n      </>\n    `;
        } else {
            // It's already there, just wrap it if not wrapped
            if (!returnBody.trim().startsWith('<>')) {
                returnBody = `\n      <>\n        ${returnBody.trim()}\n      </>\n    `;
            }
        }
        
        content = content.substring(0, returnIndex + 8) + returnBody + content.substring(closeIndex);
    }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Total JSX Structure Fix Applied!');
