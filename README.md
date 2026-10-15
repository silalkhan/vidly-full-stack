# Vidly

Vidly is a full-stack movie-rental management application with a React,
TypeScript, Vite, and Tailwind frontend and an Express, MongoDB, and Mongoose
API.

## Requirements

- Node.js 20.20.2 (see `backend/package.json`)
- npm
- MongoDB; a replica set is required for transaction support

## Local setup

Install each app's dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
```

Configure the API:

```bash
cd backend
cp .env.example .env
```

Set a private `JWT_PRIVATE_KEY`, and configure `DB_HOST`, `DB_NAME`, and
`DB_REPLICA_SET` for your MongoDB instance. Set `CLIENT_ORIGIN` to the
frontend's origin (default `http://localhost:5173`). Do not commit `.env` or
real credentials. The API defaults to port `3003`.

Configure the frontend if the API is hosted elsewhere:

```bash
cd frontend
cp .env.example .env
```

`VITE_API_URL` is the API origin without the `/api` suffix. It defaults to
`http://localhost:3003`.

Run each app in a separate terminal:

```bash
cd backend && npm start
cd frontend && npm run dev
```

The Vite development server defaults to `http://localhost:5173`.

## Authentication and roles

Register at `/register` or log in at `/login`. The API returns a signed JWT;
the frontend persists that token in local storage and loads the authenticated
profile from `GET /api/users/me`. Passwords are never persisted by the
frontend. New accounts are regular users; administrator status must be assigned
through trusted server-side operations and cannot be requested during
registration.

The frontend protects routes for usability, but the API independently checks
authentication and authorization. Movie, genre, customer, rental, and return
management operations are admin-only. Public movie and genre reads do not
require a token.

See [backend/README.md](./backend/README.md) for the complete API contract and
[frontend/README.md](./frontend/README.md) for frontend commands.

## Verification

```bash
cd frontend && npm run build
cd frontend && npm run lint
cd backend && npm test
```

Backend integration tests use a separate `vidly_test` database configured
through `.env.test` or the test environment variables. They must never point at
the development database.
