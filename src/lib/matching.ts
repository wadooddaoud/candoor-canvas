import type { AdvisorMatch, AdvisorRecord, CandidateGoal } from '../types'

const tokens = (value: string) => value.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2)
const overlap = (needle: string, haystack: string) => tokens(needle).filter((word) => haystack.toLowerCase().includes(word))

export function rankAdvisors(records: AdvisorRecord[], goal: CandidateGoal): AdvisorMatch[] {
  return records.map((advisor) => {
    const searchable = [advisor.headline, advisor.bio, ...advisor.help, ...advisor.expertise, ...advisor.industries].join(' ')
    const reasons: string[] = []
    let score = 0
    const roleHits = overlap(goal.targetRole, `${advisor.headline} ${advisor.expertise.join(' ')}`)
    const focusHits = overlap(goal.focusArea, searchable)
    const companyMatch = goal.targetCompany && advisor.companyFamiliarity.some((company) => company.toLowerCase() === goal.targetCompany?.toLowerCase())
    if (companyMatch) { score += 5; reasons.push(`Familiar with ${goal.targetCompany} hiring context`) }
    if (roleHits.length) { score += Math.min(roleHits.length, 3) * 3; reasons.push(`Strong ${roleHits.slice(0, 2).join(' + ')} overlap`) }
    if (focusHits.length) { score += Math.min(focusHits.length, 3) * 2; reasons.push(`Can coach ${goal.focusArea.toLowerCase()}`) }
    const industryHit = advisor.industries.some((industry) => goal.targetRole.toLowerCase().includes(industry.toLowerCase()))
    if (industryHit) { score += 1; reasons.push('Relevant industry pattern recognition') }
    if (!reasons.length) reasons.push('Broad career strategy fit')
    return { advisorId: advisor.id, score, reasons }
  }).sort((a, b) => b.score - a.score || a.advisorId.localeCompare(b.advisorId))
}
