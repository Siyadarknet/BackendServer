const express = require("express");
const router = express.Router();
const Event = require("../models/event");
const isAdmin = require("../middleware/isAdmin");
const verifyToken = require("../middleware/verifyToken");

router.use(verifyToken);
router.use(isAdmin);

// CREATE event
router.post("/", async (req, res) => {
  console.log("Admin Events Route: POST / - Received request to create event.");
  console.log("Request Body:", req.body);

  try {
    // Destructure ALL fields
    const {
      title,
      description,
      eventDate,
      registrationDeadline,
      location,
      createdBy,
      registeredUsers,
      eventType,
      imageUrl,
    } = req.body;

    const event = new Event({
      title,
      description,
      eventDate: new Date(eventDate), // Ensure date strings are converted to Date objects
      registrationDeadline: new Date(registrationDeadline), // Ensure date strings are converted to Date objects
      location,
      createdBy: createdBy || req.user.id,
      registeredUsers: registeredUsers || [],
      eventType,
      imageUrl,
    });

    await event.save();
    console.log("Admin Events Route: Event saved successfully:", event);
    res.status(201).json(event);
  } catch (err) {
    console.error("Admin Events Route: Error creating event:", err);

    res.status(400).json({ error: err.message || "Failed to create event" });
  }
});

// READ all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort("eventDate");
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ single event
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE event
router.put("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!event) return res.status(404).json({ message: "Not found" });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE event
router.delete("/:id", async (req, res) => {
  try {
    const result = await Event.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
