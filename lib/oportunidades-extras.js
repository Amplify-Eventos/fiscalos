export function identificarOportunidadesExtras(empresa, melhorCenario) {
  const estrategias = [];
  const receitaAnual = empresa.receitas.total;
  
  // 1. Oportunidade: Revisão de NCM / ICMS (Para Comércio)
  if ((empresa.tipoAtividade === 'COMERCIO' || empresa.tipoAtividade === 'MISTO') && receitaAnual > 500000) {
    const economiaEstimada = receitaAnual * 0.01; // 1% de economia conservadora
    estrategias.push({
      id: 'revisao-ncm',
      nome: 'Revisão de NCM e Recuperação de ICMS/PIS/COFINS',
      descricao: `Muitos produtos de comércio são tributados a maior (ex: monofásicos). Uma auditoria no cadastro de produtos (NCM) pode recuperar impostos pagos a mais nos últimos 5 anos e reduzir a carga futura.`,
      impacto: 'ALTO',
      economiaAnual: economiaEstimada,
      custoImplementacao: 1500,
      roi: (economiaEstimada / 1500) * 100,
      prazoImplementacao: '60 dias',
      acoes: [
        'Exportar XMLs de entrada e saída',
        'Cruzar NCMs com a base legal (monofásicos e ST)',
        'Solicitar restituição via portal do e-CAC'
      ]
    });
  }

  // 2. Oportunidade: Limite do Simples Nacional vs Lucro Presumido
  if (empresa.regimeAtual === 'SIMPLES_NACIONAL' && receitaAnual > 3600000 && receitaAnual <= 4800000) {
    estrategias.push({
      id: 'transicao-presumido',
      nome: 'Planejamento de Saída do Simples (Risco de Sublimite)',
      descricao: `Seu faturamento está na faixa do sublimite (acima de R$ 3,6M). O ICMS/ISS passa a ser cobrado por fora, encarecendo muito a operação. Preparar a transição para Lucro Presumido é urgente.`,
      impacto: 'ALTO',
      economiaAnual: 25000, // Valor referencial de risco evitado
      custoImplementacao: 3000,
      roi: (25000 / 3000) * 100,
      prazoImplementacao: 'Imediato',
      acoes: [
        'Realizar projeção de faturamento até dezembro',
        'Simular folha e margem no Presumido',
        'Ajustar precificação dos produtos para a nova carga'
      ]
    });
  }

  // 3. Oportunidade: Equiparação Hospitalar para Clínicas
  const cnaesSaude = ['8630-5/03', '8630-5/01', '8630-5/02'];
  const isSaude = cnaesSaude.includes(empresa.cnaePrincipal) || empresa.cnaesSecundarios.some(c => cnaesSaude.includes(c));
  if (isSaude && (melhorCenario?.regime === 'LUCRO_PRESUMIDO' || empresa.regimeAtual === 'LUCRO_PRESUMIDO')) {
    const economiaEstimada = receitaAnual * 0.08; // Redução de 32% para 8% na base do IRPJ/CSLL
    estrategias.push({
      id: 'equiparacao-hospitalar',
      nome: 'Equiparação Hospitalar (Clínicas Médicas)',
      descricao: `Clínicas médicas no Lucro Presumido podem reduzir a base de cálculo do IRPJ de 32% para 8% e CSLL de 32% para 12%, caso atendam às normas da Anvisa.`,
      impacto: 'ALTO',
      economiaAnual: economiaEstimada,
      custoImplementacao: 5000,
      roi: (economiaEstimada / 5000) * 100,
      prazoImplementacao: '120 dias',
      acoes: [
        'Obter alvará sanitário adequado (Anvisa)',
        'Adequar contrato social para serviços médicos/hospitalares',
        'Entrar com medida ou ajuste direto na apuração'
      ]
    });
  }
  
  // 4. Benefícios Fiscais Estaduais / Desenvolve
  if (empresa.tipoAtividade === 'INDUSTRIA' && receitaAnual > 1000000) {
    const economiaEstimada = receitaAnual * 0.03;
    estrategias.push({
      id: 'beneficio-estadual',
      nome: 'Mapeamento de Incentivos Fiscais Estaduais',
      descricao: `Indústrias costumam ter acesso a diferimento ou crédito presumido de ICMS dependendo do estado.`,
      impacto: 'MEDIO',
      economiaAnual: economiaEstimada,
      custoImplementacao: 4000,
      roi: (economiaEstimada / 4000) * 100,
      prazoImplementacao: '90 dias',
      acoes: [
        'Mapear legislação estadual para a NCM principal',
        'Montar dossiê de solicitação na SEFAZ',
        'Ajustar emissão de notas fiscais'
      ]
    });
  }

  return estrategias;
}
