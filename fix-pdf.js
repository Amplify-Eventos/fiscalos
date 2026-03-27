const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/api/pdf/[id]/route.ts');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "select('agencyName, agencyLogo, agencyColor, agencyWebsite')",
  "select('agencyName, agencyLogo, agencyColor, agencyColorSecondary, agencyWebsite')"
);

content = content.replace(
  "const agencyColor = userProfile?.agencyColor || '#2563eb'",
  "const agencyColor = userProfile?.agencyColor || '#2563eb'\n    const agencyColorSecondary = userProfile?.agencyColorSecondary || '#1e40af'"
);

// Apply secondary color
content = content.replace(
  "color: #1e293b; max-width: 900px;",
  "color: #1e293b; max-width: 900px;"
);

content = content.replace(
  ".subtitle { color: #64748b; margin-top: 5px; font-size: 14px; }",
  ".subtitle { color: ${agencyColorSecondary}; margin-top: 5px; font-size: 14px; }"
);

content = content.replace(
  ".section-title { font-size: 18px; font-weight: 700; color: ${agencyColor}; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; }",
  ".section-title { font-size: 18px; font-weight: 700; color: ${agencyColorSecondary}; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid ${agencyColor}; }"
);

fs.writeFileSync(filePath, content);
console.log('Fixed route.ts');
