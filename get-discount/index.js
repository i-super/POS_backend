const { dto } = require("../utils/functions");
const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");

module.exports = jwtMiddlewareHandler("store")
  .use(async (context) => {
    const discount = context.bindings.stores[0];
    if (!discount) {
      context.res = dto(400, {}, "Store not found");
      return context.done();
    }
    context.res = dto(200, discount);
    return context.done();
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
