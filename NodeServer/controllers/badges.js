const Badge = require("../models/badge");

// @desc    Get all badges
// @route   GET /api/badges
// @access  Public
exports.getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find({});
    res.status(200).json(badges);
  } catch (error) {
    console.error("Error fetching all badges:", error);
    res.status(500).json({ error: "Failed to fetch badges." });
  }
};

// @desc    Get a single badge by ID
// @route   GET /api/badges/:id
// @access  Public
exports.getBadgeById = async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: "Badge not found." });
    }
    res.status(200).json(badge);
  } catch (error) {
    console.error("Error fetching badge by ID:", error);
    res.status(500).json({ error: "Failed to fetch badge." });
  }
};

// @desc    Create a new badge
// @route   POST /api/badges
// @access  Admin
exports.createBadge = async (req, res) => {
  const { name, description, icon, criteriaType, criteriaValue } = req.body;

  if (!name || !description || !criteriaType) {
    return res.status(400).json({ message: "Missing required badge fields." });
  }

  try {
    const newBadge = new Badge({
      name,
      description,
      icon,
      criteriaType,
      criteriaValue,
    });
    await newBadge.save();
    res.status(201).json(newBadge);
  } catch (error) {
    console.error("Error creating new badge:", error);
    res.status(500).json({ error: "Failed to create badge." });
  }
};
