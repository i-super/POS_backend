const { dto, validateSchema } = require("../utils/functions");
const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");
const { inventorySchema, categorySchema } = require("../utils/schema");

module.exports = jwtMiddlewareHandler("employee")
  .use(async (context, req) => {
    switch (req.method.toLowerCase()) {
      case "get":
        const inventory = context.bindings.categories;
        if (req.params.id) {
          const item = inventory.find((emp) => emp.id === req.params.id);
          if (!item) {
            context.res = dto(400, {}, "Category not found");
            context.done();
            return;
          }
          context.res = dto(200, item);
          context.done();
          return;
        }
        context.res = dto(200, inventory);
        context.done();
        break;
      case "post":
        const result = validateSchema(req.body, categorySchema);
        if (result.error) {
          context.res = dto(400, {}, result.error.details[0].message);
          context.done();
          return;
        }
        context.bindings.addCategory = JSON.stringify({
          ...req.body,
          isActive: true,
        });
        context.res = dto(200, req.body);
        context.done();
        break;
      case "put":
        const res = validateSchema(req.body, categorySchema);
        if (res.error) {
          context.res = dto(400, {}, res.error.details[0].message);
          context.done();
          return;
        }
        context.bindings.addCategory = JSON.stringify({
          ...req.body,
          id: req.params.id,
        });
        context.res = dto(200, req.body);
        context.done();
        break;
      case "delete":
        const item = context.bindings.categories.find(
          (emp) => emp.id === req.params.id
        );
        if (!item) {
          return (context.res = dto(400, {}, "Category not found"));
        }
        item.isActive = false;
        context.bindings.addCategory = JSON.stringify(item);
        context.res = dto(200, item);
        context.done();
        break;
    }
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
