const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require("jsonwebtoken");
const user = require("../models/user");
const otp = require("../models/otp");
const zod = require("zod");
const { z } = zod;
const router = express.Router();
const data = require("../mockdata.json")



// signIn user handler
router.post("/signIn", async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  let userFind = await user.findOne({ userName: username });

  if (!userFind) {
    console.log("user not found");
    res.status(401).json({ msg: "invalid username" });
    return;
  }
  const match = await bcrypt.compare(password, userFind.userPassword);
  if (!match) {
    res.status(401).json({ msg: "invalid username" });
    return;
  }

  var token = jwt.sign({ username: username }, process.env.jwtPassword);
  res.status(200).json({
    token: token,
    user: username,
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

async function inputValidation(req, res, next) {
  const { username, password, email } = req.body;

  try {
    const UserSchema = z.object({
      username: z.string().min(1, "Username is required"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      email: z.string().email("Invalid email address"),
    });

    UserSchema.parse({ username, password, email });
    next();
  } catch (error) {
    console.error("Validation failed:", error);
    res.status(401).json({ msg: "Invalid inputs", errors: error.errors });
  }
}
//create user handler
router.post("/create", inputValidation, userNameCheck, async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let email = req.body.email;

  let salt = await bcrypt.genSalt(10);
  let hash = await bcrypt.hash(password, salt);

  let newUser = new user({
    userName: username,
    userPassword: hash,
    userEmail: email,
  });

  await newUser.save();
  console.log(`Username: ${username}, Email: ${email}`);
  res.json({
    msg: "user created successfully",
  });
});

//forget password handler
router.post("/forgetPassword", async (req, res) => {
  const { email } = req.body;
  const otpCode = Math.floor(100000 + Math.random() * 900000);
  console.log(otpCode);
  try {
    const existingUser = await user.findOne({ userEmail: email });

    if (!existingUser) {
      return res.status(401).json({ msg: "Invalid email" });
    } else {
      const newOtp = new otp({ otp: otpCode });
      const savedOtp = await newOtp.save();

      existingUser.otp = savedOtp._id;
      await existingUser.save();
      var temporaryToken = jwt.sign(
        existingUser.userName,
        process.env.jwtPasswordT
      );
      res.status(200).json({ temporaryUserToken: temporaryToken });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

//verify otp handler
router.post("/verify-otp", async (req, res) => {
  let temporaryUserToken = req.body.temporaryUserToken;
  let enterOtp = req.body.otp;
  let tokenUser;
  try {
    tokenUser = jwt.verify(temporaryUserToken, process.env.jwtPasswordT);
    console.log(tokenUser);
  } catch (error) {
    return res.status(401).json({ msg: "Invalid or expired token" });
  }

  try {
    const fuser = await user.findOne({ userName: tokenUser }).populate("otp");
    if (!fuser || !fuser.otp) {
      return res.status(400).json({ msg: "Invalid OTP not found" });
    }
    if (fuser.otp.otp === enterOtp) {
      fuser.otp = null;
      await fuser.save();

      var token = jwt.sign(tokenUser, process.env.jwtPassVerify);
      res
        .status(200)
        .json({ msg: "OTP verified successfully", verifyUserToken: token });
    }
  } catch (e) {
    console.log(e);
  }
});

//change password handler
router.post("/changePassword", async (req, res) => {
  let newPassword = req.body.newPassword;
  let verifyUserToken = req.body.verifyUserToken;
  let verifyUser;

  try {
    verifyUser = jwt.verify(verifyUserToken, process.env.jwtPassVerify);
    console.log(verifyUser);
  } catch (error) {
    return res.status(401).json({ msg: "Invalid or expired token" });
  }

  try {
    const salt = bcrypt.genSalt(10);
    const hash = bcrypt.hash(newPassword, salt);
    let updateUser = await user.findOneAndUpdate(
      { userName: verifyUser },
      { $set: { userPassword: hash } }
    );

    if (!updateUser) {
      res.status(401).json({ msg: "internal server error" });
    }
    res.json({ msg: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ msg: "An error occurred" });
  }
});

module.exports = router;
