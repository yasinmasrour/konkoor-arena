const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const questionRoutes = require("./questionRoutes");
const bookletRoutes = require("./bookletRoutes");
const examRoutes = require("./examRoutes");
const attemptRoutes = require("./attemptRoutes");
const aiAnalysisRoutes = require("./aiAnalysisRoutes");
const arenaMatchRoutes = require("./arenaMatchRoutes");
const arenaRankingRoutes = require("./arenaRankingRoutes");
const arenaStandingRoutes = require("./arenaStandingRoutes");
const arenaProfileRoutes = require("./arenaProfileRoutes");
const arenaMatchHistoryRoutes = require("./arenaMatchHistoryRoutes");
const arenaLeagueRoutes = require("./arenaLeagueRoutes");
const arenaQueueRoutes = require("./arenaQueueRoutes");
const arenaInviteRoutes = require("./arenaInviteRoutes");
const subscriptionRoutes = require("./subscriptionRoutes");
const subscriptionUserRoutes = require("./subscriptionUserRoutes");
const paymentRoutes = require("./paymentRoutes");
const walletRoutes = require("./walletRoutes");
const adminRoutes = require("./adminRoutes");
const adminArenaRoutes = require("./adminArenaRoutes");
const designerRoutes = require("./designerRoutes");
const counselorRoutes = require("./counselorRoutes");
const notificationRoutes = require("./notificationRoutes");
const referralRoutes = require("./referralRoutes");
const commentRoutes = require("./commentRoutes");
const adminCommentRoutes = require("./adminCommentRoutes");
const strategyRoutes = require("./strategyRoutes");
const adminStrategyRoutes = require("./adminStrategyRoutes");
const soloRoutes = require("./soloRoutes");
const blogRoutes = require("./blogRoutes");
const adminBlogRoutes = require("./adminBlogRoutes");
const counselorPlanRoutes = require("./counselorPlanRoutes");
const studyPlanRoutes = require("./studyPlanRoutes");
const personalExamRoutes = require("./personalExamRoutes");
const featureRoutes = require("./featureRoutes");
const examPurchaseRoutes = require("./examPurchaseRoutes");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Welcome to Konkoor Arena Backend",
  });
});

// USER
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

// TESTS
router.use("/questions", questionRoutes);
router.use("/booklets", bookletRoutes);
router.use("/exams", examRoutes);
router.use("/exams", examPurchaseRoutes);
router.use("/attempts", attemptRoutes);
router.use("/attempts", aiAnalysisRoutes);

// ARENA
router.use("/arena", arenaMatchHistoryRoutes);
router.use("/arena", arenaRankingRoutes);
router.use("/arena", arenaProfileRoutes);
router.use("/arena", arenaLeagueRoutes);
router.use("/arena/matches", arenaMatchRoutes);
router.use("/arena/standings", arenaStandingRoutes);
router.use("/arena/invites", arenaInviteRoutes);
router.use("/arena/queue", arenaQueueRoutes);

// SOLO
router.use("/solo", soloRoutes);

// SUBSCRIPTION
router.use("/subscription-plans", subscriptionRoutes);
router.use("/subscriptions", subscriptionUserRoutes);

// STRATEGY
router.use("/strategy-plans", strategyRoutes);

// FINANCIAL
router.use("/payments", paymentRoutes);
router.use("/wallet", walletRoutes);

// BLOG
router.use("/blog", blogRoutes);
router.use("/admin/blog", adminBlogRoutes);

// STUDY PLANS
router.use("/study-plans", studyPlanRoutes);
router.use("/personal-exams", personalExamRoutes);

// ADMIN & OTHER ROLES
router.use("/admin/strategy-plans", adminStrategyRoutes);
router.use("/admin/comments", adminCommentRoutes);
router.use("/admin/arena", adminArenaRoutes);
router.use("/admin", adminRoutes);
router.use("/designer", designerRoutes);
router.use("/counselor/plans", counselorPlanRoutes);
router.use("/counselor", counselorRoutes);

// NOTIFICATION
router.use("/notifications", notificationRoutes);

// REFERRAL
router.use("/referrals", referralRoutes);

// FEATURES
router.use("/features", featureRoutes);

// COMMENTS
router.use("/", commentRoutes);

module.exports = router;