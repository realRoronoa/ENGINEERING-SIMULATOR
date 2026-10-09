import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MIGRATION_FILES, getDatabasePool, closePool } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../migrations');

describe('Database Migrations & Client Foundation', () => {
  it('should have all 5 declared migration files present on disk', () => {
    for (const file of MIGRATION_FILES) {
      const fullPath = path.join(migrationsDir, file);
      expect(fs.existsSync(fullPath)).toBe(true);

      const content = fs.readFileSync(fullPath, 'utf-8');
      expect(content.length).toBeGreaterThan(100);
      expect(content).toContain('CREATE TABLE IF NOT EXISTS');
    }
  });

  it('migration 01 should contain core authored knowledge tables', () => {
    const file = path.join(migrationsDir, '20261009_000001_authored_knowledge.sql');
    const content = fs.readFileSync(file, 'utf-8');
    expect(content).toContain('reference_systems');
    expect(content).toContain('skills');
    expect(content).toContain('skill_edges');
    expect(content).toContain('task_templates');
    expect(content).toContain('fault_patterns');
  });

  it('migration 02 should define variants table with versioning constraints', () => {
    const file = path.join(migrationsDir, '20261009_000002_generated_content.sql');
    const content = fs.readFileSync(file, 'utf-8');
    expect(content).toContain('variants');
    expect(content).toContain('variants_template_version_unique');
  });

  it('migration 03 should define learners and skill_states with Bayesian Beta bounds', () => {
    const file = path.join(migrationsDir, '20261009_000003_learner_state.sql');
    const content = fs.readFileSync(file, 'utf-8');
    expect(content).toContain('learners');
    expect(content).toContain('skill_states');
    expect(content).toContain('misconceptions');
    expect(content).toContain('skill_states_learner_skill_unique');
  });

  it('migration 04 should define append-only activity tables', () => {
    const file = path.join(migrationsDir, '20261009_000004_activity.sql');
    const content = fs.readFileSync(file, 'utf-8');
    expect(content).toContain('sessions');
    expect(content).toContain('attempts');
    expect(content).toContain('submissions');
    expect(content).toContain('evaluations');
    expect(content).toContain('evidence_events');
    expect(content).toContain('hint_events');
    expect(content).toContain('viva_records');
  });

  it('migration 05 should define operational and audit tables', () => {
    const file = path.join(migrationsDir, '20261009_000005_operations.sql');
    const content = fs.readFileSync(file, 'utf-8');
    expect(content).toContain('item_stats');
    expect(content).toContain('flags');
    expect(content).toContain('disputes');
    expect(content).toContain('ai_calls');
    expect(content).toContain('weekly_reports');
  });

  it('client pool manager should initialize and close gracefully', async () => {
    const pool = getDatabasePool({
      connectionString: 'postgresql://test:test@localhost:5432/test',
    });
    expect(pool).toBeDefined();
    await closePool();
  });
});
