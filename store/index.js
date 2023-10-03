const { dto, validateSchema } = require("../utils/functions");
const { storeSchema } = require("../utils/schema");
const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");

module.exports = jwtMiddlewareHandler("store")
  .use(async (context, req) => {
    switch (req.method.toLowerCase()) {
      case "get":
        const stores = context.bindings.stores;
        if (req.params.id) {
          const store = stores.find((emp) => emp.id === req.params.id);
          context.res = dto(200, store);
          context.done();
          return;
        }
        context.res = dto(200, stores);
        context.done();
        break;
      case "post":
        const result = validateSchema(req.body, storeSchema);
        if (result.error) {
          context.res = dto(400, {}, result.error.details[0].message);
          context.done();
          return;
        }
        context.bindings.addStore = JSON.stringify({
          ...req.body,
          isActive: true,
        });
        context.res = dto(200, req.body);
        context.done();
        break;
      case "put":
        const res = validateSchema(req.body, storeSchema);
        if (res.error) {
          context.res = dto(400, {}, res.error.details[0].message);
          context.done();
          return;
        }
        context.bindings.addStore = JSON.stringify({
          ...req.body,
          isActive: true,
          id: req.params.id,
        });
        context.res = dto(200, req.body);
        context.done();
        break;
      case "delete":
        const store = context.bindings.stores.find(
          (emp) => emp.id === req.params.id
        );
        store.isActive = false;
        context.bindings.addStore = JSON.stringify(store);
        context.res = dto(200, store);
        context.done();
        break;
    }
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
