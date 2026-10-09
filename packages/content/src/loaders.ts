import {
  SKILLS,
  SKILL_EDGES,
  TASK_TEMPLATES,
  VARIANTS,
  RUBRICS,
  MISCONCEPTIONS,
} from './catalog.js';
import type { Skill, SkillEdge, TaskTemplate, Variant, Rubric, Misconception } from './types.js';

export async function loadSkills(): Promise<Skill[]> {
  return [...SKILLS];
}

export async function loadSkillGraph(): Promise<SkillEdge[]> {
  return [...SKILL_EDGES];
}

export async function loadTemplates(): Promise<TaskTemplate[]> {
  return [...TASK_TEMPLATES];
}

export async function loadVariants(filters?: {
  skillId?: string;
  status?: string;
}): Promise<Variant[]> {
  let list = [...VARIANTS];
  if (filters?.status) {
    list = list.filter((v) => v.status === filters.status);
  }
  if (filters?.skillId) {
    const targetSkillId = filters.skillId;
    const templateIdsForSkill = TASK_TEMPLATES.filter(
      (t) => t.skillId === targetSkillId || Boolean(t.supportingSkillIds?.includes(targetSkillId))
    ).map((t) => t.id);
    list = list.filter((v) => templateIdsForSkill.includes(v.templateId));
  }
  return list;
}

export async function loadVariantById(id: string): Promise<Variant | null> {
  const found = VARIANTS.find((v) => v.id === id);
  return found ? { ...found } : null;
}

export async function loadRubricById(id: string): Promise<Rubric | null> {
  const found = RUBRICS.find((r) => r.id === id);
  return found ? { ...found } : null;
}

export async function loadMisconceptions(): Promise<Misconception[]> {
  return [...MISCONCEPTIONS];
}
