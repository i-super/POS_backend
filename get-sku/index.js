const { dto } = require("../utils/functions");

module.exports = async function (context, req) {
  const code = context.bindings.counter[0];
  const count = code.code + "";
  if (code) {
    code.code += 1;
  }
  context.bindings.addCounter = code;
  context.res = dto(200, count.padStart(6, "0"));
};
