const { dto, getPaginatedData, validateSchema } = require("../utils/functions");
const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");
const { addTradeSchema } = require("../utils/schema");

module.exports = jwtMiddlewareHandler("store")
  .use(async (context, req) => {
    const result = validateSchema(req.body, addTradeSchema);
    const errors = [];
    if (result.error) {
      context.res = dto(400, {}, result.error.details[0].message);
      context.done();
      return;
    }
    let tempInventory = [];
    let customer = await getPaginatedData(
      "Customers",
      "",
      "",
      1,
      11,
      { id: req.body.customer.id },
      ""
    );
    let history = req.body.inventory.map((inv) => {
      return {
        TID: req.body.id,
        createdOn: new Date(),
        TransactionType: "Trade",
        quantity: inv.price.quantity,
        product: {
          sku: inv.sku,
          name: inv.product_name,
          category: inv.category_name,
        },
        customer: req.body.customer,
        paymentType: req.body.PaymentType,
        store: req.body.store,
        amount: inv.price.unit_sell_price,
        cogs: inv.price.unit_purchase_price,
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
      if (temp) {
        tempInventory.find({
          ...temp,
          price: {
            ...temp.price,
            quantity: temp.price.quantity + item.price.quantity,
            unit_purchase_price: item.price.unit_purchase_price,
            unit_sell_price: item.price.unit_sell_price,
          },
          store: req.body.store,
        });
      } else {
        tempInventory.push({ ...item, store: req.body.store, isActive: true });
      }
    });
    req.body.isActive = true;

    if (req.body.PaymentType === "Credit") {
      const balance = parseInt(customer[0].currentBalance) || 0;
      customer[0].currentBalance = balance + req.body.SubTotal;
    }

    inventory.forEach((item) => {
      const quantity = req.body.inventory.find(
        (inv) => inv.sku === item.sku
      ).quantity;
      item.price.quantity =
        parseInt(item.price.quantity) - parseInt(quantity) + "";
    });
    context.bindings.addCustomer = JSON.stringify(customer);
    context.bindings.addProducts = JSON.stringify(tempInventory);
    context.bindings.addTransactionHistory = JSON.stringify(history);
    context.bindings.addTrade = JSON.stringify({
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
