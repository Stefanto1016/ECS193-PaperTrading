const mongoose = require("mongoose");

const leaderboard = mongoose.Schema(
{
    userKey: String,
    score: Number,
    date: String
})

module.exports = mongoose.model("leaderboard", leaderboard);