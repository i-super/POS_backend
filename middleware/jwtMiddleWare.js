const MiddlewareHandler = require("azure-middleware");
const jwtMiddleware = require("../middleware/jwt");
const { UNAUTHORIZED } = require("../utils/constants");
const { dto } = require("../utils/functions");

module.exports = {
  jwtMiddlewareHandler: (endpoint) =>
    new MiddlewareHandler().use((ctx, req) => {
      const decoded = jwtMiddleware(ctx, endpoint);

      if (decoded) {
        ctx.next();
      } else {
        ctx.res = dto(401, {}, UNAUTHORIZED);
        ctx.done(null, { status: 401 });
      }
    }),
};
