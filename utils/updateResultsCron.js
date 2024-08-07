// cron/updateResultsCron.js

const cron = require("node-cron");
const axios = require("axios");

const updateResults = async () => {
  try {
    await axios.get("http://localhost:3000/api/results/updateResults", {
      headers: {
        Authorization: `Bearer ${YOUR_API_TOKEN}`, // Use the actual token or authenticate differently if necessary
      },
    });
    console.log("Match results updated successfully");
  } catch (error) {
    console.error("Error updating match results:", error);
  }
};

// Schedule the task to run every day at midnight
cron.schedule("0 0 * * *", updateResults);
