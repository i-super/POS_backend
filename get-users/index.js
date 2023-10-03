const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");
const { dto } = require("../utils/functions");
module.exports = jwtMiddlewareHandler("get-store")
  .use(async (context, req) => {
    const type = req.query.role;
    const users = context.bindings.getUser;
    if (type) {
      context.res = dto(
        200,
        users.filter((user) => user.role === type)
      );
      return context.done();
    }
    context.res = dto(200, users);
    context.done();
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
