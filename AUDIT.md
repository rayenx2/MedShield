# MedShield — Code Audit

## Project Summary

MedShield is a full-stack secure medical records management platform. Patients own their health records, doctors and hospitals request access with explicit consent, and all activity is logged in an immutable audit trail. It includes an AI-powered document summarization feature (Groq — Llama 4 Scout for images, Llama 3.3 for text) and an emergency 24-hour break-glass access workflow.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Vite 7, Custom CSS |
| Backend | Node.js + Express 5 |
| Auth | Custom HMAC-signed bearer tokens (role-aware) |
| Database | PostgreSQL + Drizzle ORM |
| File Storage | Appwrite Storage (cloud, optional) with automatic local-disk fallback |
| AI | Groq API — `meta-llama/llama-4-scout-17b-16e-instruct` (vision) / `llama-3.3-70b-versatile` (text) via `GROQ_API_KEY` env var |
| Security | AES-256-GCM encryption at rest, bcrypt password hashing, rate limiting |
| Tooling | ESLint 9, Vite, Vitest, concurrently, dotenv |

## Architecture

React SPA -> Express API (port 3001) -> PostgreSQL + (Appwrite Storage or local disk)

## Main Entry Points

- Frontend: `src/main.jsx`
- Backend: `server/src/index.js` -> `server/src/app.js`
- API server: `api/server.js` (Vercel serverless adapter)
- Database schema: `db/schema/` (TypeScript, Drizzle)
- Migrations: `db/migrations/*.sql`

## Data Flow

1. User registers/logs in -> HMAC bearer token issued
2. Doctor/Hospital uploads document -> AES-256-GCM encrypted -> stored in Appwrite or local disk
3. Patient receives access request -> approves/rejects
4. Approved doctor downloads -> decrypt on-the-fly -> serve file
5. All actions written to audit_logs table
6. AI summarization: fetch + decrypt -> send to Groq -> return structured analysis

## Issues Found (original audit) — all resolved

1. No docker-compose.yml — resolved, created
2. Appwrite is a paid cloud dependency — resolved, local-disk fallback added so the app works with zero cloud config
3. AI provider key stored under a misleading `GEMINI_API_KEY` name — resolved, renamed to `GROQ_API_KEY` to match the actual provider (Groq)
4. No .env.example file — resolved, created and kept current
5. Missing unique constraint on `document_access_grants` needed by the access-request approve upsert — resolved in migration `0006_access_request_documents.sql`
6. The `access_requests` table was missing the `document_ids` column that `app.js` references — resolved in migration `0006_access_request_documents.sql`
7. `audit_action` enum was missing the `ai_summarize` and `request_document_access` values used by the API — resolved in migration `0006_access_request_documents.sql`
8. `ProtectedRoute` redirected to login on every page refresh, even with a valid session, because it checked auth state before `AuthContext` finished restoring it from localStorage — resolved with an `initializing` bootstrap flag
9. Doctor dashboard's "Shared Documents" table had a `patient_email` / `patientEmail` key mismatch that left that column permanently blank — resolved

## Fixes Applied

- Created `docker-compose.yml` with PostgreSQL, API, and frontend services
- Created and maintained `.env.example` with all documented variables
- Added a local-disk storage fallback (`server/src/appwrite.js`) — uploads/downloads work fully with zero cloud configuration; same encrypted-blob interface as Appwrite
- Migrated AI summarization from OpenRouter/GPT-4o to Groq (Llama 4 Scout for vision, Llama 3.3 70B for text)
- Added migration `0006_access_request_documents.sql` fixing 3 schema bugs found by full endpoint testing
- Added 13 backend integration tests (`npm run test:api`) and 29 frontend tests (`npm test`)
- Fixed all ESLint errors and 2 functional UI bugs (auth refresh redirect, shared-documents column mismatch)

## Author

Rayen Lassoued | github.com/rayenx2
