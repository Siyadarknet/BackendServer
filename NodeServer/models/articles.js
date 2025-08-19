// models/Article.js
const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      //for Storing the main article content (can be Markdown, HTML, or plain text)
      type: String,
      required: true,
    },
    videoUrl: {
      // URL for the video explanation
      type: String,
      required: false, //optional
    },
    category: {
      type: String,
      required: true,
    },
    module: {
      // Link to the Module the article belongs to
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: false, // Some articles might be standalone, not part of a formal module
    },
    // Optional: Reading time, difficulty, etc.
    readingTimeMinutes: {
      type: Number,
      required: false,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
  },
  { timestamps: true }
);

const Article = mongoose.model("Article", ArticleSchema);
module.exports = Article;
