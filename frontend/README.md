# PIMS Frontend

## Run

Install dependencies with `npm install`, then start the Vite development server with `npm run dev`. The frontend connects to `http://localhost:8080` by default. Set `VITE_API_BASE_URL` in a local `.env` file to point at another backend URL.

## Backend Configuration

The Spring application reads its database and JWT settings from environment variables. Set `PIMS_DB_URL`, `PIMS_DB_USERNAME`, `PIMS_DB_PASSWORD`, and `JWT_SECRET` before starting it. `JWT_SECRET` must be a Base64-encoded key with at least 256 bits of entropy.

The backend currently exposes authentication, categories, items, item requests, assignments, maintenance, and pension-point APIs. User listing/status changes, audit logs, delivery confirmation, and a separate return-request workflow do not yet have backend endpoints.