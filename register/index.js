const { validateSchema } = require("../utils/functions");
const { registerSchema, userSchema } = require("../utils/schema");
const { dto } = require("../utils/functions");
const bcrypt = require("bcryptjs");

module.exports = async function (context, req) {
  const result = validateSchema(req.body, userSchema);
  if (result.error) {
    context.res = dto(400, {}, result.error.details[0].message);
    context.done();
    return;
  }
  const user = context.bindings.getUser[0];
  if (user) {
    context.res = dto(400, {}, "User already exists with same email");
    context.done();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);
  req.body.isActive = true;

  context.bindings.addUser = JSON.stringify(req.body);
  context.res = dto(200, { message: "Registered successfully" });
};
