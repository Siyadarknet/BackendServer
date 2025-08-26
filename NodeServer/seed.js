// const mongoose = require("mongoose");
// const Event = require("./models/event"); // Make sure the path is correct
// require("dotenv").config();

// // Define the event data
// const newEventData = {
//   title: "Annual Tech Conference",
//   description: "A conference for developers and tech enthusiasts.",
//   imageUrl: "http://example.com/image.jpg",
//   eventType: "Conference",
//   eventDate: new Date("2025-11-15T09:00:00.000Z"),
//   registrationDeadline: new Date("2025-11-01T23:59:59.000Z"),
//   location: "San Francisco, CA",
// };

// // Function to connect and create the event
// const createCorrectEvent = async () => {
//   try {
//     // 1. Connect to the MongoDB database
//     await mongoose.connect(process.env.DATABASE_URL, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("Database connected successfully.");

//     // 2. Create the event
//     await Event.create(newEventData);
//     console.log("Successfully created and encrypted a new event.");
//   } catch (error) {
//     console.error("Failed to create event:", error);
//   } finally {
//     // 3. Close the connection
//     await mongoose.connection.close();
//     console.log("Database connection closed.");
//   }
// };

// // 4. Call the function to run the script
// createCorrectEvent();
