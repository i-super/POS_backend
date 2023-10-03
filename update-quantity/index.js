const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");
const { dto, validateSchema } = require("../utils/functions");
const { assignUserSchema, updateQuantitySchema } = require("../utils/schema");
module.exports = jwtMiddlewareHandler("get-store")
  .use(async (context, req) => {
    const product = context.bindings.products[0];

    if (!product) {
      context.res = dto(400, {}, "Product not found");
      return context.done();
    }
    const result = validateSchema(req.body, updateQuantitySchema);
    if (result.error) {
      context.res = dto(400, {}, result.error.details[0].message);
      context.done();
      return;
    }
    product.price.quantity =
      parseInt(product.price.quantity) + req.body.price.quantity + "";
    product.price.unit_purchase_price = req.body.price.unit_purchase_price;
    product.price.unit_sell_price = req.body.price.unit_sell_price;
    product.price.type = req.body.price.type;
    context.bindings.addProduct = JSON.stringify(product);

    context.res = dto(200, product);
    return context.done();
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
