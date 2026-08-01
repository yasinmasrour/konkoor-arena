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

const getQuestions = async (req, res) => {

    try {

        const questions = await questionService.getQuestions();

        res.status(200).json({
            questions
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

const getQuestionById = async (req, res) => {

    try {

        const question = await questionService.getQuestionById(
            req.params.id
        );

        res.status(200).json({
            question
        });

    } catch (error) {

        res.status(404).json({
            message: error.message
        });

    }

};

const updateQuestion = async (req, res) => {

    try {

        const question = await questionService.updateQuestion(

            req.params.id,

            req.body

        );

        res.status(200).json({

            message: "Question updated successfully",

            question

        });

    } catch (error) {

        res.status(404).json({
            message: error.message
        });

    }

};

const deleteQuestion = async (req, res) => {

    try {

        await questionService.deleteQuestion(
            req.params.id
        );

        res.status(200).json({

            message: "Question deleted successfully"

        });

    } catch (error) {

        res.status(404).json({
            message: error.message
        });

    }

};


module.exports = {
    createQuestion,
    getQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion
};