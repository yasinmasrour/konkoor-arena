const examService = require("../services/examService");
const asyncHandler = require("../utils/asyncHandler");


const createExam = asyncHandler(async (req, res) => {

    const exam = await examService.createExam({

        ...req.body,

        createdBy: req.user.id

    });


    res.status(201).json({

        message: "Exam created successfully",

        exam

    });

});


const getExams = asyncHandler(async (req, res) => {

    const exams = await examService.getExams();


    res.status(200).json({
        exams
    });

});


const getExamById = asyncHandler(async (req, res) => {

    const exam = await examService.getExamById(
        req.params.id
    );


    res.status(200).json({
        exam
    });

});


const updateExam = asyncHandler(async (req, res) => {

    const exam = await examService.updateExam(

        req.params.id,

        req.body

    );


    res.status(200).json({

        message: "Exam updated",

        exam

    });

});


const deleteExam = asyncHandler(async (req, res) => {

    await examService.deleteExam(
        req.params.id
    );


    res.status(200).json({

        message: "Exam deleted"

    });

});


module.exports = {
    createExam,
    getExams,
    getExamById,
    updateExam,
    deleteExam
};