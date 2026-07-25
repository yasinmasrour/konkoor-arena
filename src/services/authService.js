const bcrypt = require("bcrypt");
const User = require("../models/User");

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


module.exports = {
    registerUser
};