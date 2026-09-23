const Joi = require("joi");
const mongoose = require("mongoose");
const { genreSchema } = require("./genre");

// Movies embed a snapshot of their genre so reads do not require a join.
const Movie = mongoose.model(
  "Movies",
  new mongoose.Schema({
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 255,
    },
    genre: {
      // Store the genre name and ID directly on the movie.
      type: genreSchema,
      required: true,
    },
    numberInStock: {
      type: Number,
      required: true,
      min: 0,
      max: 255,
    },
    dailyRentalRate: {
      type: Number,
      required: true,
      min: 0,
      max: 255,
    },
  }),
);

function validateMovie(movie) {
  // Validate API input before looking up the referenced genre.
  const schema = Joi.object({
    title: Joi.string().min(5).max(255).required(), // Fixed max length to match mongoose (255)
    // Accept only the standard 24-character hexadecimal MongoDB ID format.
    genreId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "Invalid Genre ID format.",
      }),
    numberInStock: Joi.number().min(0).max(255).required(),
    dailyRentalRate: Joi.number().min(0).max(255).required(),
  });

  return schema.validate(movie);
}

exports.Movie = Movie;
exports.validate = validateMovie;
