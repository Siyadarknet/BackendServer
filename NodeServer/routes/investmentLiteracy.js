const express = require("express");
const router = express.Router();
const literacyController = require("../controllers/investmentLiteracy");
const { verifyAdmin } = require("../middleware/auth");
const verifyToken = require("../middleware/verifyToken");

const {
  TranslationMiddleware,
} = require("../middleware/translationMiddleware");

// Define which fields should be translated
const fieldsToTranslate = {
  single: ["title", "description", "category"],
  data: ["title", "description", "category"],
};

// GET all literacy entries (with optional ?lang=xx for translation)
router.get(
  "/",
  verifyToken,
  TranslationMiddleware(fieldsToTranslate),
  literacyController.getAllInvestmentLiteracy
);

// GET literacy by ID (with translation middleware)
router.get(
  "/:id",
  verifyToken,
  TranslationMiddleware(fieldsToTranslate),
  literacyController.getInvestmentLiteracyById
);

// POST create literacy (Admin only, no translation on creation)
router.post(
  "/",
  verifyToken,
  verifyAdmin,
  literacyController.createInvestmentLiteracy
);

// PUT update literacy (Admin only, no translation on update)
router.put(
  "/:id",
  verifyToken,
  verifyAdmin,
  literacyController.updateInvestmentLiteracy
);

// DELETE literacy (Admin only)
router.delete(
  "/:id",
  verifyToken,
  verifyAdmin,
  literacyController.deleteInvestmentLiteracy
);

module.exports = router;
