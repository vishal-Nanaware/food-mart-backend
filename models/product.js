const mongoose = require("mongoose");

const productScheam = new mongoose.Schema({
  productName: String,
  productCategory: String,
  productPrice: String,
  productCalrie: String,
  productDescription: String,
});

const Product = mongoose.model("product", productScheam);

module.exports = Product;