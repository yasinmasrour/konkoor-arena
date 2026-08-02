const attemptService = require("../services/attemptService");


const startAttempt = async (req, res) => {

    try {

        const result = await attemptService.startAttempt(
            req.user.id,
            req.params.examId
        );


        res.status(201).json({
            message: "Attempt started successfully",
            result
        });


    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

};

const getAttemptQuestions = async (req, res) => {

    try {

        const result = await attemptService.getAttemptQuestions(
            req.params.attemptId
        );


        res.status(200).json(result);


    } catch (error) {

        res.status(404).json({
            message: error.message
        });

    }

};

const submitAnswer = async (req, res) => {

    try {

        const answer = await attemptService.submitAnswer(

            req.params.attemptId,

            req.user.id,

            req.body

        );


        res.status(200).json({

            message: "Answer submitted successfully",

            answer

        });


    } catch (error) {

        res.status(400).json({

            message: error.message

        });

    }

};

const submitAttempt = async (req, res) => {

    try {

        const attempt = await attemptService.submitAttempt(

            req.params.id,

            req.user.id

        );


        res.status(200).json({

            message: "Attempt submitted successfully",

            attempt

        });


    } catch (error) {

        res.status(400).json({

            message: error.message

        });

    }

};

const getAttemptResult = async (req, res) => {

    try {

        const result = await attemptService.getAttemptResult(
            req.params.id,
            req.user.id
        );


        res.status(200).json(result);


    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

};

const getMyAttempts = async (req, res) => {

    try {

        const attempts =
            await attemptService.getMyAttempts(
                req.user.id
            );

        res.status(200).json({
            attempts
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

const getAttemptReview = async (req, res) => {

    try {

        const review =
            await attemptService.getAttemptReview(
                req.params.id,
                req.user.id
            );

        res.status(200).json(review);

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

};

module.exports = {
    startAttempt,
    getAttemptQuestions,
    submitAnswer,
    submitAttempt,
    getAttemptResult,
    getMyAttempts,
    getAttemptReview
};