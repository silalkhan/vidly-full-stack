const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../../app");
const { Rental } = require("../../models/rental");
const { Movie } = require("../../models/movie");
const { User } = require("../../models/user");
const { connectTestDatabase, closeTestDatabase } = require("./setup");

describe("/api/rentals archive operations", () => {
  let adminUser;
  let adminToken;

  beforeAll(connectTestDatabase);
  afterAll(closeTestDatabase);

  beforeEach(async () => {
    adminUser = new User({
      _id: new mongoose.Types.ObjectId(),
      name: "Admin Archive User",
      email: "archive-admin@example.com",
      password: "secret123",
      isAdmin: true,
    });
    adminToken = adminUser.generateAuthToken();
  });

  afterEach(async () => {
    await Rental.deleteMany({});
    await Movie.deleteMany({});
  });

  function makeRental(overrides = {}) {
    const customerId = new mongoose.Types.ObjectId();
    const movieId = new mongoose.Types.ObjectId();

    return {
      customer: {
        _id: customerId,
        name: "Archive Customer",
        phone: "555-0100",
      },
      movie: {
        _id: movieId,
        title: "Archive Movie",
        dailyRentalRate: 2,
      },
      dateOut: new Date(Date.now() - 86400000),
      dateReturned: new Date(),
      rentalFee: 2,
      ...overrides,
    };
  }

  it("allows an admin to archive eligible returned rentals", async () => {
    const rental = new Rental(makeRental());
    await rental.save();

    const res = await request(app)
      .post("/api/rentals/archive")
      .set("x-auth-token", adminToken)
      .send({ rentalIds: [rental._id.toString()] });

    expect(res.status).toBe(200);
    expect(res.body.archivedCount).toBe(1);

    const archivedRental = await Rental.findById(rental._id);
    expect(archivedRental.isArchived).toBe(true);
    expect(archivedRental.archivedBy.toString()).toBe(adminUser._id.toString());
    expect(archivedRental.archivedAt).toBeTruthy();
  });

  it("rejects unauthenticated archive requests", async () => {
    const requests = [
      () => request(app).get("/api/rentals/archive-preview"),
      () =>
        request(app)
          .post("/api/rentals/archive/preview")
          .send({ rentalIds: [] }),
      () => request(app).post("/api/rentals/archive").send({ rentalIds: [] }),
    ];

    for (const makeRequest of requests) {
      expect((await makeRequest()).status).toBe(401);
    }
  });

  it("rejects non-admin archive requests", async () => {
    const token = new User({
      _id: new mongoose.Types.ObjectId(),
      isAdmin: false,
    }).generateAuthToken();

    const requests = [
      () =>
        request(app)
          .get("/api/rentals/archive-preview")
          .set("x-auth-token", token),
      () =>
        request(app)
          .post("/api/rentals/archive/preview")
          .set("x-auth-token", token)
          .send({ rentalIds: [] }),
      () =>
        request(app)
          .post("/api/rentals/archive")
          .set("x-auth-token", token)
          .send({ rentalIds: [] }),
    ];

    for (const makeRequest of requests) {
      expect((await makeRequest()).status).toBe(403);
    }
  });

  it("does not archive active rentals", async () => {
    const rental = new Rental(makeRental({ dateReturned: undefined, rentalFee: undefined }));
    await rental.save();

    const res = await request(app)
      .post("/api/rentals/archive")
      .set("x-auth-token", adminToken)
      .send({ rentalIds: [rental._id.toString()] });

    expect(res.status).toBe(200);
    expect(res.body.archivedCount).toBe(0);
    expect(res.body.skippedCount).toBe(1);

    const stored = await Rental.findById(rental._id);
    expect(stored.isArchived).toBe(false);
  });

  it("keeps movie stock unchanged when archiving", async () => {
    const movie = new Movie({
      title: "Stock Movie",
      genre: { name: "Drama" },
      numberInStock: 7,
      dailyRentalRate: 2,
    });
    await movie.save();

    const rental = new Rental(
      makeRental({
        movie: {
          _id: movie._id,
          title: movie.title,
          dailyRentalRate: movie.dailyRentalRate,
        },
      }),
    );
    await rental.save();

    const res = await request(app)
      .post("/api/rentals/archive")
      .set("x-auth-token", adminToken)
      .send({ rentalIds: [rental._id.toString()] });

    expect(res.status).toBe(200);
    const movieInDb = await Movie.findById(movie._id);
    expect(movieInDb.numberInStock).toBe(7);

    const rentalInDb = await Rental.findById(rental._id);
    expect(rentalInDb.dateOut.getTime()).toBe(rental.dateOut.getTime());
    expect(rentalInDb.dateReturned.getTime()).toBe(rental.dateReturned.getTime());
    expect(rentalInDb.rentalFee).toBe(rental.rentalFee);
  });

  it("is safe when repeated archive requests are submitted", async () => {
    const rental = new Rental(makeRental());
    await rental.save();

    const first = await request(app)
      .post("/api/rentals/archive")
      .set("x-auth-token", adminToken)
      .send({ rentalIds: [rental._id.toString()] });
    const second = await request(app)
      .post("/api/rentals/archive")
      .set("x-auth-token", adminToken)
      .send({ rentalIds: [rental._id.toString()] });

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(first.body.archivedCount).toBe(1);
    expect(second.body.archivedCount).toBe(0);
    expect(second.body.skippedCount).toBe(1);

    const stored = await Rental.findById(rental._id);
    expect(stored.isArchived).toBe(true);
  });

  it("returns the correct preview count and supports archived filtering", async () => {
    const activeRental = new Rental(makeRental({ dateReturned: undefined, rentalFee: undefined }));
    const returnedRental = new Rental(makeRental());
    const archivedRental = new Rental(
      makeRental({
        isArchived: true,
        archivedAt: new Date(),
        archivedBy: adminUser._id,
        archiveReason: "returned-history-cleanup",
      }),
    );

    await activeRental.save();
    await returnedRental.save();
    await archivedRental.save();

    // Older documents predate isArchived and must remain eligible for archiving.
    const legacyRental = makeRental();
    delete legacyRental.isArchived;
    legacyRental._id = new mongoose.Types.ObjectId();
    await Rental.collection.insertOne(legacyRental);

    const preview = await request(app)
      .get("/api/rentals/archive-preview")
      .set("x-auth-token", adminToken);

    expect(preview.status).toBe(200);
    expect(preview.body.count).toBe(2);
    expect(preview.body.eligibleIds).toEqual(
      expect.arrayContaining([
        returnedRental._id.toString(),
        legacyRental._id.toString(),
      ]),
    );
    expect(preview.body.eligibleIds).not.toContain(activeRental._id.toString());
    expect(preview.body.eligibleIds).not.toContain(archivedRental._id.toString());

    const defaultList = await request(app)
      .get("/api/rentals")
      .set("x-auth-token", adminToken);
    expect(defaultList.status).toBe(200);
    expect(defaultList.body).toHaveLength(3);
    expect(defaultList.body.some((rental) => rental.isArchived)).toBe(false);

    const archivedList = await request(app)
      .get("/api/rentals?archived=true")
      .set("x-auth-token", adminToken);

    expect(archivedList.status).toBe(200);
    expect(archivedList.body).toHaveLength(1);
    expect(archivedList.body[0].isArchived).toBe(true);
  });

  it("records archive metadata accurately", async () => {
    const rental = new Rental(makeRental());
    await rental.save();

    const res = await request(app)
      .post("/api/rentals/archive")
      .set("x-auth-token", adminToken)
      .send({ rentalIds: [rental._id.toString()] });

    expect(res.status).toBe(200);

    const stored = await Rental.findById(rental._id);
    expect(stored.archiveReason).toBe("returned-history-cleanup");
    expect(stored.archivedAt).toBeTruthy();
    expect(stored.archivedBy.toString()).toBe(adminUser._id.toString());
  });

  it("archives one selected returned rental and skips an active selection", async () => {
    const returnedRental = new Rental(makeRental());
    const activeRental = new Rental(
      makeRental({ dateReturned: undefined, rentalFee: undefined }),
    );
    await returnedRental.save();
    await activeRental.save();

    const preview = await request(app)
      .post("/api/rentals/archive/preview")
      .set("x-auth-token", adminToken)
      .send({
        rentalIds: [returnedRental._id.toString(), activeRental._id.toString()],
      });

    expect(preview.status).toBe(200);
    expect(preview.body.eligibleCount).toBe(1);
    expect(preview.body.skippedCount).toBe(1);
    expect(preview.body.eligibleIds).toEqual([returnedRental._id.toString()]);

    const archived = await request(app)
      .post("/api/rentals/archive")
      .set("x-auth-token", adminToken)
      .send({ rentalIds: preview.body.eligibleIds });

    expect(archived.status).toBe(200);
    expect(archived.body.archivedCount).toBe(1);
    expect((await Rental.findById(returnedRental._id)).isArchived).toBe(true);
    expect((await Rental.findById(activeRental._id)).isArchived).toBe(false);
  });

  it("archives multiple selected returned rentals", async () => {
    const rentals = [new Rental(makeRental()), new Rental(makeRental())];
    await Rental.insertMany(rentals);

    const res = await request(app)
      .post("/api/rentals/archive")
      .set("x-auth-token", adminToken)
      .send({ rentalIds: rentals.map((rental) => rental._id.toString()) });

    expect(res.status).toBe(200);
    expect(res.body.archivedCount).toBe(2);
    expect(res.body.skippedCount).toBe(0);
    expect(await Rental.countDocuments({ isArchived: true })).toBe(2);

    const preview = await request(app)
      .get("/api/rentals/archive-preview")
      .set("x-auth-token", adminToken);
    const archivedList = await request(app)
      .get("/api/rentals?archived=true")
      .set("x-auth-token", adminToken);

    expect(preview.body.count).toBe(0);
    expect(archivedList.body).toHaveLength(2);
  });

  it("skips a selected rental that becomes ineligible after preview", async () => {
    const rental = new Rental(makeRental());
    await rental.save();

    const preview = await request(app)
      .post("/api/rentals/archive/preview")
      .set("x-auth-token", adminToken)
      .send({ rentalIds: [rental._id.toString()] });

    expect(preview.body.eligibleCount).toBe(1);

    await Rental.updateOne(
      { _id: rental._id },
      { $unset: { dateReturned: 1 } },
    );

    const archive = await request(app)
      .post("/api/rentals/archive")
      .set("x-auth-token", adminToken)
      .send({ rentalIds: preview.body.eligibleIds });

    expect(archive.status).toBe(200);
    expect(archive.body.archivedCount).toBe(0);
    expect(archive.body.skippedCount).toBe(1);
    expect((await Rental.findById(rental._id)).isArchived).toBe(false);
  });
});
