const { dto, getPaginatedData } = require("../utils/functions");
const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");

module.exports = jwtMiddlewareHandler("store")
  .use(async (context, req) => {
    let categories = context.bindings.categories;
    const inventory = context.bindings.inventory;
    categories = categories.map((st) => {
      return {
        name: st,
        sales: inventory
          .filter(
            (inv) =>
              inv.product.category === st && inv.TransactionType === "Sale"
          )
          .reduce(
            (acc, inv) => acc + Number(inv?.amount) * Number(inv.quantity),
            0
          ),
        returns: inventory
          .filter(
            (inv) =>
              inv.product.category === st && inv.TransactionType === "Return"
          )
          .reduce(
            (acc, inv) => acc + Number(inv?.amount) * Number(inv.quantity),
            0
          ),
        trades: inventory
          .filter(
            (inv) =>
              inv.product.category === st && inv.TransactionType === "Trade"
          )
          .reduce(
            (acc, inv) => acc + Number(inv?.amount) * Number(inv.quantity),
            0
          ),
        cogs: inventory
          .filter(
            (inv) =>
              inv.product.category === st && inv.TransactionType === "Sale"
          )
          .reduce(
            (acc, inv) => acc + Number(inv?.cogs) * Number(inv.quantity),
            0
          ),
      };
    });

    context.res = dto(200, categories);
    return context.done();
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
