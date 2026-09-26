const helmet = require("helmet");
const compression = require("compression");

module.exports = function (app) {
  // Add common HTTP security headers and compress response bodies.
  app.use(helmet());
  app.use(compression());
};
