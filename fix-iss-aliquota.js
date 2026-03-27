const fs = require('fs');

function fixIssAliquota(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  const oldText = 'issAliquota: 0.05';
  const newText = 'issAliquota: client.municipioIBGE === "4205407" ? 0.02 : 0.05'; // Hack rápido para Florianópolis no mock

  code = code.replace(oldText, newText);
  // Remove possible trailing comma if any issue, but let's just do direct replace
  
  // also check if there's a second one
  code = code.replace(oldText, newText);

  fs.writeFileSync(filePath, code);
}

fixIssAliquota('app/dashboard/page.tsx');
fixIssAliquota('app/dashboard/clientes/[id]/page.tsx');
fixIssAliquota('app/api/pdf/[id]/route.ts');

console.log('Fixed ISS Aliquota');
