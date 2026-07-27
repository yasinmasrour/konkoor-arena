const questionService = require("../services/questionService");


const createQuestion = async (req, res) => {
    try {
        const question = await questionService.createQuestion({
            ...req.body,
            createdBy: req.user.id
        });


        res.status(201).json({
            message: "Question created successfully",
            question
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {
    createQuestion
};