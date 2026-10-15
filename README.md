# Vidly

Vidly is a full-stack movie-rental application. Customers can browse movies,
rent available titles, view their own rental history, and return rentals.
Administrators can manage the catalogue and customers, see rental activity,
and archive returned rental records for audit purposes.

The project is split into two applications:

- `backend/` — an Express REST API, MongoDB/Mongoose data models, and Jest tests.
- `frontend/` — a React and TypeScript website built with Vite, React Router,
  TanStack Query, Axios, and Tailwind CSS.

## Learn how the app fits together

When you use Vidly, the main request flow is:

1. The browser displays a page from `frontend/src/pages/`.
2. A page uses a hook from `frontend/src/hooks/` to load or change data.
3. `frontend/src/services/apiClient.ts` sends the HTTP request and attaches
   the saved login token when one exists.
4. Express matches the URL in `backend/startup/routes.js` and runs the
   middleware and handler in `backend/routes/`.
5. The route reads or changes MongoDB through a model in `backend/models/`.
6. TanStack Query updates or reloads the affected frontend data.

Useful places to start reading:

| If you want to understand... | Start here |
| --- | --- |
| How pages and URLs are connected | `frontend/src/App.tsx` |
| How login, current-user profile, and roles work | `frontend/src/context/AuthProvider.tsx` and `backend/routes/auth.js` |
| How frontend requests include the login token | `frontend/src/services/apiClient.ts` and `backend/middleware/auth.js` |
| How customers rent a movie | `frontend/src/pages/MoviesPage.tsx`, `frontend/src/hooks/useRentMovie.ts`, and `backend/routes/rentals.js` |
| How customers see and return their own rentals | `frontend/src/pages/MyRentalsPage.tsx`, `frontend/src/hooks/useMyRentals.ts`, and `backend/routes/returns.js` |
| How admins manage and archive rentals | `frontend/src/pages/RentalsPage.tsx` and the archive routes in `backend/routes/rentals.js` |
| How data is shaped and validated | `backend/models/` |
| How to see examples of expected behavior | `backend/tests/` |

The backend and frontend READMEs explain each side in more detail:
[backend guide](./backend/README.md) · [frontend guide](./frontend/README.md).

## Requirements

- Node.js `20.20.2` (see `backend/package.json`)
- npm
- MongoDB; rental creation and return transactions require a replica set

## Install and configure

Install dependencies in both applications:

```bash
cd backend
npm install
cd ../frontend
npm install
cd ..
```

Configure the backend:

```bash
cd backend
cp .env.example .env
```

Set a private `JWT_PRIVATE_KEY`, and configure `DB_HOST`, `DB_NAME`, and
`DB_REPLICA_SET` for your MongoDB instance. Set `CLIENT_ORIGIN` to the
frontend's origin (default `http://localhost:5173`). Do not commit `.env` or
real credentials. The API defaults to port `3003`.

If the API is hosted somewhere other than the default, configure the frontend:

```bash
cd frontend
cp .env.example .env
```

`VITE_API_URL` is the API origin without `/api`. It defaults to
`http://localhost:3003`.

## Run Vidly in WSL

Open two WSL terminal tabs, with the repository available in each:

**Terminal 1 — API**

```bash
cd /path/to/vidly-project/backend
npm start
```

**Terminal 2 — website**

```bash
cd /path/to/vidly-project/frontend
npm run dev
```

Open the Vite URL shown in the terminal, usually
`http://localhost:5173`. If your repository is in your WSL home directory,
replace `/path/to/vidly-project` with its actual Linux path, for example
`~/work-space/vidly-project`.

## Sign-in and permissions

Register at `/register` or sign in at `/login`. The backend returns a signed
JWT; the frontend saves it in browser local storage and uses it to load the
current profile from `GET /api/users/me`. Passwords are not saved by the
frontend. New registrations are regular accounts and cannot grant themselves
administrator access.

The frontend hides or redirects away from pages a user cannot use, but this is
only a user-interface convenience. The backend independently checks the token
and permissions before protected operations. A regular customer can rent,
view, and return only rentals belonging to their own account. Management and
archive endpoints require an administrator.

## Screenshots

Put screenshots you want to include in the repository in
[`screenshots/`](./screenshots/). You can save a screenshot there from Windows
or copy it into WSL, for example:

```bash
cp /mnt/c/Users/YOUR_WINDOWS_NAME/Pictures/vidly-home.png screenshots/
```

Replace `YOUR_WINDOWS_NAME` with your Windows account folder and use the
actual screenshot filename. To display one here in the README, add a line
like this and change the path to match the image:

```markdown
![Vidly home page](./screenshots/vidly-home.png)
```

Only add screenshots that do not expose passwords, private customer details,
tokens, or other personal information.

## Checks

Run the frontend production build and linter, and the backend tests:

```bash
cd frontend
npm run build
npm run lint
cd ../backend
npm test
```

Backend integration tests use a separate `vidly_test` database configured in
`.env.test` or with test environment variables. They must never point to the
development database. See the [backend testing guide](./backend/README.md#testing).

## Review, commit, and push from WSL

Before committing, check which files have changed and make sure secrets and
local environment files are not included:

```bash
git status --short
git diff
```

Stage only the files you intend to publish. For example, to stage the README
updates and screenshots:

```bash
git add README.md backend/README.md frontend/README.md screenshots/
git diff --cached
```

If you also intend to include the application changes, stage those files after
reviewing them. Then commit and push the current branch:

```bash
git commit -m "docs: add beginner-friendly Vidly guides"
git push
```

If Git says there is no upstream branch yet, use the command it suggests, or:

```bash
git push -u origin "$(git branch --show-current)"
```

These commands publish the commit to the configured GitHub remote. Review the
staged diff before committing so you do not accidentally publish unrelated
work, `.env` files, credentials, or private screenshots.
