const zod = require("zod");
const jwt = require("jsonwebtoken");

async function orderValidation(req, res, next) {
  const verifyToken = req.body.token;
  const userOrder = req.body.userOrder;

  const orderValidationSchema = zod.object({
    userId: zod.string().min(5, "not valid"),
    phoneNumber: zod.string().min(10, "not valid"),
    address: zod.string().min(10, "invalid"),
    quantity: zod.number(),
    productId: zod.string(),
  });
  let userId = userOrder.name;
  let phoneNumber = userOrder.phoneNumber;
  let address = userOrder.address;
  let quantity = parseInt(userOrder.formQuaValue);
  let productId = userOrder.productId;
  try {
    orderValidationSchema.parse({
      userId,
      phoneNumber,
      address,
      quantity,
      productId,
    });
    console.log("successfull validation");
    next();
  } catch (e) {
    console.log("error from ordervalidation :", e);
  }
}

module.exports = orderValidation;
