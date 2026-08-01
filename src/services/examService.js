const prisma = require("../config/prisma");


const createExam = async (data) => {

    const {
        createdBy,
        bookletIds,
        ...examData
    } = data;


    const exam = await prisma.exam.create({

        data: {

            ...examData,

            createdBy: {
                connect: {
                    id: createdBy
                }
            },

            booklets: {
                create: bookletIds.map((bookletId, index) => ({
                    booklet: {
                        connect: {
                            id: bookletId
                        }
                    },
                    order: index + 1
                }))
            }

        },

        include: {

            booklets: {
                include: {
                    booklet: true
                }
            },

            createdBy: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true
                }
            }

        }

    });


    return exam;

};



const getExams = async () => {

    return await prisma.exam.findMany({

        include: {

            booklets: {
                include: {
                    booklet: true
                }
            },

            createdBy: {
                select: {
                    firstName: true,
                    lastName: true
                }
            }

        },

        orderBy: {
            createdAt: "desc"
        }

    });

};



const getExamById = async (id) => {


    const exam = await prisma.exam.findUnique({

        where: {
            id
        },

        include: {

            booklets: {
                include: {
                    booklet: true
                }
            }

        }

    });


    if (!exam) {
        throw new Error("Exam not found");
    }


    return exam;

};



const updateExam = async (id, data) => {


    const exam = await prisma.exam.findUnique({

        where: {
            id
        }

    });


    if (!exam) {
        throw new Error("Exam not found");
    }


    return await prisma.exam.update({

        where: {
            id
        },

        data

    });


};



const deleteExam = async (id) => {


    const exam = await prisma.exam.findUnique({

        where: {
            id
        }

    });


    if (!exam) {
        throw new Error("Exam not found");
    }


    await prisma.exam.delete({

        where: {
            id

        }

    });

};



module.exports = {
    createExam,
    getExams,
    getExamById,
    updateExam,
    deleteExam
};