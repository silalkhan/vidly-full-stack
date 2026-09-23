const winston = require("winston");

module.exports = function (err, req, res, next) {
  // Log the original error while hiding internal details from 500 responses.
  winston.error(err.message, err);
  const status = err.status || 500;
  res.status(status).send(status === 500 ? "Something failed..." : err.message);
};
