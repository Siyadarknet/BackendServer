const QuizAttempt = require("../models/quizAttempted");
const Quiz = require("../models/quizModel");
const Article = require("../models/articles");
const User = require("../models/User");
const Module = require("../models/module");
const mongoose = require("mongoose");
const {
  checkModuleCompletion,
  updateUserLiteracyLevel,
  checkAndAwardSpecificBadges,
} = require("../Utils/literacy");

/**
 * @desc Get quizzes by Article ID
 * @route GET /api/v1/quizzes/article/:articleId
 * @access Private (User)
 */
exports.getQuizzesByArticleId = async (req, res) => {
  try {
    const { articleId } = req.params;
    console.log(
      `Backend: Attempting to fetch quizzes for Article ID: ${articleId}`
    );

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      console.warn(`Backend: Invalid Article ID format: ${articleId}`);
      return res.status(400).json({ message: "Invalid Article ID format." });
    }

    const quizzes = await Quiz.find({ article: articleId })
      .select("-options.isCorrect") // For not sending correct answers to frontend
      .lean();

    console.log(
      `Backend: Found ${quizzes.length} quizzes for Article ID: ${articleId}`
    );

    if (quizzes.length === 0) {
      return res
        .status(404)
        .json({ message: "No quizzes found for this article." });
    }

    res.status(200).json(quizzes);
  } catch (error) {
    console.error("Backend: Error fetching quizzes by article ID:", error);
    res.status(500).json({ error: "Failed to fetch quizzes." });
  }
};

/**
 * @desc Submit a quiz attempt
 * @route POST /api/v1/quiz-attempts
 * @access Private (User)
 */
exports.submitQuizAttempt = async (req, res) => {
  try {
    const { articleId, userAnswers, isGeneralQuiz } = req.body;
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    // Fetch the quiz questions to verify answers and calculate score
    const quizQuestionIds = userAnswers.map((ans) => ans.questionId);
    const quizQuestions = await Quiz.find({
      _id: { $in: quizQuestionIds },
    }).select("options");

    if (quizQuestions.length !== userAnswers.length) {
      return res
        .status(400)
        .json({ message: "Mismatched quiz questions or invalid submission." });
    }

    let correctAnswersCount = 0;
    let totalQuestions = quizQuestions.length;

    for (const userAnswer of userAnswers) {
      const question = quizQuestions.find(
        (q) => q._id.toString() === userAnswer.questionId
      );
      if (question) {
        // Find the selected option and check if it's correct
        const selectedOption = question.options[userAnswer.selectedOptionIndex];
        if (selectedOption && selectedOption.isCorrect) {
          correctAnswersCount++;
        }
      }
    }

    const score =
      totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;

    // Determine quiz type for saving attempt
    const quizType = isGeneralQuiz ? "general" : "article";

    // Save the quiz attempt
    const quizAttempt = new QuizAttempt({
      user: userId,
      quizType: quizType,
      article: isGeneralQuiz ? null : articleId, // Link article only if not a general quiz
      score: score,
      answers: userAnswers,
      literacyLevel:
        score >= 80 ? "Advanced" : score >= 50 ? "Intermediate" : "Beginner",
    });
    await quizAttempt.save();

    // Perform post-quiz updates (literacy level, badges, module completion)
    // Wrap these in a try-catch to avoid blocking the main quiz submission response
    try {
      await checkModuleCompletion(userId);
      await updateUserLiteracyLevel(userId);
      await checkAndAwardSpecificBadges(userId, score, articleId);
    } catch (updateError) {
      console.warn("Warning: Post-quiz update failed:", updateError);
      // Log the warning but don't return an error to the client for this.
    }

    res.status(201).json({
      message: "Quiz attempt submitted successfully!",
      score: score,
      correctAnswers: correctAnswersCount,
      totalQuestions: totalQuestions,
      attemptId: quizAttempt._id,
    });
  } catch (error) {
    console.error("Error submitting quiz attempt:", error);
    res.status(500).json({ error: "Failed to submit quiz attempt." });
  }
};

