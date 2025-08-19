const User = require("../models/User");
const Module = require("../models/module");
const QuizAttempt = require("../models/quizAttempted");
const Article = require("../models/articles");
const Badge = require("../models/badge");
// const TranslationCache = require("../models/translationCache"); // new cache model

// Check module completion and assign badge if earned
exports.checkModuleCompletion = async (userId, moduleId) => {
  try {
    const module = await Module.findById(moduleId).populate(
      "articles quizzes completionBadge"
    );
    const user = await User.findById(userId);
    if (!module || !user) return;

    // Check articles completion
    let allArticlesRead = true;
    if (module.completionCriteria.articlesToRead > 0) {
      const moduleArticleIds = module.articles.map((art) => art._id.toString());
      const userCompletedArticlesInModule = user.completedArticles.filter(
        (id) => moduleArticleIds.includes(id.toString())
      );
      allArticlesRead =
        userCompletedArticlesInModule.length >=
        module.completionCriteria.articlesToRead;
    }

    // Check quizzes completion
    let allQuizzesPassed = true;
    if (module.completionCriteria.quizzesToPass > 0) {
      const quizAttempts = await QuizAttempt.find({ user: userId });
      const moduleQuizIds = module.quizzes.map((q) => q._id.toString());
      const passedModuleQuizzes = quizAttempts.filter(
        (attempt) =>
          moduleQuizIds.includes(attempt.articleId.toString()) &&
          attempt.score >= module.completionCriteria.minQuizScore
      );
      allQuizzesPassed =
        passedModuleQuizzes.length >= module.completionCriteria.quizzesToPass;
    }

    // Assign badge if completed
    if (allArticlesRead && allQuizzesPassed) {
      if (
        module.completionBadge &&
        !user.earnedBadges.includes(module.completionBadge._id.toString())
      ) {
        user.earnedBadges.push(module.completionBadge._id);
        await user.save();
        console.log(
          `User ${user.firstName} earned badge for module: ${module.name}`
        );
        return module.completionBadge;
      }
    }

    return null;
  } catch (error) {
    console.error("Error in checkModuleCompletion:", error);
    return null;
  }
};

// Update user literacy level based on progress

exports.updateUserLiteracyLevel = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const totalArticlesCount = await Article.countDocuments();
    const completedArticleCount = user.completedArticles.length;
    const totalQuizAttemptsCount = await QuizAttempt.countDocuments({
      user: userId,
    });

    let newLevel = user.currentLiteracyLevel;
    if (
      completedArticleCount >= totalArticlesCount * 0.8 &&
      totalQuizAttemptsCount >= 50
    ) {
      newLevel = "Expert";
    } else if (
      completedArticleCount >= totalArticlesCount * 0.6 &&
      totalQuizAttemptsCount >= 30
    ) {
      newLevel = "Advanced";
    } else if (
      completedArticleCount >= totalArticlesCount * 0.4 &&
      totalQuizAttemptsCount >= 20
    ) {
      newLevel = "Intermediate";
    } else if (
      completedArticleCount >= totalArticlesCount * 0.2 &&
      totalQuizAttemptsCount >= 10
    ) {
      newLevel = "Novice";
    } else {
      newLevel = "Beginner";
    }

    if (user.currentLiteracyLevel !== newLevel) {
      user.currentLiteracyLevel = newLevel;
      await user.save();
      console.log(
        `User ${user.firstName} literacy level updated to: ${newLevel}`
      );
      return newLevel;
    }

    return null;
  } catch (error) {
    console.error("Error in updateUserLiteracyLevel:", error);
    return null;
  }
};

//Award badges based on article count or latest quiz score

exports.checkAndAwardSpecificBadges = async (
  userId,
  latestArticleId,
  latestQuizScore
) => {
  const user = await User.findById(userId);
  if (!user) return [];

  const newlyEarnedBadges = [];

  // Article count badges
  const completedArticlesCount = user.completedArticles.length;
  const articleCountBadges = await Badge.find({
    criteriaType: "article_count",
  });
  for (const badge of articleCountBadges) {
    if (
      completedArticlesCount >= badge.criteriaValue &&
      !user.earnedBadges.includes(badge._id.toString())
    ) {
      user.earnedBadges.push(badge._id);
      newlyEarnedBadges.push(badge);
      console.log(
        `User ${user.firstName} earned badge: ${badge.name} (Article Count)`
      );
    }
  }

  // Quiz score badges
  if (latestQuizScore != null) {
    const quizScoreBadges = await Badge.find({ criteriaType: "quiz_score" });
    for (const badge of quizScoreBadges) {
      if (
        latestQuizScore >= badge.criteriaValue &&
        !user.earnedBadges.includes(badge._id.toString())
      ) {
        user.earnedBadges.push(badge._id);
        newlyEarnedBadges.push(badge);
        console.log(
          `User ${user.firstName} earned badge: ${badge.name} (Quiz Score)`
        );
      }
    }
  }

  if (newlyEarnedBadges.length > 0) await user.save();
  return newlyEarnedBadges;
};

//Get user's completed article IDs

exports.getUsersCompletedArticles = async (userId) => {
  try {
    const user = await User.findById(userId).select("completedArticles");
    if (!user) return [];
    return user.completedArticles.map((id) => id.toString());
  } catch (error) {
    console.error("Error fetching user completed articles:", error);
    return [];
  }
};

/**
 * Fetch article translation with caching
 * @param {String} articleId
 * @param {String} lang - language code, e.g. 'hi', 'pa'
 * @param {Function} translateFn - async function(articleContent, lang) => translatedText
 */
exports.getTranslatedArticle = async (articleId, lang, translateFn) => {
  try {
    // Check cache first
    const cached = await TranslationCache.findOne({ articleId, lang });
    if (cached) return cached.text;

    // Fetch article content
    const article = await Article.findById(articleId).select("title content");
    if (!article) return null;

    // Translate using provided function
    const translatedText = await translateFn(article.content, lang);

    // Save to cache
    await TranslationCache.create({ articleId, lang, text: translatedText });

    return translatedText;
  } catch (error) {
    console.error("Error fetching translated article:", error.message);
    return null;
  }
};
