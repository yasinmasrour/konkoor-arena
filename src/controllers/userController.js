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

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user.id, currentPassword, newPassword);
  res.status(200).json({ message: "رمز عبور با موفقیت تغییر کرد" });
});

module.exports = { getProfile, updateProfile, changePassword };
