const mongoose = require("mongoose");

const BadgeSchema = new mongoose.Schema(
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
    icon: {
      type: String,
      required: false,
    },
    criteriaType: {
      type: String,
      enum: ["module_completion", "quiz_score", "article_count", "general"],
      required: true,
    },
    // `criteriaValue` can be an ID (for module_completion), a number (for quiz_score/article_count)
    criteriaValue: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

const Badge = mongoose.model("Badge", BadgeSchema);
module.exports = Badge;
