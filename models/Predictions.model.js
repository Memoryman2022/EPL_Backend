const mongoose = require("mongoose");

const PredictionSchema = new mongoose.Schema({
  fixtureId: {
    type: Number,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  homeScore: {
    type: Number,
    required: true,
  },
  awayScore: {
    type: Number,
    required: true,
  },
  outcome: {
    type: String,
    required: true,
    enum: ["homeWin", "awayWin", "draw"],
  },
});

module.exports = mongoose.model("Prediction", PredictionSchema);
