const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");
const { dto } = require("../utils/functions");
module.exports = jwtMiddlewareHandler("get-store")
  .use(async (context, req) => {
    const store = context.bindings.stores[0];

    if (!store) {
      context.res = dto(400, {}, "Store not found");
      return context.done();
    }

    switch (req.method.toLowerCase()) {
      case "get":
        context.res = dto(200, store.defaultTax);
        context.done();
        break;
      case "put":
        if (!req.body || !req.body.defaultTax) {
          context.res = dto(400, {}, "Default tax is required");
          return context.done();
        }
        store.defaultTax = req.body.defaultTax;
        context.bindings.addStore = JSON.stringify({
          ...store,
          id: req.params.id,
        });
        context.res = dto(200, store);
        return context.done();
    }
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
