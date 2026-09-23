# Vidly - Video Rental Backend API

A RESTful backend API for a video rental application built with **Node.js**, **Express.js**, and **MongoDB with Mongoose**.

The project implements CRUD operations, JWT authentication, role-based authorization, database relationships, MongoDB transactions, structured application startup, environment-based configuration, manual API testing, unit testing, integration testing, and Test-Driven Development (TDD).

This project was originally inspired by Mosh Hamedani's Node.js course and has been updated to work with modern Node.js packages and APIs.

---

# 🏗️ Architectural Overview

The application separates the **Express application** from the **HTTP server startup**.

This makes it possible to:

* Run the application normally with a real HTTP server.
* Import the Express application directly into Jest/Supertest.
* Test endpoints without creating a separate network server for every test.
* Keep application configuration separate from server startup.

```text
                    ┌──────────────────────┐
                    │       app.js         │
                    │                      │
                    │   Express App        │
                    │   Routes             │
                    │   Middleware         │
                    │   Validation         │
                    │   Error Handling     │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌────────────────┐          ┌────────────────┐
        │    server.js   │          │      Jest      │
        │                │          │                │
        │ app.listen()   │          │   Supertest    │
        └───────┬────────┘          └───────┬────────┘
                │                           │
                ▼                           ▼
        Real HTTP Server             Integration Tests
```

### Why separate `app.js` and `server.js`?

### `app.js`

Responsible for creating and configuring the Express application:

* Express middleware
* Routes
* Authentication
* Validation
* Error handling
* Application configuration

It exports the Express application.

### `server.js`

Responsible for starting the actual HTTP server:

```js
app.listen(...)
```

### Jest + Supertest

Tests can import the Express application directly:

```text
Jest
  │
  ▼
Supertest
  │
  ▼
Express App
  │
  ▼
Routes
  │
  ▼
Database
```

This avoids coupling integration tests to a manually running server.

---

# 🧠 How the Application Works

The main request flow is:

```text
Client
  │
  │ HTTP Request
  ▼
┌─────────────────┐
│     Express     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Middleware    │
│                 │
│ Auth            │
│ Admin           │
│ Validation      │
│ ObjectId        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│      Route      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Mongoose    │
│     Models      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     MongoDB     │
└────────┬────────┘
         │
         ▼
     HTTP Response
```

This project helped me understand that a backend is not just routes.

A request passes through several layers before the response is returned.

---

# 🛠️ Tech Stack

| Technology | Purpose                   |
| ---------- | ------------------------- |
| Node.js    | JavaScript runtime        |
| Express.js | REST API framework        |
| MongoDB    | Database                  |
| Mongoose   | MongoDB ODM               |
| JWT        | Authentication            |
| bcrypt     | Password hashing          |
| Joi        | Request validation        |
| Winston    | Application logging       |
| Jest       | Automated testing         |
| Supertest  | HTTP integration testing  |
| dotenv     | Environment configuration |
| Nodemon    | Development server        |

---

# 📁 Project Structure

```text
backend/
│
├── app.js
├── server.js
├── package.json
├── .env
├── .env.example
├── .env.test
│
├── config/
│   └── index.js
│
├── models/
│   ├── user.js
│   ├── genre.js
│   ├── customer.js
│   ├── movie.js
│   └── rental.js
│
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── genres.js
│   ├── customers.js
│   ├── movies.js
│   ├── rentals.js
│   └── returns.js
│
├── middleware/
│   ├── auth.js
│   ├── admin.js
│   ├── async.js
│   ├── error.js
│   ├── validate.js
│   └── validateObjectId.js
│
├── startup/
│   ├── config.js
│   ├── db.js
│   ├── logging.js
│   └── routes.js
│
└── tests/
    ├── unit/
    │   ├── models/
    │   └── middleware/
    │
    └── integration/
        ├── genres.test.js
        ├── returns.test.js
        └── auth.test.js
```

---

# 🚀 Getting Started

## Prerequisites

Install:

* Node.js
* npm
* MongoDB

---

## Install Dependencies

```bash
npm install
```

---

# 🔐 Environment Configuration

The project uses environment variables instead of hard-coding sensitive configuration.

Example:

```env
PORT=3001

vidly_jwtPrivateKey=MySecureJWT_SecretKey

DB_HOST=172.17.16.1
DB_PORT=27017
DB_NAME=vidly
```

