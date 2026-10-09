import { query } from './client.js';
import type { SkillNode, TaskVariant, TaskMode } from '@engineering-simulator/contracts';

export interface VariantDetails {
  id: string;
  variantId: string;
  templateId: string;
  title: string;
  narrative: string;
  instructions: string;
  mode: TaskMode;
  difficulty: number;
  skillIds: string[];
  estimatedMinutes: number;
  factSheet: string;
  referenceSystem: {
    name: string;
    dockerImage: string;
  };
}

export interface SelectionContext {
  currentMastery: Record<string, number>;
  recentVariantIds: string[];
  activeMisconceptions: string[];
  availableSkills: SkillNode[];
  availableVariants: TaskVariant[];
}

export async function getVariantWithDetails(variantId: string): Promise<VariantDetails | null> {
  const sql = `
    SELECT 
      v.id,
      v.id AS "variantId",
      v.template_id AS "templateId",
      v.title,
      v.narrative,
      v.instructions,
      tt.mode,
      v.difficulty,
      ARRAY[tt.skill_id]::text[] || tt.supporting_skill_ids AS "skillIds",
      v.estimated_minutes AS "estimatedMinutes",
      v.fact_sheet AS "factSheet",
      rs.name AS "rsName",
      rs.docker_image AS "rsImage"
    FROM variants v
    JOIN task_templates tt ON v.template_id = tt.id
    JOIN reference_systems rs ON v.reference_system_id = rs.id
    WHERE v.id = $1
    LIMIT 1
  `;

  const res = await query<{
    id: string;
    variantId: string;
    templateId: string;
    title: string;
    narrative: string;
    instructions: string;
    mode: TaskMode;
    difficulty: number;
    skillIds: string[];
    estimatedMinutes: number;
    factSheet: string;
    rsName: string;
    rsImage: string;
  }>(sql, [variantId]);

  const row = res.rows[0];
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    variantId: row.variantId,
    templateId: row.templateId,
    title: row.title,
    narrative: row.narrative,
    instructions: row.instructions,
    mode: row.mode,
    difficulty: row.difficulty,
    skillIds: row.skillIds ?? [],
    estimatedMinutes: row.estimatedMinutes,
    factSheet: row.factSheet,
    referenceSystem: {
      name: row.rsName,
      dockerImage: row.rsImage,
    },
  };
}

export async function fetchSelectionContext(learnerId: string): Promise<SelectionContext> {
  // 1. Current Mastery
  const masteryRes = await query<{ skill_id: string; mastery: number }>(
    'SELECT skill_id, mastery FROM skill_states WHERE learner_id = $1',
    [learnerId]
  );
  const currentMastery: Record<string, number> = {};
  for (const row of masteryRes.rows) {
    currentMastery[row.skill_id] = Number(row.mastery);
  }

  // 2. Recent Variant IDs (last 5 attempts)
  const recentRes = await query<{ variant_id: string }>(
    `SELECT variant_id FROM attempts 
     WHERE learner_id = $1 
     ORDER BY created_at DESC 
     LIMIT 5`,
    [learnerId]
  );
  const recentVariantIds = recentRes.rows.map((r) => r.variant_id);

  // 3. Active Misconceptions
  const misRes = await query<{ misconception_id: string }>(
    `SELECT DISTINCT misconception_id FROM misconception_hits 
     WHERE learner_id = $1`,
    [learnerId]
  );
  const activeMisconceptions = misRes.rows.map((r) => r.misconception_id);

  // 4. Available Skills & Prerequisite Edges
  const skillsRes = await query<{
    id: string;
    slug: string;
    name: string;
    prerequisites: string[];
  }>(
    `SELECT 
       s.id, 
       s.slug, 
       s.name,
       COALESCE(ARRAY_AGG(se.from_skill_id) FILTER (WHERE se.from_skill_id IS NOT NULL), '{}') AS prerequisites
     FROM skills s
     LEFT JOIN skill_edges se ON s.id = se.to_skill_id
     WHERE s.status = 'active'
     GROUP BY s.id, s.slug, s.name`
  );

  const availableSkills: SkillNode[] = skillsRes.rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    prerequisites: r.prerequisites ?? [],
  }));

  // 5. Available Published Variants
  const variantsRes = await query<{
    id: string;
    template_id: string;
    skill_id: string;
    mode: TaskMode;
    difficulty: number;
    status: 'published' | 'draft' | 'archived';
    misconception_ids: string[];
  }>(
    `SELECT 
       v.id,
       v.template_id,
       tt.skill_id,
       tt.mode,
       v.difficulty,
       v.status,
       v.misconception_ids
     FROM variants v
     JOIN task_templates tt ON v.template_id = tt.id
     WHERE v.status = 'published'`
  );

  const availableVariants: TaskVariant[] = variantsRes.rows.map((r) => ({
    id: r.id,
    templateId: r.template_id,
    skillId: r.skill_id,
    taskMode: r.mode,
    difficulty: r.difficulty,
    status: r.status,
    targetsMisconceptions: r.misconception_ids ?? [],
  }));

  return {
    currentMastery,
    recentVariantIds,
    activeMisconceptions,
    availableSkills,
    availableVariants,
  };
}
