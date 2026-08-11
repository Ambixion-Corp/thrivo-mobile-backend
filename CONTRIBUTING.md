# Contributing to Thrivo Mobile Backend

Thanks for your interest in contributing. This document explains the workflow and conventions for the backend service.

## Prerequisites

- Node.js 20+ (CI uses Node 20)
- npm 10+

## Getting Started

1. Fork and clone your fork.
2. Create a feature branch:

       git checkout -b feature/<descriptive-name>

3. Install dependencies:

       npm install

4. Set up the environment:

       cp .env.example .env

5. Start the server:

       npm run dev

## Development Workflow

- Make changes on a feature branch named `feature/<descriptive-name>`.
- One feature or fix per pull request; keep changes focused.
- Write type-safe code; this project uses TypeScript with strict mode.
- Ensure the build passes before opening a PR (it is the CI gate):

       npm run build

- Push to your fork and open a pull request against `main`.

## Code Style

- 2-space indentation.
- Use semicolons.
- Follow existing controller/route patterns; do not introduce new web frameworks.
- Keep SQL queries in controllers or models using parameterized values (the ? placeholder) to prevent injection.
- Return consistent JSON error shapes: { error: "<message>" } with appropriate HTTP status codes.

## Error Handling and Status Codes

Use standard HTTP status codes:
- 200 / 201 for successful operations.
- 400 for missing or invalid request body fields.
- 401 for missing/invalid auth token.
- 403 for expired or invalid token (after verification failure).
- 404 for a resource that does not exist.
- 500 for unexpected errors (log internally, return a generic message).

Wrap controller logic in try/catch and log errors to the console; never leak stack traces to the client.

## Database

- SQLite is the data store. Schema is initialized in src/models/schema.ts via CREATE TABLE IF NOT EXISTS.
- When adding a table or column, update the schema seed and document it in docs/API.md.
- Seed default data when a table is empty.

## Authentication

- Hash passwords with bcryptjs (10 rounds) before storing.
- Sign JWTs in controllers/services; use JWT_SECRET from .env with a 7-day expiry.
- Use the authenticateToken middleware (src/middleware/auth.ts) to protect routes that require a user.
- Never hardcode the JWT secret; always read from process.env.

## Pull Requests

- Reference the issue your PR addresses in the description.
- Ensure CI is green (npm ci && npm run build).
- Request a review from a code owner (see .github/CODEOWNERS).
- Squash-and-merge is the preferred merge strategy once approved.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
