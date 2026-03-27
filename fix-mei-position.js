const fs = require('fs');

let code = fs.readFileSync('lib/digital-twin.ts', 'utf8');

// Remove the incorrect block from rodarTodasSimulacoes
const wrongBlock = `
    // E. Risco de Desenquadramento MEI (Malha Fina)
    if (this.empresa.regimeAtual === "MEI" && receitaAnual > LIMITES.MEI) {
      estrategias.push({
        id: "desenquadramento-mei",
        nome: "Desenquadramento Urgente do MEI",
        descricao: \`Sua empresa faturou R$ \${receitaAnual.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} e estourou o limite de R$ \${LIMITES.MEI.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} do MEI. Você não se enquadra mais e está criticamente fora de enquadramento, podendo cair na malha fina com multas pesadas. A migração para o Simples Nacional é obrigatória.\`,
        impacto: "ALTO",
        economiaAnual: 10000,
        custoImplementacao: 1500,
        roi: (10000 / 1500) * 100,
        prazoImplementacao: "Imediato",
        acoes: [
          "Solicitar desenquadramento no Portal do Simples Nacional",
          "Recolher a diferença dos impostos como ME para estancar o problema",
          "Atualizar natureza jurídica (ex: Empresário Individual ou SLU)",
        ],
      });
    }
`;

code = code.replace(wrongBlock, '');

const meiBlock = `
    // E. Risco de Desenquadramento MEI (Malha Fina)
    if (this.empresa.regimeAtual === "MEI" && receitaAnual > LIMITES.MEI) {
      estrategias.push({
        id: "desenquadramento-mei",
        nome: "Desenquadramento Urgente do MEI",
        descricao: \`Sua empresa faturou R$ \${receitaAnual.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} e estourou o limite de R$ \${LIMITES.MEI.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} do MEI. Você não se enquadra mais e está criticamente fora de enquadramento, podendo cair na malha fina com multas pesadas. A migração para o Simples Nacional é obrigatória.\`,
        impacto: "ALTO",
        economiaAnual: 10000,
        custoImplementacao: 1500,
        roi: (10000 / 1500) * 100,
        prazoImplementacao: "Imediato",
        acoes: [
          "Solicitar desenquadramento no Portal do Simples Nacional",
          "Recolher a diferença dos impostos como ME para estancar o problema",
          "Atualizar natureza jurídica (ex: Empresário Individual ou SLU)",
        ],
      });
    }
`;

code = code.replace('// Ordenar por economia\n    return estrategias', meiBlock + '\n    // Ordenar por economia\n    return estrategias');

fs.writeFileSync('lib/digital-twin.ts', code);
console.log('Fixed MEI insertion');