/**
 * @desc Get quiz attempts by user
 * @route GET /api/v1/quiz-attempts
 * @access Private (User)
 */
exports.getQuizAttemptsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const attempts = await QuizAttempt.find({ user: userId })
      .populate("quiz")
      .populate("article", "title");

    res.status(200).json(attempts);
  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    res.status(500).json({ error: "Failed to fetch quiz attempts." });
  }
};

/**
 * @desc Create a new Quiz Question (Admin)
 * @route POST /admin/quizzes
 * @access Private (Admin)
 */
exports.createQuiz = async (req, res) => {
  try {
    const { question, options, articleId, moduleId, category, difficulty } =
      req.body;

    //  validation
    if (!question || !options || options.length < 2) {
      return res
        .status(400)
        .json({ message: "Question and at least two options are required." });
    }

    // Ensuring at least one option is marked as correct
    const hasCorrectOption = options.some((opt) => opt.isCorrect);
    if (!hasCorrectOption) {
      return res
        .status(400)
        .json({ message: "At least one option must be marked as correct." });
    }

    // Validate and check if articleId exists if provided
    if (articleId) {
      if (!mongoose.Types.ObjectId.isValid(articleId)) {
        return res.status(400).json({ message: "Invalid Article ID format." });
      }
      const articleExists = await Article.findById(articleId);
      if (!articleExists) {
        return res.status(404).json({ message: "Article not found." });
      }
    }

    // Validate and check if moduleId exists if provided
    if (moduleId) {
      if (!mongoose.Types.ObjectId.isValid(moduleId)) {
        return res.status(400).json({ message: "Invalid Module ID format." });
      }
      const moduleExists = await Module.findById(moduleId);
      if (!moduleExists) {
        return res.status(404).json({ message: "Module not found." });
      }
    }

    const newQuiz = new Quiz({
      question,
      options,
      article: articleId || null, // Link to article if provided
      module: moduleId || null, // Link to module if provided
      category: category || null,
      difficulty: difficulty || null,
    });

    await newQuiz.save();

    // If linked to an article, update the article to include this quiz
    if (articleId) {
      await Article.findByIdAndUpdate(articleId, {
        $push: { quizzes: newQuiz._id },
      });
    }
    // If linked to a module, update the module to include this quiz
    if (moduleId) {
      await Module.findByIdAndUpdate(moduleId, {
        $push: { quizzes: newQuiz._id },
      });
    }

    res.status(201).json({
      message: "Quiz question created successfully!",
      quiz: newQuiz,
    });
  } catch (error) {
    console.error("Error creating quiz question:", error);
    res.status(500).json({ error: "Failed to create quiz question." });
  }
};

/**
 * @desc Get all Quizzes (Admin)
 * @route GET /admin/quizzes
 * @access Private (Admin)
 */
exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({})
      .populate("article", "title") // Populate article title
      .populate("module", "name"); // Populate module name

    if (!quizzes || quizzes.length === 0) {
      return res.status(404).json({ message: "No quizzes found." });
    }

    res.status(200).json(quizzes);
  } catch (error) {
    console.error("Error fetching all quizzes:", error);
    res.status(500).json({ error: "Failed to fetch quizzes." });
  }
};

/**
 * @desc Get a single Quiz by ID (Admin)
 * @route GET /admin/quizzes/:id
 * @access Private (Admin)
 */
exports.getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Quiz ID format." });
    }
    const quiz = await Quiz.findById(id)
      .populate("article", "title")
      .populate("module", "name");
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }
    res.status(200).json(quiz);
  } catch (error) {
    console.error("Error fetching quiz by ID:", error);
    res.status(500).json({ error: "Failed to fetch quiz." });
  }
};

