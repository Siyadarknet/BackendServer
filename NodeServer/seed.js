// // A standalone script to seed your database with comprehensive dummy data
// const mongoose = require("mongoose");
// require("dotenv").config(); // Ensure your .env file is loaded

// // Import your Mongoose models
// const Module = require("./models/module");
// const Article = require("./models/articles");
// const Quiz = require("./models/quizModel");
// const Badge = require("./models/badge");
// const User = require("./models/User");

// // MongoDB connection URI
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

// const seedDatabase = async () => {
//   try {
//     // Connect to the database
//     await connectDB();

//     // 1. Clear old data to prevent unique index errors during re-seeding
//     console.log("Clearing old data...");
//     await Badge.deleteMany({});
//     await Quiz.deleteMany({});
//     await Article.deleteMany({});
//     await Module.deleteMany({});
//     await User.deleteMany({
//       email: { $in: ["author1@test.com", "author2@test.com"] },
//     });

//     // 2. Insert dummy User documents for authors
//     console.log("Inserting author data...");
//     const authors = await User.insertMany([
//       {
//         firstName: "Author",
//         lastName: "One",
//         email: "author1@test.com",
//         password: "hashedpassword",
//         phone: "111-222-3333",
//       },
//       {
//         firstName: "Author",
//         lastName: "Two",
//         email: "author2@test.com",
//         password: "hashedpassword",
//         phone: "444-555-6666",
//       },
//     ]);
//     const [author1, author2] = authors;

//     // 3. Insert dummy Badge documents
//     console.log("Inserting badge data...");
//     const badges = await Badge.insertMany([
//       {
//         name: "Budgeting Basics Badge",
//         description:
//           "Awarded for completing the 'Foundations of Financial Planning' module.",
//         icon: "budgeting-badge-icon-url",
//         criteriaType: "module_completion",
//       },
//       {
//         name: "Fraud Fighter Badge",
//         description:
//           "Awarded for completing the 'Digital Fraud Awareness' module.",
//         icon: "fraud-badge-icon-url",
//         criteriaType: "module_completion",
//       },
//     ]);
//     const [budgetingBadge, fraudBadge] = badges;

//     // 4. Insert dummy Article documents
//     console.log("Inserting article data...");
//     const articles = await Article.insertMany([
//       {
//         title: "What is Personal Finance?",
//         content:
//           "This article introduces the fundamental concepts of personal finance, including income, expenses, and savings...",
//         author: author1._id,
//         category: "Financial Basics",
//         readingTimeMinutes: 5,
//         difficulty: "Easy",
//       },
//       {
//         title: "Creating a Budget That Works",
//         content:
//           "A guide on how to create and stick to a personal budget. It covers different budgeting methods and tools...",
//         author: author1._id,
//         category: "Budgeting",
//         readingTimeMinutes: 8,
//         difficulty: "Easy",
//       },
//       {
//         title: "The Power of Saving and Investing",
//         content:
//           "This article explains why saving and investing are crucial for long-term financial stability and growth...",
//         author: author1._id,
//         category: "Investment Strategies",
//         readingTimeMinutes: 10,
//         difficulty: "Medium",
//       },
//       {
//         title: "Introduction to Digital Fraud",
//         content:
//           "An overview of common digital fraud schemes, such as phishing, smishing, and vishing...",
//         author: author2._id,
//         category: "Fraud Awareness",
//         readingTimeMinutes: 7,
//         difficulty: "Medium",
//       },
//       {
//         title: "Protecting Your Personal Information",
//         content:
//           "Tips and best practices for safeguarding your personal data online and preventing identity theft...",
//         author: author2._id,
//         category: "Fraud Awareness",
//         readingTimeMinutes: 6,
//         difficulty: "Medium",
//       },
//     ]);

//     const articleIds1 = articles.slice(0, 3).map((a) => a._id);
//     const articleIds2 = articles.slice(3, 5).map((a) => a._id);

