const express = require("express");
const router = express.Router();
const moduleController = require("../controllers/module");
const { verifyAdmin } = require("../middleware/auth");
const verifyToken = require("../middleware/verifyToken");

const {
  TranslationMiddleware,
} = require("../middleware/translationMiddleware");

// Get all modules
router.get(
  "/modules",
  verifyToken,
  TranslationMiddleware({
    array: ["name", "description"],
  }),
  moduleController.getAllModules
);

// Get a specific module by ID
router.get(
  "/modules/:id",
  verifyToken,
  TranslationMiddleware({
    single: ["name", "description"],
  }),
  moduleController.getModuleById
);

// Create a new module (admin only)
router.post(
  "/modules",
  verifyToken,
  verifyAdmin,
  moduleController.createModule
);

module.exports = router;
