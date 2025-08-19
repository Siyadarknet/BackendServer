const express = require("express");
const router = express.Router();
const articleController = require("../controllers/article");
const { verifyAdmin } = require("../middleware/auth");
const verifyToken = require("../middleware/verifyToken");

const {
  TranslationMiddleware,
} = require("../middleware/translationMiddleware");

// fields of the article for translation.
const fieldsToTranslate = {
  single: ["title", "content", "difficulty", "category"],
  array: ["title", "content", "difficulty", "category"],
  data: ["title", "content", "difficulty", "category"],
};

// Get all articles
router.get(
  "/articles",
  verifyToken,

  TranslationMiddleware(fieldsToTranslate),
  articleController.getAllArticles
);

// Get articles by moduleId
router.get(
  "/articles/module/:moduleId",
  verifyToken,

  TranslationMiddleware(fieldsToTranslate),
  articleController.getArticlesByModuleId
);

// Get article by ID
router.get(
  "/articles/:id",
  verifyToken,
  TranslationMiddleware(fieldsToTranslate),
  articleController.getArticleById
);

// Mark article as read
router.post(
  "/articles/:id/read",
  verifyToken,
  articleController.markArticleAsRead
);

// // Create article (admin only, no translation needed on creation)
// router.post(
//   "/articles",
//   verifyToken,
//   verifyAdmin,
//   articleController.createArticle
// );

module.exports = router;