Testing uses a separate database:

```env
NODE_ENV=test

DB_NAME=vidly_test
```

The test database is intentionally separated from the development database.

```text
Development
     │
     ▼
  vidly DB


Testing
     │
     ▼
vidly_test DB
```

Real `.env` files should not be committed to GitHub.

Use `.env.example` to document required variables.

---

# ▶️ Running the Application

Start the development server:

```bash
npm start
```

The API runs on:

```text
http://localhost:3001
```

---

# 🔑 Authentication

Protected endpoints use JWT authentication.

The token is sent through:

```text
x-auth-token
```

Example:

```text
x-auth-token: <YOUR_JWT_TOKEN>
```

Authentication flow:

```text
┌─────────────────┐
│ Register User   │
└────────┬────────┘
         ▼
POST /api/users
         │
         ▼
┌─────────────────┐
│   Login User    │
└────────┬────────┘
         ▼
POST /api/auth
         │
         ▼
     JWT Token
         │
         ▼
  x-auth-token
         │
         ▼
┌─────────────────┐
│ Protected API   │
└─────────────────┘
```

---

# 👤 Authentication vs Authorization

The project separates two concepts.

### Authentication

Answers:

> Who are you?

Handled by:

```text
auth middleware
```

### Authorization

Answers:

> Are you allowed to perform this operation?

Handled by:

```text
admin middleware
```

Example:

```text
DELETE /api/genres/:id

        │
        ▼
Authentication
        │
        ▼
Authorization
        │
        ▼
Delete Genre
```

---

# 📡 API Endpoints

## 🔑 Users

### Register

```http
POST /api/users
```

Example:

```json
{
  "name": "Test User",
  "email": "testuser@vidly.com",
  "password": "Password1234!"
}
```

---

## 🔐 Authentication

### Login

```http
POST /api/auth
```

Example:

```json
{
  "email": "testuser@vidly.com",
  "password": "Password1234!"
}
```

---

# 🎬 Genres

| Method | Endpoint          | Authentication |
| ------ | ----------------- | -------------- |
| GET    | `/api/genres`     | No             |
| GET    | `/api/genres/:id` | No             |
| POST   | `/api/genres`     | Yes            |
| PUT    | `/api/genres/:id` | Yes            |
| DELETE | `/api/genres/:id` | Yes + Admin    |

Example:

```json
{
  "name": "Action"
}
```

---

# 👥 Customers

| Method | Endpoint             |
| ------ | -------------------- |
| GET    | `/api/customers`     |
| GET    | `/api/customers/:id` |
| POST   | `/api/customers`     |
| PUT    | `/api/customers/:id` |
| DELETE | `/api/customers/:id` |

Example:

```json
{
  "name": "ShahKhalid",
  "phone": "1234567890",
  "isGold": true
}
```

---

# 🎥 Movies

| Method | Endpoint          | Authentication |
| ------ | ----------------- | -------------- |
| GET    | `/api/movies`     | No             |
| GET    | `/api/movies/:id` | No             |
| POST   | `/api/movies`     | Yes            |
| PUT    | `/api/movies/:id` | Yes            |
| DELETE | `/api/movies/:id` | Yes            |

Example:

```json
{
  "title": "Inception",
  "genreId": "YOUR_GENRE_ID",
  "numberInStock": 5,
  "dailyRentalRate": 2
}
```

---

# 🎞️ Rentals

### Create Rental

```http
POST /api/rentals
```

Authentication required.

Example:

```json
{
  "customerId": "YOUR_CUSTOMER_ID",
  "movieId": "YOUR_MOVIE_ID"
}
```

The rental operation uses a MongoDB transaction.

```text
             Create Rental
                  │
                  ▼
         Validate Customer
                  │
                  ▼
           Validate Movie
                  │
                  ▼
          Create Rental
                  │
                  ▼
       Decrease Movie Stock
                  │
                  ▼
           Commit Transaction
```

If an operation fails:

```text
Transaction Error
       │
       ▼
Abort Transaction
       │
       ▼
Rollback Changes
```

This prevents the database from being left in a partially updated state.

---

# 🔄 Returns

### Return a Rental

```http
POST /api/returns
```

Authentication required.

Example:

