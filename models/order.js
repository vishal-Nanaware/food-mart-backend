const mongoose = require("mongoose")

const order = new mongoose.Schema({
    userId:String,
    phoneNumber:Number,
    address:String,
    productId:String,
    paymentType:String,
    billTotalAmount:Number,
    status:String
});

const orders = mongoose.model('order', order)

module.exports = orders;