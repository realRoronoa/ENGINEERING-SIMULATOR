export type {
  TaskMode,
  SkillNode,
  TaskVariant,
  SelectorDecision,
  SelectorInput,
} from '@engineering-simulator/contracts';

export interface RankedSkill {
  skill: import('@engineering-simulator/contracts').SkillNode;
  mastery: number;
  priorityScore: number;
  hasActiveMisconception: boolean;
}