```json
{
  "customerId": "YOUR_CUSTOMER_ID",
  "movieId": "YOUR_MOVIE_ID"
}
```

Return flow:

```text
POST /api/returns
        │
        ▼
Authentication
        │
        ▼
Validate Request
        │
        ▼
Find Rental
        │
        ├──── Not Found ────► 404
        │
        ▼
Check dateReturned
        │
        ├──── Already Returned ───► 400
        │
        ▼
Calculate Rental Fee
        │
        ▼
Set Return Date
        │
        ▼
Save Rental
        │
        ▼
Increase Movie Stock
        │
        ▼
Return Rental
        │
        ▼
       200
```

The `/api/returns` route currently has complete integration-test coverage.

---

# 🗄️ Database Architecture

```text
                    MongoDB
                       │
                       ▼
                  Mongoose ODM
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
     User            Genre            Customer
       │                                │
       │                                │
       └──────────────┐                 │
                      ▼                 ▼
                    Movie ◄──────── Rental
```

Main models:

* User
* Genre
* Customer
* Movie
* Rental

Mongoose provides:

* Schema definitions
* Validation
* Database queries
* Model methods
* Relationships/references
* Transaction support

---

# 🧪 Testing Strategy

The project uses three different testing approaches.

```text
                     Vidly API
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
       Postman        Integration      Unit
          │              │              │
          │              │              │
       Manual         Jest +          Jest
       Testing        Supertest
          │              │              │
          ▼              ▼              ▼
      API Client      API Flow       Isolated
      Behaviour       Behaviour       Logic
```

Each approach has a different purpose.

---

# 1️⃣ Postman Testing

Postman was used for **manual API testing**.

The purpose was to verify the API from the perspective of an actual API client.

Testing included:

* User registration
* Authentication
* JWT tokens
* Genres
* Customers
* Movies
* Rentals
* Protected endpoints
* Administrator authorization
* Rental transactions
* Returns

The manual Postman testing phase has been completed.

---

# 2️⃣ Integration Testing

Integration testing checks whether multiple parts of the backend work together correctly.

The flow looks like:

```text
Supertest
    │
    ▼
HTTP Request
    │
    ▼
Express
    │
    ▼
Middleware
    │
    ▼
Route Handler
    │
    ▼
Mongoose Model
    │
    ▼
MongoDB Test Database
    │
    ▼
HTTP Response
```

Current integration tests:

```text
tests/integration/

├── genres.test.js
├── returns.test.js
└── auth.test.js
```

These tests verify real application behaviour rather than testing a single function in isolation.

---

# 3️⃣ Unit Testing

Unit tests focus on small pieces of logic.

Current unit tests include:

```text
tests/unit/

├── models/
│   └── user.test.js
│
└── middleware/
    └── auth.test.js
```

For example, the User model contains:

```js
generateAuthToken()
```

The unit test verifies that the method creates a valid JWT.

```text
User Model
    │
    ▼
generateAuthToken()
    │
    ▼
JWT Token
    │
    ▼
jwt.verify()
    │
    ▼
Expected Payload
```

Unit tests are useful for isolated logic such as:

* Model methods
* Middleware behaviour
* Validation logic
* Utility functions
* Business logic

---

# 🔴 TDD — Test-Driven Development

TDD is not another testing library.

It is a development process.

The basic cycle is:

```text
             ┌──────────────┐
             │ Write Test   │
             └──────┬───────┘
                    │
                    ▼
                🔴 RED
              Test Fails
                    │
                    ▼
             ┌──────────────┐
             │ Write Minimum│
             │    Code      │
             └──────┬───────┘
                    │
                    ▼
                🟢 GREEN
              Test Passes
                    │
                    ▼
             ┌──────────────┐
             │   Refactor   │
             └──────┬───────┘
                    │
                    ▼
                  Repeat
```

TDD can be applied to unit tests or integration tests.

The important idea is:

```text
Test
 ↓
Fail
 ↓
Implementation
 ↓
Pass
 ↓
Refactor
```

The project includes TDD learning based on the course exercises and endpoint testing approach.

---

# 📊 Current Automated Test Results

Latest test command:

```bash
npm test -- --detectOpenHandles
```

Result:

```text
Test Suites: 5 passed, 5 total
Tests:       37 passed, 37 total
Time:        5.954 s
```

