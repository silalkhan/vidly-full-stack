const express = require("express");
const auth = require("../routes/auth");
const users = require("../routes/users");
const rentals = require("../routes/rentals");
const movies = require("../routes/movies");
const customers = require("../routes/customers");
const genres = require("../routes/genres");
const error = require("../middleware/error");
const returns = require("../routes/returns");

module.exports = function (app) {
  // Parse JSON request bodies before they reach the route handlers.
  app.use(express.json());
  // Mount each feature router under its public API prefix.
  app.use("/api/genres", genres);
  app.use("/api/customers", customers);
  app.use("/api/movies", movies);
  app.use("/api/rentals", rentals);
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/returns", returns);
  // Convert errors from all routes into consistent HTTP responses.
  app.use(error);
};
