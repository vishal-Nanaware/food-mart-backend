const mongoose = require("mongoose");

const userScheama = new mongoose.Schema({
  userName: String,
  userPassword: String,
  userEmail: String,
  otp: { type: mongoose.Schema.Types.ObjectId, ref: "otp" },
});

const User = mongoose.model("user", userScheama);

module.exports = User;
