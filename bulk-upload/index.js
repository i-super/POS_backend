const { dto, validateSchema } = require("../utils/functions");
const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");
const { bulkUploadSchema } = require("../utils/schema");

module.exports = jwtMiddlewareHandler("employee")
  .use(async (context, req) => {
    const result = validateSchema(req.body, bulkUploadSchema);
    if (result.error) {
      context.res = dto(400, {}, result.error.details[0].message);
      context.done();
      return;
    }
    req.body = req.body.map((inv) => {
      return { ...inv, isActive: true };
    });
    context.bindings.bulkUpload = JSON.stringify(req.body);
    context.res = dto(200, req.body);
    return context.done();
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
