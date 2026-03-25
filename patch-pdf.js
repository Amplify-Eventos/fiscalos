const fs = require('fs');
const path = 'C:\\Users\\ampli\\.openclaw\\workspace\\fiscalos\\app\\api\\pdf\\[id]\\route.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/border-bottom: 3px solid #2563eb;/g, "border-bottom: 3px solid ${agencyColor};");
content = content.replace(/color: #1e3a8a;/g, "color: ${agencyColor};");

content = content.replace(
  /<div class="header">[\s\S]*?<div style="text-align: right">/,
  `<div class="header">
    <div style="display: flex; gap: 20px; align-items: center;">
      \${agencyLogo ? \`<img src="\${agencyLogo}" style="max-height: 60px; max-width: 150px; object-fit: contain;" />\` : ''}
      <div>
        <h1 class="title" style="margin-bottom: 5px;">Planejamento Fiscal Estratégico</h1>
        <p class="subtitle" style="margin: 0;">Relatório gerado em \${today}</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b; font-weight: bold;">Preparado por: \${agencyName}</p>
      </div>
    </div>
    <div style="text-align: right">`
);

content = content.replace(
  /<div class="footer">[\s\S]*?<\/div>/,
  `<div class="footer">
    <p>Este relatório é uma simulação estratégica e não substitui a análise legal de um contador.</p>
    <p>\${agencyName} \${agencyWebsite ? \`| <a href="\${agencyWebsite}" target="_blank">\${agencyWebsite}</a>\` : ''}</p>
  </div>`
);

fs.writeFileSync(path, content, 'utf8');
console.log("Patch aplicado com sucesso no route.ts");