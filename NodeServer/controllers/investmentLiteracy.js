const InvestmentLiteracy = require("../models/investmentLiteracy"); // Adjust path and model name accordingly
const mongoose = require("mongoose");

// Create a new investment literacy entry
exports.createInvestmentLiteracy = async (req, res) => {
  try {
    // Create new document using the request body
    const literacy = new InvestmentLiteracy(req.body);
    await literacy.save();
    res.status(201).json({ success: true, data: literacy });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all Investment Literacy entries with optional filters like category or tag
exports.getAllInvestmentLiteracy = async (req, res) => {
  try {
    const { category, tag } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (tag) filter.tags = tag;

    const literacy = await InvestmentLiteracy.find(filter).sort({
      createdAt: -1,
    }); // optionally sort by created date descending

    res.status(200).json({ success: true, data: literacy });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

//Get all investment literacy via id
exports.getInvestmentLiteracyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format." });
    }

    const literacy = await InvestmentLiteracy.findById(id);
    if (!literacy) {
      return res.status(404).json({ success: false, error: "Not found" });
    }

    return res.status(200).json(literacy);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Update an existing Investment Literacy entry by ID
exports.updateInvestmentLiteracy = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format." });
    }

    const updatedLiteracy = await InvestmentLiteracy.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedLiteracy) {
      return res.status(404).json({ success: false, error: "Not found" });
    }

    res.status(200).json({ success: true, data: updatedLiteracy });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete an Investment Literacy entry by ID
exports.deleteInvestmentLiteracy = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format." });
    }

    const deletedLiteracy = await InvestmentLiteracy.findByIdAndDelete(id);
    if (!deletedLiteracy) {
      return res.status(404).json({ success: false, error: "Not found" });
    }

    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
