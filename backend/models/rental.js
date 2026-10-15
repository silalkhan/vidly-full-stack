const Joi = require("joi");
const mongoose = require("mongoose");
const moment = require("moment");

// A rental stores snapshots of customer and movie data at checkout time.
const rentalSchema = new mongoose.Schema({
  customer: {
    type: new mongoose.Schema({
      name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
      },
      isGold: {
        type: Boolean,
        default: false,
      },
      phone: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
      },
    }),
    required: true,
  },

  movie: {
    type: new mongoose.Schema({
      title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 255,
      },
      dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 255,
      },
    }),
    required: true,
  },

  // The date the movie was rented.
  dateOut: {
    type: Date,
    required: true,
    default: Date.now,
  },

  // This field is set when the movie is returned.
  // It is absent while the rental is active.
  dateReturned: {
    type: Date,
  },

  // The total rental fee, calculated when the movie is returned.
  rentalFee: {
    type: Number,
    min: 0,
  },
});

// Find the most recent rental so repeated returns can be rejected explicitly.
rentalSchema.statics.lookup = function (customerId, movieId) {
  return this.findOne({
    "customer._id": customerId,
    "movie._id": movieId,
  }).sort("-dateOut");
};

// Mark the rental as returned and calculate its fee.
rentalSchema.methods.return = function () {
  this.dateReturned = new Date();

  // Calculate the number of complete days between checkout and return.
  const rentalDays = moment().diff(this.dateOut, "days");

  this.rentalFee = rentalDays * this.movie.dailyRentalRate;
};

const Rental = mongoose.model("Rental", rentalSchema);

// Validate the customer and movie IDs before database operations.
function validateRental(rental) {
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

  return schema.validate(rental);
}

exports.Rental = Rental;
exports.validate = validateRental;
