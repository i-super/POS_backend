const { dto, getPaginatedData } = require("../utils/functions");
const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");

module.exports = jwtMiddlewareHandler("store")
  .use(async (context, req) => {
    const transaction = context.bindings.transactions;
    const total = transaction.reduce(
      (a, b) => a + Number(b.TotalAmountPaid),
      0
    );
    let tradeIns = 0;
    context.bindings.trades.forEach((element) => {
      tradeIns += element.inventory.reduce(
        (a, b) => a + Number(b.price.quantity),
        0
      );
    });

    context.res = dto(200, {
      transaction: transaction.length,
      total,
      trades: tradeIns,
    });
    return context.done();
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.done();
    ctx.next();
  })
  .listen();
