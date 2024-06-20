const mongoose = require("mongoose")

const otpScheama = new mongoose.Schema({
  otp: String,
  createdAt: { type: Date, default: Date.now, expires: 360 },
});

const otp = mongoose.model("otp", otpScheama);

module.exports = otp;