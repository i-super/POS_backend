const { dto, getPaginatedData, validateSchema } = require("../utils/functions");
const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");
const { transactionSchema, returnSchema } = require("../utils/schema");

module.exports = jwtMiddlewareHandler("store")
  .use(async (context, req) => {
    const result = validateSchema(req.body, returnSchema);
    let customer = null;
    const errors = [];
    if (result.error) {
      context.res = dto(400, {}, result.error.details[0].message);
      context.done();
      return;
    }
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
    let history = req.body.inventory.map((inv) => {
      return {
        TID: req.body.TransactionID,
        createdOn: new Date(),
        TransactionType: "Return",
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
    req.body.inventory.forEach((item) => {
      const temp = inventory.find((inv) => inv.sku === item.sku);
      if (!temp) {
        errors.push(`Product ${item.item} not found`);
      }
    });
    if (errors.length > 0) {
      context.res = dto(400, {}, errors[0]);
      return context.done();
    }
    if (req.body.customer?.id) {
      customer = await getPaginatedData("Customers", "", "", 1, 99999, {
        id: req.body.customer.id,
      });
    }
    inventory.forEach((item) => {
      const quantity = req.body.inventory.find(
        (inv) => inv.sku === item.sku
      ).quantity;
      item.price.quantity =
        parseInt(item.price.quantity) + parseInt(quantity) + "";
    });
    if (req.body.PaymentType === "Store Credit") {
      customer[0].currentBalance =
        Number(customer[0].currentBalance) + Number(req.body.TotalAmountPaid);
      context.bindings.addCustomer = JSON.stringify(customer);
    }
    context.bindings.addProducts = JSON.stringify(inventory);
    context.bindings.addTransaction = JSON.stringify({
      ...req.body,
      isActive: true,
    });
    context.bindings.addTransactionHistory = JSON.stringify(history);
    context.res = dto(200, req.body);
    return context.done();
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
