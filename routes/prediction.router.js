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

  try {
    const existingPrediction = await Prediction.findOne({ fixtureId, userId });
    if (existingPrediction) {
      return res
        .status(400)
        .json({ message: "Prediction already exists for this fixture" });
    }

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
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/:userId", authenticateToken, async (req, res) => {
  try {
    const predictions = await Prediction.find({ userId: req.params.userId });
    res.status(200).json(predictions);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// New route to get predictions by fixtureId
router.get("/fixture/:fixtureId", authenticateToken, async (req, res) => {
  try {
    const predictions = await Prediction.find({
      fixtureId: req.params.fixtureId,
    });
    res.status(200).json(predictions);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Example routes in prediction.router.js
router.get("/", authenticateToken, async (req, res) => {
  try {
    const predictions = await Prediction.find({});
    res.json(predictions);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    console.error("Error details:", error.stack);

    res.status(500).json({ message: "Failed to fetch predictions" });
  }
});

module.exports = router;
