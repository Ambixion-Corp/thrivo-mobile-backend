# API Reference

Base URL: http://localhost:5000 (configurable via the PORT environment variable).

All routes are mounted under /api (except /health). JSON request and response
bodies are used throughout; clients should set Content-Type: application/json.

Authenticated endpoints expect a Bearer token in the Authorization header:

    Authorization: Bearer <token>

Tokens are JWTs (signed with JWT_SECRET, valid 7 days) returned by the login
and signup endpoints. The encoded claims are { id, email, role }.

## Conventions

- String fields shown in examples use single quotes for brevity.
- HTTP status codes: 200/201 success, 400 bad input, 401 unauthenticated,
  403 forbidden/ expired token, 404 not found, 500 server error.
- All error bodies have the shape: { error: <message> }

## Health Check

### GET /health

Service status and server time. No authentication required.

Response 200 OK:
    { status: 'ok', timestamp: '2026-01-01T00:00:00.000Z' }

## Authentication

### POST /api/auth/signup

Register a new user. No authentication.

Request body:
    email    string  Required. Unique email address.
    password string  Required. Plain text; hashed server-side with bcrypt (10 rounds).
    role     string  Required. One of: founder, investor, creator, consumer.
    name     string  Optional. Display name; defaults to the email local part.

Response 201 Created:
    { token: '<jwt>', user: { id: 'user_...', email: '...', role: '...', name: '...' } }

Other responses:
    400  { error: 'Email, password, and role are required' }
    409  { error: 'User with this email already exists' }
    500  { error: 'Internal server error' }

### POST /api/auth/login

Authenticate and receive a JWT. No authentication.

Request body:
    email    string  Required.
    password string  Required.

Response 200 OK:
    { token: '<jwt>', user: { id: 'user_...', email: '...', role: '...', name: '...' } }

Other responses:
    400  { error: 'Email and password are required' }
    401  { error: 'Invalid email or password' }
    500  { error: 'Internal server error' }

## Feed

### GET /api/feed

List feed items, newest first. Authentication: optional.

Response 200 OK (JSON array):
    [
      {
        id: '1',
        name: 'Founder',
        handle: '@Founder0',
        description: 'Building the future of sustainable architecture...',
        videoUrl: 'https://example.com/video.mp4',
        likes: 1174,
        comments: 39,
        founderAvatar: 'https://example.com/avatar.png'
      }
    ]

Response fields:
    id            string
    name          string   Display name of the founder/creator.
    handle        string   Social handle, prefixed with @.
    description   string   Short copy for the post.
    videoUrl      string   Playback / thumbnail URL.
    likes         number   Like count.
    comments      number   Comment count.
    founderAvatar string   URL to the founder avatar image.

### POST /api/feed/:id/like

Like or unlike a feed item. Authentication: optional.

Path parameter:
    id     string   The feed item id.

Request body:
    action   string   Either 'like' or 'unlike'.

Response 200 OK:
    { id: '<id>', likes: <newCount> }

Other responses:
    404  { error: 'Feed item not found' }
    500  { error: 'Internal server error' }

## Deals

### GET /api/deals

List investment deals, newest first. Authentication: optional.

Response 200 OK (JSON array):
    [
      {
        id: '1',
        name: 'Quantum Metrics',
        category: 'SaaS / Analytics',
        stage: 'Series A',
        description: 'AI-driven predictive analytics...',
        raising: '',
        valuation: '',
        imageUrl: 'https://example.com/image.jpg'
      }
    ]

Response fields:
    id          string
    name        string   Deal / company name.
    category    string   Industry category.
    stage       string   Funding stage (e.g. Series A).
    description string   Long-form description.
    raising     string   Amount being raised.
    valuation   string   Current / post-money valuation.
    imageUrl    string   Deal image URL.

### POST /api/deals/:id/intro

Request an introduction to a deal. Authentication: optional.

Path parameter:
    id     string   The deal id.

Response 200 OK:
    { success: true, message: 'Introduction request successfully sent for <name>.' }

Other responses:
    404  { error: 'Deal not found' }
    500  { error: 'Internal server error' }

## Data Store

The service uses SQLite (file: database.sqlite at the project root, created on
first run). Tables: users, feed_items, deals. See src/models/schema.ts for the
schema and seed data.

## Errors

All error responses use the shape { error: <message> } with the HTTP status
code appropriate to the failure. Unexpected errors return 500 and log a
server-side message; stack traces are never returned to the client.