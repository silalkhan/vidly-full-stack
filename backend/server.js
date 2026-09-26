// Start the HTTP server separately from the Express application setup.

const winston = require("winston");
const app = require("./app");
const connectDB = require("./startup/db");

// Use the configured port, or 3001 when no port is provided.
const port = process.env.PORT || 3001;

// Begin accepting requests as soon as the application is configured.
const server = app.listen(port, () => {
  winston.info(`Listening on port ${port}...`);
});

// Connect to MongoDB and stop the process if startup cannot complete.
connectDB().catch((err) => {
  winston.error("Could not connect to MongoDB...", err);
  process.exit(1);
});

module.exports = server;
