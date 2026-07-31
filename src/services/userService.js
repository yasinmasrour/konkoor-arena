const prisma = require("../config/prisma");


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
        throw new Error("User not found");
    }


    return user;

};


module.exports = {
    getUserProfile
};