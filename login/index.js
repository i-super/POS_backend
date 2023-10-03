const { SUCCESS } = require("../utils/constants");
const {
  dto,
  matchPassword,
  getSignedJwtToken,
  validateSchema,
} = require("../utils/functions");
const { loginSchema } = require("../utils/schema");

module.exports = async function (context, req) {
  const result = validateSchema(req.body, loginSchema);

  if (result.error) {
    context.res = dto(400, {}, result.error.details[0].message);
    return;
  }
  const user = context.bindings.getUser[0];
  if (!user) {
    context.res = dto(400, {}, "Invalid user");
    context.done();
    return;
  }

  const validPassword = await matchPassword(req.body.password, user.password);

  if (!validPassword) {
    context.res = dto(400, {}, "Invalid Credentials");
    return;
  }

  const response = getSignedJwtToken(user);
  context.res = dto(200, response, SUCCESS);
};