### Test Result Graph

```text
Automated Tests

Passed
████████████████████████████████████ 37

Failed
                                     0

Total
████████████████████████████████████ 37
```

Current automated test status:

```text
┌────────────────────────────┬────────┐
│ Test Suites                │ 5      │
├────────────────────────────┼────────┤
│ Passed Suites              │ 5  ✅  │
│ Failed Suites              │ 0  ✅  │
├────────────────────────────┼────────┤
│ Total Tests                │ 37     │
│ Passed Tests               │ 37 ✅  │
│ Failed Tests               │ 0  ✅  │
└────────────────────────────┴────────┘
```

---

# 📈 Code Coverage

Latest Jest coverage:

```text
Statements     66.12%
Branches       36.95%
Functions      50.00%
Lines          68.20%
```

### Coverage Graph

```text
Statements
█████████████████████████████░░░░░░░░░ 66.12%

Branches
███████████████░░░░░░░░░░░░░░░░░░░░░░ 36.95%

Functions
██████████████████████░░░░░░░░░░░░░░ 50.00%

Lines
██████████████████████████████░░░░░░░ 68.20%
```

Coverage should be interpreted as a measurement of which code paths were exercised by the current automated tests. It is not by itself a measurement of overall software quality.

---

# 📋 Current Coverage by Main Area

```text
Application
████████████████████████████████████ 88.23%

Middleware
██████████████████████████████████   90.32%

Models
████████████████████████████████     84.31%

Routes
██████████████████                   48.80%

Startup
██████████████████████████████████   90.90%
```

The lower route coverage is expected because only selected endpoints currently have automated integration tests.

---

# 🧪 Current Test Coverage Map

```text
                    Vidly Testing
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
    Postman          Integration          Unit
       │                 │                 │
       │                 │                 │
       ▼                 ▼                 ▼
    Manual             Jest +            Jest
    Testing            Supertest
       │                 │                 │
       ▼                 ▼                 ▼
   All main          Genres             User Model
   API routes        Returns            Auth Middleware
                     Auth
```

---

# 🔍 Returns Endpoint Test Coverage

The `/api/returns` endpoint currently has **10 integration tests**.

```text
/api/returns
      │
      ├── 401 Unauthorized              ✅
      ├── 400 Missing customerId        ✅
      ├── 400 Missing movieId           ✅
      ├── 404 Rental not found          ✅
      ├── 400 Already returned          ✅
      ├── 200 Valid request             ✅
      ├── Sets return date              ✅
      ├── Calculates rental fee         ✅
      ├── Increases movie stock         ✅
      └── Returns rental object         ✅
```

Coverage report:

```text
returns.js

Statements     100%
Branches       100%
Functions      100%
Lines          100%
```

This is a good example of how integration tests can verify the complete behaviour of an endpoint.

---

# 🧪 Test Environment

Automated tests use a separate MongoDB database:

```text
Development
     │
     ▼
  vidly


Testing
     │
     ▼
vidly_test
```

This prevents tests from modifying development data.

The test environment is loaded through:

```text
.env.test
```

The test command uses:

```text
Jest
   │
   ▼
setup.js
   │
   ▼
.env.test
   │
   ▼
vidly_test
```

---

# 🛑 Open Handle Investigation

Initially Jest reported:

```text
Jest did not exit one second after the test run
```

The test suite was then executed with:

```bash
npm test -- --detectOpenHandles
```

The latest run completed successfully:

```text
Test Suites: 5 passed
Tests:       37 passed
```

No open-handle diagnostic was reported in the latest output.

This command is useful when Jest appears to keep running because some asynchronous resource has not been closed.

---

# ⚠️ Current Mongoose Warning

The latest test output still reports:

```text
[MONGOOSE] Warning:
the `new` option for `findOneAndUpdate()`
and `findOneAndReplace()` is deprecated.

Use `returnDocument: 'after'` instead.
```

This is a **deprecation warning**, not a failed test.

The tests still pass:

```text
37 passed
```

The affected database operations should eventually be modernized to use the current Mongoose option.

---

# 🔒 Security Features

The backend includes:

* JWT authentication
* Password hashing with bcrypt
* Role-based authorization
* Protected routes
* Joi validation
* ObjectId validation
* Environment-based secrets
* Separate test database
* Error handling
* Logging

