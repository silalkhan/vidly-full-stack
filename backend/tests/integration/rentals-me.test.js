const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../../app");
const { Customer } = require("../../models/customer");
const { Movie } = require("../../models/movie");
const { Rental } = require("../../models/rental");
const { User } = require("../../models/user");
const { connectTestDatabase, closeTestDatabase } = require("./setup");

describe("/api/rentals/me", () => {
  let user;
  let token;

  beforeAll(connectTestDatabase);
  afterAll(closeTestDatabase);

  beforeEach(async () => {
    user = await User.create({
      name: "Ali Khan",
      email: `ali-${new mongoose.Types.ObjectId()}@example.com`,
      password: "secret123",
      isAdmin: false,
    });
    token = user.generateAuthToken();
  });

  afterEach(async () => {
    await Rental.deleteMany({});
    await Customer.deleteMany({});
    await Movie.deleteMany({});
    await User.deleteOne({ _id: user._id });
  });

  function makeRental(customer, title) {
    return {
      customer: {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
        isGold: customer.isGold,
      },
      movie: {
        _id: new mongoose.Types.ObjectId(),
        title,
        dailyRentalRate: 2,
      },
    };
  }

  it("links a unique existing customer and returns only that user's rentals", async () => {
    const existingCustomer = await Customer.create({
      name: "Ali Khan",
      phone: "555-0100",
    });
    const otherCustomer = await Customer.create({
      name: "Other Person",
      phone: "555-0101",
    });
    const ownRental = await Rental.create(
      makeRental(existingCustomer, "Ali Movie"),
    );
    await Rental.create(makeRental(otherCustomer, "Other Movie"));

    const response = await request(app)
      .get("/api/rentals/me")
      .set("x-auth-token", token);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]._id).toBe(ownRental._id.toString());

    const linkedCustomer = await Customer.findById(existingCustomer._id);
    expect(linkedCustomer.userId.toString()).toBe(user._id.toString());
    expect(linkedCustomer.phone).toBe("555-0100");
  });

  it("creates at most one customer for an existing account with no matching customer", async () => {
    const first = await request(app)
      .get("/api/rentals/me")
      .set("x-auth-token", token);
    const second = await request(app)
      .get("/api/rentals/me")
      .set("x-auth-token", token);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(first.body).toEqual([]);
    expect(second.body).toEqual([]);
    expect(await Customer.countDocuments({ userId: user._id })).toBe(1);
  });

  it("does not guess which existing customer belongs to an account when names collide", async () => {
    await Customer.create([
      { name: "Ali Khan", phone: "555-0100" },
      { name: "Ali Khan", phone: "555-0101" },
    ]);

    const response = await request(app)
      .get("/api/rentals/me")
      .set("x-auth-token", token);

    expect(response.status).toBe(409);
    expect(await Customer.countDocuments({ userId: user._id })).toBe(0);
  });

  it("creates a rental for the authenticated user without accepting a customerId", async () => {
    const movie = await Movie.create({
      title: "Rental Movie",
      genre: { name: "Drama" },
      numberInStock: 1,
      dailyRentalRate: 2,
    });
    const otherCustomerId = new mongoose.Types.ObjectId();

    const rejected = await request(app)
      .post("/api/rentals/me")
      .set("x-auth-token", token)
      .send({ movieId: movie._id.toString(), customerId: otherCustomerId.toString() });

    expect(rejected.status).toBe(400);
    expect((await Movie.findById(movie._id)).numberInStock).toBe(1);

    const rented = await request(app)
      .post("/api/rentals/me")
      .set("x-auth-token", token)
      .send({ movieId: movie._id.toString() });

    expect(rented.status).toBe(200);
    expect(rented.body.customer.name).toBe(user.name);
    expect((await Movie.findById(movie._id)).numberInStock).toBe(0);
    expect(await Rental.countDocuments({ "customer._id": rented.body.customer._id })).toBe(1);
  });
});
