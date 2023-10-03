const { dto } = require("../utils/functions");

module.exports = async function (context, req) {
  const code = context.bindings.counter[0];
  const count = code.trade + "";
  if (code) {
    code.trade += 1;
  }
  context.bindings.addCounter = code;
  context.res = dto(200, "TRADE" + count.padStart(8, "0"));
};
