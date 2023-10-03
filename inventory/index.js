const { dto, validateSchema } = require("../utils/functions");
const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");
const { inventorySchema } = require("../utils/schema");

module.exports = jwtMiddlewareHandler("employee")
  .use(async (context, req) => {
    switch (req.method.toLowerCase()) {
      case "get":
        const inventory = context.bindings.employees;
        if (req.params.id) {
          const item = inventory.find((emp) => emp.id === req.params.id);
          if (!item) {
            context.res = dto(400, {}, "Inventory item not found");
            context.done();
            return;
          }
          context.res = dto(200, item);
          context.done();
          return;
        }
        context.res = dto(
          200,
          !req.query.searchText
            ? inventory
            : inventory.filter((inv) =>
                inv.product_name
                  .toLowerCase()
                  .includes(req.query.searchText?.toLowerCase())
              )
        );
        context.done();
        break;
      case "post":
        const result = validateSchema(req.body, inventorySchema);
        if (result.error) {
          context.res = dto(400, {}, result.error.details[0].message);
          context.done();
          return;
        }
        const found = context.bindings.employees.find(
          (inv) =>
            inv.product_id === req.body.product_id &&
            inv.price.type === req.body.price.type
        );
        const history = {
          TID: req.body.product_id,
          createdOn: new Date(),
          TransactionType: "Add",
          quantity: req.body.price.quantity,
          product: {
            sku: req.body.sku,
            name: req.body.product_name,
            category: req.body.category_name,
          },
          customer: "",
          paymentType: "",
          store: req.body.store,
          amount: req.body.price.unit_sell_price,
          cogs: req.body.price.unit_purchase_price,
          processedBy: req.decoded.firstName + " " + req.decoded.lastName,
          isActive: true,
        };
        if (found) {
          context.bindings.addTransactionHistory = JSON.stringify(history);
          context.bindings.addEmployee = JSON.stringify({
            ...req.body,
            id: found.id,
            isActive: true,
          });
          context.res = dto(200, req.body);
          context.done();
          return;
        }
        context.bindings.addTransactionHistory = JSON.stringify(history);
        context.bindings.addEmployee = JSON.stringify({
          ...req.body,
          isActive: true,
        });
        context.res = dto(200, req.body);
        context.done();
        break;
      case "put":
        const res = validateSchema(req.body, inventorySchema);
        if (res.error) {
          context.res = dto(400, {}, res.error.details[0].message);
          context.done();
          return;
        }
        context.bindings.addEmployee = JSON.stringify({
          ...req.body,
          id: req.params.id,
        });
        context.res = dto(200, req.body);
        context.done();
        break;
      case "delete":
        const item = context.bindings.employees.find(
          (emp) => emp.id === req.query.id
        );
        if (!item) {
          return (context.res = dto(400, {}, "Inventory item not found"));
        }
        const tHistory = {
          TID: item.product_id,
          createdOn: new Date(),
          TransactionType: "Delete",
          quantity: item.price.quantity,
          product: {
            sku: item.sku,
            name: item.product_name,
            category: item.category_name,
          },
          customer: "",
          paymentType: "",
          store: item.store,
          amount: item.price.unit_sell_price,
          cogs: item.price.unit_purchase_price,
          processedBy: req.decoded.firstName + " " + req.decoded.lastName,
          isActive: true,
        };
        item.isActive = false;
        context.bindings.addTransactionHistory = JSON.stringify(tHistory);
        context.bindings.addEmployee = JSON.stringify(item);
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
