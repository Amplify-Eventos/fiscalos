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
  
  // Ajuste fino: Alíquota efetiva não pode ser negativa (casos de RBT12 muito baixo com dedução alta, raro mas possível em edge cases)
  if (aliquotaEfetiva < 0) aliquotaEfetiva = 0

  const impostoAnual = rbt12 * aliquotaEfetiva
  const impostoMensal = impostoAnual / 12

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

export function calculateLucroPresumido(receita12m: number, tipo: 'servico' | 'comercio') {
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
  // ISS médio 5% | ICMS efetivo médio 18% (muito variável, usando estimativa simples pro MVP)
  const impostoEstadualMunicipal = tipo === 'servico' 
    ? receita12m * 0.05 // ISS 5%
    : receita12m * 0.18 // ICMS 18% (Simplificado)

  const totalImpostos = (receita12m * PIS) + (receita12m * COFINS) + IRPJ + adicionalIRPJ + CSLL + impostoEstadualMunicipal

  return {
    totalAnual: totalImpostos,
    totalMensal: totalImpostos / 12,
    aliquotaEfetiva: totalImpostos / receita12m,
    detalhes: {
      PIS: receita12m * PIS,
      COFINS: receita12m * COFINS,
      IRPJ: IRPJ + adicionalIRPJ,
      CSLL,
      Outros: impostoEstadualMunicipal
    }
  }
}
