const attemptService = require("../services/attemptService");
const asyncHandler = require("../utils/asyncHandler");


const startAttempt = asyncHandler(async (req, res) => {

    const result = await attemptService.startAttempt(
        req.user.id,
        req.params.examId
    );


    res.status(201).json({
        message: "Attempt started successfully",
        result
    });

});


const getAttemptQuestions = asyncHandler(async (req, res) => {

    const result = await attemptService.getAttemptQuestions(
        req.params.attemptId
    );


    res.status(200).json(result);

});


const submitAnswer = asyncHandler(async (req, res) => {

    const answer = await attemptService.submitAnswer(

        req.params.attemptId,

        req.user.id,

        req.body

    );


    res.status(200).json({

        message: "Answer submitted successfully",

        answer

    });

});


const submitAttempt = asyncHandler(async (req, res) => {

    const attempt = await attemptService.submitAttempt(

        req.params.id,

        req.user.id

    );


    res.status(200).json({

        message: "Attempt submitted successfully",

        attempt

    });

});


const getAttemptResult = asyncHandler(async (req, res) => {

    const result = await attemptService.getAttemptResult(
        req.params.id,
        req.user.id
    );


    res.status(200).json(result);

});


const getMyAttempts = asyncHandler(async (req, res) => {

    const attempts = await attemptService.getMyAttempts(
        req.user.id
    );


    res.status(200).json({
        attempts
    });

});


const getAttemptReview = asyncHandler(async (req, res) => {

    const review = await attemptService.getAttemptReview(
        req.params.id,
        req.user.id
    );


    res.status(200).json(review);

});


module.exports = {
    startAttempt,
    getAttemptQuestions,
    submitAnswer,
    submitAttempt,
    getAttemptResult,
    getMyAttempts,
    getAttemptReview
};