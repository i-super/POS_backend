const { dto, getPaginatedData } = require("../utils/functions");
const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");

module.exports = jwtMiddlewareHandler("store")
  .use(async (context) => {
    const customers = await getPaginatedData(
      "TransactionHistory",
      "",
      "",
      1,
      999999,
      {
        TransactionType:
          context.req.query.type !== "All" ? context.req.query.type : null,
        "store.id": context.req.params.id,
        "product.category": context.req.query.category ?? null,
      },
      ` and c.createdOn > '${context.req.query.startDate}' and c.createdOn < '${context.req.query.endDate}' order by c.createdOn desc`
    );
    context.res = dto(200, customers);
    return context.done();
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
