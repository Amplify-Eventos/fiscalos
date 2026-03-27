const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "agencyColorSecondary" TEXT DEFAULT '#1e40af';`);
  console.log("Column added successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
