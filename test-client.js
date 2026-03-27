const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.users.findFirst()
  if (!user) {
    console.log("No users found.")
    return
  }

  const newClient = await prisma.clients.create({
    data: {
      id: "teste-" + Date.now().toString(),
      userId: user.id,
      cnpj: "12.345.678/0001-90",
      companyName: "Comércio XYZ Ltda (Teste NCM)",
      cnaeMain: "4711-3/02", // Comercio
      employeesCount: 5,
      revenueLast12m: 600000,
      payrollLast12m: 100000,
      updatedAt: new Date(),
      legalNature: 'LTDA',
      companySize: 'ME',
      taxRegime: 'SIMPLES_NACIONAL',
      revenueType: 'COMERCIO',
      revenueComercio: 600000,
      municipio: 'São Paulo',
      uf: 'SP',
      municipioIBGE: '3550308',
      currentDAS: 30000,
      currentISS: 0,
      currentIRPJ: 0,
      currentCSLL: 0,
      currentPIS: 0,
      currentCOFINS: 0,
      currentINSS: 0,
    }
  })
  
  console.log("Client created:", newClient.id)
}

main().catch(console.error).finally(() => prisma.$disconnect())
