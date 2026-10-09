export function parseFactSheet(factSheetText: string): string[] {
  if (!factSheetText) return [];

  return factSheetText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      if (line.startsWith('#')) return false;
      if (line.startsWith('---')) return false;
      return true;
    })
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter((line) => line.length > 5);
}

export function extractGroundedFacts(factSheetText: string, query: string): string[] {
  const allFacts = parseFactSheet(factSheetText);
  if (allFacts.length === 0) {
    return ['Verified system specifications in fact sheet'];
  }

  const queryTerms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((term) => term.length > 3);

  const scoredFacts = allFacts.map((fact) => {
    const factLower = fact.toLowerCase();
    let score = 0;
    for (const term of queryTerms) {
      if (factLower.includes(term)) {
        score += 1;
      }
    }
    return { fact, score };
  });

  const matched = scoredFacts.filter((item) => item.score > 0);
  if (matched.length > 0) {
    matched.sort((a, b) => b.score - a.score);
    return matched.slice(0, 3).map((item) => item.fact);
  }

  // Return the first 2 primary system facts as baseline grounding
  return allFacts.slice(0, 2);
}

export function isProhibitedTopic(message: string): { prohibited: boolean; reason?: string } {
  const lower = message.toLowerCase();
  if (
    lower.includes('hidden test') ||
    lower.includes('grader test') ||
    lower.includes('secret test')
  ) {
    return { prohibited: true, reason: 'hidden_test_query' };
  }
  if (
    lower.includes('give me the code') ||
    lower.includes('write the solution') ||
    lower.includes('solve it for me') ||
    lower.includes('give me the patch')
  ) {
    return { prohibited: true, reason: 'solution_solicitation' };
  }
  return { prohibited: false };
}
