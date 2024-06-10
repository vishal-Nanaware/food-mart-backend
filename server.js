const express = require("express");
var cors = require("cors");
const app = express();
const port = 3000;
const mongoose = require("mongoose");


app.use(cors());
app.use(express.json());

async function connect() {
  try {
    await mongoose.connect(
      //mongo url
    );
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
});

const user = mongoose.model("user", userScheama);

const users = [];


app.get("/", (req, res) => {

  // res.redirect("http://localhost:3000/createAccount.html");
  res.send("hii");
});

app.post("/signIn", async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  let userFind = await user.findOne({userName:username})
 
 
  if(!userFind){
    res.status(401).json({msg:"invalid username"})
  }

  if(!password == userFind.userPassword){
    res.status(401).json({ msg: "invalid username" });
  }
  res.status(200).json({user:userFind.userName})
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
