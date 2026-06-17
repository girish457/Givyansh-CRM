const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'dashboard', 'Recruiter.tsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Applying Robust JSX Fix...');

// 1. Find the CRMView component return and wrap it
// We know it starts with <ReminderSystem and ends at the first ); before const InboxView
const startMarker = '<ReminderSystem candidates={candidates} onRefresh={fetchCandidates} />';
const endMarker = '    </div>\n  );\n};\n\nconst InboxView';
const endMarkerCRLF = '    </div>\r\n  );\r\n};\r\n\r\nconst InboxView';

if (content.includes(startMarker)) {
    // If it's already wrapped in <>, don't do it again
    if (!content.includes('<>\n      ' + startMarker)) {
        content = content.replace(startMarker, '<>\n      ' + startMarker);
        
        if (content.includes(endMarker)) {
            content = content.replace(endMarker, '    </div>\n    </>\n  );\n};\n\nconst InboxView');
        } else if (content.includes(endMarkerCRLF)) {
            content = content.replace(endMarkerCRLF, '    </div>\r\n    </>\r\n  );\r\n};\r\n\r\nconst InboxView');
        }
    }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('JSX Fix applied successfully.');
