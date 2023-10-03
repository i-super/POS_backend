const { dto } = require("../utils/functions");

module.exports = async function (context, req) {
  const code = context.bindings.counter[0];
  const count = code.return + "";
  if (code) {
    code.return += 1;
  }
  context.bindings.addCounter = code;
  context.res = dto(200, "RET" + count.padStart(8, "0"));
};
