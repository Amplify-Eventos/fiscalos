const fs = require('fs');

let code = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

const oldLogic = `          const todos = await twin.rodarTodasSimulacoes();
          const validos = todos.filter((c) => c.viavel && c.impostoTotal > 0);

          if (validos.length > 0 && validos[0].economiaVsAtual > 0) {
            economiaTotal += validos[0].economiaVsAtual;
            client.economiaPotencial = validos[0].economiaVsAtual;
          } else {
            client.economiaPotencial = 0;
          }

          const diagnostico = await twin.gerarDiagnostico();
          const estrategias = await twin.detectingOportunidades();`;

const newLogic = `          const diagnostico = await twin.gerarDiagnostico();
          const estrategias = await twin.detectingOportunidades();
          
          const potencialTotal = estrategias.reduce((sum, est) => sum + est.economiaAnual, 0);
          
          if (potencialTotal > 0) {
            economiaTotal += potencialTotal;
            client.economiaPotencial = potencialTotal;
          } else {
            client.economiaPotencial = 0;
          }`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('app/dashboard/page.tsx', code);
console.log('Fixed potential savings calculation');
