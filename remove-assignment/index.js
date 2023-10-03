const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");
const { dto, validateSchema } = require("../utils/functions");
const { assignEmployeesSchema } = require("../utils/schema");
module.exports = jwtMiddlewareHandler("get-store")
  .use(async (context, req) => {
    const store = context.bindings.stores[0];

    if (!store) {
      context.res = dto(400, {}, "Store not found");
      return context.done();
    }
    const result = validateSchema(req.body, assignEmployeesSchema);
    if (result.error) {
      context.res = dto(400, {}, result.error.details[0].message);
      context.done();
      return;
    }
    store.employees = store.employees.filter(
      (emp) => !req.body.some((bdy) => bdy.id === emp.id)
    );
    context.bindings.addStore = JSON.stringify(store);  

    context.res = dto(200, store);
    return context.done();
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
