const fs = require('fs');
const files = [
  'app/api/clients/route.ts',
  'app/api/pdf/[id]/route.ts',
  'app/dashboard/clientes/[id]/actions.ts',
  'app/dashboard/clientes/[id]/page.tsx',
  'app/dashboard/clientes/novo/actions.ts',
  'app/dashboard/page.tsx'
];
files.forEach(f => {
  let data = fs.readFileSync(f, 'utf8');
  data = data.replace(/\.from\('Client'\)/g, ".from('clients')");
  data = data.replace(/\.from\('User'\)/g, ".from('users')");
  data = data.replace(/\.from\('IssRate'\)/g, ".from('iss_rates')");
  fs.writeFileSync(f, data);
});
console.log('Done!');
