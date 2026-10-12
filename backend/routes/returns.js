const Joi = require("joi");
const mongoose = require("mongoose");
const validate = require("../middleware/validate");
const { Rental } = require("../models/rental");
const { Movie } = require("../models/movie");
const auth = require("../middleware/auth");
const express = require("express");

const router = express.Router();

// POST /api/returns
// Return a rented movie and increase its stock by 1.
router.post("/", [auth, validate(validateReturn)], async (req, res) => {
  // Start a MongoDB session so multiple database operations
  // can be handled together in one transaction.
  const session = await mongoose.startSession();

  try {
    // Store the rental that will be returned to the client.
    let returnedRental;

    // A transaction ensures that either all database changes succeed
    // or none of them are committed.
    await session.withTransaction(async () => {
      // Find the rental using the customer's ID and the movie's ID.
      const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

      // Stop if no matching rental exists.
      if (!rental) {
        const error = new Error("Rental not found.");
        error.statusCode = 404;
        throw error;
      }

      // Prevent returning the same rental twice.
      // Otherwise, the movie stock could increase more than once.
      if (rental.dateReturned) {
        const error = new Error("Return already processed.");
        error.statusCode = 400;
        throw error;
      }

      // Get the movie's ID from the rental document.
      const movieId = rental.movie._id;

      // Set the return date and calculate any applicable rental fee.
      rental.return();

      // Save the updated rental using the same transaction.
      await rental.save({ session });

      // Increase the movie's available stock by 1.
      // The session keeps this update part of the transaction.
      const result = await Movie.updateOne(
        { _id: movieId },
        { $inc: { numberInStock: 1 } },
        { session },
      );

      // Ensure that a movie document matched the update query.
      // If not, throw an error so the transaction is aborted.
      if (result.matchedCount !== 1) {
        throw new Error("Movie not found; stock was not updated.");
      }

      // Keep the updated rental so we can send it in the response.
      returnedRental = rental;
    });

    // Send the successfully returned rental to the frontend.
    return res.send(returnedRental);
  } catch (error) {
    // Send an appropriate HTTP status and error message.
    // Errors without a custom status code receive status 500.
    return res
      .status(error.statusCode || 500)
      .send(error.message || "Failed to return movie.");
  } finally {
    // Always close the session, even if an error occurs.
    await session.endSession();
  }
});

// Validate the customerId and movieId received in the request body.
function validateReturn(req) {
  const schema = Joi.object({
    customerId: Joi.string()
      // A MongoDB ObjectId is represented by 24 hexadecimal characters.
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "Invalid Customer ID format.",
      }),

    movieId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "Invalid Movie ID format.",
      }),
  });

  // Validate the request body against the schema.
  return schema.validate(req.body);
}

module.exports = router;
