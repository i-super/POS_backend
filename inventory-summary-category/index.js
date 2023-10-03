const { dto, getPaginatedData } = require("../utils/functions");
const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");
const getStore = require("../get-store");

module.exports = jwtMiddlewareHandler("store")
  .use(async (context, req) => {
    let categories = context.bindings.categories;
    const inventory = context.bindings.inventory;
    categories = categories.map((st) => {
      return {
        name: st,
        quantity: inventory
          .filter((inv) => inv.category_name === st)
          .reduce((acc, inv) => acc + Number(inv?.price?.quantity), 0),
        purchase: inventory
          .filter((inv) => inv.category_name === st)
          .reduce(
            (acc, inv) =>
              acc +
              Number(inv?.price?.unit_purchase_price) *
                Number(inv.price.quantity),
            0
          ),
        sale: inventory
          .filter((inv) => inv.category_name === st)
          .reduce(
            (acc, inv) =>
              acc +
              Number(inv?.price?.unit_sell_price) * Number(inv.price.quantity),
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
