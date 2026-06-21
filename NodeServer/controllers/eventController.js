const Event = require("../models/event");

// Create a new event handler
exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      createdBy: req.user.id, // Already uses req.user.id
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({
      message: "Event creation failed",
      error: err.message,
    });
  }
};

// Get all upcoming events
// Get all upcoming events
exports.getEvents = async (req, res) => {
  console.log("Hit on get events");
  try {
    const events = await Event.find({ eventDate: { $gte: new Date() } }).sort(
      "eventDate",
    );
    // Remove the `.toObject()` call. The TranslationMiddleware
    // will handle this for you.
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

//  Get events with optional filter (upcoming / past / all)
//  Get events with optional filter (upcoming / past / all)
exports.getFilteredEvents = async (req, res) => {
  const filter = req.query.filter || "upcoming";
  const now = new Date();

  try {
    let query = {};

    if (filter === "upcoming") {
      query = { eventDate: { $gte: now } };
    } else if (filter === "past") {
      query = { eventDate: { $lt: now } };
    } else if (filter !== "all") {
      return res.status(400).json({ message: "Invalid filter" });
    }

    // 1. Fetch the documents from MongoDB
    const events = await Event.find(query).sort("eventDate");

    const sanitizedEvents = events.map((event) => {
      const eventObj = event.toObject({ getters: true });
      eventObj.status = new Date(event.eventDate) >= now ? "upcoming" : "past"; // Lowercase to match Flutter safely
      return eventObj;
    });

    // 3. Return the sanitized array
    res.status(200).json(sanitizedEvents);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch filtered events",
      error: err.message,
    });
  }
};
// Register a user for an event
exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) return res.status(404).json({ message: "Event not found" });

    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ message: "Registration closed" });
    }

    const alreadyRegistered = event.registeredUsers.some(
      (entry) => entry.user.toString() === req.user.id,
    );

    if (alreadyRegistered)
      return res.status(400).json({ message: "Already registered" });

    event.registeredUsers.push({ user: req.user.id });
    await event.save();

    res.status(200).json({
      message: "Registered successfully",
      event,
    });
  } catch (err) {
    res.status(500).json({
      message: "Registration failed",
      error: err.message,
    });
  }
};
