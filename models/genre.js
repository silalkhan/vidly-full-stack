const Joi = require("joi");
const mongoose = require("mongoose");

// Reusable schema for genres embedded inside movie documents.
const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 50,
  },
});

const Genre = mongoose.model("Genre", genreSchema);

function validateGenre(genre) {
  // Validate genre input before creating or updating a document.
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(), // Keep matching limits
  });
  return schema.validate(genre);
}

exports.genreSchema = genreSchema;
exports.Genre = Genre;
exports.validate = validateGenre;
