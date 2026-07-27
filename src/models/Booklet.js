const mongoose = require("mongoose");

const bookletSchema = new mongoose.Schema(
    {
        lesson: {
            type: String,
            required: true
        },

        grade: {
            type: String,
            enum: ["10", "11", "12"],
            required: true
        },

        major: {
            type: String,
            enum: [
                "math",
                "experimental",
                "humanities"
            ],
            required: true
        },

        examDate: {
            type: Date,
            required: true
        },

        duration: {
            type: Number,
            required: true
        },

        questions: [
            {
                question: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Question",
                    required: true
                },

                order: {
                    type: Number,
                    required: true
                },

                score: {
                    type: Number,
                    default: 1
                }
            }
        ],

        status: {
            type: String,
            enum: [
                "draft",
                "published",
                "archived"
            ],
            default: "draft"
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Booklet",
    bookletSchema
);