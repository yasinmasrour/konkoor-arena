const userService = require("../services/userService");
const asyncHandler = require("../utils/asyncHandler");


const getProfile = asyncHandler(async (req, res) => {

    const user = await userService.getUserProfile(
        req.user.id
    );


    res.status(200).json({
        user
    });

});


module.exports = {
    getProfile
};