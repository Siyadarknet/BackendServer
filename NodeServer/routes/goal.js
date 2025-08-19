const express = require("express");
const router = express.Router();
const {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
} = require("../controllers/goal");
const verifyToken = require("../middleware/verifyToken");
const {
  TranslationMiddleware,
} = require("../middleware/translationMiddleware");

// All goal routes require authentication
router.use(verifyToken);

// Create a new goal
router.post("/createGoal", createGoal);

// Get all goals
router.get("/getGoals", TranslationMiddleware({ data: ["name"] }), getGoals);

// Update a specific goal
router.put("/updateGoal/:id", updateGoal);

// Delete a specific goal
router.delete("/deleteGoal/:id", deleteGoal);

module.exports = router;
