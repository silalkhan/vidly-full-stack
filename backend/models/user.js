const config = require("../config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

// Store account credentials and authorization flags for each user.
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 5, maxlength: 50 },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: { type: String, required: true, minlength: 5, maxlength: 1024 },
  isAdmin: { type: Boolean, default: false },
});

userSchema.methods.generateAuthToken = function () {
  // Put only the identity and authorization flag into the signed token.
  return jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("JWT_PRIVATE_KEY"),
  );
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  // Validate registration data before hashing and saving the password.
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });
  return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;
