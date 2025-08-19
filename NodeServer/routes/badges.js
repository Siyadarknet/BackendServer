const express = require("express");
const router = express.Router();
const {
  getAllBadges,
  getBadgeById,
  createBadge,
} = require("../controllers/badgeController");
const { verifyAdmin } = require("../middleware/auth");
const verifyToken = require("../middleware/verifyToken");

const {
  TranslationMiddleware,
} = require("../middleware/translationMiddleware");

// @route   GET /api/badges
// @desc    Get all badges (with optional translation via ?lang=xx)
// @access  Public
router.get("/", TranslationMiddleware, getAllBadges);

// @route   GET /api/badges/:id
// @desc    Get a single badge by ID (with optional translation)
// @access  Public
router.get("/:id", TranslationMiddleware, getBadgeById);

// @route   POST /api/badges
// @desc    Create a new badge
// @access  Admin only
router.post("/", verifyToken, verifyAdmin, createBadge);

module.exports = router;
