const express = require("express");
var cors = require("cors");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
require("dotenv").config();
const userRouter = require("./routes/user");
const productRouter = require("./routes/product")

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

app.use("/user", userRouter);
app.use("/product",productRouter);

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
