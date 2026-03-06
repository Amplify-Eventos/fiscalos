export function calculateSimplesNacional(rbt12: number, anexo: 'I' | 'II' | 'III' | 'IV' | 'V') {
  // Tabelas 2026 (Baseadas na Lei Complementar 123/2006 atualizada)
  
  // Anexo I - Comércio
  const anexoI = [
    { limite: 180000, aliquota: 0.04, deducao: 0 },
    { limite: 360000, aliquota: 0.073, deducao: 5940 },
    { limite: 720000, aliquota: 0.095, deducao: 13860 },
    { limite: 1800000, aliquota: 0.107, deducao: 22500 },
    { limite: 3600000, aliquota: 0.143, deducao: 87300 },
    { limite: 4800000, aliquota: 0.19, deducao: 378000 },
  ]

  // Anexo II - Indústria
  const anexoII = [
    { limite: 180000, aliquota: 0.045, deducao: 0 },
    { limite: 360000, aliquota: 0.078, deducao: 5940 },
    { limite: 720000, aliquota: 0.1, deducao: 13860 },
    { limite: 1800000, aliquota: 0.112, deducao: 22500 },
    { limite: 3600000, aliquota: 0.147, deducao: 85500 },
    { limite: 4800000, aliquota: 0.3, deducao: 720000 },
  ]

  // Anexo III - Serviços (Locação, Manutenção, Agências de Viagem, Escritórios Contábeis)
  const anexoIII = [
    { limite: 180000, aliquota: 0.06, deducao: 0 },
    { limite: 360000, aliquota: 0.112, deducao: 9360 },
    { limite: 720000, aliquota: 0.135, deducao: 17640 },
    { limite: 1800000, aliquota: 0.16, deducao: 35640 },
    { limite: 3600000, aliquota: 0.21, deducao: 125640 },
    { limite: 4800000, aliquota: 0.33, deducao: 648000 },
  ]

  // Anexo IV - Serviços (Limpeza, Vigilância, Obras, Advocacia) - CPP à parte
  const anexoIV = [
    { limite: 180000, aliquota: 0.045, deducao: 0 },
    { limite: 360000, aliquota: 0.09, deducao: 8100 },
    { limite: 720000, aliquota: 0.102, deducao: 12420 },
    { limite: 1800000, aliquota: 0.14, deducao: 39780 },
    { limite: 3600000, aliquota: 0.22, deducao: 183780 },
    { limite: 4800000, aliquota: 0.33, deducao: 828000 },
  ]

  // Anexo V - Serviços (Auditoria, Jornalismo, Tecnologia, Engenharia) - Sujeito ao Fator R
  const anexoV = [
    { limite: 180000, aliquota: 0.155, deducao: 0 },
    { limite: 360000, aliquota: 0.18, deducao: 4500 },
    { limite: 720000, aliquota: 0.195, deducao: 9900 },
    { limite: 1800000, aliquota: 0.205, deducao: 17100 },
    { limite: 3600000, aliquota: 0.23, deducao: 62100 },
    { limite: 4800000, aliquota: 0.305, deducao: 540000 },
  ]

  let tabela
  switch (anexo) {
    case 'I': tabela = anexoI; break;
    case 'II': tabela = anexoII; break;
    case 'III': tabela = anexoIII; break;
    case 'IV': tabela = anexoIV; break;
    case 'V': tabela = anexoV; break;
  }

  // Encontrar a faixa
  const faixa = tabela.find(f => rbt12 <= f.limite) || tabela[tabela.length - 1]

  // Cálculo da Alíquota Efetiva: (RBT12 * AliqNominal - Deducao) / RBT12
  let aliquotaEfetiva = ((rbt12 * faixa.aliquota) - faixa.deducao) / rbt12
  
  // Ajuste fino: Alíquota efetiva não pode ser negativa
  if (aliquotaEfetiva < 0) aliquotaEfetiva = 0

  const impostoAnual = rbt12 * aliquotaEfetiva
  const impostoMensal = impostoAnual / 12

  // CPP para Anexo IV (20% sobre a folha, pago por fora do DAS)
  // Mas esta função retorna apenas o DAS. O CPP do Anexo IV deve ser somado depois.
  
  return {
    aliquotaNominal: faixa.aliquota,
    aliquotaEfetiva,
    impostoAnual,
    impostoMensal,
    faixa
  }
}

