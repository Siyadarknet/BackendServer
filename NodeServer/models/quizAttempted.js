const mongoose = require("mongoose");

const QuizAttemptedSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Article",
    required: false,
  },
  score: {
    type: Number,
    required: true,
  },

  literacyLevel: {
    type: String,
    required: true,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Beginner",
  },
  badgesEarned: {},
});
module.exports = mongoose.model("QuizAttempt", QuizAttemptedSchema);
