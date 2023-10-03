const { dto, getPaginatedData } = require("../utils/functions");
const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");

module.exports = jwtMiddlewareHandler("store")
  .use(async (context, req) => {
    let transaction = await getPaginatedData(
      "Transaction",
      "",
      "",
      1,
      9999999,
      req.query.customer && req.query.store
        ? {
            "store.id": req.query.store,
            "customer.id": req.query.customer,
            TransactionType: req.query.TransactionType,
          }
        : req.query.customer
        ? {
            "customer.id": req.query.customer,
            TransactionType: req.query.TransactionType,
          }
        : req.query.store
        ? {
            "store.id": req.query.store,
            TransactionType: req.query.TransactionType,
          }
        : { TransactionType: req.query.TransactionType },
      ""
    );
    context.res = dto(200, transaction);
    return context.done();
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
