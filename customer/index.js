const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");
const { dto, validateSchema } = require("../utils/functions");
const { customerSchema } = require("../utils/schema");

module.exports = jwtMiddlewareHandler("customer")
  .use(async (context, req) => {
    switch (req.method.toLowerCase()) {
      case "get":
        const customers = context.bindings.customers;
        if (req.params.id) {
          const customer = customers.find((cus) => cus.id === req.params.id);
          if (!customer) {
            context.res = dto(400, {}, "Customer not found");
            context.done();
            return;
          }
          context.res = dto(200, customer);
          context.done();
          return;
        }
        context.res = dto(
          200,
          !req.query.searchText
            ? customers
            : customers.filter((cus) =>
                (cus.firstName + " " + cus.lastName)
                  .toLowerCase()
                  .includes(req.query.searchText?.toLowerCase())
              )
        );
        context.done();
        break;
      case "post":
        const result = validateSchema(req.body, customerSchema);
        if (result.error) {
          context.res = dto(400, {}, result.error.details[0].message);
          context.done();
          return;
        }
        req.body.notification = [];
        context.bindings.addCustomer = JSON.stringify({
          ...req.body,
          isActive: true,
        });
        context.res = dto(200, req.body);
        context.done();
        break;
      case "put":
        const res = validateSchema(req.body, customerSchema);
        if (res.error) {
          context.res = dto(400, {}, res.error.details[0].message);
          context.done();

          return;
        }
        context.bindings.addCustomer = JSON.stringify({
          ...req.body,
          id: req.params.id,
          isActive: true,
        });
        context.res = dto(200, req.body);
        context.done();

        break;
      case "delete":
        const all = context.bindings.customers;
        const single = all.find((cus) => cus.id === req.params.id);
        if (!single) {
          context.res = dto(400, {}, "Customer not found");
          context.done();
          return;
        }
        context.bindings.addCustomer = JSON.stringify({
          ...single,
          id: req.params.id,
          isActive: false,
        });
        context.res = dto(200, single);
        context.done();
        break;
    }
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