---

# 🧩 What I Learned From This Project

The project was used to understand backend development rather than simply copying a course project.

Important concepts learned:

```text
Node.js
   │
   ▼
Express
   │
   ▼
REST APIs
   │
   ├── Routing
   ├── Middleware
   ├── Authentication
   ├── Authorization
   └── Validation
   │
   ▼
Mongoose
   │
   ▼
MongoDB
   │
   ├── Models
   ├── Queries
   ├── Relationships
   └── Transactions
   │
   ▼
Testing
   │
   ├── Postman
   ├── Unit Testing
   ├── Integration Testing
   └── TDD
   │
   ▼
Deployment
```

---

# 🆚 Course Code vs Modernized Project

The project started from an older Node.js course.

Some course examples use older packages and APIs.

During development, modern dependencies required updates such as:

```text
Older Course
     │
     ▼
Older Node/Express/Mongoose APIs
     │
     ▼
Modern Dependencies
     │
     ▼
Updated Vidly Code
```

Examples include:

* Modern Joi object validation
* Environment variables with dotenv
* Modern Mongoose APIs
* Native Mongoose transactions
* Updated ObjectId validation
* Modern Jest testing
* Express application/server separation
* Jest + Supertest integration testing

The goal was to understand the original concepts while adapting the implementation to a modern development environment.

---

# 📊 Overall Learning Journey

```text
                 VIDLY BACKEND
                      │
                      ▼
              ┌───────────────┐
              │ Node.js       │
              └───────┬───────┘
                      ▼
              ┌───────────────┐
              │ Express.js    │
              └───────┬───────┘
                      ▼
              ┌───────────────┐
              │ REST API      │
              └───────┬───────┘
                      ▼
              ┌───────────────┐
              │ MongoDB       │
              │ + Mongoose    │
              └───────┬───────┘
                      ▼
              ┌───────────────┐
              │ Authentication│
              │ Authorization │
              └───────┬───────┘
                      ▼
              ┌───────────────┐
              │ Transactions  │
              └───────┬───────┘
                      ▼
              ┌───────────────┐
              │ Postman       │
              └───────┬───────┘
                      ▼
              ┌───────────────┐
              │ Unit Testing  │
              └───────┬───────┘
                      ▼
              ┌───────────────┐
              │ Integration   │
              │ Testing       │
              └───────┬───────┘
                      ▼
              ┌───────────────┐
              │ TDD           │
              └───────┬───────┘
                      ▼
              ┌───────────────┐
              │ Deployment    │
              └───────────────┘
```

---

# 📌 Current Project Progress

```text
Node.js                     ✅
Express.js                  ✅
REST APIs                   ✅
MongoDB + Mongoose          ✅
CRUD Operations             ✅
Relationships               ✅
MongoDB Transactions        ✅
Authentication              ✅
Authorization               ✅
Validation                  ✅
Error Handling              ✅
Logging                     ✅
Environment Configuration   ✅

Postman Testing             ✅
Unit Testing                ✅
Integration Testing         🔄
TDD                         ✅ Learning completed
Deployment                  ⏳
```

### Automated testing status

```text
Test Suites
████████████████████████████████████ 5/5 PASS

Tests
████████████████████████████████████ 37/37 PASS
```

Integration testing is **not yet complete for every API route**. Currently the automated integration suite covers:

```text
Genres       ✅
Returns      ✅
Auth         ✅

Customers    ⏳
Movies       ⏳
Rentals      ⏳
Users        ⏳
```

---

# 🎯 Next Step: Deployment

The next major stage is deployment.

The deployment learning path will be:

```text
Local Development
       │
       ▼
Automated Tests
       │
       ▼
Environment Variables
       │
       ▼
Production Database
       │
       ▼
Deploy Backend
       │
       ▼
Configure Production
       │
       ▼
Test Production API
       │
       ▼
Production API 🚀
```

Before deployment, the remaining technical cleanup includes:

1. Complete integration tests for the important remaining routes.
2. Review the Mongoose deprecation warning.
3. Confirm production environment variables.
4. Confirm production MongoDB configuration.
5. Run the complete test suite.
6. Deploy the backend.
7. Test the deployed API.

---

# 📄 License

This project is intended for educational and development purposes.
