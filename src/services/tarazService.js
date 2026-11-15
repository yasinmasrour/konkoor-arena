const prisma = require("../config/prisma");
const { NOTIFICATION_TYPES } = require("../constants/notification");

// ==================== ثابت‌ها ====================
const TARAZ_MEAN = 5000;
const TARAZ_STD = 2000;
const MIN_PARTICIPANTS = 20;

// ==================== محاسبه‌ی آمار آزمون ====================
const calculateExamStats = async (examId) => {
  const attempts = await prisma.attempt.findMany({
    where: { examId, status: "submitted" },
    select: { score: true },
  });

  const count = attempts.length;
  if (count === 0) return { average: 0, stdDev: 0, count: 0 };

  const scores = attempts.map((a) => a.score);
  const sum = scores.reduce((a, b) => a + b, 0);
  const average = sum / count;

  const variance =
    scores.reduce((sum, s) => sum + Math.pow(s - average, 2), 0) / count;
  const stdDev = Math.sqrt(variance);

  return { average, stdDev, count };
};

// ==================== محاسبه‌ی تراز ====================
const calculateTaraz = (rawScore, average, stdDev) => {
  if (stdDev === 0) return TARAZ_MEAN;

  const zScore = (rawScore - average) / stdDev;
  const taraz = TARAZ_MEAN + TARAZ_STD * zScore;

  return Math.round(taraz * 100) / 100;
};

// ==================== محاسبه‌ی رتبه ====================
const calculateRank = async (examId, score) => {
  const betterCount = await prisma.attempt.count({
    where: { examId, status: "submitted", score: { gt: score } },
  });
  return betterCount + 1;
};

// ==================== محاسبه‌ی صدک ====================
const calculatePercentile = async (examId, score, totalParticipants) => {
  if (totalParticipants <= 1) return 100;

  const betterOrEqual = await prisma.attempt.count({
    where: { examId, status: "submitted", score: { lte: score } },
  });

  return Math.round((betterOrEqual / totalParticipants) * 10000) / 100;
};

// ==================== Notification تراز آماده ====================
const notifyTarazReady = async (
  userIds,
  examId,
  examTitle,
  totalParticipants,
) => {
  if (!userIds || userIds.length === 0) return;

  try {
    const notifications = userIds.map((userId) => ({
      userId,
      type: NOTIFICATION_TYPES.TARAZ_READY,
      title: `📊 تراز آزمون «${examTitle}» آماده شد!`,
      message: `تراز و رتبه‌ی شما در این آزمون محاسبه شد. برای مشاهده، روی نتیجه کلیک کنید.`,
      link: `/dashboard?section=exams`,
      icon: "bar-chart",
      metadata: {
        examId,
        totalParticipants,
        action: "view_result",
      },
    }));

    await prisma.notification.createMany({ data: notifications });

    console.log(
      `📧 Sent taraz notifications to ${userIds.length} users for exam ${examId}`,
    );
  } catch (err) {
    console.error("notifyTarazReady error:", err);
  }
};

// ==================== محاسبه‌ی مجدد همه‌ی Attemptها ====================
const recalculateAllAttemptsForExam = async (examId, examTitle) => {
  try {
    const stats = await calculateExamStats(examId);

    if (stats.count < MIN_PARTICIPANTS) return;

    const attemptsWithoutTaraz = await prisma.attempt.findMany({
      where: {
        examId,
        status: "submitted",
        tarazScore: null,
      },
      select: { id: true, score: true, studentId: true },
    });

    if (attemptsWithoutTaraz.length === 0) return;

    console.log(
      `🔄 Recalculating taraz for ${attemptsWithoutTaraz.length} attempts in exam ${examId}`,
    );

    for (const att of attemptsWithoutTaraz) {
      const taraz = calculateTaraz(att.score, stats.average, stats.stdDev);
      const rank = await calculateRank(examId, att.score);
      const percentile = await calculatePercentile(
        examId,
        att.score,
        stats.count,
      );

      await prisma.attempt.update({
        where: { id: att.id },
        data: {
          tarazScore: taraz,
          rank,
          totalParticipants: stats.count,
          percentile,
        },
      });
    }

    // Notification برای همه
    await notifyTarazReady(
      attemptsWithoutTaraz.map((a) => a.studentId),
      examId,
      examTitle,
      stats.count,
    );
  } catch (err) {
    console.error("recalculateAllAttemptsForExam error:", err);
  }
};

