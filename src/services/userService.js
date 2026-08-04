const prisma = require("../config/prisma");
const AppError = require("../utils/appError")

const getUserProfile = async (userId) => {

    const user = await prisma.user.findUnique({

        where: {
            id: userId
        },

        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: {
                select: {
                    name: true
                }
            }
        }

    });


    if (!user) {
        throw new Error("User not found", 404);
    }


    return user;

};


module.exports = {
    getUserProfile
};