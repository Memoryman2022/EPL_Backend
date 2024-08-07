// models/RealResult.model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const realResultSchema = new Schema({
  fixtureId: { type: Number, required: true, unique: true },
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  homeScore: { type: Number, required: true },
  awayScore: { type: Number, required: true },
  outcome: { type: String, required: true },
  date: { type: Date, required: true },
});

const RealResult = mongoose.model("RealResult", realResultSchema, "results");

module.exports = RealResult;
