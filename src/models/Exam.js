const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        examDate: {
            type: Date,
            required: true
        },

        startTime: {
            type: String,
            required: true
        },

        endTime: {
            type: String,
            default: ""
        },

        booklets: [
            {
                booklet: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Booklet",
                    required: true
                },

                order: {
                    type: Number,
                    required: true
                }
            }
        ],

        status: {
            type: String,
            enum: [
                "draft",
                "scheduled",
                "running",
                "finished",
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

module.exports = mongoose.model("Exam", examSchema);