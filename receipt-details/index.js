const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");
const { dto, validateSchema } = require("../utils/functions");
const { receiptDetailsSchema } = require("../utils/schema");
module.exports = jwtMiddlewareHandler("receiptDetails")
  .use(async (context, req) => {
    const store = context.bindings.store[0];

    if (!store) {
      context.res = dto(400, {}, "Store not found");
      return context.done();
    }
    const result = validateSchema(req.body, receiptDetailsSchema);
    if (result.error) {
      context.res = dto(400, {}, result.error.details[0].message);
      context.done();
      return;
    }
    store.returnPolicy = req.body.returnPolicy;
    store.logo = req.body.logo;

    context.bindings.addStore = JSON.stringify(store);

    context.res = dto(200, store);
    return context.done();
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
