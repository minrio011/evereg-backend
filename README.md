# Evereg Backend

TypeScript + Express backend for the Evereg project. Provides authentication and campaign registration APIs backed by PostgreSQL.

## Tech Stack

- Node.js + TypeScript
- Express 5
- PostgreSQL (pg)
- Zod (request validation)
- JWT (authentication)
- Nodemailer (email notifications)

## Prerequisites

- Node.js (recommended: 18+)
- npm
- PostgreSQL (local install) or Docker Desktop (for docker-compose)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start PostgreSQL

### Option A: Docker (recommended)

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5432` and runs the schema/seed in [db/init.sql](file:///c:/Users/submi/Desktop/Personal-Project/evereg/evereg-backend/db/init.sql).

### Option B: Local Postgres

Create a database and run the SQL from [db/init.sql](file:///c:/Users/submi/Desktop/Personal-Project/evereg/evereg-backend/db/init.sql).

3. Create a `.env` file in the project root:

```env
PORT=5000
DATABASE_URL=postgres://evereg:evereg@localhost:5432/evereg

JWT_SECRET=change-me
JWT_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=10

EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
```

Notes:

- `DATABASE_URL` is required. The code enables SSL automatically when the URL does not include `localhost`.
- For Gmail, use an App Password (recommended) instead of your normal account password.

## Running

### Development

```bash
npm run dev
```

This runs `src/index.ts` via `ts-node-dev` (fast reload, no typechecking).

### Production build

```bash
npm run build
npm start
```

Build output goes to `dist/` (configured in [tsconfig.json](file:///c:/Users/submi/Desktop/Personal-Project/evereg/evereg-backend/tsconfig.json)).

## API

Base URL: `http://localhost:${PORT}`

### Health / DB

- `GET /test-db` — runs `SELECT NOW()` to verify DB connectivity

### Auth (`/api/auth`)

- `POST /api/auth/register`
  - Body: `{ "email": string, "password": string, "username": string }`
- `POST /api/auth/login`
  - Body: `{ "email": string, "password": string }`
  - Returns: `{ token: string, data: { user: ... } }`
- `GET /api/auth/me`
  - Auth: `Authorization: Bearer <token>`
  - Returns current user

### Campaign (`/api/campaign`)

- `POST /api/campaign/register`
  - Body: `{ "first_name": string, "last_name": string, "email": string, "phone_number": string, "event_id": number }`
  - Sends a confirmation email (if email config is set)
- `GET /api/campaign/summary`
  - Auth: `Authorization: Bearer <token>`
- `GET /api/campaign/registration/all`
  - Auth: `Authorization: Bearer <token>`
  - Query: `page`, `limit`, optional `event_id`, `search`, `email`, `start_date`, `end_date`
- `GET /api/campaign/registration/export`
  - Auth: `Authorization: Bearer <token>`
  - Same query params as `/registration/all`
  - Returns a CSV attachment
- `PATCH /api/campaign/registration/eligibility`
  - Auth: `Authorization: Bearer <token>`
  - Body: `{ "id": number }`
- `POST /api/campaign/registration/send-email`
  - Auth: `Authorization: Bearer <token>`
  - Body: `{ "id": number }`

## Project Structure

```
src/
  index.ts                Express app bootstrap
  configs/db.ts            PG Pool + query helper
  middlewares/             JWT auth + Zod validation
  modules/
    auth/                  Register/login/me
    campaign/              Registrations, exports, admin actions
    email/                 Email sender (nodemailer)
```

## Database Schema

The initial schema and seed data live in [db/init.sql](file:///c:/Users/submi/Desktop/Personal-Project/evereg/evereg-backend/db/init.sql):

- `events` — event list and schedule
- `registrations` — user registrations per event (eligibility + email sent flags)
- `users` — admin/auth users for protected endpoints
