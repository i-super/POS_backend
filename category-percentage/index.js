const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");
const { dto, validateSchema } = require("../utils/functions");
const {
  notificationSchema,
  categoryPercentageSchema,
} = require("../utils/schema");
module.exports = jwtMiddlewareHandler("receiptDetails")
  .use(async (context, req) => {
    const store = context.bindings.stores[0];

    if (!store) {
      context.res = dto(400, {}, "Store not found");
      return context.done();
    }
    switch (req.method.toLowerCase()) {
      case "get":
        context.res = dto(200, store.categoryPercentage);
        return context.done();
        break;
      case "post":
        const result = validateSchema(req.body, categoryPercentageSchema);
        if (result.error) {
          context.res = dto(400, {}, result.error.details[0].message);
          context.done();
          return;
        }
        store.categoryPercentage = store.categoryPercentage || [];
        store.categoryPercentage.push(req.body);

        context.bindings.addStore = JSON.stringify(store);

        context.res = dto(200, store);
        return context.done();
        break;
      case "delete":  
        if (!req.body?.id) {
          context.res = dto(400, {}, "Category percentage is required");
          context.done();
          return;
        }
        store.categoryPercentage = store.categoryPercentage || [];
        store.categoryPercentage = store.categoryPercentage.filter(
          (not) => not.id !== req.body.id
        );
        context.bindings.addStore = JSON.stringify(store);

        context.res = dto(200, store);
        return context.done();
    }
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