// ==================== محاسبه و ذخیره‌ی تراز ====================
const updateAttemptWithTaraz = async (attemptId) => {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      examId: true,
      score: true,
      status: true,
      studentId: true,
      tarazScore: true,
    },
  });

  if (!attempt || attempt.status !== "submitted") return null;

  const stats = await calculateExamStats(attempt.examId);

  // کمتر از حداقل
  if (stats.count < MIN_PARTICIPANTS) {
    await prisma.exam.update({
      where: { id: attempt.examId },
      data: {
        participantCount: stats.count,
        averageScore: stats.count > 0 ? stats.average : null,
        stdDeviation: stats.count > 0 ? stats.stdDev : null,
        lastStatsUpdate: new Date(),
      },
    });

    const updated = await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        tarazScore: null,
        rank: null,
        totalParticipants: stats.count,
        percentile: null,
      },
    });

    return {
      attempt: updated,
      taraz: null,
      rank: null,
      percentile: null,
      stats,
      minParticipants: MIN_PARTICIPANTS,
    };
  }

  // محاسبه
  const taraz = calculateTaraz(attempt.score, stats.average, stats.stdDev);
  const rank = await calculateRank(attempt.examId, attempt.score);
  const percentile = await calculatePercentile(
    attempt.examId,
    attempt.score,
    stats.count,
  );

  const updated = await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      tarazScore: taraz,
      rank,
      totalParticipants: stats.count,
      percentile,
    },
  });

  const exam = await prisma.exam.update({
    where: { id: attempt.examId },
    data: {
      participantCount: stats.count,
      averageScore: stats.average,
      stdDeviation: stats.stdDev,
      lastStatsUpdate: new Date(),
    },
    select: { id: true, title: true },
  });

  // 🆕 اگه تازه به حداقل رسیدیم، همه‌ی قبلی‌ها رو دوباره حساب کن
  if (stats.count === MIN_PARTICIPANTS) {
    await recalculateAllAttemptsForExam(attempt.examId, exam.title);
  }

  // 🆕 اگه قبلاً تراز نداشت و الان داره، Notification برای خودش
  if (!attempt.tarazScore && updated.tarazScore) {
    await notifyTarazReady(
      [attempt.studentId],
      attempt.examId,
      exam.title,
      stats.count,
    );
  }

  return {
    attempt: updated,
    taraz,
    rank,
    percentile,
    stats,
    minParticipants: MIN_PARTICIPANTS,
  };
};

// ==================== محاسبه‌ی مجدد برای یه آزمون ====================
const recalculateTarazForExam = async (examId) => {
  const stats = await calculateExamStats(examId);
  if (stats.count < MIN_PARTICIPANTS) {
    return { updated: 0, stats, minParticipants: MIN_PARTICIPANTS };
  }

  const attempts = await prisma.attempt.findMany({
    where: { examId, status: "submitted" },
    select: { id: true, score: true },
  });

  const sorted = [...attempts].sort((a, b) => b.score - a.score);
  let updated = 0;

  for (let i = 0; i < sorted.length; i++) {
    const att = sorted[i];
    const taraz = calculateTaraz(att.score, stats.average, stats.stdDev);
    const rank = i + 1;
    const percentile =
      Math.round(((sorted.length - i) / sorted.length) * 10000) / 100;

    await prisma.attempt.update({
      where: { id: att.id },
      data: {
        tarazScore: taraz,
        rank,
        totalParticipants: stats.count,
        percentile,
      },
    });
    updated++;
  }

  await prisma.exam.update({
    where: { id: examId },
    data: {
      participantCount: stats.count,
      averageScore: stats.average,
      stdDeviation: stats.stdDev,
      lastStatsUpdate: new Date(),
    },
  });

  return { updated, stats, minParticipants: MIN_PARTICIPANTS };
};

module.exports = {
  TARAZ_MEAN,
  TARAZ_STD,
  MIN_PARTICIPANTS,
  calculateExamStats,
  calculateTaraz,
  calculateRank,
  calculatePercentile,
  updateAttemptWithTaraz,
  recalculateTarazForExam,
  recalculateAllAttemptsForExam,
  notifyTarazReady,
};
