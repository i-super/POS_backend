const { dto, getPaginatedData } = require("../utils/functions");
const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");
const getStore = require("../get-store");

module.exports = jwtMiddlewareHandler("store")
  .use(async (context, req) => {
    let stores = context.bindings.stores;
    const inventory = context.bindings.inventory;
    const user = context.req.decoded;

    if (user.role !== "admin") {
      stores =
        stores.filter(
          (store) =>
            store.owner.id === user.id ||
            store.manager.id === user.id ||
            store.employees.findIndex((st) => st.id === user.id)
        ) !== -1;
    }
    stores = stores.map((st) => {
      return {
        name: st.storeName,
        id: st.id,
        quantity: inventory
          .filter((inv) => inv.store.id === st.id)
          .reduce((acc, inv) => acc + Number(inv.price.quantity), 0),
        purchase: inventory
          .filter((inv) => inv.store.id === st.id)
          .reduce(
            (acc, inv) =>
              acc +
              Number(inv.price.unit_purchase_price) *
                Number(inv.price.quantity),
            0
          ),
        sale: inventory
          .filter((inv) => inv.store.id === st.id)
          .reduce(
            (acc, inv) =>
              acc +
              Number(inv.price.unit_sell_price) * Number(inv.price.quantity),
            0
          ),
      };
    });

    context.res = dto(200, stores);
    return context.done();
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
