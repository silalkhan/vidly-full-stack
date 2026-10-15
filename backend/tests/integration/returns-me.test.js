const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../../app");
const { Customer } = require("../../models/customer");
const { Movie } = require("../../models/movie");
const { Rental } = require("../../models/rental");
const { User } = require("../../models/user");
const { connectTestDatabase, closeTestDatabase } = require("./setup");

describe("/api/returns/me", () => {
  let user;
  let customer;
  let token;

  beforeAll(connectTestDatabase);
  afterAll(closeTestDatabase);

  beforeEach(async () => {
    user = await User.create({
      name: "Rental User",
      email: `rental-user-${new mongoose.Types.ObjectId()}@example.com`,
      password: "secret123",
      isAdmin: false,
    });
    token = user.generateAuthToken();
    customer = await Customer.create({
      name: user.name,
      phone: "555-0100",
      userId: user._id,
    });
  });

  afterEach(async () => {
    await Rental.deleteMany({});
    await Movie.deleteMany({});
    await Customer.deleteOne({ _id: customer._id });
    await User.deleteOne({ _id: user._id });
  });

  it("returns the selected owned active rental when the user has rented that movie before", async () => {
    const movie = await Movie.create({
      title: "Rental Movie",
      genre: { name: "Drama" },
      numberInStock: 4,
      dailyRentalRate: 2,
    });

    const rentalData = {
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
    };

    const priorReturnedRental = await Rental.create({
      ...rentalData,
      dateOut: new Date(Date.now() - 86_400_000),
      dateReturned: new Date(),
      rentalFee: 2,
    });
    const activeRental = await Rental.create({
      ...rentalData,
      dateOut: new Date(),
    });

    const response = await request(app)
      .post("/api/returns/me")
      .set("x-auth-token", token)
      .send({ rentalId: activeRental._id.toString() });

    expect(response.status).toBe(200);
    expect(response.body._id).toBe(activeRental._id.toString());
    expect((await Rental.findById(activeRental._id)).dateReturned).toBeTruthy();
    expect((await Rental.findById(priorReturnedRental._id)).dateReturned).toEqual(
      priorReturnedRental.dateReturned,
    );
    expect((await Movie.findById(movie._id)).numberInStock).toBe(5);
  });

  it("does not let a user return another customer's rental", async () => {
    const otherCustomer = await Customer.create({
      name: "Other Person",
      phone: "555-0101",
    });
    const rental = await Rental.create({
      customer: {
        _id: otherCustomer._id,
        name: otherCustomer.name,
        phone: otherCustomer.phone,
      },
      movie: {
        _id: new mongoose.Types.ObjectId(),
        title: "Other Movie",
        dailyRentalRate: 2,
      },
    });

    const response = await request(app)
      .post("/api/returns/me")
      .set("x-auth-token", token)
      .send({ rentalId: rental._id.toString() });

    expect(response.status).toBe(404);
    expect((await Rental.findById(rental._id)).dateReturned).toBeUndefined();
  });
});