export function calculateFatorR(folha12m: number, receita12m: number) {
  if (receita12m === 0) return 0
  return folha12m / receita12m
}

export function calculateLucroPresumido(receita12m: number, folha12m: number, tipo: 'servico' | 'comercio') {
  // Alíquotas Federais (Padrão)
  const PIS = 0.0065
  const COFINS = 0.03
  
  // Base de Cálculo (Presunção)
  const basePresuncao = tipo === 'servico' ? 0.32 : 0.08
  
  // IRPJ
  const baseIRPJ = receita12m * basePresuncao
  const IRPJ = baseIRPJ * 0.15 // 15%
  // Adicional IRPJ (10% sobre o que exceder 20k/mês = 240k/ano)
  const adicionalIRPJ = Math.max(0, (baseIRPJ - 240000) * 0.10)
  
  // CSLL
  const baseCSLL = receita12m * (tipo === 'servico' ? 0.32 : 0.12)
  const CSLL = baseCSLL * 0.09 // 9%

  // ISS (Serviço) ou ICMS (Comércio) - Estimativa
  // TODO: Permitir configurar alíquota de ISS por município
  const impostoEstadualMunicipal = tipo === 'servico' 
    ? receita12m * 0.05 // ISS 5% (Máximo)
    : receita12m * 0.18 // ICMS 18% (Simplificado)

  // CPP (INSS Patronal) - 20% sobre a folha + RAT + Terceiros (~28% total)
  // No Lucro Presumido, a empresa paga isso cheio.
  const cppTotal = folha12m * 0.28 // Estimativa conservadora (20% INSS + 1-3% RAT + 5.8% Terceiros)

  const totalImpostos = (receita12m * PIS) + (receita12m * COFINS) + IRPJ + adicionalIRPJ + CSLL + impostoEstadualMunicipal + cppTotal

  return {
    totalAnual: totalImpostos,
    totalMensal: totalImpostos / 12,
    aliquotaEfetiva: totalImpostos / receita12m,
    detalhes: {
      PIS: receita12m * PIS,
      COFINS: receita12m * COFINS,
      IRPJ: IRPJ + adicionalIRPJ,
      CSLL,
      Outros: impostoEstadualMunicipal,
      CPP: cppTotal
    }
  }
}

export function calculateCPPAnexoIV(folha12m: number) {
  // Anexo IV paga CPP (INSS Patronal) por fora do DAS, igual ao Lucro Presumido/Real
  return folha12m * 0.28 // ~28% sobre a folha
}

// ============================================
// INTELIGÊNCIA TRIBUTÁRIA - O "PULO DO GATO"
// ============================================

/**
 * Calcula o pró-labore mínimo necessário para atingir Fator R de 28%
 * Isso permite migrar do Anexo V (mais caro) para o Anexo III (mais barato)
 */
export function calcularProlaboreIdeal(receita12m: number, folhaAtual: number): {
  fatorRAtual: number
  fatorRIdeal: 0.28
  precisaAumentar: boolean
  prolaboreAdicional: number
  folhaMinimaNecessaria: number
  economiaPotencial: number
  valeAPena: boolean
} {
  const fatorRAtual = folhaAtual / receita12m
  const fatorRIdeal = 0.28
  const folhaMinimaNecessaria = receita12m * fatorRIdeal
  
  // Quanto falta de folha (pró-labore) para atingir 28%
  const diferencaFolha = Math.max(0, folhaMinimaNecessaria - folhaAtual)
  
  // Calcular economia se atingir 28%
  const simplesAnexoV = calculateSimplesNacional(receita12m, 'V')
  const simplesAnexoIII = calculateSimplesNacional(receita12m, 'III')
  const economiaPotencial = simplesAnexoV.impostoAnual - simplesAnexoIII.impostoAnual
  
  // Vale a pena? Economia deve ser maior que o custo do pró-labore (INSS 11%)
  const custoProlaboreINSS = diferencaFolha * 0.11 // INSS do sócio (11%)
  const valeAPena = economiaPotencial > custoProlaboreINSS && diferencaFolha > 0
  
  return {
    fatorRAtual,
    fatorRIdeal,
    precisaAumentar: fatorRAtual < fatorRIdeal,
    prolaboreAdicional: diferencaFolha / 12, // Valor mensal
    folhaMinimaNecessaria,
    economiaPotencial: Math.max(0, economiaPotencial),
    valeAPena
  }
}

