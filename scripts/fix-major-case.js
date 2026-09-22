// scripts/fix-major-case.js
const prisma = require("../src/config/prisma");

async function main() {
  const result = await prisma.question.updateMany({
    where: { major: "Math" },
    data: { major: "math" },
  });

  console.log(`✅ ${result.count} سوال اصلاح شد`);

  // چک کن چیز دیگه‌ای مونده
  const remaining = await prisma.question.groupBy({
    by: ["major"],
    _count: true,
  });
  console.log("Majors موجود:", remaining);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());