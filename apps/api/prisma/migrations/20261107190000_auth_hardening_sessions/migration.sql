-- Auth hardening: indexed refresh-token lookup + rotation / reuse detection columns.
-- Existing bcrypt hashes cannot be looked up by SHA-256; staging has no live sessions yet.
-- Operators should expect clients to re-authenticate after deploy if any bcrypt sessions existed.

ALTER TABLE "sessions"
  ADD COLUMN IF NOT EXISTS "revoked_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "replaced_by_id" TEXT;

-- Drop non-unique leftovers if a previous unique index is absent.
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_refresh_token_hash_key"
  ON "sessions" ("refresh_token_hash");

CREATE INDEX IF NOT EXISTS "sessions_expires_at_idx"
  ON "sessions" ("expires_at");

ALTER TABLE "otp_codes"
  ADD COLUMN IF NOT EXISTS "failed_attempts" INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "otp_codes_phone_tenant_created_idx"
  ON "otp_codes" ("phone", "tenant_id", "created_at");
