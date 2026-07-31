const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = require("../config/prisma");
const ROLES = require("../constants/roles");

const registerUser = async (userData) => {

    const {
        firstName,
        lastName,
        email,
        password
    } = userData;


    const existingUser = await prisma.user.findUnique({
        where: {
            email
        }
    });


    if (existingUser) {
        throw new Error("User already exists");
    }


    const studentRole = await prisma.role.findUnique({
        where: {
            name: ROLES.STUDENT
        }
    });


    if (!studentRole) {
        throw new Error("Student role not found");
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            roleId: studentRole.id
        },
        include: {
            role: true
        }
    });


    return user;

};



const loginUser = async (email, password) => {

    const user = await prisma.user.findUnique({

        where: {
            email
        },

        include: {
            role: true
        }

    });


    if (!user) {
        throw new Error("Invalid email or password");
    }


    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );


    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }


    const token = jwt.sign(

        {
            id: user.id
        },

        process.env.JWT_SECRET,

        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }

    );


    return {
        token,
        user
    };

};


module.exports = {
    registerUser,
    loginUser
};