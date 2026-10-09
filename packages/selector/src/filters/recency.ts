import type { TaskVariant } from '@engineering-simulator/contracts';

/**
 * Filters out variants that have been attempted recently by the learner.
 */
export function filterRecentVariants(
  variants: TaskVariant[],
  recentVariantIds?: string[]
): TaskVariant[] {
  if (!recentVariantIds || recentVariantIds.length === 0) {
    return variants;
  }

  const recentSet = new Set(recentVariantIds);
  return variants.filter((variant) => !recentSet.has(variant.id));
}
