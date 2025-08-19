const Module = require("../models/module");

// get all modules
exports.getAllModules = async (req, res) => {
  try {
    const modules = await Module.find({})
      .populate("articles", "title category")
      .populate("quizzes", "question")
      .populate("completionBadge", "name icon");

    res.status(200).json(modules);
  } catch (error) {
    console.error("Error fetching modules:", error);
    res.status(500).json({ error: "Failed to fetch modules." });
  }
};

//get module by id
exports.getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate("articles", "title category")
      .populate("quizzes", "question")
      .populate("completionBadge", "name icon");

    if (!module) {
      return res.status(404).json({ message: "Module not found." });
    }
    res.status(200).json(module);
  } catch (error) {
    console.error("Error fetching module by ID:", error);
    res.status(500).json({ error: "Failed to fetch module." });
  }
};

//Module creation handler
exports.createModule = async (req, res) => {
  const {
    name,
    description,
    articles,
    quizzes,
    completionBadge,
    completionCriteria,
  } = req.body;

  if (!name || !description) {
    return res
      .status(400)
      .json({ message: "Missing required module fields (name, description)." });
  }

  try {
    const newModule = new Module({
      name,
      description,
      articles: articles || [],
      quizzes: quizzes || [],
      completionBadge,
      completionCriteria: completionCriteria || {
        articlesToRead: 0,
        quizzesToPass: 0,
        minQuizScore: 70,
      },
    });
    await newModule.save();
    res
      .status(201)
      .json({ message: "Module created successfully!", module: newModule });
  } catch (error) {
    console.error("Error creating module:", error);
    res.status(500).json({ error: "Failed to create module." });
  }
};

// Add update and delete module functions as needed (Admin only)
