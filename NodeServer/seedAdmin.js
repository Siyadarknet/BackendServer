// const mongoose = require("mongoose");
// const User = require("./models/User");
// const { encrypt } = require("./Utils/encryption");
// require("dotenv").config();

// const MONGODB_URI = process.env.DATABASE_URL;

// // Connect to MongoDB
// const connectDB = async () => {
//   try {
//     await mongoose.connect(MONGODB_URI);
//     console.log("MongoDB connected for seeding...");
//   } catch (err) {
//     console.error("MongoDB connection error:", err);
//     process.exit(1);
//   }
// };

// (async () => {
//   await connectDB();

//   const adminEmail = "admin@example.com";
//   try {
//     // Check if an admin user already exists
//     const existingAdmin = await User.findOne({
//       email: encrypt(adminEmail), // The email is encrypted in the DB
//     });

//     if (existingAdmin) {
//       console.log("✅ Admin user already exists. Skipping creation.");
//     } else {
//       const admin = new User({
//         firstName: "Admin",
//         lastName: "User",
//         email: adminEmail, // The pre-save hook will encrypt this
//         phone: "9999999999",
//         password: "admin123", // The pre-save hook will hash this
//         isAdmin: true,
//       });

//       await admin.save();
//       console.log("✅ Admin user created.");
//     }
//   } catch (err) {
//     console.error("❌ Error during seeding:", err.message);
//   } finally {
//     mongoose.disconnect();
//     console.log("MongoDB disconnected.");
//   }
// })();
