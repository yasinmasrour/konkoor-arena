const mongoose = require("mongoose");


const attemptSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        exam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exam",
            required: true
        },

        answers: [
            {
                question: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Question",
                    required: true
                },

                selectedAnswer: {
                    type: Number,
                    min: 0,
                    max: 3
                },

                isCorrect: {
                    type: Boolean,
                    default: false
                },

                answeredAt: {
                    type: Date
                }
            }
        ],

        startedAt: {
            type: Date
        },

        submittedAt: {
            type: Date
        },

        status: {
            type: String,
            enum: [
                "started",
                "submitted",
                "expired"
            ],
            default: "started"
        },

        score: {
            type: Number,
            default: 0
        },

        analysis: {
            type: Object,
            default: {}
        }
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model(
    "Attempt",
    attemptSchema
);