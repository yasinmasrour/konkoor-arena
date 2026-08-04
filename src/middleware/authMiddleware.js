const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");


const protect = asyncHandler(async (req, res, next) => {

    const authHeader = req.headers.authorization;


    if (!authHeader) {

        throw new AppError(
            "Unauthorized",
            401
        );

    }


    const token = authHeader.split(" ")[1];


    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
    );


    const user = await prisma.user.findUnique({

        where: {
            id: decoded.id
        },

        include: {
            role: true
        }

    });


    if (!user) {

        throw new AppError(
            "User not found",
            401
        );

    }


    req.user = {

        id: user.id,

        firstName: user.firstName,

        lastName: user.lastName,

        email: user.email,

        role: user.role.name

    };


    next();

});


module.exports = protect;