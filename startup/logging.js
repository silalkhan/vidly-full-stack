const winston = require("winston");

module.exports = function () {
  // Send uncaught exceptions to both the console and a persistent log file.
  winston.exceptions.handle(
    new winston.transports.Console(),
    new winston.transports.File({ filename: "uncaughtExceptions.log" }),
  );

  // Convert rejected promises into exceptions so they are not silently lost.
  process.on("unhandledRejection", (ex) => {
    throw ex;
  });

  // Log normal application messages to the console and logfile.
  winston.add(
    new winston.transports.Console({ format: winston.format.simple() }),
  );
  winston.add(new winston.transports.File({ filename: "logfile.log" }));
};
