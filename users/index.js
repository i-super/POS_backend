const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");
const { validateSchema, dto } = require("../utils/functions");
const { userSchema } = require("../utils/schema");
const bcrypt = require("bcryptjs");
module.exports =
  // jwtMiddlewareHandler("users")
  // .use(
  async (context, req) => {
    switch (req.method.toLowerCase()) {
      case "get":
        const users = context.bindings.getUser;
        if (req.params.id) {
          const user = users.find((emp) => emp.id === req.params.id);
          context.res = dto(200, user);
          context.done();
          return;
        }
        context.res = dto(200, users);
        context.done();
        break;

      case "put":
        const res = validateSchema(req.body, userSchema);
        if (res.error) {
          context.res = dto(400, {}, res.error.details[0].message);
          context.done();
          return;
        }
        req.body.password = await bcrypt.hash(req.body.password, salt);
        req.body.isActive = true;
        context.bindings.addUser = JSON.stringify({
          ...req.body,
          id: req.params.id,
        });
        context.res = dto(200, req.body);
        context.done();
        break;
      case "delete":
        const employee = context.bindings.getUser.find(
          (emp) => emp.id === req.params.id
        );
        if (!employee) {
          context.res = dto(404, {}, "User not found");
          return context.done();
        }
        employee.isActive = false;
        context.bindings.addUser = JSON.stringify(employee);
        context.res = dto(200, employee);
        context.done();
        break;
    }
  };
// )
// .catch((error, ctx) => {
//   ctx.log.info(error);
//   ctx.next();
// })
// .listen();
