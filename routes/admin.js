const express = require("express");
const router = express.Router();
const product = require("../models/product");
const data = require("../mockdata.json");

router.get("/",async (req, res) => {
  let  data = await product.find({});
  res.json({data:data})
});

router.post("/addproduct", async (req, res) => {
  const { name, description, category, price, calories } = req.body;
  let newProduct = new product({
    productName: name,
    productCategory: category,
    productPrice: price,
    productCalrie: calories,
    productDescription: description,
  });
 await newProduct.save().then(console.log("saved"))

});



module.exports = router;
