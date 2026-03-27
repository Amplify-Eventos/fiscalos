const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const clients = await prisma.clients.findMany({
    where: {
      id: { startsWith: 'teste-' }
    }
  });

  console.log(`Corrigindo ${clients.length} clientes...`);

  for (const client of clients) {
    await prisma.clients.update({
      where: { id: client.id },
      data: {
        currentDAS: client.currentDAS ? Number(client.currentDAS) / 12 : 0,
        currentISS: client.currentISS ? Number(client.currentISS) / 12 : 0,
        currentIRPJ: client.currentIRPJ ? Number(client.currentIRPJ) / 12 : 0,
        currentCSLL: client.currentCSLL ? Number(client.currentCSLL) / 12 : 0,
        currentPIS: client.currentPIS ? Number(client.currentPIS) / 12 : 0,
        currentCOFINS: client.currentCOFINS ? Number(client.currentCOFINS) / 12 : 0,
        currentINSS: client.currentINSS ? Number(client.currentINSS) / 12 : 0,
      }
    });
    console.log(`Cliente ${client.companyName} atualizado.`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
