-- Migration: 20261009_000002_generated_content
-- Description: Variants and versioning chains (immutable once published)

CREATE TABLE IF NOT EXISTS variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES task_templates(id) ON DELETE RESTRICT,
  reference_system_id UUID NOT NULL REFERENCES reference_systems(id) ON DELETE RESTRICT,
  version INTEGER NOT NULL DEFAULT 1,
  previous_version_id UUID REFERENCES variants(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  narrative TEXT NOT NULL,
  instructions TEXT NOT NULL,
  fact_sheet TEXT NOT NULL,
  code_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  hint_ladder JSONB NOT NULL DEFAULT '[]'::jsonb,
  explanation TEXT NOT NULL,
  misconception_ids UUID[] NOT NULL DEFAULT '{}',
  viva_question_ids UUID[] NOT NULL DEFAULT '{}',
  rubric_id UUID REFERENCES rubrics(id) ON DELETE SET NULL,
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  estimated_minutes INTEGER NOT NULL CHECK (estimated_minutes > 0),
  status TEXT NOT NULL CHECK (status IN ('draft', 'review', 'published', 'paused', 'retired')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT variants_template_version_unique UNIQUE (template_id, version)
);

CREATE INDEX IF NOT EXISTS idx_variants_template ON variants(template_id);
CREATE INDEX IF NOT EXISTS idx_variants_status ON variants(status);
