const authService = require("../services/authService");


const register = async (req, res) => {

    try {

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


    } catch (error) {

        res.status(400).json({

            message: error.message

        });

    }

};



const login = async (req, res) => {

    try {

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


    } catch (error) {

        res.status(401).json({

            message: error.message

        });

    }

};



module.exports = {
    register,
    login
};