const config = require("../config");

module.exports = function () {
  // Fail early because JWT signing and verification require this secret.
  if (!config.get("JWT_PRIVATE_KEY")) {
    throw new Error("FATAL ERROR: JWT_PRIVATE_KEY is not defined.");
  }
};
