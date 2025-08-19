// Admin routes for Articles (CRUD)

const express = require("express");
const router = express.Router();
const articleController = require("../controllers/article"); // Import the article controller
const isAdmin = require("../middleware/isAdmin");
const verifyToken = require("../middleware/verifyToken");

router.use(verifyToken);
router.use(isAdmin);

// CREATE article
router.post("/", articleController.createArticle);

// READ all articles
router.get("/", articleController.getAllArticles);

// READ single article
router.get("/:id", articleController.getArticleById);

// UPDATE article
router.put("/:id", articleController.updateArticle);

// DELETE article
router.delete("/:id", articleController.deleteArticle);

module.exports = router;
