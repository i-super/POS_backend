const { dto, getPaginatedData } = require("../utils/functions");
const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");

module.exports = jwtMiddlewareHandler("store")
  .use(async (context, req) => {
    if (req.query.type === "All") {
      let sale = await getPaginatedData(
        "Transaction",
        "",
        "",
        1,
        999999,
        {
          TransactionType: "Processed",
          "store.id": req.params.id,
        },
        ` and c.createdOn > '${req.query.startDate}' and c.createdOn < '${req.query.endDate}' order by c.createdOn desc`
      );
      sale = sale.map((sle) => {
        return { ...sle, type: "Sale" };
      });
      let trade = await getPaginatedData(
        "Trade",
        "",
        "",
        1,
        999999,
        {
          "store.id": req.params.id,
        },
        ` and c.createdOn > '${req.query.startDate}' and c.createdOn < '${req.query.endDate}' order by c.createdOn desc`
      );
      trade = trade.map((sle) => {
        return { ...sle, type: "Trade" };
      });
      let returns = await getPaginatedData(
        "Return",
        "",
        "",
        1,
        999999,
        {
          "store.id": req.params.id,
        },
        ` and c.createdOn > '${req.query.startDate}' and c.createdOn < '${req.query.endDate}' order by c.createdOn desc`
      );
      returns = returns.map((sle) => {
        return { ...sle, type: "Return" };
      });
      context.res = dto(
        200,
        [...sale, ...returns, ...trade].sort((t1, t2) => {
          const dateA = new Date(t1.createdOn);
          const dateB = new Date(t2.createdOn);

          return dateB - dateA;
        })
      );
      return context.done();
    }
    let transaction = await getPaginatedData(
      req.query.type,
      "",
      "",
      1,
      9999999,
      req.query.type === "Transaction"
        ? { TransactionType: "Processed", "store.id": req.params.id }
        : { "store.id": req.params.id },
      ` and c.createdOn > '${req.query.startDate}' and c.createdOn < '${req.query.endDate}' order by c.createdOn desc `
    );
    context.res = dto(
      200,
      transaction.map((tra) => {
        return {
          ...tra,
          type: req.query.type === "Transaction" ? "Sale" : req.query.type,
        };
      })
    );
    return context.done();
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
