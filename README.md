# Thrivo Mobile Backend

RESTful API service for Thrivo Mobile, written in TypeScript and powered by Express and SQLite. It serves authenticated startup discovery data (feed items, deals, founder profiles) to the mobile client.

## Project Status

Under active development. The current codebase targets TypeScript 5.4.5, Express 4, sqlite3 6.x.

## Requirements

- Node.js 20 or newer (the CI workflow pins Node 20)
- npm 10 or newer

## Getting Started

1. Clone and enter the project:

       git clone https://github.com/Ambixion-Corp/thrivo-mobile-backend.git
       cd thrivo-mobile-backend

2. Install dependencies:

       npm install

3. Configure environment. A sample is provided in .env.example:

       cp .env.example .env
       # Edit .env if needed (defaults are fine for local development)

4. Start the development server (with live reload via ts-node-dev):

       npm run dev
       # API available on http://localhost:5000

5. (Production build) Compile TypeScript then start:

       npm run build   # compiles to /dist
       npm start       # runs node dist/index.js

## API Quick Reference

By default all API routes are mounted under /api.

    GET  /health                  Health check: { status: 'ok', timestamp }
    POST /api/auth/signup         Register a new user
    POST /api/auth/login           Authenticate and receive a JWT
    GET  /api/feed                List feed items (newest first)
    POST /api/feed/:id/like        Like/unlike a feed item (body: { action: 'like'|'unlike' })
    GET  /api/deals              List investment deals (newest first)
    POST /api/deals/:id/intro     Request an introduction to a deal

See docs/API.md for full request/response schemas.

## Project Structure

    src/
      index.ts            Express app bootstrap: middleware (cors, json), route mounting, health check
      config/
        db.ts             SQLite connection helper (opens database.sqlite, singleton getDb())
      models/
        schema.ts         Database initialization (CREATE TABLE) + seed data for feed and deals
      controllers/
        authController.ts Signup + login (bcryptjs hashing, JWT signing via jsonwebtoken)
        feedController.ts Get feed + like/unlike
        dealController.ts Get deals + request an intro
      routes/
        authRoutes.ts       POST /signup, POST /login
        feedRoutes.ts         GET /, POST /:id/like
        dealRoutes.ts         GET /, POST /:id/intro
      middleware/
        auth.ts           JWT verification middleware (authenticateToken)

    database.sqlite       SQLite database file (auto-created on first run)
    .env                  Environment variables (do not commit the real one)
    tsconfig.json         TypeScript config (strict, CommonJS, moduleResolution node)

## Database

- SQLite is used as the data store; the database file (database.sqlite) is created at the project root on first run by src/models/schema.ts.
- Tables: users, feed_items, deals. See docs/API.md for column details.
- Default seed data is inserted when the feed and deals tables are empty.

## Authentication

- Passwords are hashed with bcryptjs (10 rounds).
- Users authenticate with email + password and receive a JWT signed with JWT_SECRET (7-day expiry).
- The token is returned as { token, user: { id, email, role, name } } and must be sent by the client for authenticated requests (Bearer token header).
- A reference authenticateToken middleware exists in src/middleware/auth.ts for protecting routes. Roles: founder, investor, creator, consumer.

## Configuration

Environment variables (see .env.example):

    PORT=5000                         Port the server listens on (default 5000)
    JWT_SECRET=super_secret_thrivo_key_2026  Secret used to sign JWTs
    NODE_ENV=development              Environment label

## Scripts

    npm run dev     Start server with ts-node-dev (live reload)
    npm run build   Compile TypeScript to /dist
    npm start       Run the compiled server from /dist
    npm run lint    (if configured)

## Testing

There is no unit test runner configured yet. CI performs a TypeScript build via `npm ci && npm run build` (see .github/workflows/ci.yml). Ensure the build passes before opening a pull request.

## Branch Convention

- Default branch: main
- Feature branches: feature/<descriptive-name>
- Each pull request runs CI: npm ci && npm run build

## License

MIT License. See LICENSE for details.
