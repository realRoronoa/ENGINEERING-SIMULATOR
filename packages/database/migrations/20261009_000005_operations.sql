-- Migration: 20261009_000005_operations
-- Description: Operational, quality, AI tracking, and reporting tables

-- Item Stats (aggregated variant difficulty and pass rate metrics)
CREATE TABLE IF NOT EXISTS item_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL UNIQUE REFERENCES variants(id) ON DELETE CASCADE,
  attempts_count INTEGER NOT NULL DEFAULT 0 CHECK (attempts_count >= 0),
  pass_rate FLOAT NOT NULL DEFAULT 0.0 CHECK (pass_rate >= 0.0 AND pass_rate <= 1.0),
  avg_score FLOAT NOT NULL DEFAULT 0.0,
  avg_hints_used FLOAT NOT NULL DEFAULT 0.0,
  avg_time_minutes FLOAT NOT NULL DEFAULT 0.0,
  calibrated_difficulty FLOAT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Content / Problem Flags
CREATE TABLE IF NOT EXISTS flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('incorrect-test', 'unclear-instructions', 'wrong-answer', 'other')),
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Evaluation Disputes
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  evidence_description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'reviewing', 'upheld', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI API Calls Audit Log
CREATE TABLE IF NOT EXISTS ai_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES attempts(id) ON DELETE SET NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('mentor', 'viva', 'rubric_grading', 'weekly_report', 'offline')),
  model TEXT NOT NULL,
  prompt_name TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  input_tokens INTEGER NOT NULL CHECK (input_tokens >= 0),
  output_tokens INTEGER NOT NULL CHECK (output_tokens >= 0),
  latency_ms INTEGER NOT NULL CHECK (latency_ms >= 0),
  cost_usd FLOAT NOT NULL DEFAULT 0.0 CHECK (cost_usd >= 0.0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Weekly Reports
CREATE TABLE IF NOT EXISTS weekly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  week_of DATE NOT NULL,
  summary TEXT NOT NULL,
  data_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT weekly_reports_learner_week_unique UNIQUE (learner_id, week_of)
);

CREATE INDEX IF NOT EXISTS idx_weekly_reports_learner ON weekly_reports(learner_id, week_of);
