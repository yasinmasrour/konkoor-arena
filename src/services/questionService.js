const prisma = require("../config/prisma");


const createQuestion = async (data) => {

    const {
        createdBy,
        ...questionData
    } = data;


    const question = await prisma.question.create({
        data: {
            ...questionData,

            createdBy: {
                connect: {
                    id: createdBy
                }
            }
        }
    });


    return question;
};


module.exports = {
    createQuestion
};