const jwt = require("jsonwebtoken");
const config = require("../config");

module.exports = function (req, res, next) {
  // Read the JWT from the custom header used by protected endpoints.
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    // Verify the signature before exposing the decoded user data to routes.
    const decoded = jwt.verify(token, config.get("JWT_PRIVATE_KEY"));
    req.user = decoded;
    next();
  } catch (ex) {
    return res.status(401).send("Invalid token.");
  }
};