/**
 * @desc Update a Quiz (Admin)
 * @route PUT /admin/quizzes/:id
 * @access Private (Admin)
 */
exports.updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, options, articleId, moduleId, category, difficulty } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Quiz ID format." });
    }

    // Basic validation
    if (!question || !options || options.length < 2) {
      return res
        .status(400)
        .json({ message: "Question and at least two options are required." });
    }

    const hasCorrectOption = options.some((opt) => opt.isCorrect);
    if (!hasCorrectOption) {
      return res
        .status(400)
        .json({ message: "At least one option must be marked as correct." });
    }

    // Find the existing quiz to handle article/module updates
    const existingQuiz = await Quiz.findById(id);
    if (!existingQuiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    // Remove quiz from old article/module if changed
    if (existingQuiz.article && existingQuiz.article.toString() !== articleId) {
      await Article.findByIdAndUpdate(existingQuiz.article, {
        $pull: { quizzes: id },
      });
    }
    if (existingQuiz.module && existingQuiz.module.toString() !== moduleId) {
      await Module.findByIdAndUpdate(existingQuiz.module, {
        $pull: { quizzes: id },
      });
    }

    // Update the quiz
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      {
        question,
        options,
        article: articleId || null,
        module: moduleId || null,
        category: category || null,
        difficulty: difficulty || null,
      },
      { new: true, runValidators: true }
    );

    if (!updatedQuiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    // Add quiz to new article/module if changed
    if (articleId && existingQuiz.article.toString() !== articleId) {
      await Article.findByIdAndUpdate(articleId, { $push: { quizzes: id } });
    }
    if (moduleId && existingQuiz.module.toString() !== moduleId) {
      await Module.findByIdAndUpdate(moduleId, { $push: { quizzes: id } });
    }

    res.status(200).json({
      message: "Quiz updated successfully!",
      quiz: updatedQuiz,
    });
  } catch (error) {
    console.error("Error updating quiz:", error);
    res.status(500).json({ error: "Failed to update quiz." });
  }
};

/**
 * @desc Delete a Quiz (Admin)
 * @route DELETE /admin/quizzes/:id
 * @access Private (Admin)
 */
exports.deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Quiz ID format." });
    }

    const quizToDelete = await Quiz.findById(id);
    if (!quizToDelete) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    // Remove quiz reference from associated article/module
    if (quizToDelete.article) {
      await Article.findByIdAndUpdate(quizToDelete.article, {
        $pull: { quizzes: id },
      });
    }
    if (quizToDelete.module) {
      await Module.findByIdAndUpdate(quizToDelete.module, {
        $pull: { quizzes: id },
      });
    }

    await Quiz.findByIdAndDelete(id);

    res.status(200).json({ message: "Quiz deleted successfully!" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({ error: "Failed to delete quiz." });
  }
};

/**
 * @desc Get aggregated user quiz analytics
 * @route GET /api/v1/quiz-attempts/analytics
 * @access Private (User)
 */
exports.getQuizAnalytics = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      console.warn(
        "Analytics Error: User ID not found in request. User might not be authenticated."
      );
      return res
        .status(401)
        .json({ message: "User not authenticated or ID missing." });
    }

    const attempts = await QuizAttempt.find({ user: userId });

    // Handle case where no attempts are found without throwing an error
    if (attempts.length === 0) {
      return res.status(200).json({
        overallScore: 0,
        literacyLevel: "Beginner",
        earnedBadges: [],
      });
    }

    const totalScore = attempts.reduce(
      (sum, attempt) => sum + attempt.score,
      0
    );
    const overallScore = Math.round(totalScore / attempts.length);

    let literacyLevel = "Beginner";
    if (overallScore >= 80) {
      literacyLevel = "Advanced";
    } else if (overallScore >= 50) {
      literacyLevel = "Intermediate";
    }

    const user = await User.findById(userId).populate("earnedBadges");

    const earnedBadges = (user?.earnedBadges || [])
      .filter(
        (badge) =>
          badge &&
          typeof badge.name === "string" &&
          typeof badge.icon === "string"
      )
      .map((badge) => ({ name: badge.name, icon: badge.icon }));

    res.status(200).json({
      overallScore,
      literacyLevel,
      earnedBadges,
    });
  } catch (error) {
    console.error("Error fetching quiz analytics:", error);
    res.status(500).json({ error: "Failed to fetch quiz analytics." });
  }
};

