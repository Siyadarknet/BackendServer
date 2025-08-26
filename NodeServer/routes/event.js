const express = require("express");
const router = express.Router();
const {
  createEvent,
  getEvents,
  getFilteredEvents,
  registerForEvent,
} = require("../controllers/eventController");
const verifyToken = require("../middleware/verifyToken");
const {
  TranslationMiddleware,
} = require("../middleware/translationMiddleware");

const fieldsToTranslate = {
  array: ["title", "description", "location"],
};

// All routes require authentication
router.use(verifyToken);

// Create a new event
router.post("/createEvent", createEvent);

// Get only future events (basic) — supports ?lang=xx
router.get("/getEvents", TranslationMiddleware(fieldsToTranslate), getEvents);

// Get events with filters: ?filter=upcoming | past | all — supports ?lang=xx
router.get(
  "/events",
  TranslationMiddleware(fieldsToTranslate),
  getFilteredEvents
);

// Register for a specific event
router.post("/registerEvent/:eventId", registerForEvent);

module.exports = router;
