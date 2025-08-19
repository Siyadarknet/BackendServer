const Article = require("../models/articles");
const User = require("../models/User");
const Module = require("../models/module");
const mongoose = require("mongoose");
const {
  checkModuleCompletion,
  updateUserLiteracyLevel,
  checkAndAwardSpecificBadges,
} = require("../Utils/literacy");

// @desc    Get all Articles (with optional filters)
// @route   GET /api/v1/articles or /admin/articles
// @access  Public / Private (Admin)

//Get all articles handler
exports.getAllArticles = async (req, res) => {
  try {
    //for module and category based filter destructure from req query
    const { module, category } = req.query;
    let filter = {};
    if (module) {
      if (!mongoose.Types.ObjectId.isValid(module)) {
        return res.status(400).json({ message: "Invalid Module ID format." });
      }
      filter.module = module;
    }
    if (category) filter.category = category;

    const articles = await Article.find(filter)
      .populate("module", "name") // Populate module name
      .sort({ createdAt: -1 }); // Sort by creation date, newest first

    res.status(200).json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ error: "Failed to fetch articles." });
  }
};

// @desc    Get articles by Module ID
// @route   GET /api/v1/articles/module/:moduleId
// @access  Public

//getArticles By module id
exports.getArticlesByModuleId = async (req, res) => {
  // fetch moduleId from req params
  const { moduleId } = req.params;

  try {
    // check for ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      console.log(`Invalid moduleId format: ${moduleId}`);
      return res.status(400).json({ message: "Invalid Module ID format." });
    }

    // console.log(`Querying articles for moduleId: ${moduleId}`);
    const moduleObjId = new mongoose.Types.ObjectId(moduleId);

    // get articles by module
    let articles = await Article.find({ module: moduleObjId })
      .populate("module", "name")
      .sort({ createdAt: 1 });
    console.log(`Direct query found ${articles.length} articles`);

    // Fallback: Use module's articles array if direct query fails
    if (articles.length === 0) {
      console.log(
        `Falling back to module's articles array for moduleId: ${moduleId}`
      );
      const module = await Module.findById(moduleObjId);
      if (!module) {
        console.log(`Module not found: ${moduleId}`);
        return res.status(404).json({ message: "Module not found." });
      }
      if (!module.articles || module.articles.length === 0) {
        console.log(`No articles in module: ${moduleId}`);
        return res
          .status(404)
          .json({ message: "No articles found for this module." });
      }
      articles = await Article.find({ _id: { $in: module.articles } })
        .populate("module", "name")
        .sort({ createdAt: 1 });
      console.log(
        `Module query found ${articles.length} articles: ${JSON.stringify(
          articles.map((a) => ({ _id: a._id, title: a.title }))
        )}`
      );
    }

    if (articles.length === 0) {
      console.log(`No articles found for moduleId: ${moduleId}`);
      return res
        .status(404)
        .json({ message: "No articles found for this module." });
    }

    res.status(200).json(articles);
  } catch (error) {
    console.error(`Error fetching articles for moduleId ${moduleId}:`, error);
    res.status(500).json({ error: "Failed to fetch articles by module." });
  }
};

// @desc    Get a single Article by ID
// @route   GET /api/v1/articles/:id or /admin/articles/:id
// @access  Public / Private (Admin)
exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Article ID format." });
    }

    const article = await Article.findById(id).populate("module", "name");
    if (!article) {
      return res.status(404).json({ message: "Article not found." });
    }
    res.status(200).json(article);
  } catch (error) {
    console.error("Error fetching article by ID:", error);
    res.status(500).json({ error: "Failed to fetch article." });
  }
};

// @desc    Mark an article as read by a user
// @route   POST /api/v1/articles/:id/read
// @access  Private (User)
exports.markArticleAsRead = async (req, res) => {
  try {
    const { id: articleId } = req.params;
    const userId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      return res.status(400).json({ message: "Invalid Article ID format." });
    }

    const user = await User.findById(userId);
    const article = await Article.findById(articleId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (!article) {
      return res.status(404).json({ message: "Article not found." });
    }

    if (user.completedArticles.includes(articleId)) {
      return res
        .status(200)
        .json({ message: "Article already marked as read." });
    }

    user.completedArticles.push(articleId);
    await user.save();

    let earnedBadge = null;
    let newLiteracyLevel = null;
    let specificBadges = [];

    if (article.module) {
      earnedBadge = await checkModuleCompletion(userId, article.module);
    }
    newLiteracyLevel = await updateUserLiteracyLevel(userId);
    specificBadges = await checkAndAwardSpecificBadges(userId, articleId, null); // Assuming articleId for article-based badges

    res.status(200).json({
      message: "Article marked as read successfully.",
      userCompletedArticles: user.completedArticles,
      earnedBadge: earnedBadge,
      newLiteracyLevel: newLiteracyLevel,
      newlyEarnedSpecificBadges: specificBadges,
    });
  } catch (error) {
    console.error("Error marking article as read:", error);
    res.status(500).json({ error: "Failed to mark article as read." });
  }
};