/**
 * Gera alertas automáticos baseados nos dados do cliente
 */
export function gerarAlertasFiscais(receita12m: number, folha12m: number, tipoAtividade: 'servico' | 'comercio'): string[] {
  const alertas: string[] = []
  
  // 1. Limite do Simples Nacional
  if (receita12m > 3600000 && receita12m <= 4800000) {
    alertas.push(`⚠️ ATENÇÃO: Faturamento de R$ ${(receita12m/1000000).toFixed(2)}M está próximo do limite do Simples (R$ 4,8M/ano). Planeje transição para Lucro Presumido.`)
  }
  if (receita12m > 4800000) {
    alertas.push(`🚫 BLOQUEIO: Faturamento de R$ ${(receita12m/1000000).toFixed(2)}M excede o limite do Simples Nacional. Obrigado a migrar para Lucro Presumido ou Real.`)
  }
  
  // 2. Fator R
  const fatorR = folha12m / receita12m
  if (tipoAtividade === 'servico' && fatorR < 0.28 && receita12m > 0) {
    const analise = calcularProlaboreIdeal(receita12m, folha12m)
    if (analise.valeAPena) {
      alertas.push(`💡 OPORTUNIDADE: Aumentando o pró-labore em R$ ${analise.prolaboreAdicional.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês, você economiza R$ ${analise.economiaPotencial.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/ano de imposto!`)
    }
  }
  
  // 3. Efeito Cascata (mudança de faixa)
  const simples = calculateSimplesNacional(receita12m, 'III')
  if (simples.faixa.limite === 3600000) {
    // Está na última faixa antes do limite
    alertas.push(`📊 CUIDADO: Você está na última faixa do Simples. Cada R$ 1 adicional de faturamento pode aumentar muito a alíquota efetiva.`)
  }
  
  // 4. CPP no Lucro Presumido
  if (tipoAtividade === 'servico' && receita12m > 0) {
    const presumido = calculateLucroPresumido(receita12m, folha12m, 'servico')
    if (presumido.detalhes.CPP > 0) {
      alertas.push(`💰 INFO: No Lucro Presumido, você pagará R$ ${presumido.detalhes.CPP.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/ano de CPP (INSS Patronal) à parte.`)
    }
  }
  
  return alertas
}

/**
 * Simula cenários futuros
 */
export function simularCenarios(
  receitaAtual: number, 
  folhaAtual: number,
  crescimentoPercentual: number,
  aumentoFolhaPercentual: number
): {
  cenarioAtual: { simples: number; presumido: number; melhor: string }
  cenarioFuturo: { simples: number; presumido: number; melhor: string }
  mudancaRecomendada: boolean
} {
  const receitaFutura = receitaAtual * (1 + crescimentoPercentual / 100)
  const folhaFutura = folhaAtual * (1 + aumentoFolhaPercentual / 100)
  
  const simplesAtual = calculateSimplesNacional(receitaAtual, 'III').impostoAnual
  const presumidoAtual = calculateLucroPresumido(receitaAtual, folhaAtual, 'servico').totalAnual
  
  const simplesFuturo = calculateSimplesNacional(receitaFutura, 'III').impostoAnual
  const presumidoFuturo = calculateLucroPresumido(receitaFutura, folhaFutura, 'servico').totalAnual
  
  return {
    cenarioAtual: {
      simples: simplesAtual,
      presumido: presumidoAtual,
      melhor: simplesAtual < presumidoAtual ? 'Simples Nacional' : 'Lucro Presumido'
    },
    cenarioFuturo: {
      simples: simplesFuturo,
      presumido: presumidoFuturo,
      melhor: simplesFuturo < presumidoFuturo ? 'Simples Nacional' : 'Lucro Presumido'
    },
    mudancaRecomendada: (simplesAtual < presumidoAtual) !== (simplesFuturo < presumidoFuturo)
  }
}

