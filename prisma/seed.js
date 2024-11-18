const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Pietro@272', 10); // Altere a senha conforme necessário

  // Inserir ou atualizar o administrador
  const adminUser = await prisma.administrador.upsert({
    where: { email: 'pietrosantos@blockcode.online' },
    update: {}, // Se o administrador já existe, não atualiza nada
    create: {
      email: 'pietrosantos@blockcode.online',
      senha: hashedPassword,
    },
  });

  console.log('Usuário administrador criado ou atualizado:', adminUser);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
