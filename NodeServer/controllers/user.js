const User = require("../models/User");
const Badge = require("../models/badge");
const { getUsersCompletedArticles } = require("../Utils/literacy");

//get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("earnedBadges");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const completedArticleIds = await getUsersCompletedArticles(req.user.id);

    res.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      currentLiteracyLevel: user.currentLiteracyLevel,
      completedArticles: completedArticleIds,
      earnedBadges: user.earnedBadges,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile." });
  }
};

//updating user profile
exports.updateUserProfile = async (req, res) => {
  const { firstName, lastName, phone } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phone = phone || user.phone;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        currentLiteracyLevel: user.currentLiteracyLevel,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Failed to update user profile." });
  }
};

//get all badges received
exports.getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find({});
    res.status(200).json(badges);
  } catch (error) {
    console.error("Error fetching badges:", error);
    res.status(500).json({ error: "Failed to fetch badges." });
  }
};

//create a new badge ( admin)
exports.createBadge = async (req, res) => {
  const { name, description, icon, criteriaType, criteriaValue } = req.body;

  try {
    const newBadge = new Badge({
      name,
      description,
      icon,
      criteriaType,
      criteriaValue,
    });
    await newBadge.save();
    res
      .status(201)
      .json({ message: "Badge created successfully!", badge: newBadge });
  } catch (error) {
    console.error("Error creating badge:", error);
    res.status(500).json({ error: "Failed to create badge." });
  }
};