// @desc    Create a new Article (Admin)
// @route   POST /admin/articles
// @access  Private (Admin)
exports.createArticle = async (req, res) => {
  const {
    title,
    content,
    videoUrl,
    category,
    module, // This is the module ID from the frontend
    readingTimeMinutes,
    difficulty,
  } = req.body;

  if (!title || !content || !category || !module) {
    return res.status(400).json({
      message:
        "Missing required article fields (title, content, category, module).",
    });
  }

  try {
    // Validate if module ID is valid and exists
    if (!mongoose.Types.ObjectId.isValid(module)) {
      return res.status(400).json({ message: "Invalid module ID format." });
    }
    const existingModule = await Module.findById(module);
    if (!existingModule) {
      return res.status(404).json({ message: "Module not found." });
    }

    const newArticle = new Article({
      title,
      content,
      videoUrl,
      category,
      module, // Store the module ID
      readingTimeMinutes,
      difficulty,
    });
    await newArticle.save();

    // ADDED: Push article to the module's articles array
    await Module.findByIdAndUpdate(
      module,
      { $push: { articles: newArticle._id } },
      { new: true } // Return the updated module document
    );

    res
      .status(201)
      .json({ message: "Article created successfully!", article: newArticle });
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({ error: "Failed to create article." });
  }
};

// @desc    Update an existing Article (Admin)
// @route   PUT /admin/articles/:id
// @access  Private (Admin)
exports.updateArticle = async (req, res) => {
  const {
    title,
    content,
    videoUrl,
    category,
    module, // New module ID
    readingTimeMinutes,
    difficulty,
  } = req.body;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Article ID format." });
  }

  if (!title || !content || !category || !module) {
    return res.status(400).json({
      message:
        "Missing required article fields (title, content, category, module).",
    });
  }

  try {
    // Fetch the existing article to determine if module link is changing
    const oldArticle = await Article.findById(id);
    if (!oldArticle) {
      return res.status(404).json({ message: "Article not found." });
    }

    // Validate new module ID if provided and check existence
    if (!mongoose.Types.ObjectId.isValid(module)) {
      return res.status(400).json({ message: "Invalid new module ID format." });
    }
    const newModuleExists = await Module.findById(module);
    if (!newModuleExists) {
      return res.status(404).json({ message: "New Module not found." });
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      {
        title,
        content,
        videoUrl,
        category,
        module, // Update the module ID
        readingTimeMinutes,
        difficulty,
      },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    if (!updatedArticle) {
      return res.status(404).json({ message: "Article not found." });
    }

    // NEW LOGIC: Update module's articles array if module link changed
    if (oldArticle.module && oldArticle.module.toString() !== module) {
      // Remove article from old module's articles array
      await Module.findByIdAndUpdate(oldArticle.module, {
        $pull: { articles: oldArticle._id },
      });
    }
    if (
      module &&
      (!oldArticle.module || oldArticle.module.toString() !== module)
    ) {
      // Add article to new module's articles array
      await Module.findByIdAndUpdate(module, {
        $push: { articles: updatedArticle._id },
      });
    }

    res.status(200).json({
      message: "Article updated successfully!",
      article: updatedArticle,
    });
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({ error: "Failed to update article." });
  }
};

// @desc    Delete an Article (Admin)
// @route   DELETE /admin/articles/:id
// @access  Private (Admin)
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Article ID format." });
    }

    const deletedArticle = await Article.findByIdAndDelete(id);

    if (!deletedArticle) {
      return res.status(404).json({ message: "Article not found." });
    }

    // NEW LOGIC: Remove article ID from associated Module's articles array
    if (deletedArticle.module) {
      await Module.findByIdAndUpdate(deletedArticle.module, {
        $pull: { articles: deletedArticle._id },
      });
    }

    res.status(200).json({ message: "Article deleted successfully!" });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ error: "Failed to delete article." });
  }
};
