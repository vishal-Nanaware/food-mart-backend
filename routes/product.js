const express = require("express");
const router = express.Router();
const data = require("../mockdata.json");
const product = require("../models/product");
const jwt = require("jsonwebtoken");
const user = require("../models/user");
const orderValidationSchema = require("../middleware/orderValidation");
const orders = require("../models/order")

router.get("/", async (req, res) => {
  const products = await product.find({});
  res.json(products);
});

router.post("/ProductId", async (req, res) => {
  const ProductId = req.query.ProductId;
  console.log(ProductId);
  let item = await product.findById({ _id: ProductId });
  res.json(item);
});

router.post("/category", async (req, res) => {
  const category = req.body.category;
  try {
    const products = await product.find({ productCategory: category });
    res.json(products);
  } catch (e) {
    console.log("error: ", e);
  }
});
function totalBill(price, quantity){
  if(quantity<1){
    return false
  }
  return price*quantity

}
router.post("/order", orderValidationSchema, async (req, res) => {
  let { token, userOrder } = req.body;
  try {
    let verifyUser = jwt.verify(token, process.env.jwtPassword);
     
     console.log(userOrder.productId);

    const orderProduct = await product.findById({
      _id: userOrder.productId,
    });
   const findUser = await user.findOne({ userName: verifyUser.username });
    const price = orderProduct.productPrice;
    const quantity = parseInt(userOrder.formQuaValue);
    let bill = totalBill(price , quantity)

    const newOrder = new orders({
      userName: findUser._id,
      phoneNumber: userOrder.phoneNumber,
      address: userOrder.address,
      productId: userOrder.productId,
      billTotalAmount: bill,
      status: "processing",
    });
    await newOrder.save().then(console.log("order saved"))
    console.log(
      `userName:${userOrder.name} | userPhone: ${userOrder.phoneNumber} | user: ${verifyUser.username} productId:${userOrder.productId} quantity: ${userOrder.formQuaValue} biil:${bill} userId: ${findUser._id} userAddress: ${userOrder.address}`
    );
    res.status(201).json({ data: userOrder });
  } catch (e) {
    console.log("user not found", e);
    res.json({ msg: "login access expire" });
  }
});

module.exports = router;
