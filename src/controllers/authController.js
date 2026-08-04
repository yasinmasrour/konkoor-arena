const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");


const register = asyncHandler(async (req, res) => {

    const user = await authService.registerUser(req.body);


    res.status(201).json({

        message: "User registered successfully",

        user: {

            id: user.id,

            firstName: user.firstName,

            lastName: user.lastName,

            email: user.email,

            role: user.role.name

        }

    });

});


const login = asyncHandler(async (req, res) => {

    const {
        email,
        password
    } = req.body;


    const result = await authService.loginUser(
        email,
        password
    );


    res.status(200).json({

        message: "Login successful",

        token: result.token,

        user: {

            id: result.user.id,

            firstName: result.user.firstName,

            lastName: result.user.lastName,

            email: result.user.email,

            role: result.user.role.name

        }

    });

});


module.exports = {
    register,
    login
};