const { dto, validateSchema } = require("../utils/functions");
const bcrypt = require("bcryptjs");
const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");
const { userSchema } = require("../utils/schema");

module.exports = jwtMiddlewareHandler("employee")
  .use(async (context, req) => {
    switch (req.method.toLowerCase()) {
      case "get":
        const employees = context.bindings.employees;
        if (req.params.id) {
          const employee = employees.find((emp) => emp.id === req.params.id);
          if (!employee) {
            context.res = dto(400, {}, "Employee not found");
            context.done();
            return;
          }
          context.res = dto(200, employee);
          context.done();
          return;
        }
        context.res = dto(200, employees);
        context.done();
        break;
      case "post":
        const result = validateSchema(req.body, userSchema);
        if (result.error) {
          context.res = dto(400, {}, result.error.details[0].message);
          context.done();
          return;
        }
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
        context.bindings.addEmployee = JSON.stringify({
          ...req.body,
          isActive: true,
        });
        context.res = dto(200, req.body);
        context.done();
        break;
      case "put":
        const res = validateSchema(req.body, userSchema);
        if (res.error) {
          context.res = dto(400, {}, res.error.details[0].message);
          context.done();
          return;
        }
        context.bindings.addEmployee = JSON.stringify({
          ...req.body,
          id: req.params.id,
        });
        context.res = dto(200, req.body);
        context.done();
        break;
      case "delete":
        const employee = context.bindings.employees.find(
          (emp) => emp.id === req.params.id
        );
        if (!employee) {
          return (context.res = dto(400, {}, "Employee not found"));
        }
        employee.isActive = false;
        context.bindings.addEmployee = JSON.stringify(employee);
        context.res = dto(200, employee);
        context.done();
        break;
    }
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
