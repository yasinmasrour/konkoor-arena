const prisma = require("../src/config/prisma");

// ==================== تنظیمات ====================
const QUESTION_CODES = [
  "MATH-009",
  "MATH-011",
  "MATH-008",
  "MATH-007",
  "MATH-010",
  "Q-TEST-001",
  "MATH-011-COPY-MU4BSDVP",
];

// ==================== تابع اصلی ====================
async function main() {
  console.log("🔍 جستجوی سوالات...\n");

  const questions = await prisma.question.findMany({
    where: { code: { in: QUESTION_CODES } },
    select: { id: true, code: true, lesson: true, status: true },
  });

  if (questions.length === 0) {
    console.log("❌ هیچ سوالی با این کدها پیدا نشد.");
    return;
  }

  console.log(`✅ ${questions.length} سوال پیدا شد:\n`);
  for (const q of questions) {
    console.log(`  - ${q.code} | ${q.lesson} | ${q.status}`);
  }
  console.log("");

  // ==================== چک وابستگی‌ها ====================
  console.log("🔎 بررسی وابستگی‌ها...\n");

  for (const q of questions) {
    const [arenaMatches, attemptAnswers, bookletQuestions, reviews] =
      await Promise.all([
        prisma.arenaMatchQuestion.count({ where: { questionId: q.id } }),
        prisma.attemptAnswer.count({ where: { questionId: q.id } }),
        prisma.bookletQuestion.count({ where: { questionId: q.id } }),
        prisma.questionReview.count({ where: { questionId: q.id } }),
      ]);

    console.log(`📌 ${q.code}:`);
    console.log(`   ArenaMatchQuestion: ${arenaMatches}`);
    console.log(`   AttemptAnswer:      ${attemptAnswers}  ← ${attemptAnswers > 0 ? "⚠️ خطرناک!" : "✅"}`);
    console.log(`   BookletQuestion:    ${bookletQuestions}  (cascade)`);
    console.log(`   QuestionReview:     ${reviews}  (cascade)`);
    console.log("");
  }

  // ==================== چک ایمنی ====================
  const dangerousQuestions = [];
  for (const q of questions) {
    const attempts = await prisma.attemptAnswer.count({
      where: { questionId: q.id },
    });
    if (attempts > 0) dangerousQuestions.push(q.code);
  }

  if (dangerousQuestions.length > 0) {
    console.log("🚨 توجه! سوالات زیر در AttemptAnswer استفاده شده‌اند:");
    console.log(`   ${dangerousQuestions.join(", ")}`);
    console.log("   اگه اینا رو حذف کنی، کاربرا نمی‌تونن آزمون‌هاشون رو مرور کنن!");
    console.log("   پیشنهاد: اینا رو حذف نکن، به‌جاش آرشیو کن.\n");
    
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise((resolve) => {
      readline.question("با این حال ادامه بدی؟ (yes/no): ", resolve);
    });
    readline.close();

    if (answer.toLowerCase() !== "yes") {
      console.log("❌ لغو شد.");
      return;
    }
  }

  // ==================== حذف ====================
  console.log("\n🗑️ شروع حذف...\n");

  for (const q of questions) {
    await prisma.$transaction(async (tx) => {
      // 1. ArenaMatchQuestion
      await tx.arenaMatchQuestion.deleteMany({
        where: { questionId: q.id },
      });

      // 2. AttemptAnswer (اگه تأیید کردی)
      await tx.attemptAnswer.deleteMany({
        where: { questionId: q.id },
      });

      // 3. Question (BookletQuestion و QuestionReview cascade می‌شن)
      await tx.question.delete({
        where: { id: q.id },
      });
    });

    console.log(`✅ ${q.code} حذف شد`);
  }

  console.log("\n🎉 تمام!");
}

main()
  .catch((err) => {
    console.error("❌ خطا:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());