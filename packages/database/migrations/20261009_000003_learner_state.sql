-- Migration: 20261009_000003_learner_state
-- Description: Learner profile, Bayesian Beta mastery states, and cataloged misconceptions

-- Learners
CREATE TABLE IF NOT EXISTS learners (
  id UUID PRIMARY KEY, -- Matches Supabase auth UID
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  goal TEXT,
  current_role TEXT,
  years_experience INTEGER DEFAULT 0,
  target_stack TEXT[] NOT NULL DEFAULT '{}',
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Misconceptions Catalog
CREATE TABLE IF NOT EXISTS misconceptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('active', 'retired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Skill States (Bayesian Beta distribution mastery per learner per skill)
CREATE TABLE IF NOT EXISTS skill_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
  mastery FLOAT NOT NULL DEFAULT 0.0 CHECK (mastery >= 0.0 AND mastery <= 1.0),
  alpha FLOAT NOT NULL DEFAULT 1.0 CHECK (alpha > 0),
  beta FLOAT NOT NULL DEFAULT 1.0 CHECK (beta > 0),
  evidence_count INTEGER NOT NULL DEFAULT 0 CHECK (evidence_count >= 0),
  last_evidence_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT skill_states_learner_skill_unique UNIQUE (learner_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_skill_states_lookup ON skill_states(learner_id, skill_id);
