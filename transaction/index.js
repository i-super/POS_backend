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
      { id: req.params.id.toUpperCase() },
      ""
    );
    if (transaction.length < 1) {
      context.res = dto(400, {}, "Transaction not found");
      return context.done();
    }
    context.res = dto(200, transaction);
    return context.done();
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
