const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");
const { dto, validateSchema } = require("../utils/functions");
const { notificationSchema } = require("../utils/schema");
module.exports = jwtMiddlewareHandler("receiptDetails")
  .use(async (context, req) => {
    const customer = context.bindings.customers[0];

    if (!customer) {
      context.res = dto(400, {}, "Customer not found");
      return context.done();
    }
    switch (req.method.toLowerCase()) {
      case "get":
        context.res = dto(200, customer.notification);
        return context.done();
        break;
      case "post":
        const result = validateSchema(req.body, notificationSchema);
        if (result.error) {
          context.res = dto(400, {}, result.error.details[0].message);
          context.done();
          return;
        }
        customer.notification = customer.notification || [];
        if (!customer.notification.find((not) => not.id === req.body.id)) {
          customer.notification.push(req.body);
        }

        context.bindings.addCustomer = JSON.stringify(customer);

        context.res = dto(200, customer);
        return context.done();
        break;
      case "delete":
        if (!req.body?.id) {
          context.res = dto(400, {}, "Notification id is required");
          context.done();
          return;
        }
        customer.notification = customer.notification.filter(
          (not) => not.id !== req.body.id
        );
        context.bindings.addCustomer = JSON.stringify(customer);

        context.res = dto(200, customer);
        return context.done();
    }
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
