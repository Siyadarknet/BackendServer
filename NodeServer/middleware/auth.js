const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    // Relies on req.user
    return res.status(403).json({ message: "Not authorized as an admin" });
  }
  next();
};
