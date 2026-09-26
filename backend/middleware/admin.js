module.exports = function (req, res, next) {
  // This middleware must run after auth, which populates req.user.
  if (!req.user.isAdmin) return res.status(403).send("Access denied.");
  next();
};
