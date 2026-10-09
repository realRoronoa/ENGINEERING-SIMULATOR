-- Migration: 20261009_000001_authored_knowledge
-- Description: Core tables for authored knowledge (skills, task templates, fault patterns, reference systems)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Reference Systems
CREATE TABLE IF NOT EXISTS reference_systems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  docker_image TEXT NOT NULL,
  version TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'deprecated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Skills
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  track TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'retired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Skill Edges (Prerequisites and related skills)
CREATE TABLE IF NOT EXISTS skill_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
  to_skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
  edge_type TEXT NOT NULL CHECK (edge_type IN ('prerequisite', 'related')),
  CONSTRAINT skill_edges_no_self_loop CHECK (from_skill_id <> to_skill_id),
  CONSTRAINT skill_edges_unique_pair UNIQUE (from_skill_id, to_skill_id, edge_type)
);

-- Rubrics (Evaluation criteria for viva and open-ended assessments)
CREATE TABLE IF NOT EXISTS rubrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Task Templates
CREATE TABLE IF NOT EXISTS task_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
  supporting_skill_ids UUID[] NOT NULL DEFAULT '{}',
  mode TEXT NOT NULL CHECK (mode IN ('debug', 'build', 'fix', 'investigate')),
  difficulty_range INT4RANGE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'retired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fault Patterns
CREATE TABLE IF NOT EXISTS fault_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  pattern_type TEXT NOT NULL,
  reference_system_id UUID NOT NULL REFERENCES reference_systems(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'retired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
