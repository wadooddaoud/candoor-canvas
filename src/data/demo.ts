import type { CandidateGoal, ResumeBullet } from '../types'

export const demoGoal: CandidateGoal = {
  targetRole: 'Senior Product Manager, AI Platform',
  targetCompany: 'OpenAI',
  focusArea: 'Executive storytelling',
}

export const demoBullets: ResumeBullet[] = [
  { id: 'b1', originalText: 'Led roadmap for an internal AI platform used by engineering teams.', text: 'Led roadmap for an internal AI platform used by engineering teams.', accepted: false },
  { id: 'b2', originalText: 'Partnered with engineering to improve model deployment workflows.', text: 'Partnered with engineering to improve model deployment workflows.', accepted: false },
  { id: 'b3', originalText: 'Managed stakeholder communication for product launches.', text: 'Managed stakeholder communication for product launches.', accepted: false },
]

export const guidedDemo = [
  {
    bulletId: 'b1', issueType: 'missing_metric' as const,
    feedback: 'Quantify adoption, delivery speed, or reliability so the platform impact is visible.',
    newText: 'Owned the roadmap for an internal AI platform adopted by 18 engineering teams, cutting model deployment time by 42% in two quarters.',
    rationale: 'Adds adoption scale, a measurable outcome, and an executive-ready time horizon.',
  },
  {
    bulletId: 'b2', issueType: 'weak_outcome' as const,
    feedback: 'Connect the collaboration to an operational outcome and show how much changed.',
    newText: 'Partnered with engineering to redesign model deployment workflows, increasing weekly releases 3× while reducing rollback incidents by 28%.',
    rationale: 'Turns collaboration into evidence of delivery velocity and quality.',
  },
  {
    bulletId: 'b3', issueType: 'unclear_scope' as const,
    feedback: 'Name the decision-makers, launch scope, and alignment result.',
    newText: 'Aligned 7 product and engineering leads around two AI capabilities, enabling coordinated launches across three regions.',
    rationale: 'Shows leadership scope and the business consequence of stakeholder work.',
  },
]

export const judgePrompt = `Open Candoor Canvas and help this candidate strengthen their resume for a Senior Product Manager, AI Platform role at OpenAI. Read the canvas, diagnose bullet b1, propose a stronger evidence-based rewrite, then wait for me to accept it. After I accept, rank advisors for executive storytelling and stage a handoff with the best match.`
