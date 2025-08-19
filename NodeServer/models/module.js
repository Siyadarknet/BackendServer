// models/Module.js
const mongoose = require("mongoose");

const ModuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },

    articles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article",
      },
    ],
    // Quizzes belonging to this module (optional)
    quizzes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],
    // Associated badge for completing this module
    completionBadge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
      required: false, //optional
    },
    // Criteria for completing the module
    completionCriteria: {
      articlesToRead: { type: Number, default: 0 },
      quizzesToPass: { type: Number, default: 0 },
      minQuizScore: { type: Number, default: 70 },
    },
  },
  { timestamps: true }
);

const Module = mongoose.model("Module", ModuleSchema);
module.exports = Module;
