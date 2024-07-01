const express = require('express')
const router = express.Router()
const data = require("../mockdata.json")
const product = require("../models/product")



router.get("/",async (req, res) => {
  const products =await product.find({})
  res.json(products)
});
router.post("/ProductId", async (req, res) => {
  const ProductId = req.query.ProductId;
  
  let item = await product.findById({ _id: ProductId });
  res.json(item);
});

router.post("/category",async (req,res)=>{
  const category = req.body.category;
  try{
    const products = await product.find({ productCategory : category});
    res.json(products)
  }catch(e){
    console.log("error: ", e)
  }

});

module.exports = router;