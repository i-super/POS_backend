const { dto, getPaginatedData, validateSchema } = require("../utils/functions");
const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");
const { transactionSchema } = require("../utils/schema");

module.exports = jwtMiddlewareHandler("store")
  .use(async (context, req) => {
    const result = validateSchema(req.body, transactionSchema);
    const errors = [];
    if (result.error) {
      context.res = dto(400, {}, result.error.details[0].message);
      context.done();
      return;
    }
    let customer = await getPaginatedData(
      "Customers",
      "",
      "",
      1,
      11,
      { id: req.body.customer?.id },
      ""
    );
    let history = req.body.inventory.map((inv) => {
      return {
        TID: req.body.id,
        createdOn: new Date(),
        TransactionType: "Sale",
        quantity: inv.quantity,
        product: {
          sku: inv.sku,
          name: inv.item,
          category: inv.category,
        },
        customer: req.body.customer,
        paymentType: req.body.PaymentType,
        store: req.body.store,
        amount: inv.price,
        cogs: inv.cogs,
        processedBy: req.decoded.firstName + " " + req.decoded.lastName,
        isActive: true,
      };
    });
    req.body.createdOn = new Date();
    const ids = req.body.inventory.map((inv) => inv.sku);
    const skus = "(" + ids.map((s) => `"${s}"`).join(", ") + ")";
    const inventory = await getPaginatedData(
      "Inventory",
      "",
      "",
      1,
      99999999,
      {},
      `AND c.sku IN ${skus}`
    );
    req.body.inventory.forEach((item) => {
      const temp = inventory.find((inv) => inv.sku === item.sku);
      if (temp && parseInt(temp.price.quantity) < parseInt(item.quantity)) {
        errors.push(
          `Available quantity of ${item.item} is less than ${item.quantity}`
        );
      }
    });
    req.body.isActive = true;
    if (errors.length > 0) {
      context.res = dto(400, {}, errors[0]);
      return context.done();
    }
    inventory.forEach((item) => {
      const quantity = req.body.inventory.find(
        (inv) => inv.sku === item.sku
      ).quantity;
      item.price.quantity =
        parseInt(item.price.quantity) - parseInt(quantity) + "";
    });
    if (req.body.TransactionType === "Processed") {
      context.bindings.addProducts = JSON.stringify(inventory);
      context.bindings.addTransactionHistory = JSON.stringify(history);
      if (req.body.creditUsed > 0) {
        customer[0].currentBalance =
          Number(customer[0].currentBalance) - req.body.creditUsed;
        context.bindings.addCustomer = JSON.stringify(customer);
      }
      context.bindings.addTransaction = JSON.stringify(req.body);
      context.res = dto(200, req.body);
      return context.done();
    }
    context.bindings.addTransaction = JSON.stringify({
      ...req.body,
      isActive: true,
    });
    context.res = dto(200, req.body);
    return context.done();
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
