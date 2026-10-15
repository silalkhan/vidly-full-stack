const Joi = require("joi");
const mongoose = require("mongoose");
const validate = require("../middleware/validate");
const { Rental } = require("../models/rental");
const { Movie } = require("../models/movie");
const { Customer } = require("../models/customer");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const express = require("express");

const router = express.Router();

router.post("/me", [auth, validate(validateReturnForUser)], async (req, res) => {
  // Resolve the customer from the authenticated user so callers cannot return
  // rentals belonging to another customer by changing the request body.
  const customer = await Customer.findByUserId(req.user._id);
  if (!customer) {
    return res.status(403).send("No customer record is linked to this account.");
  }

  return completeReturn(
    req,
    res,
    customer._id.toString(),
    req.body.rentalId,
  );
});

router.post("/", [auth, admin, validate(validateReturn)], async (req, res) => {
  return completeReturn(req, res, req.body.customerId);
});

async function completeReturn(req, res, customerId, rentalId) {
  const session = await mongoose.startSession();

  try {
    let returnedRental;

    // Rental status, return fee, and movie stock must commit or roll back
    // together so a failed return cannot leave stock and history inconsistent.
    await session.withTransaction(async () => {
      const rental = rentalId
        ? await Rental.findOne({
            _id: rentalId,
            "customer._id": customerId,
          }).session(session)
        : await Rental.lookup(customerId, req.body.movieId).session(session);

      if (!rental) {
        const error = new Error("Rental not found.");
        error.statusCode = 404;
        throw error;
      }

      if (rental.dateReturned) {
        const error = new Error("Return already processed.");
        error.statusCode = 400;
        throw error;
      }

      if (!req.user.isAdmin && rental.customer._id.toString() !== customerId.toString()) {
        const error = new Error("You do not have access to this rental.");
        error.statusCode = 403;
        throw error;
      }

      const movieId = rental.movie._id;
      rental.return();
      await rental.save({ session });

      const result = await Movie.updateOne(
        { _id: movieId },
        { $inc: { numberInStock: 1 } },
        { session },
      );

      if (result.matchedCount !== 1) {
        throw new Error("Movie not found; stock was not updated.");
      }

      returnedRental = rental;
    });

    return res.send(returnedRental);
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .send(error.message || "Failed to return movie.");
  } finally {
    await session.endSession();
  }
}

function validateReturn(body) {
  const schema = Joi.object({
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

  return schema.validate(body);
}

function validateReturnForUser(body) {
  const schema = Joi.object({
    rentalId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .messages({
        "string.pattern.base": "Invalid Rental ID format.",
      }),
    movieId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .messages({
        "string.pattern.base": "Invalid Movie ID format.",
      }),
  })
    .xor("rentalId", "movieId")
    .messages({
      "object.missing": "A rentalId is required.",
      "object.xor": "Provide either a rentalId or movieId, not both.",
    });

  return schema.validate(body);
}

module.exports = router;
