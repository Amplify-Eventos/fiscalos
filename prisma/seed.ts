import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // ==========================================
  // 1. TAXAS DO SIMPLES NACIONAL (2024/2025/2026)
  // Fonte: Lei Complementar 123/2006 atualizada
  // ==========================================
  
  const simplesRates = [
    // ANEXO I - COMÉRCIO
    { anexo: 'I', faixa: 1, limiteInferior: 0, limiteSuperior: 180000, aliquota: 0.0400, deducao: 0, percentualCPP: 0.4150 },
    { anexo: 'I', faixa: 2, limiteInferior: 180000.01, limiteSuperior: 360000, aliquota: 0.0730, deducao: 5940, percentualCPP: 0.4150 },
    { anexo: 'I', faixa: 3, limiteInferior: 360000.01, limiteSuperior: 720000, aliquota: 0.0950, deducao: 13860, percentualCPP: 0.4200 },
    { anexo: 'I', faixa: 4, limiteInferior: 720000.01, limiteSuperior: 1800000, aliquota: 0.1070, deducao: 22500, percentualCPP: 0.4200 },
    { anexo: 'I', faixa: 5, limiteInferior: 1800000.01, limiteSuperior: 3600000, aliquota: 0.1430, deducao: 87300, percentualCPP: 0.4200 },
    { anexo: 'I', faixa: 6, limiteInferior: 3600000.01, limiteSuperior: 4800000, aliquota: 0.1900, deducao: 378000, percentualCPP: 0.4200 },

    // ANEXO II - INDÚSTRIA
    { anexo: 'II', faixa: 1, limiteInferior: 0, limiteSuperior: 180000, aliquota: 0.0450, deducao: 0, percentualCPP: 0.3750 },
    { anexo: 'II', faixa: 2, limiteInferior: 180000.01, limiteSuperior: 360000, aliquota: 0.0780, deducao: 5940, percentualCPP: 0.3750 },
    { anexo: 'II', faixa: 3, limiteInferior: 360000.01, limiteSuperior: 720000, aliquota: 0.1000, deducao: 13860, percentualCPP: 0.3750 },
    { anexo: 'II', faixa: 4, limiteInferior: 720000.01, limiteSuperior: 1800000, aliquota: 0.1120, deducao: 22500, percentualCPP: 0.3750 },
    { anexo: 'II', faixa: 5, limiteInferior: 1800000.01, limiteSuperior: 3600000, aliquota: 0.1470, deducao: 85500, percentualCPP: 0.3750 },
    { anexo: 'II', faixa: 6, limiteInferior: 3600000.01, limiteSuperior: 4800000, aliquota: 0.3000, deducao: 720000, percentualCPP: 0.3750 },

    // ANEXO III - SERVIÇOS (LOCAÇÃO, INSTALAÇÃO, REPAROS, ETC.)
    { anexo: 'III', faixa: 1, limiteInferior: 0, limiteSuperior: 180000, aliquota: 0.0600, deducao: 0, percentualCPP: 0.4340 },
    { anexo: 'III', faixa: 2, limiteInferior: 180000.01, limiteSuperior: 360000, aliquota: 0.1120, deducao: 9360, percentualCPP: 0.4340 },
    { anexo: 'III', faixa: 3, limiteInferior: 360000.01, limiteSuperior: 720000, aliquota: 0.1350, deducao: 17640, percentualCPP: 0.4340 },
    { anexo: 'III', faixa: 4, limiteInferior: 720000.01, limiteSuperior: 1800000, aliquota: 0.1600, deducao: 35640, percentualCPP: 0.4340 },
    { anexo: 'III', faixa: 5, limiteInferior: 1800000.01, limiteSuperior: 3600000, aliquota: 0.2100, deducao: 125640, percentualCPP: 0.4340 },
    { anexo: 'III', faixa: 6, limiteInferior: 3600000.01, limiteSuperior: 4800000, aliquota: 0.3300, deducao: 648000, percentualCPP: 0.4340 },

    // ANEXO IV - SERVIÇOS (LIMPEZA, OBRAS, ADVOCACIA) - CPP À PARTE
    { anexo: 'IV', faixa: 1, limiteInferior: 0, limiteSuperior: 180000, aliquota: 0.0450, deducao: 0, percentualCPP: 0 },
    { anexo: 'IV', faixa: 2, limiteInferior: 180000.01, limiteSuperior: 360000, aliquota: 0.0900, deducao: 8100, percentualCPP: 0 },
    { anexo: 'IV', faixa: 3, limiteInferior: 360000.01, limiteSuperior: 720000, aliquota: 0.1020, deducao: 12420, percentualCPP: 0 },
    { anexo: 'IV', faixa: 4, limiteInferior: 720000.01, limiteSuperior: 1800000, aliquota: 0.1400, deducao: 39780, percentualCPP: 0 },
    { anexo: 'IV', faixa: 5, limiteInferior: 1800000.01, limiteSuperior: 3600000, aliquota: 0.2200, deducao: 183780, percentualCPP: 0 },
    { anexo: 'IV', faixa: 6, limiteInferior: 3600000.01, limiteSuperior: 4800000, aliquota: 0.3300, deducao: 828000, percentualCPP: 0 },

    // ANEXO V - SERVIÇOS INTELECTUAIS (FATOR R < 28%)
    { anexo: 'V', faixa: 1, limiteInferior: 0, limiteSuperior: 180000, aliquota: 0.1550, deducao: 0, percentualCPP: 0.2885 },
    { anexo: 'V', faixa: 2, limiteInferior: 180000.01, limiteSuperior: 360000, aliquota: 0.1800, deducao: 4500, percentualCPP: 0.2785 },
    { anexo: 'V', faixa: 3, limiteInferior: 360000.01, limiteSuperior: 720000, aliquota: 0.1950, deducao: 9900, percentualCPP: 0.2385 },
    { anexo: 'V', faixa: 4, limiteInferior: 720000.01, limiteSuperior: 1800000, aliquota: 0.2050, deducao: 17100, percentualCPP: 0.2385 },
    { anexo: 'V', faixa: 5, limiteInferior: 1800000.01, limiteSuperior: 3600000, aliquota: 0.2300, deducao: 62100, percentualCPP: 0.2385 },
    { anexo: 'V', faixa: 6, limiteInferior: 3600000.01, limiteSuperior: 4800000, aliquota: 0.3050, deducao: 540000, percentualCPP: 0.2385 },
  ]

  console.log('📊 Inserindo taxas do Simples Nacional...')
  for (const rate of simplesRates) {
    await prisma.simplesRate.upsert({
      where: { anexo_faixa: { anexo: rate.anexo, faixa: rate.faixa } },
      update: { ...rate },
      create: { ...rate },
    })
  }

  // ==========================================
  // 2. CNAEs COMUNS (AMOSTRA)
  // ==========================================
  
  const cnaes = [
    { code: '6201-5/01', description: 'Desenvolvimento de programas de computador sob encomenda', anexoSimples: 'III', canBeSimples: true, issPercentage: 0.02 },
    { code: '6202-3/00', description: 'Desenvolvimento e licenciamento de programas de computador customizáveis', anexoSimples: 'III', canBeSimples: true, issPercentage: 0.02 },
    { code: '6203-1/00', description: 'Desenvolvimento e licenciamento de programas de computador não-customizáveis', anexoSimples: 'I', canBeSimples: true, issPercentage: 0 }, // Comércio (software de prateleira)
    { code: '6204-0/00', description: 'Consultoria em tecnologia da informação', anexoSimples: 'V', canBeSimples: true, issPercentage: 0.05 },
    { code: '6311-9/00', description: 'Tratamento de dados, provedores de serviços de aplicação e serviços de hospedagem na internet', anexoSimples: 'III', canBeSimples: true, issPercentage: 0.03 },
    { code: '6911-7/01', description: 'Serviços advocatícios', anexoSimples: 'IV', canBeSimples: true, issPercentage: 0.05 },
    { code: '6920-6/01', description: 'Atividades de contabilidade', anexoSimples: 'III', canBeSimples: true, issPercentage: 0.02 },
    { code: '7111-1/00', description: 'Serviços de arquitetura', anexoSimples: 'III', canBeSimples: true, issPercentage: 0.05 }, // Anexo III apenas se Fator R > 28%, mas padrão é V. Vamos ajustar lógica no motor
    { code: '7112-0/00', description: 'Serviços de engenharia', anexoSimples: 'V', canBeSimples: true, issPercentage: 0.05 },
    { code: '7311-4/00', description: 'Agências de publicidade', anexoSimples: 'V', canBeSimples: true, issPercentage: 0.05 },
    { code: '8599-6/04', description: 'Treinamento em desenvolvimento profissional e gerencial', anexoSimples: 'III', canBeSimples: true, issPercentage: 0.03 },
    { code: '8630-5/03', description: 'Atividade médica ambulatorial restrita a consultas', anexoSimples: 'V', canBeSimples: true, issPercentage: 0.02 }, // Médicos
    { code: '4751-2/01', description: 'Comércio varejista especializado de equipamentos e suprimentos de informática', anexoSimples: 'I', canBeSimples: true, issPercentage: 0 },
  ]

  console.log('🏢 Inserindo CNAEs de exemplo...')
  for (const cnae of cnaes) {
    await prisma.cnaeCode.upsert({
      where: { code: cnae.code },
      update: { ...cnae },
      create: { ...cnae },
    })
  }

  // ==========================================
  // 3. TAXAS DE ISS (CAPITAIS)
  // ==========================================
  
  const issRates = [
    { ibgeCode: '3550308', cityName: 'São Paulo', stateCode: 'SP', issRate: 0.0290 }, // Média ponderada ou regra geral (SP varia muito)
    { ibgeCode: '3304557', cityName: 'Rio de Janeiro', stateCode: 'RJ', issRate: 0.0500 },
    { ibgeCode: '3106200', cityName: 'Belo Horizonte', stateCode: 'MG', issRate: 0.0300 },
    { ibgeCode: '4106902', cityName: 'Curitiba', stateCode: 'PR', issRate: 0.0500 },
    { ibgeCode: '4314902', cityName: 'Porto Alegre', stateCode: 'RS', issRate: 0.0400 },
    { ibgeCode: '5300108', cityName: 'Brasília', stateCode: 'DF', issRate: 0.0200 }, // ISS baixo para TI
    { ibgeCode: '2927408', cityName: 'Salvador', stateCode: 'BA', issRate: 0.0500 },
    { ibgeCode: '2304400', cityName: 'Fortaleza', stateCode: 'CE', issRate: 0.0500 },
    { ibgeCode: '2611606', cityName: 'Recife', stateCode: 'PE', issRate: 0.0500 },
    { ibgeCode: '5208707', cityName: 'Goiânia', stateCode: 'GO', issRate: 0.0500 },
    { ibgeCode: '4205407', cityName: 'Florianópolis', stateCode: 'SC', issRate: 0.0200 }, // Conhecido polo tec
    { ibgeCode: '0000000', cityName: 'Outros Municípios', stateCode: 'BR', issRate: 0.0500 }, // Fallback
  ]

  console.log('🏙️ Inserindo taxas de ISS...')
  for (const iss of issRates) {
    await prisma.issRate.upsert({
      where: { ibgeCode: iss.ibgeCode },
      update: { ...iss },
      create: { ...iss },
    })
  }

  console.log('✅ Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
