const userService = require("../services/userService");


const getProfile = async (req, res) => {

    try {

        const user = await userService.getUserProfile(
            req.user.id
        );


        res.status(200).json({
            user
        });


    } catch (error) {

        res.status(404).json({
            message: error.message
        });

    }
};


module.exports = {
    getProfile
};