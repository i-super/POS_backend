const {
  ADMIN_ALLOWED,
  SURVEYOR_ALLOWED,
  UNAUTHORIZED,
} = require("../utils/constants");
const { dto } = require("../utils/functions");
const jwt = require("jsonwebtoken");

module.exports = jwtMiddleware;

function jwtMiddleware(ctx, endpoint) {
  try {
    return validateRequest(ctx, endpoint);
  } catch (error) {
    return error;
  }
}

function validateRequest(ctx, endpoint) {
  if (!ctx.req.headers.authorization) {
    ctx.res = dto(401, {}, UNAUTHORIZED);
    return;
  }
  try {
    const header = ctx.req.headers.authorization;
    const decoded = jwt.verify(
      header.includes("Bearer") ? header.split(" ")[1] : header,
      process.env["jwtSecret"]
    );
    if (
      decoded &&
      decoded.role === "admin" &&
      ADMIN_ALLOWED.indexOf(endpoint) > -1
    ) {
      ctx.req.decoded = decoded;
      return decoded;
    }
    if (
      decoded &&
      decoded.role === "surveyor" &&
      SURVEYOR_ALLOWED.indexOf(endpoint) > -1
    ) {
      console.log("surveyor");
      ctx.req.decoded = decoded;
      return decoded;
    }
    return;
  } catch (error) {
    console.log("catch block", error.message);
    ctx.res = dto(401, error, UNAUTHORIZED);
    ctx.done(null, { status: 401 });
  }
}
