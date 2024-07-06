const zod = require("zod")
const jwt = require('jsonwebtoken')


async function orderValidation(req,res,next){
  
  const verifyToken = req.body.token;
  const userOrder = req.body.userOrder;

  const orderValidationSchema = zod.object({
    userName: zod.string().min(5, "not valid"),
    phoneNumber: zod.string().min(10, "not valid"),
    address: zod.string().min(10, "invalid"),
    quantity: zod.number(),
    productId: zod.string(),
  });
  let userName = userOrder.name
  let phoneNumber = userOrder.phoneNumber
  let address = userOrder.address
  let quantity = parseInt(userOrder.formQuaValue);
  let productId = userOrder.productId
  try{
    orderValidationSchema.parse({userName ,phoneNumber,address,quantity,productId})
    next()
  }catch(e){
    console.log("error from ordervalidation :" , e)
  }

}

module.exports = orderValidation;