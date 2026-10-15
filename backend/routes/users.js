const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate } = require("../models/user");
const { Customer } = require("../models/customer");
const express = require("express");

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) return res.status(404).send("The current user was not found.");
  res.send(user);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.body.isAdmin !== undefined) {
    return res.status(400).send("Admin privileges cannot be assigned on registration.");
  }

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered...");

  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  user = await user.save();

  await Customer.ensureForUser(user, {
    name: user.name,
    phone: req.body.phone || "Not provided",
  });

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "name", "email"]));
});

module.exports = router;