/**
 * @desc Get a single random latest general quiz
 * @route GET /api/v1/quizzes/random/latest
 * @access Private (User)
 */
exports.getRandomLatestGeneralQuiz = async (req, res) => {
  try {
    console.log("Backend: Attempting to fetch a random latest general quiz.");
    const quizzes = await Quiz.find({
      article: null,
      module: null,
      category: { $exists: true, $ne: null, $ne: "" },
    })
      .select("-options.isCorrect") // for NOT send correct answers to the frontend
      .sort({ createdAt: -1 }) // Sort by latest first
      .limit(50); // Limit to a reasonable number of "latest" quizzes to pick from

    console.log(
      `Backend: Found ${quizzes.length} potential random general quizzes.`
    );

    if (quizzes.length === 0) {
      console.log(
        "Backend: No general quizzes found matching random criteria."
      );
      return res.status(404).json({ message: "No general quizzes found." });
    }

    const randomIndex = Math.floor(Math.random() * quizzes.length);
    const randomQuiz = quizzes[randomIndex];
    console.log("Backend: Successfully picked a random general quiz.");

    res.status(200).json(randomQuiz);
  } catch (error) {
    console.error("Backend: Error fetching random latest general quiz:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch random latest general quiz." });
  }
};

/**
 * @desc Get all unique quiz categories for general quizzes
 * @route GET /api/v1/quizzes/categories
 * @access Private (User)
 */
exports.fetchQuizCategories = async (req, res) => {
  try {
    console.log(
      "Backend: Request to fetch all unique general quiz categories."
    );
    const categories = await Quiz.distinct("category", {
      article: null, // Only get categories from quizzes not tied to articles
      module: null, // Only get categories from quizzes not tied to modules
      category: { $exists: true, $ne: null, $ne: "" }, // Ensure category is present and not empty
    });
    console.log("Backend: Fetched distinct quiz categories:", categories);
    res.status(200).json(categories);
  } catch (error) {
    console.error("Backend: Error fetching quiz categories:", error);
    res.status(500).json({ error: "Failed to fetch quiz categories." });
  }
};

/**
 * @desc Get quizzes by Category (for general quizzes)
 * @route GET /api/v1/quizzes/category/:categoryName
 * @access Private (User)
 */
exports.fetchQuizzesByCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;
    console.log(
      `Backend: Request to fetch quizzes for Category: "${categoryName}"`
    );

    // This is the CRITICAL query. It must match your MongoDB document structure.
    const query = {
      article: null, // Ensure it's not tied to an article
      module: null, // Ensure it's not tied to a module
      category: categoryName, // Match the exact category name from the URL parameter
    };
    console.log(
      "Backend: MongoDB query being executed for category:",
      JSON.stringify(query)
    );

    const quizzes = await Quiz.find(query)
      .select("-options.isCorrect") // Do NOT send correct answers to frontend
      .lean(); // Return plain JavaScript objects for performance

    console.log(
      `Backend: Found ${quizzes.length} quizzes for category "${categoryName}".`
    );

    if (quizzes.length === 0) {
      console.log(
        `Backend: No quizzes found for category "${categoryName}" matching criteria.`
      );
      return res
        .status(404)
        .json({ message: "No quizzes found for this category." });
    }

    res.status(200).json(quizzes);
  } catch (error) {
    console.error("Backend: Error fetching quizzes by category:", error);
    res.status(500).json({ error: "Failed to fetch quizzes by category." });
  }
};
