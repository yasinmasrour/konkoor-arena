const prisma = require("../src/config/prisma");
const {
  generateUniqueReferralCode,
} = require("../src/utils/referralCode");

async function main() {
  console.log("🔍 شروع backfill کدهای دعوت...\n");

  const users = await prisma.user.findMany({
    where: { referralCode: null },
    select: { id: true, username: true, firstName: true, lastName: true },
  });

  if (users.length === 0) {
    console.log("✅ همه کاربران از قبل کد دارن. کاری برای انجام نیست.");
    return;
  }

  console.log(`🔹 ${users.length} کاربر بدون کد پیدا شد\n`);

  let successCount = 0;
  let failCount = 0;

  for (const user of users) {
    try {
      const code = await generateUniqueReferralCode();
      await prisma.user.update({
        where: { id: user.id },
        data: { referralCode: code },
      });
      console.log(
        `✅ ${user.username} (${user.firstName} ${user.lastName}) → ${code}`
      );
      successCount++;
    } catch (error) {
      console.error(`❌ ${user.username} → خطا: ${error.message}`);
      failCount++;
    }
  }

  console.log("\n🎉 تمام شد!");
  console.log(`   ✅ موفق: ${successCount}`);
  console.log(`   ❌ ناموفق: ${failCount}`);
}

main()
  .catch((e) => {
    console.error("❌ خطای کلی:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });