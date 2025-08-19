const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quiz");
const verifyToken = require("../middleware/verifyToken");
const {
  TranslationMiddleware,
} = require("../middleware/translationMiddleware");

// Get quizzes by Article ID
router.get(
  "/quizzes/article/:articleId",
  verifyToken,
  TranslationMiddleware({
    array: ["question", "options.option"],
  }),
  quizController.getQuizzesByArticleId
);

// Submit a quiz attempt
router.post("/quiz-attempts", verifyToken, quizController.submitQuizAttempt);

// Get user's quiz attempts history
router.get(
  "/quiz-attempts",
  verifyToken,
  TranslationMiddleware({
    array: ["quiz.question", "quiz.options"],
  }),
  quizController.getQuizAttemptsByUser
);

// Get  user quiz analytics
router.get(
  "/quiz-attempts/analytics",
  verifyToken,
  quizController.getQuizAnalytics
);

// Get a single random latest general quiz
router.get(
  "/quizzes/random/latest",
  verifyToken,
  TranslationMiddleware({
    // Translate the fields of a single quiz object
    single: ["question", "options.option"],
  }),
  quizController.getRandomLatestGeneralQuiz
);

// Get all unique quiz categories for general quizzes
router.get(
  "/quizzes/categories",
  verifyToken,
  TranslationMiddleware({
    data: true,
  }),
  quizController.fetchQuizCategories
);

// Get quizzes by a specific category
router.get(
  "/quizzes/category/:categoryName",
  verifyToken,
  TranslationMiddleware({
    array: ["question", "options.option"],
  }),
  quizController.fetchQuizzesByCategory
);

module.exports = router;
