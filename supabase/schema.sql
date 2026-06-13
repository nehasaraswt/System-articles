-- Content Engine — Supabase Schema
-- Run this once in your Supabase project: SQL Editor > New query > paste > Run

-- Stores every generation (articles + diagram)
CREATE TABLE IF NOT EXISTS generations (
  id           UUID PRIMARY KEY,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  module       JSONB NOT NULL,
  settings     JSONB NOT NULL,
  raw_content  TEXT NOT NULL,
  articles     JSONB NOT NULL,
  diagram      JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS generations_created_at_idx
  ON generations (created_at DESC);

-- Single-row table for app-level settings (API key, defaults)
CREATE TABLE IF NOT EXISTS app_settings (
  id   BOOLEAN PRIMARY KEY DEFAULT TRUE,
  data JSONB NOT NULL DEFAULT '{}',
  CONSTRAINT app_settings_single_row CHECK (id = TRUE)
);

-- Seed the settings row so GET always finds a record
INSERT INTO app_settings (id, data)
VALUES (TRUE, '{"anthropicApiKey":"","defaultVenture":"systems","defaultLength":"medium","defaultAudience":"practitioners"}')
ON CONFLICT (id) DO NOTHING;

-- Disable RLS — this is a personal tool accessed only via the service role key
ALTER TABLE generations DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings DISABLE ROW LEVEL SECURITY;
