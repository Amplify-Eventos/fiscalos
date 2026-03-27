const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.users.findFirst()
  if (!user) {
    console.log("No users found. Run some tests first or create a user.")
    return
  }
  
  console.log("Criando 8 clientes de teste para o usuário:", user.email)

  const testClients = [
    {
      // Cliente 1: Fator R Ruim (Cenário muito ruim, paga muito imposto)
      id: "teste-" + Date.now() + "-1",
      userId: user.id,
      cnpj: "11.111.111/0001-11",
      companyName: "1. Consultoria XYZ (Fator R Ruim)",
      cnaeMain: "6204-0/00", // Consultoria TI (Anexo V, sujeito ao Fator R)
      employeesCount: 1,
      revenueLast12m: 1200000,
      payrollLast12m: 50000, // Fator R < 28% (está em 4.1%)
      updatedAt: new Date(),
      legalNature: 'LTDA',
      companySize: 'ME',
      taxRegime: 'SIMPLES_NACIONAL',
      revenueType: 'SERVICOS',
      revenueServicos: 1200000,
      municipio: 'São Paulo',
      uf: 'SP',
      municipioIBGE: '3550308',
      currentDAS: 180000, // Imposto alto no Anexo V
      currentISS: 0, currentIRPJ: 0, currentCSLL: 0, currentPIS: 0, currentCOFINS: 0, currentINSS: 0,
    },
    {
      // Cliente 2: Risco de Sublimite (Simples)
      id: "teste-" + Date.now() + "-2",
      userId: user.id,
      cnpj: "22.222.222/0001-22",
      companyName: "2. Comércio Crescente (Risco Sublimite)",
      cnaeMain: "4711-3/02", // Comércio
      employeesCount: 15,
      revenueLast12m: 3550000, // Quase batendo os 3.6M
      payrollLast12m: 400000,
      updatedAt: new Date(),
      legalNature: 'LTDA',
      companySize: 'EPP',
      taxRegime: 'SIMPLES_NACIONAL',
      revenueType: 'COMERCIO',
      revenueComercio: 3550000,
      municipio: 'São Paulo',
      uf: 'SP',
      municipioIBGE: '3550308',
      currentDAS: 350000,
      currentISS: 0, currentIRPJ: 0, currentCSLL: 0, currentPIS: 0, currentCOFINS: 0, currentINSS: 0,
    },
    {
      // Cliente 3: Clínica Médica (Oportunidade de Equiparação Hospitalar)
      id: "teste-" + Date.now() + "-3",
      userId: user.id,
      cnpj: "33.333.333/0001-33",
      companyName: "3. Clínica Saúde & Vida (Equiparação)",
      cnaeMain: "8630-5/03", // Atividade médica
      employeesCount: 8,
      revenueLast12m: 2500000,
      payrollLast12m: 300000,
      updatedAt: new Date(),
      legalNature: 'LTDA',
      companySize: 'EPP',
      taxRegime: 'LUCRO_PRESUMIDO',
      revenueType: 'SERVICOS',
      revenueServicos: 2500000,
      municipio: 'São Paulo',
      uf: 'SP',
      municipioIBGE: '3550308',
      currentDAS: 0,
      currentISS: 125000, 
      currentIRPJ: 120000, 
      currentCSLL: 72000, 
      currentPIS: 16250, 
      currentCOFINS: 75000, 
      currentINSS: 84000,
    },
    {
      // Cliente 4: Indústria (Oportunidade Benefício Estadual)
      id: "teste-" + Date.now() + "-4",
      userId: user.id,
      cnpj: "44.444.444/0001-44",
      companyName: "4. Indústria Metalúrgica ABC (Incentivos)",
      cnaeMain: "2511-0/00", // Estruturas metálicas
      employeesCount: 45,
      revenueLast12m: 8500000,
      payrollLast12m: 1500000,
      updatedAt: new Date(),
      legalNature: 'LTDA',
      companySize: 'DEMAIS',
      taxRegime: 'LUCRO_REAL',
      revenueType: 'INDUSTRIA', // Mapeado para Industria
      municipio: 'Guarulhos',
      uf: 'SP',
      municipioIBGE: '3518800',
      currentDAS: 0,
      currentISS: 0, currentIRPJ: 300000, currentCSLL: 150000, currentPIS: 140000, currentCOFINS: 646000, currentINSS: 420000,
    },
    {
      // Cliente 5: Comércio Grande (Revisão NCM e Lucro Real)
      id: "teste-" + Date.now() + "-5",
      userId: user.id,
      cnpj: "55.555.555/0001-55",
      companyName: "5. Supermercado Bairro (Revisão NCM)",
      cnaeMain: "4711-3/02",
      employeesCount: 30,
      revenueLast12m: 12000000,
      payrollLast12m: 1800000,
      updatedAt: new Date(),
      legalNature: 'LTDA',
      companySize: 'DEMAIS',
      taxRegime: 'LUCRO_PRESUMIDO', // Supermercado no Presumido costuma perder pro Real
      revenueType: 'COMERCIO',
      revenueComercio: 12000000,
      municipio: 'Campinas',
      uf: 'SP',
      municipioIBGE: '3509502',
      currentDAS: 0,
      currentISS: 0, currentIRPJ: 144000, currentCSLL: 129600, currentPIS: 78000, currentCOFINS: 360000, currentINSS: 504000,
    },
    {
      // Cliente 6: Serviços no Lucro Presumido (Deveria estar no Simples)
      id: "teste-" + Date.now() + "-6",
      userId: user.id,
      cnpj: "66.666.666/0001-66",
      companyName: "6. Agência Criativa (Deveria ser Simples)",
      cnaeMain: "7311-4/00", // Publicidade
      employeesCount: 5,
      revenueLast12m: 800000, // Faturamento baixo para Presumido
      payrollLast12m: 250000,
      updatedAt: new Date(),
      legalNature: 'LTDA',
      companySize: 'ME',
      taxRegime: 'LUCRO_PRESUMIDO', // Erro clássico
      revenueType: 'SERVICOS',
      revenueServicos: 800000,
      municipio: 'Curitiba',
      uf: 'PR',
      municipioIBGE: '4106902',
      currentDAS: 0,
      currentISS: 40000, currentIRPJ: 38400, currentCSLL: 23040, currentPIS: 5200, currentCOFINS: 24000, currentINSS: 70000,
    },
    {
      // Cliente 7: MEI Estourando Limite
      id: "teste-" + Date.now() + "-7",
      userId: user.id,
      cnpj: "77.777.777/0001-77",
      companyName: "7. João Pinturas (Estourou MEI)",
      cnaeMain: "4330-4/04", // Pintura
      employeesCount: 0,
      revenueLast12m: 145000, // Estourou os 81k do MEI
      payrollLast12m: 0,
      updatedAt: new Date(),
      legalNature: 'MEI',
      companySize: 'ME',
      taxRegime: 'MEI',
      revenueType: 'SERVICOS',
      revenueServicos: 145000,
      municipio: 'Belo Horizonte',
      uf: 'MG',
      municipioIBGE: '3106200',
      currentDAS: 800, // Pagou só a guia do MEI, mas o risco é altíssimo
      currentISS: 0, currentIRPJ: 0, currentCSLL: 0, currentPIS: 0, currentCOFINS: 0, currentINSS: 0,
    },
    {
      // Cliente 8: Empresa Otimizada (Bom Exemplo / Score Alto)
      id: "teste-" + Date.now() + "-8",
      userId: user.id,
      cnpj: "88.888.888/0001-88",
      companyName: "8. Empresa Modelo (Totalmente Otimizada)",
      cnaeMain: "6201-5/01", // Desenvolvimento
      employeesCount: 4,
      revenueLast12m: 1500000,
      payrollLast12m: 450000, // Fator R = 30% (Perfeito, cravado no Anexo III)
      updatedAt: new Date(),
      legalNature: 'LTDA',
      companySize: 'EPP',
      taxRegime: 'SIMPLES_NACIONAL',
      revenueType: 'SERVICOS',
      revenueServicos: 1500000,
      municipio: 'Florianópolis',
      uf: 'SC',
      municipioIBGE: '4205407',
      currentDAS: 135000, // Imposto justo e baixo (Anexo III)
      currentISS: 0, currentIRPJ: 0, currentCSLL: 0, currentPIS: 0, currentCOFINS: 0, currentINSS: 0,
    }
  ]

  for (const client of testClients) {
    await prisma.clients.create({ data: client })
    console.log("-> Criado:", client.companyName)
  }
  
  console.log("Concluído!")
}

main().catch(console.error).finally(() => prisma.$disconnect())
