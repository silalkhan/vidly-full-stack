# Vidly Frontend

The frontend uses React, TypeScript, Vite, React Router, Axios,
TanStack Query, and Tailwind CSS v4.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

`VITE_API_URL` is the API origin without `/api`. The default is
`http://localhost:3003`; set it in `.env` if your backend uses another origin.
The Vite development server defaults to `http://localhost:5173`.

## Checks

```bash
npm run build
npm run lint
```

There is currently no frontend test script. API behavior and authorization are
covered by the backend Jest/Supertest suite; see [../backend/README.md](../backend/README.md).
