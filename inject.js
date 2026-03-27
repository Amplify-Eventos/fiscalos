const fs = require('fs');
let code = fs.readFileSync('lib/digital-twin.ts', 'utf8');

const oldBlockStart = '    // 4. ISS Alto (Simplificado';
const endMarker = '    // Ordenar por economia';

const parts = code.split(oldBlockStart);
if(parts.length === 2) {
  const subParts = parts[1].split(endMarker);
  if(subParts.length === 2) {
    const newBlock = `    // 4. ISS Alto
    if (
      this.empresa.localizacao.issAliquota >= 0.05 &&
      this.empresa.receitas.servicos > 0
    ) {
      const economiaISS = this.empresa.receitas.servicos * 0.03;
      if (economiaISS > 5000) {
        estrategias.push({
          id: "reduzir-iss",
          nome: "Avaliar Mudança de Município (ISS)",
          descricao: \`Seu município cobra 5% de ISS. Mudar para um município vizinho com 2% pode economizar R$ \${economiaISS.toLocaleString(
            "pt-BR",
            { maximumFractionDigits: 0 },
          )}/ano.\`,
          impacto: "MEDIO",
          economiaAnual: economiaISS,
          custoImplementacao: 3000,
          roi: (economiaISS / 3000) * 100,
          prazoImplementacao: "90 dias",
          acoes: [
            "Pesquisar municípios vizinhos com ISS de 2%",
            "Avaliar viabilidade de mudança de sede",
            "Planejar custos logísticos",
          ],
        });
      }
    }

    // OPORTUNIDADES INTELIGENTES EXTRAS
    const receitaAnual = this.empresa.receitas.total;

    // A. Oportunidade: Revisão de NCM / Recuperação de Crédito (Para Comércio)
    if (
      (this.empresa.tipoAtividade === "COMERCIO" ||
        this.empresa.tipoAtividade === "MISTO") &&
      receitaAnual > 500000
    ) {
      const economiaEstimada = receitaAnual * 0.01;
      estrategias.push({
        id: "revisao-ncm",
        nome: "Revisão de NCM e Recuperação de ICMS/PIS/COFINS",
        descricao:
          "Produtos monofásicos tributados a maior geram direito a restituição dos últimos 5 anos. Uma auditoria no cadastro de produtos (NCM) pode recuperar caixa imediato.",
        impacto: "ALTO",
        economiaAnual: economiaEstimada,
        custoImplementacao: 1500,
        roi: (economiaEstimada / 1500) * 100,
        prazoImplementacao: "60 dias",
        acoes: [
          "Exportar XMLs de entrada e saída",
          "Cruzar NCMs com a base legal (monofásicos e ST)",
          "Solicitar restituição via portal e-CAC",
        ],
      });
    }

    // B. Oportunidade: Limite do Simples Nacional vs Lucro Presumido
    if (
      this.empresa.regimeAtual === "SIMPLES_NACIONAL" &&
      receitaAnual > 3600000 &&
      receitaAnual <= 4800000
    ) {
      estrategias.push({
        id: "transicao-presumido",
        nome: "Planejamento de Saída do Simples (Risco de Sublimite)",
        descricao:
          "Seu faturamento está na faixa do sublimite (acima de R$ 3,6M). O ICMS/ISS passa a ser cobrado por fora, encarecendo a operação. É preciso preparar a transição para Lucro Presumido urgentemente.",
        impacto: "ALTO",
        economiaAnual: 25000,
        custoImplementacao: 3000,
        roi: (25000 / 3000) * 100,
        prazoImplementacao: "Imediato",
        acoes: [
          "Realizar projeção de faturamento até dezembro",
          "Simular folha e margem no Presumido",
          "Ajustar precificação dos produtos para a nova carga",
        ],
      });
    }

    // C. Oportunidade: Equiparação Hospitalar para Clínicas
    const cnaesSaude = ["8630-5/03", "8630-5/01", "8630-5/02", "8610-1/01", "8610-1/02", "8630-5/04"];
    const isSaude =
      cnaesSaude.includes(this.empresa.cnaePrincipal) ||
      this.empresa.cnaesSecundarios.some((c) => cnaesSaude.includes(c));
    if (
      isSaude &&
      (melhorCenario?.regime === "LUCRO_PRESUMIDO" ||
        this.empresa.regimeAtual === "LUCRO_PRESUMIDO")
    ) {
      const economiaEstimada = receitaAnual * 0.08;
      estrategias.push({
        id: "equiparacao-hospitalar",
        nome: "Equiparação Hospitalar (Clínicas)",
        descricao:
          "Clínicas médicas no Lucro Presumido podem reduzir a base de cálculo do IRPJ de 32% para 8% e CSLL de 32% para 12%, caso atendam às normas da Anvisa.",
        impacto: "ALTO",
        economiaAnual: economiaEstimada,
        custoImplementacao: 5000,
        roi: (economiaEstimada / 5000) * 100,
        prazoImplementacao: "120 dias",
        acoes: [
          "Obter alvará sanitário adequado (Anvisa)",
          "Adequar contrato social para serviços hospitalares",
          "Ajustar apuração fiscal na Receita",
        ],
      });
    }

    // D. Benefícios Fiscais Estaduais (Desenvolve)
    if (this.empresa.tipoAtividade === "INDUSTRIA" && receitaAnual > 1000000) {
      const economiaEstimada = receitaAnual * 0.03;
      estrategias.push({
        id: "beneficio-estadual",
        nome: "Mapeamento de Incentivos Fiscais Estaduais",
        descricao:
          "Indústrias costumam ter acesso a diferimento ou crédito presumido de ICMS dependendo do estado onde operam.",
        impacto: "MEDIO",
        economiaAnual: economiaEstimada,
        custoImplementacao: 4000,
        roi: (economiaEstimada / 4000) * 100,
        prazoImplementacao: "90 dias",
        acoes: [
          "Mapear legislação estadual para a NCM principal",
          "Montar dossiê de solicitação na SEFAZ",
          "Ajustar emissão de notas fiscais (CST)",
        ],
      });
    }

`;
    const finalCode = parts[0] + newBlock + '    // Ordenar por economia' + subParts[1];
    fs.writeFileSync('lib/digital-twin.ts', finalCode);
    console.log('Successfully injected opportunities into digital-twin.ts');
  } else {
    console.log('Failed to find end marker.');
  }
} else {
  console.log('Failed to find start marker.');
}
