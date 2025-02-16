require("dotenv").config();

const MONGO_URI =
  process.env.NODE_ENV === "development"
    ? process.env.MONGODB_URI_LOCAL
    : process.env.DATABASE_URL;

const allowedOrigins = [
  "http://localhost:5173", // Frontend server
  process.env.ORIGIN, // Production frontend URL from environment variables
  "https://EPL2024.netlify.app",
];

module.exports = {
  MONGO_URI,
  allowedOrigins,
};
