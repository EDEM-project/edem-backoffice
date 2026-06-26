# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EDEM Backoffice is a research lab website for the EDEM project (explainability of agricultural AI). It has a public-facing site and an admin panel backed by a Node.js/Express API with a MySQL database.

## Running the Project

```bash
# Install dependencies
npm install

# Start the server
node server/index.js
# → http://localhost:3000

# Seed the initial admin account (run once)
node seed.js
# Admin: michele@etis.fr / changeme123
```

No build step — the server serves static files directly.

## Environment Configuration

Copy `.env` and configure before running:

```
JWT_SECRET=un_secret_long
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=edem_db
```

The database (`edem_db`) must exist in MySQL; tables are created automatically on first connection via `server/db.js:initTables()`.

## Architecture

```
server/
  index.js        — Express entry point; mounts routes, serves static files
  db.js           — MySQL pool singleton; auto-creates tables on first call
  auth.js         — POST /api/auth/login + requireAuth / requireAdmin middleware
  publications.js — CRUD for /api/publications
  users.js        — CRUD for /api/users (GET public, write admin-only)
  uploads.js      — POST /api/uploads (multer, saves to public/uploads/)

public/           — Public website (served at /)
  index.html      — Homepage
  equipe.html     — Team page (fetches /api/users)
  chercheur.html  — Researcher profile page (fetches /api/users/:id)
  publications.html / publication.html — Publications listing and detail
  style.css       — Shared CSS for both public and admin

admin/            — Admin panel (served at /admin/)
  login.html      — JWT login form (stores token in localStorage)
  dashboard.html  — Lists publications
  new-publication.html — Create/edit publication form
  users.html      — Admin: manage team accounts
```

## Auth Model

- JWT stored in `localStorage` as `edem_token` and `edem_user`
- Two roles: `admin` (full access) and `author` (can manage own publications only)
- `requireAuth` and `requireAdmin` are exported from `server/auth.js` and used as Express middleware

## Data Model

**`users`** — name, email, password (bcrypt), role, titre, institution, bio, competences (comma-separated), photo_url, linkedin_url, email_public

**`publications`** — title, summary, explanation, code_snippet, code_language, tags (comma-separated), type (recherche/rapport/article), pdf_url, image_url, author_id (FK → users)

Both tables store comma-separated strings for `competences`/`tags`; the API parses them into arrays before responding (`parseUser`/`parseTags` helpers in the respective route files).

## File Uploads

`POST /api/uploads` (requires auth) — accepts images (JPEG/PNG/GIF/WebP) and PDF up to 10 MB, saves to `public/uploads/`, returns `{ url, type, name }`. The `url` is relative (`/uploads/filename`).
