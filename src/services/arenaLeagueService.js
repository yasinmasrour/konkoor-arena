const prisma = require("../config/prisma");
const AppError = require("../utils/appError");

const createLeague = async (data) => {
  const { title, lesson, startDate, endDate } = data;

  if (new Date(startDate) >= new Date(endDate)) {
    throw new AppError("Start date must be before end date", 400);
  }

  const existingLeague = await prisma.arenaLeague.findFirst({
    where: {
      OR: [
        {
          title,
        },

        {
          lesson,

          startDate: {
            lte: new Date(endDate),
          },

          endDate: {
            gte: new Date(startDate),
          },
        },
      ],
    },
  });

  if (existingLeague) {
    throw new AppError("A conflicting league already exists", 409);
  }

  const league = await prisma.arenaLeague.create({
    data: {
      title,
      lesson,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: "upcoming",
    },
  });

  return league;
};

const getActiveLeague = async () => {
  const now = new Date();

  const league = await prisma.arenaLeague.findFirst({
    where: {
      status: "active",

      startDate: {
        lte: now,
      },

      endDate: {
        gte: now,
      },
    },

    orderBy: {
      startDate: "desc",
    },
  });

  if (!league) {
    throw new AppError("No active league found", 404);
  }

  return league;
};

module.exports = {
  createLeague,
  getActiveLeague,
};
