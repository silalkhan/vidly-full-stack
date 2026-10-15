const { User } = require("../../models/user");
const { Genre } = require("../../models/genre");
const request = require("supertest");
const app = require("../../app");
const { connectTestDatabase, closeTestDatabase } = require("./setup");
const bcrypt = require("bcrypt");

describe("auth middleware", () => {
  // Use the test database for the endpoint-level authentication checks.
  beforeAll(connectTestDatabase);
  afterAll(closeTestDatabase);

  afterEach(async () => {
    await Genre.deleteMany({});
    await User.deleteMany({});
  });

  let token;

  const exec = () => {
    // The genres endpoint provides a protected route for exercising auth.
    return request(app)
      .post("/api/genres")
      .set("x-auth-token", token)
      .send({ name: "genre1" });
  };

  beforeEach(() => {
    token = new User({ isAdmin: true }).generateAuthToken();
  });

  it("should return 401 if no token is provided", async () => {
    token = "";

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it("should return 400 if token is invalid", async () => {
    token = "a";
    const res = await exec();
    expect(res.status).toBe(401);
  });

  it("should return 200 if token is valid", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });

  it("should reject a non-admin token for an admin-only genre operation", async () => {
    token = new User({ isAdmin: false }).generateAuthToken();

    const res = await exec();

    expect(res.status).toBe(403);
  });

  it("should reject registration attempts to supply admin privileges", async () => {
    const escalationAttempt = await request(app)
      .post("/api/users")
      .send({
        name: "Vidly User",
        email: "regular-user@example.com",
        password: "password123",
        isAdmin: true,
      });

    expect(escalationAttempt.status).toBe(400);
    expect(await User.findOne({ email: "regular-user@example.com" })).toBeNull();

    const res = await request(app)
      .post("/api/users")
      .set("Origin", "http://localhost:5173")
      .send({
        name: "Vidly User",
        email: "regular-user@example.com",
        password: "password123",
      });

    expect(res.status).toBe(200);
    expect(res.headers["x-auth-token"]).toBeTruthy();
    expect(res.headers["access-control-expose-headers"]).toContain(
      "x-auth-token",
    );
    expect(res.body).not.toHaveProperty("password");
    expect(res.body).not.toHaveProperty("isAdmin");
    const registeredUser = await User.findById(res.body._id);
    expect(registeredUser.password).not.toBe("password123");
    expect(await bcrypt.compare("password123", registeredUser.password)).toBe(
      true,
    );

    const profile = await request(app)
      .get("/api/users/me")
      .set("x-auth-token", res.headers["x-auth-token"]);

    expect(profile.status).toBe(200);
    expect(profile.body).toMatchObject({
      name: "Vidly User",
      email: "regular-user@example.com",
      isAdmin: false,
    });
    expect(profile.body).not.toHaveProperty("password");
  });

  it("should require a valid token to get the current user", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.status).toBe(401);
  });

  it("should return a valid JWT from login for correct credentials", async () => {
    const user = new User({
      name: "Login User",
      email: "login-user@example.com",
      password: await bcrypt.hash("password123", 10),
    });
    await user.save();

    const res = await request(app).post("/api/auth").send({
      email: user.email,
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(typeof res.text).toBe("string");
    expect(res.text.split(".")).toHaveLength(3);

    const rejected = await request(app).post("/api/auth").send({
      email: user.email,
      password: "incorrect-password",
    });
    expect(rejected.status).toBe(400);
  });

  it("should return 401 for an invalid token at the current-user endpoint", async () => {
    const res = await request(app)
      .get("/api/users/me")
      .set("x-auth-token", "invalid");

    expect(res.status).toBe(401);
  });
});
