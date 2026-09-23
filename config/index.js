// Load the test environment file only when Jest sets NODE_ENV to test.
require("dotenv").config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

function get(key) {
  // Keep environment access behind one small configuration API.
  return process.env[key];
}

module.exports = { get };
