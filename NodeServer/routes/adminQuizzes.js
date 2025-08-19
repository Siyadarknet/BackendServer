// Admin routes for Quizzes (CRUD)
const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quiz"); // Assuming quiz.js is your quizController
const isAdmin = require("../middleware/isAdmin");
const verifyToken = require("../middleware/verifyToken");

router.use(verifyToken);
router.use(isAdmin);

// CREATE Quiz
router.post("/", quizController.createQuiz);

// READ all quizzes
router.get("/", quizController.getAllQuizzes);

// READ single quiz (optional, if admin needs to fetch by ID)
router.get("/:id", quizController.getQuizById);

// UPDATE quiz
router.put("/:id", quizController.updateQuiz);

// DELETE quiz
router.delete("/:id", quizController.deleteQuiz);

module.exports = router;
