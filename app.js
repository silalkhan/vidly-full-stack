// Build the Express application without opening a network port.

const express = require("express");
const app = express();

// Load configuration and infrastructure before registering API routes.
require("./startup/config")();
require("./startup/logging")();
require("./startup/routes")(app);
// Add production-only security and response-compression middleware.
require("./startup/prod")(app);

module.exports = app;
