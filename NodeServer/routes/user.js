const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const { verifyAdmin } = require("../middleware/auth");
const verifyToken = require("../middleware/verifyToken");

const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const {
  TranslationMiddleware,
} = require("../middleware/translationMiddleware");

//  Rate Limiter
const profileLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  message: "Too many requests from this IP, please try again later.",
});

// Validation Middleware for profile update
const validateProfileUpdate = [
  body("firstName")
    .optional()
    .notEmpty()
    .withMessage("First name cannot be empty"),
  body("lastName")
    .optional()
    .notEmpty()
    .withMessage("Last name cannot be empty"),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Enter valid phone number"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

// Validation Middleware for badge creation (admin)
const validateBadge = [
  body("name").notEmpty().withMessage("Badge name is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("criteriaType").notEmpty().withMessage("Criteria type required"),
  body("icon").optional(),
  body("criteriaValue").optional(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

//  Profile Routes
router.get(
  "/profile",
  verifyToken,
  profileLimiter,
  TranslationMiddleware({
    single: ["firstName", "lastName", "currentLiteracyLevel"],
  }),
  userController.getUserProfile
);
router.put(
  "/profile",
  verifyToken,
  validateProfileUpdate,
  userController.updateUserProfile
);

//  Badge Routes
router.get(
  "/badges",
  verifyToken,
  TranslationMiddleware({
    array: ["name", "description"],
  }),
  userController.getAllBadges
);
router.post(
  "/badges",
  verifyToken,
  verifyAdmin,
  validateBadge,
  userController.createBadge
);

module.exports = router;
