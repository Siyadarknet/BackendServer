const express = require("express");
const Prediction = require("../models/prediction");
const { verifyToken } = require("../middleware/auth");

exports.SavePrediction = async (req, res) => {
  try {
    const {
      salary,
      features,
      predictedIncome,
      recommendations,
      warningsMessage,
      overspendingMessages,
    } = req.body;

    const userId = req.user.id;

    if (!userId) {
      console.error("Save Prediction Error: User ID not found in request.");
      return res
        .status(401)
        .json({ message: "User not authenticated or ID missing." });
    }

    const prediction = new Prediction({
      user: userId,
      salary,
      features,
      predictedIncome,
      recommendations,
      warnings: warningsMessage,
      overspendingMessages: overspendingMessages,
    });

    console.log("Attempting to save new prediction to DB for user:", userId);
    await prediction.save();
    console.log("Prediction saved successfully!");

    res.status(201).json({
      success: true,
      message: "Prediction Data Saved Successfully in DB",
    });
  } catch (error) {
    console.error("Error saving prediction to DB:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save prediction in DB",
    });
  }
};

exports.getPredictionHistory = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      console.error(
        "Get Prediction History Error: User ID not found in request."
      );
      return res
        .status(401)
        .json({ message: "User not authenticated or ID missing." });
    }

    console.log("Fetching prediction history for user:", userId);
    const predictions = await Prediction.find({
      user: userId,
    }).sort({ createdAt: -1 });
    console.log(`Found ${predictions.length} predictions for user:`, userId);

    res.status(200).json({
      success: true,
      predictions,
    });
  } catch (error) {
    console.error("Error while fetching prediction from DB:", error);
    res.status(500).json({
      success: false,
      message: "Error while fetching prediction from DB",
    });
  }
};
