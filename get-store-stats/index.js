const { dto, getPaginatedData } = require("../utils/functions");
const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");
const getStore = require("../get-store");

module.exports = jwtMiddlewareHandler("store")
  .use(async (context, req) => {
    let stores = context.bindings.stores;
    const transaction = context.bindings.transactions;
    const trades = context.bindings.trades;
    const returns = context.bindings.returns;
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
        sales: transaction
          .filter((tr) => tr.store.id === st.id)
          .reduce((a, b) => a + Number(b.TotalAmountPaid), 0),
        trades: trades
          .filter((tr) => tr.store.id === st.id)
          .reduce((a, b) => a + Number(b.TotalAmountPaid), 0),
        returns: returns
          .filter((tr) => tr.store.id === st.id)
          .reduce((a, b) => a + Number(b.TotalAmountPaid), 0),
        cogs: getAmount(trades.filter((tr) => tr.store.id === st.id)),
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

const getAmount = (trades) => {
  let amount = 0;
  trades.forEach((element) => {
    amount += element.inventory.reduce(
      (a, b) =>
        a + Number(b.price.unit_purchase_price) * Number(b.price.quantity),
      0
    );
  });
  return amount;
};
