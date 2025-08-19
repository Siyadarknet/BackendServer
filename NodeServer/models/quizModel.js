const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: [
    {
      option: {
        type: String,
        required: true,
      },
      isCorrect: {
        type: Boolean,
        default: false,
      },
    },
  ],
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Article",
    required: false,
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Module",
    required: false, // Optional
  },
  category: {
    type: String,
    required: false, // Optional
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: false, // Optional
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

quizSchema.index({ article: 1 });
quizSchema.index({ module: 1 });
quizSchema.index({ category: 1 });
quizSchema.index({ difficulty: 1 });

module.exports = mongoose.model("Quiz", quizSchema);
