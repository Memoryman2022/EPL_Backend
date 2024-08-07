const express = require("express");
const router = express.Router();
const axios = require("axios");
const RealResult = require("../models/RealResult.model.js");
const { authenticateToken } = require("../middleware/authenticateToken.js");

// Fetch and update match results
router.get("/updateResults", authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.football-data.org/v4/competitions/2021/matches?status=FINISHED",
      {
        headers: {
          "X-Auth-Token": process.env.FOOTBALL_API_TOKEN,
        },
      }
    );
    const matches = response.data.matches;
    for (const match of matches) {
      const outcome = getOutcomeFromScore(match.score);
      const realResultData = {
        fixtureId: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        homeScore: match.score.fullTime.homeTeam,
        awayScore: match.score.fullTime.awayTeam,
        outcome,
        date: match.utcDate,
      };
      // Upsert the match result to the database
      await RealResult.findOneAndUpdate(
        { fixtureId: match.id },
        realResultData,
        {
          upsert: true,
          new: true,
        }
      );
    }
    res.status(200).json({ message: "Match results updated successfully" });
  } catch (error) {
    console.error("Error updating match results:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Fetch match result by fixture ID
router.get("/:fixtureId", authenticateToken, async (req, res) => {
  try {
    const { fixtureId } = req.params;
    console.log("Querying for fixtureId:", fixtureId);

    // Validate fixtureId if needed
    if (!fixtureId || isNaN(fixtureId)) {
      return res.status(400).json({ message: "Invalid fixture ID" });
    }

    const result = await RealResult.findOne({ fixtureId: Number(fixtureId) });
    console.log("Query result:", result);

    if (!result) {
      return res.status(404).json({ message: "Match result not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching match result:", error);
    res.status(500).json({ message: "Failed to fetch match result" });
  }
});

// Helper function to determine outcome
const getOutcomeFromScore = (score) => {
  if (score.winner === "HOME_TEAM") return "homeWin";
  if (score.winner === "AWAY_TEAM") return "awayWin";
  if (score.winner === "DRAW") return "draw";
  return "unknown";
};

module.exports = router;
