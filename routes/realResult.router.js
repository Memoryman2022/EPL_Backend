const express = require("express");
const router = express.Router();
const RealResult = require("../models/RealResult.model");
const Prediction = require("../models/Predictions.model");
const User = require("../models/User.model");
const updateUserPositionsAndMovements = require("../utils/userPosition");

// Route to fetch all real results
router.get("/", async (req, res, next) => {
  try {
    const realResults = await RealResult.find();
    res.status(200).json(realResults);
  } catch (error) {
    console.error("Error fetching real results:", error);
    next(error);
  }
});

// Route to fetch the real result of a specific game
router.get("/:gameId/result", async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const realResult = await RealResult.findOne({ gameId });

    if (!realResult) {
      console.warn(`Real result not found for game ID: ${gameId}`);
      return res.status(404).json({ message: "Real result not found" });
    }

    res.status(200).json(realResult);
  } catch (error) {
    console.error(`Error fetching real result for game ID: ${gameId}`, error);
    next(error);
  }
});

// Route to save the real result for a specific game
router.post("/:gameId/result", async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { team1, team2, team1Score, team2Score, outcome } = req.body;

    console.log(`Saving real result for game ID: ${gameId}`);
    console.log(
      `Team 1: ${team1}, Team 2: ${team2}, Team 1 Score: ${team1Score}, Team 2 Score: ${team2Score}, Outcome: ${outcome}`
    );

    // Ensure the data matches the schema
    if (
      typeof gameId !== "string" ||
      typeof team1 !== "string" ||
      typeof team2 !== "string" ||
      typeof team1Score !== "number" ||
      typeof team2Score !== "number" ||
      !["team1", "draw", "team2"].includes(outcome)
    ) {
      throw new Error("Data does not match schema requirements");
    }

    const realResult = await RealResult.findOneAndUpdate(
      { gameId },
      { gameId, team1, team2, team1Score, team2Score, outcome },
      { new: true, upsert: true }
    );

    console.log("Real result saved:", realResult);

    // Fetch all predictions for this game
    const predictions = await Prediction.find({ gameId });
    console.log(
      `Found ${predictions.length} predictions for game ID: ${gameId}`
    );

    // Update user scores based on predictions
    for (const prediction of predictions) {
      let points = 0;
      let correctScore = false;
      let correctOutcome = false;

      // Correct score prediction
      if (
        prediction.team1Score === team1Score &&
        prediction.team2Score === team2Score
      ) {
        points += 5;
        correctScore = true;
      }

      // Correct outcome prediction
      if (prediction.predictedOutcome === outcome) {
        points += 2;
        correctOutcome = true;
      }

      // Log the prediction details for debugging
      console.log(`Prediction details:`, {
        userId: prediction.userId,
        gameId: prediction.gameId,
        team1Score: prediction.team1Score,
        team2Score: prediction.team2Score,
        predictedOutcome: prediction.predictedOutcome,
        realTeam1Score: team1Score,
        realTeam2Score: team2Score,
        realOutcome: outcome,
        pointsAwarded: points,
        correctScore,
        correctOutcome,
      });

      // Update the user's score
      const user = await User.findById(prediction.userId);
      if (user) {
        user.score += points;
        if (correctScore) user.correctScores += 1;
        if (correctOutcome) user.correctOutcomes += 1;
        await user.save();
        console.log(`Updated score for user ${user._id}: ${user.score}`);
      }
    }

    // Update user positions and movements
    await updateUserPositionsAndMovements();

    // Update group standings
    await updateGroupStandings();

    res
      .status(200)
      .json({ message: "Real result and user scores updated successfully" });
  } catch (error) {
    console.error("Error saving real result or updating user scores:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
