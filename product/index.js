const { dto } = require("../utils/functions");
const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");

module.exports = jwtMiddlewareHandler("store")
  .use(async (context) => {
    const customers = context.bindings.inventory;
    if (customers.length > 0) {
      context.res = dto(200, customers);
      return context.done();
    }
    context.res = dto(400, {}, "Product is not available in our inventory");
    return context.done();
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
