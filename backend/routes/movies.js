const { Movie, validate } = require("../models/movie");
const { Genre } = require("../models/genre");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const express = require("express");

const router = express.Router();

// GET /api/movies
// Public: anyone can browse the movie catalog.
router.get("/", async (req, res) => {
  // Return movies sorted by title for predictable client display.
  const movies = await Movie.find().sort("title");

  res.send(movies);
});

// POST /api/movies
// Admin only: create a new movie.
router.post("/", [auth, admin], async (req, res) => {
  // Validate input before resolving the referenced genre.
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send("Invalid genre.");

  // Embed a genre snapshot so movie reads remain self-contained.
  const movie = new Movie({
    title: req.body.title,
    genre: {
      _id: genre._id,
      name: genre.name,
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate,
  });

  await movie.save();

  res.send(movie);
});

// PUT /api/movies/:id
// Admin only: update an existing movie.
router.put("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send("Invalid genre.");

  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      genre: {
        _id: genre._id,
        name: genre.name,
      },
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate,
    },
    { new: true, runValidators: true },
  );

  if (!movie) {
    return res.status(404).send("The movie with the given ID was not found.");
  }

  res.send(movie);
});

// DELETE /api/movies/:id
// Admin only: delete an existing movie.
router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);

  if (!movie) {
    return res.status(404).send("The movie with the given ID was not found.");
  }

  res.send(movie);
});

// GET /api/movies/:id
// Public: retrieve a single movie.
router.get("/:id", validateObjectId, async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    return res.status(404).send("The movie with the given ID was not found.");
  }

  res.send(movie);
});

module.exports = router;
