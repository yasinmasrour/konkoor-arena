const userService = require("../services/userService");
const asyncHandler = require("../utils/asyncHandler");

const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ user: await userService.getUserProfile(req.user.id) });
});

const updateProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "Profile updated successfully",
    user: await userService.updateUserProfile(req.user.id, req.body),
  });
});

module.exports = { getProfile, updateProfile };
