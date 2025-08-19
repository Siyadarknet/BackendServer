const express = require("express");
const router = express.Router();
const Module = require("../models/module");
const isAdmin = require("../middleware/isAdmin");
const verifyToken = require("../middleware/verifyToken");

router.use(verifyToken);
router.use(isAdmin);

// CREATE module
router.post("/", async (req, res) => {
  try {
    const { name, description, articles, quizzes, completionBadge } = req.body;
    const module = new Module({
      name,
      description,
      articles,
      quizzes,
      completionBadge,
    });
    await module.save();
    res.status(201).json(module);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all modules
router.get("/", async (req, res) => {
  try {
    const modules = await Module.find()
      .populate("articles", "title")
      .populate("quizzes", "question")
      .populate("completionBadge", "name");
    res.json(modules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ single module
router.get("/:id", async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate("articles", "title")
      .populate("quizzes", "question")
      .populate("completionBadge", "name");
    if (!module) return res.status(404).json({ message: "Not found" });
    res.json(module);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE module
router.put("/:id", async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!module) return res.status(404).json({ message: "Not found" });
    res.json(module);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE module
router.delete("/:id", async (req, res) => {
  try {
    const result = await Module.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
