export const ISSUE_TYPES = ['missing_metric', 'unclear_scope', 'weak_outcome', 'generic_language', 'role_relevance'] as const
export type IssueType = (typeof ISSUE_TYPES)[number]
export type Actor = 'human' | 'agent' | 'system'

export interface CandidateGoal {
  targetRole: string
  targetCompany?: string
  focusArea: string
}

export interface Diagnosis {
  issueType: IssueType
  feedback: string
  createdAt: string
}

export interface RewriteProposal {
  newText: string
  rationale: string
  createdAt: string
}

export interface ResumeBullet {
  id: string
  text: string
  originalText: string
  diagnosis?: Diagnosis
  proposal?: RewriteProposal
  accepted: boolean
}

export interface ScoreBreakdown {
  action: number
  evidence: number
  scope: number
  outcome: number
  relevance: number
  total: number
}

export interface AdvisorRecord {
  id: string
  name: string
  pronouns: string
  headline: string
  organization: string
  bio: string
  help: string[]
  expertise: string[]
  industries: string[]
  companyFamiliarity: string[]
  avatar: string
  isDemo: true
}

export interface AdvisorMatch {
  advisorId: string
  score: number
  reasons: string[]
}

export interface HandoffBrief {
  advisorId: string
  advisorName: string
  sessionTopic: string
  auditSummary: string
  agenda: string[]
  acceptedChanges: Array<{ bulletId: string; before: string; after: string }>
  remainingGaps: string[]
  score: number
  createdAt: string
}

export interface TelemetryEvent {
  id: string
  actor: Actor
  action: string
  detail: string
  createdAt: string
}

export interface CanvasState {
  version: number
  candidate: { name: string; title: string }
  goal: CandidateGoal
  bullets: ResumeBullet[]
  score: ScoreBreakdown
  advisorMatches: AdvisorMatch[]
  selectedAdvisorId?: string
  handoff?: HandoffBrief
  events: TelemetryEvent[]
}

export type CanvasAction =
  | { type: 'DIAGNOSE'; actor: Actor; bulletId: string; issueType: IssueType; feedback: string }
  | { type: 'PROPOSE'; actor: Actor; bulletId: string; newText: string; rationale: string }
  | { type: 'APPLY'; actor: Actor; bulletId: string }
  | { type: 'MATCH'; actor: Actor; goal: CandidateGoal }
  | { type: 'SELECT_ADVISOR'; actor: Actor; advisorId: string }
  | { type: 'STAGE_HANDOFF'; actor: Actor; advisorId: string; sessionTopic: string; auditSummary: string }
  | { type: 'CLOSE_HANDOFF' }
  | { type: 'RESET'; actor: Actor }

export interface ToolSuccess<T> { ok: true; version: 1; stateVersion: number; data: T }
export interface ToolFailure { ok: false; version: 1; error: { code: string; message: string } }
