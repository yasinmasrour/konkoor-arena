const Question = require("../models/Question");


const createQuestion = async (data) => {
    const question = await Question.create(data);

    return question;
};


module.exports = {
    createQuestion
};