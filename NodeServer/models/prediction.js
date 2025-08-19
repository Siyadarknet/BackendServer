// models/prediction.js

const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  salary: Number,
  features: Object,
  predictedIncome: Number,
  recommendations: Object,
  warnings: String,
  // NEW: Add a dedicated field for overspending messages
  overspendingMessages: Object,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Prediction", predictionSchema);
