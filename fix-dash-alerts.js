const fs = require('fs');

let code = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

const oldLogic = `          const diagnostico = await twin.gerarDiagnostico()
          client.score = diagnostico.score.score
          client.status = diagnostico.score.classificacao

          // Fator R
          const payroll12m = Number(client.payrollLast12m || 0)
          const fatorR = (payroll12m / rev) * 100
          if (client.taxRegime === 'SIMPLES_NACIONAL' && fatorR < 28 && fatorR > 0) {
            client.alertas.push('Fator R < 28%')
          }

          // Sublimite
          if (client.taxRegime === 'SIMPLES_NACIONAL' && rev >= 3600000 * 0.9) {
            client.alertas.push('Risco Sublimite')
          }`;

const newLogic = `          const diagnostico = await twin.gerarDiagnostico()
          const estrategias = await twin.detectingOportunidades()
          
          client.score = diagnostico.score.score
          client.status = diagnostico.score.classificacao

          // Extrair alertas das estratégias e problemas detectados
          for (const prob of diagnostico.problemasDetectados) {
             if (prob.includes('Fator R') && client.alertas.length < 3) client.alertas.push('Fator R Baixo');
          }
          
          for (const est of estrategias) {
             if (est.id === 'desenquadramento-mei' && !client.alertas.includes('Estourou MEI')) client.alertas.push('Estourou MEI');
             if (est.id === 'transicao-presumido' && !client.alertas.includes('Risco Sublimite')) client.alertas.push('Risco Sublimite');
             if (est.id === 'revisao-ncm' && !client.alertas.includes('Recup. NCM')) client.alertas.push('Recup. NCM');
             if (est.id === 'equiparacao-hospitalar' && !client.alertas.includes('Equiparação Hosp.')) client.alertas.push('Equiparação Hosp.');
             if (est.id === 'mudar-regime' && !client.alertas.includes('Mudar Regime')) client.alertas.push('Mudar Regime');
          }`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('app/dashboard/page.tsx', code);
console.log('Fixed dashboard alerts');
