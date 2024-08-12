const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User.model");
const { authenticateToken } = require("../middleware/authenticateToken");
const { AppError } = require("../middleware/errorHandling");

// Get user details (protected)
router.get(
  "/protected/user/:userId",
  authenticateToken,
  async (req, res, next) => {
    console.log("Requested user ID:", req.params.userId);
    try {
      const userId = req.params.userId;

      if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
        throw new AppError("Invalid user ID", 400);
      }

      const user = await User.findById(req.params.userId);

      if (!user) {
        throw new AppError("User not found", 404);
      }

      const {
        _id,
        email,
        userName,
        profileImage,
        score,
        position,
        movement,
        previousPosition,
      } = user;

      res.status(200).json({
        _id,
        email,
        userName,
        profileImage,
        score,
        position,
        movement,
        previousPosition,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Find all users and update positions
router.get("/", async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ score: -1 });

    console.log("Fetched users:", users);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    next(error);
  }
});

// Update user scores
router.put("/updateScore", async (req, res, next) => {
  try {
    const { userId, score, correctScores, correctOutcomes } = req.body;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Update user score and statistics
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Set previous position before updating
    const previousPosition = user.position;

    // Update user fields
    user.score += score;
    user.correctScores += correctScores;
    user.correctOutcomes += correctOutcomes;
    user.previousPosition = previousPosition; // Ensure previousPosition is updated

    // Calculate the new position
    const allUsers = await User.find({}).sort({ score: -1 });
    const newPosition =
      allUsers.findIndex((u) => u._id.toString() === userId) + 1;

    user.position = newPosition;

    await user.save();

    res.status(200).json({ message: "User scores updated successfully" });
  } catch (error) {
    console.error("Error updating user scores:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to update user movements
router.put("/update-movements", async (req, res) => {
  const { users } = req.body;

  try {
    for (let userData of users) {
      await User.findByIdAndUpdate(userData._id, {
        movement: userData.movement,
        position: userData.position,
        previousPosition: userData.previousPosition,
      });
    }
    res.status(200).send({ message: "User movements updated successfully" });
  } catch (error) {
    res.status(500).send({ error: "Failed to update user movements" });
  }
});

// Update user scores (new route)
router.post("/updateScore", async (req, res, next) => {
  try {
    const { userId, score } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user ID", 400);
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.score = score;
    await user.save();

    res.status(200).json({ message: "Score updated successfully" });
  } catch (error) {
    console.error("Error updating score:", error);
    next(error);
  }
});

module.exports = router;
