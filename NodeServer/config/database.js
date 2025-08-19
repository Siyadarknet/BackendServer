const mongoose = require("mongoose");
require("dotenv").config();

// DB connction handler
const dbConnect = () => {
  mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => console.log("Database connected"))
    .catch((error) => {
      console.log("ISSUE IN DB CONNECTION");
      console.error(error.message);
      process.exit(1);
    });
};
module.exports = dbConnect;
