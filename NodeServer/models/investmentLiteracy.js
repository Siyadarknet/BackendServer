const mongoose = require("mongoose");

const literacySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["Basics", "Advanced", "Stock Market", "Mutual Funds", "Other"],
      default: "Other",
    },
    tags: [{ type: String }],
    image: { type: String },
    videoUrl: { type: String },
    author: { type: String, default: "Admin" },
    published: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "investmentLiteracy",
  }
);

module.exports = mongoose.model("Literacy", literacySchema);
