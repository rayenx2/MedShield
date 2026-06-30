-- Migration 0006: per-document access requests + missing audit actions
-- Patients can be asked for access to a specific subset of documents
-- (instead of all-or-nothing), and the AI summary / document-scoped
-- request flows need their own audit_action values.

ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS document_ids JSONB;

DO $$ BEGIN
  ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'ai_summarize';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'request_document_access';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Approving an access request upserts a grant per (document_id, grantee_user_id);
-- the app's ON CONFLICT clause needs a matching unique constraint to target.
ALTER TABLE document_access_grants
  ADD CONSTRAINT document_access_grants_document_grantee_uq UNIQUE (document_id, grantee_user_id);
