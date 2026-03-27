const fs = require('fs');

function updateFiles() {
  const files = [
    'app/dashboard/page.tsx',
    'app/dashboard/clientes/[id]/page.tsx',
    'app/api/pdf/[id]/route.ts'
  ];

  files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace the hardcoded hack with the real value from client
    content = content.replace(
      /issAliquota: client\.municipioIBGE === \"4205407\" \? 0\.02 : 0\.05/g,
      'issAliquota: client.issAliquota || 5.0'
    );

    // Replace other possible hardcoded values
    content = content.replace(
      /issAliquota: 0\.05/g,
      'issAliquota: client.issAliquota || 5.0'
    );

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  });
}

updateFiles();
console.log('All files updated with real ISS field');