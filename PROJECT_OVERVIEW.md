# MedShield Project Overview

## 1) Project Name and One-Line Description
- **Project name:** `medshield-react`
- **One-line description:** MedShield is a secure, role-based medical records platform where patients, doctors, and hospitals manage encrypted records, consented access, emergency access, and AI-assisted report summaries.

## 2) Core Problem It Solves (The Why)
Healthcare records are typically fragmented across hospitals and providers, which causes delays, repeated tests, and unsafe care decisions (especially during emergencies). MedShield addresses this by:
- Centralizing patient records under patient ownership
- Enforcing explicit, auditable access control
- Enabling emergency break-glass access with guardrails
- Making records easier to understand through AI summaries

## 3) Complete Tech Stack
### Languages
- JavaScript (frontend + backend)
- TypeScript (Drizzle schema/config)
- SQL (database migrations)

### Frontend
- React 19
- React Router 7
- Vite 7
- Custom CSS components/pages for landing, auth, and dashboards

### Backend/API
- Node.js + Express 5
- `cors` (origin controls)
- `multer` (file upload handling)
- `bcryptjs` (password hashing)
- `express-rate-limit` (auth endpoint protection)
- `dotenv` (environment loading)

### Authentication/Session
- Custom HMAC-signed bearer token session flow (`SESSION_SECRET`)
- Role-aware protected routes and backend middleware

### Data and Storage
- PostgreSQL via `pg`
- Drizzle schema/migrations in `db/`
- Appwrite Storage via `node-appwrite` for document file storage, with an automatic local-disk fallback (`server/storage/`) when Appwrite isn't configured — uploads work with zero cloud setup

### AI
- Groq Chat Completions endpoint (`https://api.groq.com/openai/v1/chat/completions`)
- Models used in code: `meta-llama/llama-4-scout-17b-16e-instruct` (vision, for image documents) and `llama-3.3-70b-versatile` (text-only documents)
- API key loaded from `GROQ_API_KEY`

### Tooling
- ESLint 9
- `concurrently` for running frontend + backend together

## 4) Top 5 Key Features
1. **Role-based platform and dashboards**
   - Separate flows for patient, doctor, and hospital users.

2. **Secure document vault**
   - Upload/download flows with encryption metadata and strict authorization checks.

3. **Consent and access governance**
   - Access requests, approve/reject, document grant issuance, revoke (single and bulk).

4. **Emergency access workflow**
   - Doctor/hospital can initiate 24-hour emergency access with audit tracking.

5. **AI medical document summarization**
   - Generates structured summaries and highlights from uploaded records.

## 5) Setup and Run Instructions
### Prerequisites
- Docker + Docker Compose (recommended — `docker compose up -d` runs everything)
- Or, for non-Docker dev: Node.js LTS, npm, PostgreSQL

### Step-by-step (Docker, recommended)
1. `cp .env.example .env` and fill in `SESSION_SECRET` (everything else has a working default or is optional)
2. `docker compose up -d`
3. Frontend at http://localhost:5177, API at http://localhost:3001/health

Uploads work immediately with **no** Appwrite or Groq key — local-disk storage is the default fallback, and AI summarization just returns "AI service not configured" until you set `GROQ_API_KEY`.

### Step-by-step (manual, no Docker)
1. `npm install`
2. Set up a local PostgreSQL database and run the SQL files in `db/migrations/` in order (`0001` through `0006`)
3. Configure `.env` per `.env.example`:
   - `VITE_API_BASE_URL=http://localhost:3001`, `VITE_ENABLE_MOCK_AUTH=false`
   - `DATABASE_URL`, `SESSION_SECRET`, `API_PORT`, `API_HOST`, `ALLOWED_ORIGINS`
   - `APPWRITE_*` (optional — leave blank for local-disk storage)
   - `GROQ_API_KEY` (optional — leave blank to disable AI summarization)
4. Start development:
   - Full stack: `npm run dev:all`
   - Frontend only: `npm run dev`
   - API only: `npm run dev:api`
5. Production build (frontend): `npm run build`, preview with `npm run preview`

### Testing
- Backend integration tests (needs the Docker stack running): `npm run test:api`
- Frontend unit/component tests: `npm test`

## 6) Demo Links, Hosted URLs, or Screenshots
### Hosted/demo URL
- No explicit deployed production URL found in current repo content.

### Local demo assets/docs present
- `public/carousel/slide-1.png`
- `public/carousel/slide-2.png`
- `public/carousel/slide-3.png`
- `public/carousel/slide-4.png`
- `public/docs/MedShield-Architecture.pdf`
- `public/docs/MedShield-Team-Briefing.docx`

## 7) Team Name and Member Names (If Found)
- No explicit team name (separate from "MedShield") found in the current code/config.
- No explicit member name list found in current code/config.
- Text references found:
  - "Team Briefing"
  - "For Team Use Only"

## 8) Hackathon Name
- Mention found: **"Hackathon 2026"**
- A specific branded hackathon event name is not explicitly present in current repo files.

## 9) Future Improvements / TODOs Mentioned
1. **Storage scale migration path**
   - Move blob payloads from DB storage to object storage via backfill when scaling.

2. **Session revocation enhancement**
   - Add a `revoked_tokens` table for immediate token invalidation.

3. **Legacy-path cleanup opportunities**
   - Some code comments indicate legacy compatibility branches that can be retired after full migration.

---

## Notes on Source Accuracy
- This overview is based on currently available repository files and code paths.
- `README.md` has been rewritten and reflects current MedShield functionality.
