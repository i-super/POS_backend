const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");
const { dto, validateSchema } = require("../utils/functions");
const { assignUserSchema } = require("../utils/schema");
module.exports = jwtMiddlewareHandler("get-store")
  .use(async (context, req) => {
    const store = context.bindings.stores[0];

    if (!store) {
      context.res = dto(400, {}, "Store not found");
      return context.done();
    }
    const result = validateSchema(req.body, assignUserSchema);
    if (result.error) {
      context.res = dto(400, {}, result.error.details[0].message);
      context.done();
      return;
    }
    store.manager = req.body;
    context.bindings.addStore = JSON.stringify(store);

    context.res = dto(200, store);
    return context.done();
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
