const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");


const protect = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;


        if (!authHeader) {

            return res.status(401).json({
                message: "Unauthorized"
            });

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

            return res.status(401).json({
                message: "User not found"
            });

        }


        req.user = {

            id: user.id,

            firstName: user.firstName,

            lastName: user.lastName,

            email: user.email,

            role: user.role.name

        };


        next();


    } catch (error) {

        return res.status(401).json({

            message: "Invalid or expired token"

        });

    }

};


module.exports = protect;