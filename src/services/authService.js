const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const registerUser = async (userData) => {
    const {
        firstName,
        lastName,
        email,
        password
    } = userData;


    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("User already exists");
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword
    });


    return user;
};

const loginUser = async (email, password) => {

    const user = await User.findOne({ email });


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
            id: user._id,
            role: user.role
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