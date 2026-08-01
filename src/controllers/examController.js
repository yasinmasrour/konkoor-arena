const examService = require("../services/examService");


const createExam = async (req,res)=>{

    try{

        const exam = await examService.createExam({

            ...req.body,

            createdBy:req.user.id

        });


        res.status(201).json({

            message:"Exam created successfully",

            exam

        });


    }catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};



const getExams = async(req,res)=>{

    try{

        const exams = await examService.getExams();


        res.json({
            exams
        });


    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};



const getExamById = async(req,res)=>{

    try{

        const exam = await examService.getExamById(
            req.params.id
        );


        res.json({
            exam
        });


    }catch(error){

        res.status(404).json({
            message:error.message
        });

    }

};



const updateExam = async(req,res)=>{

    try{

        const exam = await examService.updateExam(

            req.params.id,

            req.body

        );


        res.json({

            message:"Exam updated",

            exam

        });


    }catch(error){

        res.status(404).json({
            message:error.message
        });

    }

};



const deleteExam = async(req,res)=>{

    try{

        await examService.deleteExam(
            req.params.id
        );


        res.json({

            message:"Exam deleted"

        });


    }catch(error){

        res.status(404).json({
            message:error.message
        });

    }

};



module.exports={
    createExam,
    getExams,
    getExamById,
    updateExam,
    deleteExam
};