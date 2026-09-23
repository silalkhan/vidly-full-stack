const { Rental, validate } = require("../models/rental");
const { Movie } = require("../models/movie");
const { Customer } = require("../models/customer");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  // Show the newest rentals first.
  const rentals = await Rental.find().sort("-dateOut");
  res.send(rentals);
});

router.post("/", async (req, res) => {
  // Validate IDs before loading the customer and movie documents.
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send("Invalid customer.");

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send("Invalid movie.");

  if (movie.numberInStock === 0)
    return res.status(400).send("Movie not in stock.");

  // Store snapshots of related records in the rental document.
  let rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
      isGold: customer.isGold,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
  });

  // Keep saving the rental and decrementing stock in one transaction.
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    await rental.save({ session });
    await Movie.updateOne(
      { _id: movie._id },
      { $inc: { numberInStock: -1 } },
      { session },
    );
    await session.commitTransaction();
    res.send(rental);
  } catch (ex) {
    await session.abortTransaction();
    res.status(500).send("Something failed during the rental transaction.");
  } finally {
    session.endSession();
  }
});

router.get("/:id", async (req, res) => {
  // Return one rental or a clear not-found response.
  const rental = await Rental.findById(req.params.id);
  if (!rental)
    return res.status(404).send("The rental with the given ID was not found.");
  res.send(rental);
});

module.exports = router;
