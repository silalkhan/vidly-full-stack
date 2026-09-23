// Complete a rental return and restore the movie to inventory.
const Joi = require("joi");
const validate = require("../middleware/validate");
const { Rental } = require("../models/rental");
const { Movie } = require("../models/movie");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.post("/", [auth, validate(validateReturn)], async (req, res) => {
  // Locate the rental belonging to the requested customer and movie.
  const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

  if (!rental) return res.status(404).send("Rental not found.");

  // Prevent a second return from increasing stock twice.
  if (rental.dateReturned)
    return res.status(400).send("Return already processed.");

  // Calculate the fee, save the return time, and restore one stock item.
  rental.return();
  await rental.save();

  await Movie.updateOne(
    { _id: rental.movie._id },
    {
      $inc: { numberInStock: 1 },
    },
  );

  return res.send(rental);
});

function validateReturn(req) {
  // Validate both identifiers before performing the return operation.
  const schema = Joi.object({
    // Accept only standard 24-character hexadecimal MongoDB IDs.
    customerId: Joi.string()
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

  return schema.validate(req);
}
module.exports = router;
