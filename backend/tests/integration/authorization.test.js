const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../../app");
const { Customer } = require("../../models/customer");
const { Movie } = require("../../models/movie");
const { Rental } = require("../../models/rental");
const { User } = require("../../models/user");
const { connectTestDatabase, closeTestDatabase } = require("./setup");

describe("admin-managed endpoints", () => {
  const id = () => new mongoose.Types.ObjectId().toHexString();

  beforeAll(connectTestDatabase);
  afterAll(closeTestDatabase);

  afterEach(async () => {
    await Customer.deleteMany({});
    await Movie.deleteMany({});
    await Rental.deleteMany({});
  });

  describe("/api/customers", () => {
    it("requires an admin for list, detail, create, update, and delete", async () => {
      const customerId = id();
      const requests = [
        () => request(app).get("/api/customers"),
        () => request(app).get(`/api/customers/${customerId}`),
        () => request(app).post("/api/customers").send({}),
        () => request(app).put(`/api/customers/${customerId}`).send({}),
        () => request(app).delete(`/api/customers/${customerId}`),
      ];

      for (const makeRequest of requests) {
        expect((await makeRequest()).status).toBe(401);
      }

      const token = new User({ isAdmin: false }).generateAuthToken();
      for (const makeRequest of requests) {
        expect(
          (
            await makeRequest().set("x-auth-token", token)
          ).status,
        ).toBe(403);
      }
    });

    it("allows an admin to manage customer records", async () => {
      const token = new User({ isAdmin: true }).generateAuthToken();
      const headers = { "x-auth-token": token };
      const created = await request(app)
        .post("/api/customers")
        .set(headers)
        .send({ name: "Vidly Customer", phone: "555-0100", isGold: false });

      expect(created.status).toBe(200);
      const customerId = created.body._id;

      const listed = await request(app).get("/api/customers").set(headers);
      expect(listed.status).toBe(200);
      expect(listed.body).toHaveLength(1);

      const updated = await request(app)
        .put(`/api/customers/${customerId}`)
        .set(headers)
        .send({ name: "Updated Customer", phone: "555-0101", isGold: true });
      expect(updated.status).toBe(200);
      expect(updated.body.name).toBe("Updated Customer");

      const detail = await request(app)
        .get(`/api/customers/${customerId}`)
        .set(headers);
      expect(detail.status).toBe(200);

      const deleted = await request(app)
        .delete(`/api/customers/${customerId}`)
        .set(headers);
      expect(deleted.status).toBe(200);
    });
  });

  describe("/api/rentals", () => {
    it("requires an admin for list, detail, and create", async () => {
      const rentalId = id();
      const requests = [
        () => request(app).get("/api/rentals"),
        () => request(app).get(`/api/rentals/${rentalId}`),
        () => request(app).post("/api/rentals").send({}),
      ];

      for (const makeRequest of requests) {
        expect((await makeRequest()).status).toBe(401);
      }

      const token = new User({ isAdmin: false }).generateAuthToken();
      for (const makeRequest of requests) {
        expect(
          (
            await makeRequest().set("x-auth-token", token)
          ).status,
        ).toBe(403);
      }
    });

    it("allows admin list access and validates admin create requests", async () => {
      const token = new User({ isAdmin: true }).generateAuthToken();
      const listed = await request(app)
        .get("/api/rentals")
        .set("x-auth-token", token);
      expect(listed.status).toBe(200);

      const invalidCreate = await request(app)
        .post("/api/rentals")
        .set("x-auth-token", token)
        .send({});
      expect(invalidCreate.status).toBe(400);

      const invalidId = await request(app)
        .get("/api/rentals/not-an-object-id")
        .set("x-auth-token", token);
      expect(invalidId.status).toBe(404);
    });

    it("creates rentals and decrements available movie stock", async () => {
      const token = new User({ isAdmin: true }).generateAuthToken();
      const customer = await Customer.create({
        name: "Vidly Customer",
        phone: "555-0100",
        isGold: false,
      });
      const movie = await Movie.create({
        title: "Vidly Movie",
        genre: { name: "Drama" },
        numberInStock: 1,
        dailyRentalRate: 2,
      });

      const res = await request(app)
        .post("/api/rentals")
        .set("x-auth-token", token)
        .send({ customerId: customer._id, movieId: movie._id });

      expect(res.status).toBe(200);
      expect(await Rental.countDocuments()).toBe(1);
      expect((await Movie.findById(movie._id)).numberInStock).toBe(0);
    });

    it("does not rent a movie with no stock", async () => {
      const token = new User({ isAdmin: true }).generateAuthToken();
      const customer = await Customer.create({
        name: "Vidly Customer",
        phone: "555-0100",
      });
      const movie = await Movie.create({
        title: "Vidly Movie",
        genre: { name: "Drama" },
        numberInStock: 0,
        dailyRentalRate: 2,
      });

      const res = await request(app)
        .post("/api/rentals")
        .set("x-auth-token", token)
        .send({ customerId: customer._id, movieId: movie._id });

      expect(res.status).toBe(400);
      expect(await Rental.countDocuments()).toBe(0);
      expect((await Movie.findById(movie._id)).numberInStock).toBe(0);
    });
  });

  describe("/api/movies", () => {
    it("allows public reads but restricts create, update, and delete to admins", async () => {
      expect((await request(app).get("/api/movies")).status).toBe(200);

      const movieId = id();
      const token = new User({ isAdmin: false }).generateAuthToken();
      const requests = [
        () => request(app).post("/api/movies").send({}),
        () => request(app).put(`/api/movies/${movieId}`).send({}),
        () => request(app).delete(`/api/movies/${movieId}`),
      ];

      for (const makeRequest of requests) {
        expect((await makeRequest()).status).toBe(401);
        expect(
          (
            await makeRequest().set("x-auth-token", token)
          ).status,
        ).toBe(403);
      }

      const adminToken = new User({ isAdmin: true }).generateAuthToken();
      expect(
          (
            await request(app)
              .post("/api/movies")
              .set("x-auth-token", adminToken)
              .send({})
          ).status,
      ).toBe(400);
      expect(
          (
            await request(app)
              .get("/api/movies/not-an-object-id")
              .set("x-auth-token", adminToken)
          ).status,
      ).toBe(404);
    });
  });
});