/**
 * Determina o Anexo correto baseado na atividade e Fator R
 */
export function determinarAnexoSimples(
  tipoAtividade: 'comercio' | 'industria' | 'servico_iii' | 'servico_iv' | 'servico_v',
  receita12m: number,
  folha12m: number
): 'I' | 'II' | 'III' | 'IV' | 'V' {
  switch (tipoAtividade) {
    case 'comercio':
      return 'I'
    case 'industria':
      return 'II'
    case 'servico_iii':
      return 'III' // Locação, manutenção, agências, contabilidade
    case 'servico_iv':
      return 'IV' // Limpeza, vigilância, obras, advocacia
    case 'servico_v':
      // Serviços sujeitos ao Fator R
      const fatorR = folha12m / receita12m
      return fatorR >= 0.28 ? 'III' : 'V'
  }
}

// ============================================
// AÇÕES ESTRATÉGICAS - A MAGIA DO SOFTWARE
// ============================================

export interface AcaoEstrategica {
  tipo: 'fator_r' | 'cnae' | 'contratar' | 'municipio' | 'dividir_empresa' | 'limite'
  titulo: string
  descricao: string
  impacto: 'alto' | 'medio' | 'baixo'
  economiaAnual: number
  custoImplementacao: number
  acao: string // O que fazer exatamente
}

/**
 * Gera ações estratégicas para economizar imposto
 * Este é o "pulo do gato" que o contador vende como consultoria
 */
