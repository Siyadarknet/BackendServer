const Goal = require("../models/goal");

// create a new goal
exports.createGoal = async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, dueDate } = req.body;

    // Ensure all fields are provided
    if (!name || !targetAmount || !dueDate) {
      console.log("Missing required fields for goal creation.");
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: name, targetAmount, dueDate",
      });
    }

    if (!req.user || !req.user.id) {
      console.log(
        "req.user.id is missing, authentication failed at goalCreation."
      );
      return res.status(401).json({
        success: false,
        message: "User not authenticated.",
      });
    }

    const newGoal = new Goal({
      user: req.user.id,
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      dueDate: new Date(dueDate),
    });

    await newGoal.save();
    console.log("new Goal saved successfully.");
    res.status(201).json({
      success: true,
      message: "New goal created successfully.",
      goal: newGoal,
    });
  } catch (error) {
    console.error("Error while creating goal:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create goal",
      error: error.message,
    });
  }
};

//get all goals
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ dueDate: 1 });
    res.status(200).json({ success: true, data: goals });
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch goals",
      error: error.message,
    });
  }
};

// update goal
exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, targetAmount, currentAmount, dueDate } = req.body;

    const goal = await Goal.findOne({ _id: id, user: req.user.id });

    if (!goal) {
      console.log(" Goal not found for updating or is  unauthorized.");
      return res.status(404).json({
        success: false,
        message: "Goal not found or don't have permission to update it.",
      });
    }

    goal.name = name || goal.name;
    goal.targetAmount = targetAmount || goal.targetAmount;
    goal.currentAmount =
      currentAmount !== undefined ? currentAmount : goal.currentAmount;
    goal.dueDate = dueDate ? new Date(dueDate) : goal.dueDate;

    await goal.save();
    console.log("  Updated Goal saved successfully in DB.");
    res.status(200).json({
      success: true,
      message: "Goal updated successfully.",
      goal,
    });
  } catch (error) {
    console.error("Error while updating goal", error);
    res.status(500).json({
      success: false,
      message: "Failed to update goal",
      error: error.message,
    });
  }
};

// delete goal
exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Goal.deleteOne({ _id: id, user: req.user.id });

    if (result.deletedCount === 0) {
      console.log("Goal not found or unauthorized.");
      return res.status(404).json({
        success: false,
        message: "Goal not found or not have permission to delete it.",
      });
    }

    console.log("Goal deleted successfully.");
    res
      .status(200)
      .json({ success: true, message: "Goal deleted successfully." });
  } catch (error) {
    console.error("Error while  deleting goal:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete goal",
      error: error.message,
    });
  }
};
