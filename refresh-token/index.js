const { UNAUTHORIZED } = require("../utils/constants");
const { dto } = require("../utils/functions");
const jwt = require("jsonwebtoken");

module.exports = async function (context, req) {
  if (!req.body.refreshToken) {
    context.res = dto(401, {}, UNAUTHORIZED);
    return;
  }
  try {
    const decoded = jwt.verify(req.body.refreshToken, process.env.jwtSecret);
    if (decoded) {
      delete decoded.exp;
      delete decoded.iat;
      const accessToken = jwt.sign(decoded, process.env.jwtSecret, {
        expiresIn: process.env.jwtExpiresIn,
      });
      
      context.res = dto(200, {
        accessToken,
        refreshToken: req.body.refreshToken,
      });
    }
  } catch {
    context.res = dto(401, {}, "Invalid token");
  }
};
