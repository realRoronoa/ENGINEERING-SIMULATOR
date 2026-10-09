-- Migration: 20261009_000004_activity
-- Description: Learner activity records (sessions, attempts, submissions, evaluations, evidence events, hint events, viva)

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('practice', 'debug', 'build', 'transfer')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Attempts
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES variants(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN (
    'created', 'started', 'working', 'submitted', 'grading',
    'evaluated', 'viva', 'transfer', 'completed', 'abandoned'
  )),
  selector_decision JSONB NOT NULL DEFAULT '{}'::jsonb,
  hints_used INTEGER NOT NULL DEFAULT 0 CHECK (hints_used >= 0),
  submissions_count INTEGER NOT NULL DEFAULT 0 CHECK (submissions_count >= 0),
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attempts_learner_status ON attempts(learner_id, status);
CREATE INDEX IF NOT EXISTS idx_attempts_session ON attempts(session_id);

-- Submissions (append-only)
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  patch TEXT NOT NULL,
  structured_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  client_checksum TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'grading', 'complete', 'failed', 'timeout')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_attempt_status ON submissions(attempt_id, status);

-- Evaluations (append-only)
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  patch_valid BOOLEAN NOT NULL DEFAULT FALSE,
  public_tests_passed INTEGER NOT NULL DEFAULT 0,
  public_tests_total INTEGER NOT NULL DEFAULT 0,
  hidden_tests_passed INTEGER NOT NULL DEFAULT 0,
  hidden_tests_total INTEGER NOT NULL DEFAULT 0,
  benchmarks_passed BOOLEAN,
  structured_answers_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  rubric_results JSONB,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  score FLOAT NOT NULL DEFAULT 0.0 CHECK (score >= 0.0 AND score <= 1.0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evaluations_submission ON evaluations(submission_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_attempt ON evaluations(attempt_id);

-- Evidence Events (append-only)
CREATE TABLE IF NOT EXISTS evidence_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('practice', 'transfer', 'diagnostic')),
  passed BOOLEAN NOT NULL,
  score FLOAT NOT NULL CHECK (score >= 0.0 AND score <= 1.0),
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  task_mode TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_events_history ON evidence_events(learner_id, skill_id, occurred_at);

-- Hint Events (append-only)
CREATE TABLE IF NOT EXISTS hint_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  hint_index INTEGER NOT NULL CHECK (hint_index >= 0),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hint_events_attempt ON hint_events(attempt_id);

-- Viva Records
CREATE TABLE IF NOT EXISTS viva_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  rubric_results JSONB,
  status TEXT NOT NULL CHECK (status IN ('in-progress', 'complete')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Misconception Hits
CREATE TABLE IF NOT EXISTS misconception_hits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  misconception_id UUID NOT NULL REFERENCES misconceptions(id) ON DELETE RESTRICT,
  attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL CHECK (source IN ('viva', 'structured-answer', 'ai-classification'))
);

CREATE INDEX IF NOT EXISTS idx_misconception_hits_learner ON misconception_hits(learner_id);
