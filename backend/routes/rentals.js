const Joi = require("joi");
const { Rental, validate } = require("../models/rental");
const { Movie } = require("../models/movie");
const { Customer } = require("../models/customer");
const { User } = require("../models/user");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.use(auth);

const returnedNotArchivedFilter = {
  // `$ne: true` includes older rentals that predate this schema field.
  dateReturned: { $type: "date" },
  isArchived: { $ne: true },
};

router.get("/archive-preview", [admin], async (req, res) => {
  try {
    const eligibleRentals = await Rental.find(returnedNotArchivedFilter)
      .select("_id")
      .lean();

    return res.send({
      count: eligibleRentals.length,
      eligibleIds: eligibleRentals.map((rental) => rental._id.toString()),
    });
  } catch (error) {
    return res.status(500).send({
      message: "Unable to preview returned rentals.",
    });
  }
});

router.post("/archive", [admin], async (req, res) => {
  const { error } = validateArchiveRentalIds(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const rentalIds = [...new Set(req.body.rentalIds.map((id) => id.toLowerCase()))];
  if (rentalIds.length === 0) {
    return res.send({ archivedCount: 0, skippedCount: 0 });
  }

  try {
    const archivedAt = new Date();
    const result = await Rental.updateMany(
      {
        _id: { $in: rentalIds },
        // Recheck eligibility in the write itself so a stale preview cannot
        // archive a rental that is now active or was already archived.
        ...returnedNotArchivedFilter,
      },
      {
        $set: {
          isArchived: true,
          archivedAt,
          archivedBy: req.user._id,
          archiveReason: "returned-history-cleanup",
        },
      },
    );

    const archivedCount = result.modifiedCount;
    return res.send({
      archivedCount,
      skippedCount: rentalIds.length - archivedCount,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Failed to archive returned rental records." });
  }
});

router.post("/archive/preview", [admin], async (req, res) => {
  const { error } = validateArchiveRentalIds(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  try {
    const rentalIds = [
      ...new Set(req.body.rentalIds.map((id) => id.toLowerCase())),
    ];
    const eligibleRentals = rentalIds.length
      ? await Rental.find({
          _id: { $in: rentalIds },
          ...returnedNotArchivedFilter,
        })
          .select("_id")
          .lean()
      : [];
    const eligibleIds = eligibleRentals.map((rental) =>
      rental._id.toString(),
    );

    return res.send({
      requestedCount: rentalIds.length,
      eligibleCount: eligibleIds.length,
      eligibleIds,
      skippedCount: rentalIds.length - eligibleIds.length,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Unable to validate selected rentals for archiving.",
    });
  }
});

router.get("/me", async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).send("The current user was not found.");

  // The owner comes from the verified token, never from a client-supplied ID.
  const customer = await Customer.ensureForUser(user, { linkExisting: true });

  const rentals = await Rental.find({ "customer._id": customer._id }).sort(
    "-dateOut",
  );
  return res.send(rentals);
});

router.post("/me", async (req, res) => {
  const { error } = validateRentalForUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).send("The current user was not found.");

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send("Invalid movie.");

  if (movie.numberInStock === 0)
    return res.status(400).send("Movie not in stock.");

  const customer = await Customer.ensureForUser(user, { linkExisting: true });

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

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const stockUpdate = await Movie.updateOne(
      { _id: movie._id, numberInStock: { $gt: 0 } },
      { $inc: { numberInStock: -1 } },
      { session },
    );
    if (stockUpdate.matchedCount !== 1) {
      const error = new Error("Movie not in stock.");
      error.statusCode = 400;
      throw error;
    }
    await rental.save({ session });
    await session.commitTransaction();
    res.send(rental);
  } catch (ex) {
    await session.abortTransaction();
    res
      .status(ex.statusCode || 500)
      .send(
        ex.statusCode === 400
          ? ex.message
          : "Something failed during the rental transaction.",
      );
  } finally {
    session.endSession();
  }
});

router.get("/", [admin], async (req, res) => {
  const includeArchived = req.query.archived === "true";
  const filter = includeArchived
    ? { isArchived: true }
    : { isArchived: { $ne: true } };

  const rentals = await Rental.find(filter).sort("-dateOut");
  res.send(rentals);
});

router.post("/", [admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send("Invalid customer.");

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send("Invalid movie.");

  if (movie.numberInStock === 0)
    return res.status(400).send("Movie not in stock.");

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

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const stockUpdate = await Movie.updateOne(
      { _id: movie._id, numberInStock: { $gt: 0 } },
      { $inc: { numberInStock: -1 } },
      { session },
    );
    if (stockUpdate.matchedCount !== 1) {
      const error = new Error("Movie not in stock.");
      error.statusCode = 400;
      throw error;
    }
    await rental.save({ session });
    await session.commitTransaction();
    res.send(rental);
  } catch (ex) {
    await session.abortTransaction();
    res
      .status(ex.statusCode || 500)
      .send(
        ex.statusCode === 400
          ? ex.message
          : "Something failed during the rental transaction.",
      );
  } finally {
    session.endSession();
  }
});

router.get("/:id", [admin, validateObjectId], async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental)
    return res.status(404).send("The rental with the given ID was not found.");
  res.send(rental);
});

function validateRentalForUser(rental) {
  const schema = Joi.object({
    movieId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
      "string.pattern.base": "Invalid Movie ID format.",
    }),
    phone: Joi.string().min(5).max(50).optional(),
  });

  return schema.validate(rental);
}

function validateArchiveRentalIds(body) {
  const schema = Joi.object({
    rentalIds: Joi.array()
      .items(
        Joi.string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .messages({ "string.pattern.base": "Invalid rental ID format." }),
      )
      .required(),
  }).required();

  return schema.validate(body);
}

module.exports = router;