//     // 5. Insert dummy Quiz documents (one for each question)
//     console.log("Inserting quiz data...");
//     const quizzes = await Quiz.insertMany([
//       // Quiz questions for the first article in module 1
//       {
//         question: "What is the primary purpose of creating a budget?",
//         options: [
//           {
//             option: "To track and manage income and expenses",
//             isCorrect: true,
//           },
//           { option: "To spend money without limits", isCorrect: false },
//           { option: "To find a new job", isCorrect: false },
//         ],
//         article: articles[0]._id,
//         difficulty: "easy",
//       },
//       {
//         question: "Which of these is a budgeting method?",
//         options: [
//           { option: "The 50/30/20 Rule", isCorrect: true },
//           { option: "The 100% Rule", isCorrect: false },
//           { option: "The Credit Card Rule", isCorrect: false },
//         ],
//         article: articles[1]._id,
//         difficulty: "easy",
//       },
//       // Quiz questions for articles in module 2
//       {
//         question: "What is phishing?",
//         options: [
//           { option: "A type of online game", isCorrect: false },
//           {
//             option: "An attempt to trick you into revealing personal info",
//             isCorrect: true,
//           },
//           { option: "A method of online shopping", isCorrect: false },
//         ],
//         article: articles[3]._id,
//         difficulty: "medium",
//       },
//       {
//         question: "What should you do if you receive a suspicious email?",
//         options: [
//           { option: "Click all links in the email", isCorrect: false },
//           {
//             option: "Reply immediately with your bank details",
//             isCorrect: false,
//           },
//           { option: "Delete it and do not click any links", isCorrect: true },
//         ],
//         article: articles[4]._id,
//         difficulty: "medium",
//       },
//     ]);

//     // Now get the quiz IDs for each module
//     const quizIds1 = [quizzes[0]._id, quizzes[1]._id];
//     const quizIds2 = [quizzes[2]._id, quizzes[3]._id];

//     // 6. Insert dummy Module documents, referencing the new _id's
//     console.log("Inserting module data...");
//     const modules = await Module.insertMany([
//       {
//         name: "Foundations of Financial Planning",
//         description:
//           "An introductory module covering the basics of personal finance and budgeting.",
//         articles: articleIds1,
//         quizzes: quizIds1,
//         completionBadge: budgetingBadge._id,
//         completionCriteria: {
//           articlesToRead: 3,
//           quizzesToPass: 2,
//           minQuizScore: 80,
//         },
//       },
//       {
//         name: "Digital Fraud Awareness",
//         description:
//           "Learn to identify and protect yourself from common digital fraud and scams.",
//         articles: articleIds2,
//         quizzes: quizIds2,
//         completionBadge: fraudBadge._id,
//         completionCriteria: {
//           articlesToRead: 2,
//           quizzesToPass: 2,
//           minQuizScore: 70,
//         },
//       },
//     ]);

//     // 7. Update articles and quizzes with their module _id's
//     console.log("Updating foreign key references...");
//     await Article.updateMany(
//       { _id: { $in: articleIds1 } },
//       { $set: { module: modules[0]._id } }
//     );
//     await Article.updateMany(
//       { _id: { $in: articleIds2 } },
//       { $set: { module: modules[1]._id } }
//     );
//     await Quiz.updateMany(
//       { _id: { $in: quizIds1 } },
//       { $set: { module: modules[0]._id } }
//     );
//     await Quiz.updateMany(
//       { _id: { $in: quizIds2 } },
//       { $set: { module: modules[1]._id } }
//     );

//     // 8. Update badges with the module _id as the criteriaValue
//     console.log("Updating badge criteria values...");
//     await Badge.findByIdAndUpdate(budgetingBadge._id, {
//       $set: { criteriaValue: modules[0]._id },
//     });
//     await Badge.findByIdAndUpdate(fraudBadge._id, {
//       $set: { criteriaValue: modules[1]._id },
//     });

//     console.log("Database seeded successfully!");
//   } catch (error) {
//     console.error("Error seeding database:", error);
//   } finally {
//     mongoose.connection.close();
//   }
// };

// // Execute the seeding script
// seedDatabase();
