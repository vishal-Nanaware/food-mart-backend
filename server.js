const express = require("express");
var cors = require("cors");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const dotenv = require("dotenv");
require("dotenv").config();

app.use(cors());
app.use(express.json());

async function connect() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("db connected");
  } catch (error) {
    console.log(error);
  }
}
connect();

const userScheama = new mongoose.Schema({
  userName: String,
  userPassword: String,
  userEmail: String,
  otp: { type: mongoose.Schema.Types.ObjectId, ref: "otp" },
});

const otpScheama = new mongoose.Schema({
  otp: String,
  createdAt: { type: Date, default: Date.now, expires: 360 },
});

const user = mongoose.model("user", userScheama);
const otp = mongoose.model("otp", otpScheama);

app.get("/", (req, res) => {
  res.send("hii");
});

app.post("/signIn", async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  let userFind = await user.findOne({ userName: username });

  if (!userFind) {
    console.log("user not found");
    res.status(401).json({ msg: "invalid username" });
    return;
  }

  if (!password == userFind.userPassword) {
    res.status(401).json({ msg: "invalid username" });
    return;
  }

  res.status(200).json({
    user: userFind.userName,
  });
});

//userNamecheck middleware
async function userNameCheck(req, res, next) {
  const username = req.body.username;

  try {
    const existingUser = await user.findOne({ userName: username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }
    next();
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error" });
  }
}

app.post("/create", userNameCheck, async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let email = req.body.email;

  let newUser = new user({
    userName: username,
    userPassword: password,
    userEmail: email,
  });

  await newUser.save();
  console.log(`Username: ${username}, Email: ${email}`);
  res.json({
    msg: "user created successfully",
  });
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});

app.post("/forgetPassword", async (req, res) => {
  const { email } = req.body;
  const otpCode = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
  console.log(otpCode);
  try {
    const existingUser = await user.findOne({ userEmail: email });

    if (!existingUser) {
      return res.status(401).json({ msg: "Invalid email" });
    }

    // Create a new OTP document
    const newOtp = new otp({ otp: otpCode });
    const savedOtp = await newOtp.save();

    // Update the user with the reference to the new OTP
    existingUser.otp = savedOtp._id;
    await existingUser.save();

    res.status(200).json({ temporaryUser: existingUser.userName }); // You might not want to send the OTP in the response for security reasons
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

app.post("/verify-otp", async (req, res) => {
  let forgetpasswordUser = req.body.forgetpasswordUser;
  let enterOtp = req.body.otp;
  try {
    const fuser = await user
      .findOne({ userName: forgetpasswordUser })
      .populate("otp");
    if (!fuser || !fuser.otp) {
      return res.status(400).json({ msg: "Invalid OTP not found" });
    }
    if (fuser.otp.otp === enterOtp) {
      // Success: OTP is valid
      res.json({ msg: "OTP verified successfully" });
      fuser.otp = null;
      await fuser.save();
    }
    
  } catch (e) {
    console.log(e);
  }
});
