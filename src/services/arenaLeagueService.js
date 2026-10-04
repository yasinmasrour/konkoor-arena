const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const arenaLeagueFinalizationService = require("./arenaLeagueFinalizationService");

const activateLeague = async (leagueId) => {
  return await prisma.$transaction(async (tx) => {
    const league = await tx.arenaLeague.findUnique({
      where: {
        id: leagueId,
      },
    });

    if (!league) {
      throw new AppError("Arena league not found", 404);
    }

    if (league.status === "active") {
      return league;
    }

    if (league.status === "finished") {
      throw new AppError("Finished league cannot be activated", 400);
    }

    const now = new Date();

    if (now < league.startDate) {
      throw new AppError("League start date has not been reached", 400);
    }

    if (now > league.endDate) {
      throw new AppError("League end date has already passed", 400);
    }

    const updatedLeague = await tx.arenaLeague.update({
      where: {
        id: leagueId,
      },

      data: {
        status: "active",
      },
    });

    return updatedLeague;
  });
};

const finishLeague = async (leagueId) => {
  return await prisma.$transaction(async (tx) => {
    const league = await tx.arenaLeague.findUnique({
      where: {
        id: leagueId,
      },
    });

    if (!league) {
      throw new AppError("Arena league not found", 404);
    }

    if (league.status === "finished") {
      return league;
    }

    if (league.status !== "active") {
      throw new AppError("Only active leagues can be finished", 400);
    }

    const now = new Date();

    if (now < league.endDate) {
      throw new AppError("League has not ended yet", 400);
    }

    const updatedLeague = await tx.arenaLeague.update({
      where: {
        id: leagueId,
      },

      data: {
        status: "finished",
      },
    });

    await arenaLeagueFinalizationService.finalizeLeagueTx(tx, leagueId);

    return updatedLeague;
  });
};

const processLeagueStatuses = async () => {
  const now = new Date();

  return await prisma.$transaction(async (tx) => {
    const activatedLeagues = [];
    const finishedLeagues = [];

    const upcomingLeagues = await tx.arenaLeague.findMany({
      where: {
        status: "upcoming",
        startDate: {
          lte: now,
        },
        endDate: {
          gt: now,
        },
      },
    });

    for (const league of upcomingLeagues) {
      const updatedLeague = await tx.arenaLeague.update({
        where: {
          id: league.id,
        },

        data: {
          status: "active",
        },
      });

      activatedLeagues.push(updatedLeague);
    }

    const activeLeagues = await tx.arenaLeague.findMany({
      where: {
        status: "active",
        endDate: {
          lte: now,
        },
      },
    });

    for (const league of activeLeagues) {
      const updatedLeague = await tx.arenaLeague.update({
        where: {
          id: league.id,
        },

        data: {
          status: "finished",
        },
      });

      finishedLeagues.push(updatedLeague);
    }

    return {
      activatedLeagues,
      finishedLeagues,
    };
  });
};

const getActiveLeagues = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { grade: true, major: true },
  });

  if (!user) throw new AppError("User not found", 404);

  // 🆕 اگه grade نداره، پیام واضح بده
  if (!user.grade) {
    throw new AppError(
      "برای شرکت در آرنا باید پایه تحصیلی خود را در پروفایل تکمیل کنید",
      400,
    );
  }

  const now = new Date();

  // 🆕 major رو فقط اگه وجود داره اضافه کن
  const majorConditions = [{ compatibleMajors: { isEmpty: true } }];

  if (user.major) {
    majorConditions.push({ compatibleMajors: { has: user.major } });
  }

  const leagues = await prisma.arenaLeague.findMany({
    where: {
      status: "active",
      startDate: { lte: now },
      endDate: { gte: now },
      grade: user.grade,
      OR: majorConditions,
    },
    orderBy: { startDate: "desc" },
    // 🆕 تعداد شرکت‌کننده‌ها (بر اساس ArenaRating)
    include: {
      _count: {
        select: { ratings: true },
      },
    },
  });

  // 🆕 map کردن به فرمت فرانت
  return {
    leagues: leagues.map((league) => ({
      id: league.id,
      title: league.title,
      lesson: league.lesson,
      status: league.status,
      startDate: league.startDate,
      endDate: league.endDate,
      participantsCount: league._count.ratings,
    })),
  };
};

const getUpcomingLeagues = async () => {
  return await prisma.arenaLeague.findMany({
    where: {
      status: "upcoming",
    },

    orderBy: {
      startDate: "asc",
    },
  });
};

const getFinishedLeagues = async () => {
  return await prisma.arenaLeague.findMany({
    where: {
      status: "finished",
    },

    orderBy: {
      endDate: "desc",
    },
  });
};

module.exports = {
  activateLeague,
  finishLeague,
  processLeagueStatuses,
  getActiveLeagues,
  getUpcomingLeagues,
  getFinishedLeagues,
};
