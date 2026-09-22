const prisma = require("../config/prisma");
const counselorService = require("../services/counselorService");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

// ==================== آمار ====================
const getStats = asyncHandler(async (req, res) => {
  const stats = await counselorService.getCounselorStats();
  res.status(200).json(stats);
});

// ==================== لیست دانش‌آموزان ====================
const listStudents = asyncHandler(async (req, res) => {
  const result = await counselorService.listStudents({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    search: req.query.search,
  });
  res.status(200).json(result);
});

const getStudentById = asyncHandler(async (req, res) => {
  const student = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      phoneNumber: true,
      email: true,
      grade: true,
      major: true,
      city: true,
      province: true,
      phoneVerifiedAt: true,
      createdAt: true,
      _count: { select: { attempts: true } },
    },
  });

  if (!student) throw new AppError("دانش‌آموز پیدا نشد", 404);

  res.json({
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      username: student.username,
      phoneNumber: student.phoneNumber,
      email: student.email,
      grade: student.grade,
      major: student.major,
      city: student.city,
      province: student.province,
      isVerified: !!student.phoneVerifiedAt,
      attemptsCount: student._count.attempts,
      createdAt: student.createdAt,
    },
  });
});

module.exports = { getStats, listStudents, getStudentById };
