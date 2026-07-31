const { PrismaClient } = require("@prisma/client");

require("dotenv").config();

const prisma = new PrismaClient();


async function main() {
  const roles = [
    "ADMIN",
    "COUNSELOR",
    "QUESTION_DESIGNER",
    "STUDENT",
  ];

  for (const roleName of roles) {
    await prisma.role.upsert({
      where: {
        name: roleName,
      },
      update: {},
      create: {
        name: roleName,
      },
    });
  }

  console.log("Roles seeded successfully");
}


main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });