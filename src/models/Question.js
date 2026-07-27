const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            unique: true
        },

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

        chapter: {
            type: String,
            required: true
        },

        topic: {
            type: String,
            default: ""
        },

        questionText: {
            type: String,
            required: true
        },

        questionImage: {
            type: String,
            default: ""
        },

        options: {
            type: [String],
            validate: {
                validator: (options) => options.length === 4,
                message: "Question must have exactly 4 options"
            }
        },

        correctAnswer: {
            type: Number,
            min: 0,
            max: 3,
            required: true
        },

        explanation: {
            type: String,
            default: ""
        },

        explanationPdf: {
            type: String,
            default: ""
        },

        source: {
            type: String,
            default: ""
        },

        author: {
            type: String,
            default: ""
        },

        year: {
            type: Number
        },

        difficulty: {
            type: String,
            enum: [
                "easy",
                "medium",
                "hard",
                "tricky"
            ],
            default: "medium"
        },

        tags: {
            type: [String],
            default: []
        },

        usageCount: {
            type: Number,
            default: 0
        },

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
    "Question",
    questionSchema
);