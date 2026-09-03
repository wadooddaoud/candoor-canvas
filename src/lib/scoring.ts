import type { ResumeBullet, ScoreBreakdown } from '../types'

const actionVerbs = /\b(owned|led|launched|built|drove|created|scaled|improved|reduced|increased|grew|delivered|aligned|designed|shipped|accelerated)\b/i
const evidence = /(\d+[x×%]?|\$\d+|\b(one|two|three|four|five|six|seven|eight|nine|ten|dozen)\b)/i
const scope = /\b(teams?|users?|customers?|regions?|markets?|products?|platforms?|stakeholders?|leads?|engineers?|company-wide|global)\b/i
const outcome = /\b(cutting|reducing|increasing|improving|enabling|resulting|grew|growth|adopted|revenue|retention|conversion|velocity|reliability|satisfaction|time|incidents?|launches?)\b/i
const relevance = /\b(ai|artificial intelligence|model|platform|product|roadmap|developer|api|deployment|engineering|executive)\b/i

const ratio = (bullets: ResumeBullet[], matcher: RegExp, points: number) => {
  if (!bullets.length) return 0
  return Math.round((bullets.filter((bullet) => matcher.test(bullet.text)).length / bullets.length) * points)
}

export function scoreResume(bullets: ResumeBullet[]): ScoreBreakdown {
  const action = ratio(bullets, actionVerbs, 20)
  const evidenceScore = ratio(bullets, evidence, 25)
  const scopeScore = ratio(bullets, scope, 20)
  const outcomeScore = ratio(bullets, outcome, 20)
  const relevanceScore = ratio(bullets, relevance, 15)
  return { action, evidence: evidenceScore, scope: scopeScore, outcome: outcomeScore, relevance: relevanceScore, total: action + evidenceScore + scopeScore + outcomeScore + relevanceScore }
}

export const scoreRules = [
  { key: 'action', label: 'Action', max: 20 },
  { key: 'evidence', label: 'Evidence', max: 25 },
  { key: 'scope', label: 'Scope', max: 20 },
  { key: 'outcome', label: 'Outcome', max: 20 },
  { key: 'relevance', label: 'Role fit', max: 15 },
] as const