export function gerarAcoesEstrategicas(
  receita12m: number,
  folha12m: number,
  tipoAtividade: 'servico' | 'comercio',
  cnae?: string
): AcaoEstrategica[] {
  const acoes: AcaoEstrategica[] = []
  const LIMITE_SIMPLES = 4800000
  
  // 1. Verificar se está no limite do Simples
  if (receita12m > LIMITE_SIMPLES) {
    const excedente = receita12m - LIMITE_SIMPLES
    acoes.push({
      tipo: 'dividir_empresa',
      titulo: 'Dividir Faturamento em Duas Empresas',
      descricao: `Faturamento excede R$ 4,8M em R$ ${excedente.toLocaleString('pt-BR', {maximumFractionDigits: 0})}. Dividir em duas empresas pode manter ambas no Simples Nacional.`,
      impacto: 'alto',
      economiaAnual: 0, // Precisa calcular
      custoImplementacao: 5000, // Custo de abrir empresa
      acao: `Abrir uma segunda empresa para faturar R$ ${excedente.toLocaleString('pt-BR', {maximumFractionDigits: 0})}. Consulte um contador sobre viabilidade.`
    })
  }
  
  // 2. Análise do Fator R (só para serviços)
  if (tipoAtividade === 'servico' && receita12m <= LIMITE_SIMPLES) {
    const fatorR = folha12m / receita12m
    
    if (fatorR < 0.28 && receita12m > 0) {
      // Calcula quanto precisa de folha adicional
      const folhaNecessaria = receita12m * 0.28
      const folhaFaltando = folhaNecessaria - folha12m
      const prolaborMensalNecessario = folhaFaltando / 12
      
      // Calcula economia
      const simplesV = calculateSimplesNacional(receita12m, 'V')
      const simplesIII = calculateSimplesNacional(receita12m, 'III')
      const economiaPotencial = simplesV.impostoAnual - simplesIII.impostoAnual
      
      // Custo do INSS extra (11% do pró-labore)
      const custoINSSMensal = prolaborMensalNecessario * 0.11
      const custoINSSAnual = custoINSSMensal * 12
      const economiaLiquida = economiaPotencial - custoINSSAnual
      
      if (economiaLiquida > 0) {
        acoes.push({
          tipo: 'fator_r',
          titulo: 'Aumentar Pró-labore para Atingir Fator R',
          descricao: `Aumente o pró-labore em R$ ${prolaborMensalNecessario.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês para migrar do Anexo V (mais caro) para o Anexo III (mais barato).`,
          impacto: 'alto',
          economiaAnual: economiaLiquida,
          custoImplementacao: custoINSSAnual,
          acao: `Ajustar pró-labore para R$ ${prolaborMensalNecessario.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês. Custo extra de INSS: R$ ${custoINSSMensal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês. Economia líquida: R$ ${economiaLiquida.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/ano.`
        })
      }
      
      // 3. Sugerir contratação para melhorar Fator R
      const salarioMedio = 2500 // Estimativa
      const funcionariosNecessarios = Math.ceil(folhaFaltando / (salarioMedio * 12))
      const folhaNova = folha12m + (funcionariosNecessarios * salarioMedio * 12)
      const fatorRNova = folhaNova / receita12m
      
      if (fatorRNova >= 0.28 && funcionariosNecessarios > 0) {
        const custoContratacaoAnual = funcionariosNecessarios * salarioMedio * 12 * 1.3 // ~30% de encargos
        const economiaContratacao = economiaPotencial
        
        acoes.push({
          tipo: 'contratar',
          titulo: `Contratar ${funcionariosNecessarios} Funcionário(s)`,
          descricao: `Contratar ${funcionariosNecessarios} funcionário(s) de R$ ${salarioMedio.toLocaleString('pt-BR')}/mês aumenta seu Fator R para ${(fatorRNova * 100).toFixed(1)}%, permitindo usar o Anexo III.`,
          impacto: 'medio',
          economiaAnual: economiaContratacao,
          custoImplementacao: custoContratacaoAnual,
          acao: `Contratar ${funcionariosNecessarios} funcionário(s). Custo anual: ~R$ ${custoContratacaoAnual.toLocaleString('pt-BR', {maximumFractionDigits: 0})}. Economia de imposto: R$ ${economiaContratacao.toLocaleString('pt-BR', {maximumFractionDigits: 2})}/ano.`
        })
      }
    }
  }
  
  // 4. Mudança de município (ISS)
  if (tipoAtividade === 'servico') {
    // ISS varia de 2% a 5% dependendo do município
    const issAtual = 0.05 // 5% (máximo)
    const issMinimo = 0.02 // 2% (mínimo em alguns municípios)
    const economiaISS = receita12m * (issAtual - issMinimo)
    
    if (economiaISS > 1000) {
      acoes.push({
        tipo: 'municipio',
        titulo: 'Avaliar Mudança de Município',
        descricao: `Municípios diferentes têm alíquotas de ISS de 2% a 5%. Mudar para um município com ISS menor pode economizar até R$ ${economiaISS.toLocaleString('pt-BR', {maximumFractionDigits: 0})}/ano.`,
        impacto: 'medio',
        economiaAnual: economiaISS,
        custoImplementacao: 2000, // Custo de mudança
        acao: 'Pesquisar municípios próximos com alíquota de ISS menor (2-3%). Considerar custo de mudança vs economia.'
      })
    }
  }
  
  // 5. Alerta de proximidade do limite (dentro do Simples mas próximo)
  if (receita12m > LIMITE_SIMPLES * 0.8 && receita12m <= LIMITE_SIMPLES) {
    const margem = LIMITE_SIMPLES - receita12m
    acoes.push({
      tipo: 'limite',
      titulo: 'Atenção: Próximo do Limite do Simples',
      descricao: `Faltam apenas R$ ${margem.toLocaleString('pt-BR', {maximumFractionDigits: 0})} para atingir o limite de R$ 4,8M. Planeje-se para migrar para Lucro Presumido.`,
      impacto: 'alto',
      economiaAnual: 0,
      custoImplementacao: 0,
      acao: 'Começar a planejar a transição para Lucro Presumido. Consulte seu contador sobre a melhor estratégia.'
    })
  }
  
  // Ordenar por impacto e economia
  return acoes.sort((a, b) => {
    const ordemImpacto = { alto: 3, medio: 2, baixo: 1 }
    if (ordemImpacto[a.impacto] !== ordemImpacto[b.impacto]) {
      return ordemImpacto[b.impacto] - ordemImpacto[a.impacto]
    }
    return b.economiaAnual - a.economiaAnual
  })
}
