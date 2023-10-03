const { dto } = require("../utils/functions");
const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");

module.exports = jwtMiddlewareHandler("store")
  .use(async (context) => {
    const stores = context.bindings.stores;
    const user = context.req.decoded;
    if (user.role === "admin") {
      context.res = dto(200, stores);
      return context.done();
    }
    const filtered =
      stores.filter(
        (store) =>
          store.owner.id === user.id ||
          store.manager.id === user.id ||
          store.employees.findIndex((st) => st.id === user.id)
      ) !== -1;
    context.res = dto(200, filtered);
    return context.done();
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
