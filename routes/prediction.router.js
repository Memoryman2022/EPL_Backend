const express = require("express");
const router = express.Router();
const Prediction = require("../models/Predictions.model");
const { authenticateToken } = require("../middleware/authenticateToken.js");

router.post("/", authenticateToken, async (req, res) => {
  const { fixtureId, userId, homeScore, awayScore, outcome } = req.body;

  if (
    !fixtureId ||
    !userId ||
    homeScore === undefined ||
    awayScore === undefined ||
    !outcome
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const newPrediction = new Prediction({
      fixtureId,
      userId,
      homeScore,
      awayScore,
      outcome,
    });

    await newPrediction.save();

    res.status(201).json(newPrediction);
  } catch (error) {
    console.error("Error saving prediction:", error);
    res
      .status(400)
      .json({ message: "Error saving prediction", error: error.message });
  }
});

module.exports = router;
