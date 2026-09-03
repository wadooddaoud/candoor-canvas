import { useEffect } from 'react'
import { z } from 'zod'
import { advisors } from '../data/advisors'
import { ISSUE_TYPES, type CanvasAction, type CanvasState, type ToolFailure, type ToolSuccess } from '../types'

type ToolResult<T> = ToolSuccess<T> | ToolFailure
type Act = (action: CanvasAction) => CanvasState

const failure = (code: string, message: string): ToolFailure => ({ ok: false, version: 1, error: { code, message } })
const success = <T,>(state: CanvasState, data: T): ToolSuccess<T> => ({ ok: true, version: 1, stateVersion: state.version, data })
const ensureActive = (signal: AbortSignal) => signal.aborted ? failure('ABORTED', 'The tool invocation was cancelled.') : null

function validate<T extends z.ZodType>(schema: T, input: unknown): z.output<T> | ToolFailure {
  const parsed = schema.safeParse(input)
  if (!parsed.success) return failure('INVALID_INPUT', parsed.error.issues.map((issue) => `${issue.path.join('.') || 'input'}: ${issue.message}`).join('; '))
  return parsed.data
}

const isFailure = (value: unknown): value is ToolFailure => Boolean(value && typeof value === 'object' && 'ok' in value && value.ok === false)

export const toolInputSchemas = {
  empty: z.object({}).strict(),
  diagnose: z.object({
    bulletId: z.string().regex(/^b[1-3]$/),
    issueType: z.enum(ISSUE_TYPES),
    feedback: z.string().trim().min(12).max(240),
  }).strict(),
  propose: z.object({
    bulletId: z.string().regex(/^b[1-3]$/),
    newText: z.string().trim().min(30).max(360),
    rationale: z.string().trim().min(12).max(240),
  }).strict(),
  apply: z.object({ bulletId: z.string().regex(/^b[1-3]$/) }).strict(),
  match: z.object({
    targetRole: z.string().trim().min(3).max(100),
    targetCompany: z.string().trim().min(2).max(80).optional(),
    focusArea: z.string().trim().min(3).max(100),
  }).strict(),
  handoff: z.object({
    advisorId: z.enum(advisors.map((advisor) => advisor.id) as [string, ...string[]]),
    sessionTopic: z.string().trim().min(5).max(120),
    auditSummary: z.string().trim().min(12).max(500),
  }).strict(),
}

const objectSchema = (properties: Record<string, unknown>, required: string[] = []) => ({
  type: 'object', properties, required, additionalProperties: false,
})

export function useCanvasTools(stateRef: React.RefObject<CanvasState>, act: Act) {
  useEffect(() => {
    const context = document.modelContext
    if (!context?.registerTool) return
    const controller = new AbortController()
    const register = (tool: WebMCP.ModelContextTool) => context.registerTool(tool, { signal: controller.signal })

    const registrations = [
      register({
        name: 'get_canvas_state', title: 'Read the career canvas',
        description: 'Read the current candidate goal, accepted resume bullets, diagnoses, pending rewrites, score breakdown, advisor matches, selected advisor, and state version. Call this first and after human actions.',
        inputSchema: objectSchema({}), annotations: { readOnlyHint: true },
        execute(input, { signal }): ToolResult<CanvasState> {
          const cancelled = ensureActive(signal); if (cancelled) return cancelled
          const parsed = validate(toolInputSchemas.empty, input); if (isFailure(parsed)) return parsed
          return success(stateRef.current, stateRef.current)
        },
      }),
      register({
        name: 'diagnose_resume_bullet', title: 'Add an inline diagnosis',
        description: 'Attach one concise, actionable diagnosis to a resume bullet. This visibly changes the canvas but does not change the accepted text or score.',
        inputSchema: objectSchema({
          bulletId: { type: 'string', enum: ['b1', 'b2', 'b3'], description: 'Visible resume bullet ID.' },
          issueType: { type: 'string', enum: ISSUE_TYPES },
          feedback: { type: 'string', minLength: 12, maxLength: 240 },
        }, ['bulletId', 'issueType', 'feedback']),
        annotations: { readOnlyHint: false },
        execute(input, { signal }) {
          const cancelled = ensureActive(signal); if (cancelled) return cancelled
          const parsed = validate(toolInputSchemas.diagnose, input); if (isFailure(parsed)) return parsed
          const next = act({ type: 'DIAGNOSE', actor: 'agent', ...parsed })
          return success(next, { bullet: next.bullets.find((bullet) => bullet.id === parsed.bulletId), scoreUnchanged: next.score.total })
        },
      }),
      register({
        name: 'propose_bullet_rewrite', title: 'Propose a resume rewrite',
        description: 'Create a reviewable before-and-after rewrite. The proposal remains pending until a human or apply_bullet_rewrite accepts it; score does not change yet.',
        inputSchema: objectSchema({
          bulletId: { type: 'string', enum: ['b1', 'b2', 'b3'] },
          newText: { type: 'string', minLength: 30, maxLength: 360 },
          rationale: { type: 'string', minLength: 12, maxLength: 240 },
        }, ['bulletId', 'newText', 'rationale']),
        annotations: { readOnlyHint: false },
        execute(input, { signal }) {
          const cancelled = ensureActive(signal); if (cancelled) return cancelled
          const parsed = validate(toolInputSchemas.propose, input); if (isFailure(parsed)) return parsed
          const next = act({ type: 'PROPOSE', actor: 'agent', ...parsed })
          return success(next, { proposal: next.bullets.find((bullet) => bullet.id === parsed.bulletId)?.proposal, awaitingHumanReview: true, scoreUnchanged: next.score.total })
        },
      }),
      register({
        name: 'apply_bullet_rewrite', title: 'Apply a pending rewrite',
        description: 'Apply an existing pending proposal for one bullet and recalculate its impact score locally. Fails if no proposal exists. Use only after the human approves.',
        inputSchema: objectSchema({ bulletId: { type: 'string', enum: ['b1', 'b2', 'b3'] } }, ['bulletId']),
        annotations: { readOnlyHint: false },
        execute(input, { signal }) {
          const cancelled = ensureActive(signal); if (cancelled) return cancelled
          const parsed = validate(toolInputSchemas.apply, input); if (isFailure(parsed)) return parsed
          const current = stateRef.current.bullets.find((bullet) => bullet.id === parsed.bulletId)
          if (!current?.proposal) return failure('NO_PENDING_PROPOSAL', `${parsed.bulletId} has no rewrite awaiting approval.`)
          const beforeScore = stateRef.current.score.total
          const next = act({ type: 'APPLY', actor: 'agent', ...parsed })
          return success(next, { bullet: next.bullets.find((bullet) => bullet.id === parsed.bulletId), beforeScore, afterScore: next.score.total, delta: next.score.total - beforeScore })
        },
      }),
      register({
        name: 'match_candoor_advisors', title: 'Rank demo Candoor advisors',
        description: 'Deterministically rank clearly labeled fictional demo advisors against a target role, optional company, and focus area. Returns explicit reasons and reorders the visible cards.',
        inputSchema: objectSchema({
          targetRole: { type: 'string', minLength: 3, maxLength: 100 },
          targetCompany: { type: 'string', minLength: 2, maxLength: 80 },
          focusArea: { type: 'string', minLength: 3, maxLength: 100 },
        }, ['targetRole', 'focusArea']),
        annotations: { readOnlyHint: false },
        execute(input, { signal }) {
          const cancelled = ensureActive(signal); if (cancelled) return cancelled
          const parsed = validate(toolInputSchemas.match, input); if (isFailure(parsed)) return parsed
          const next = act({ type: 'MATCH', actor: 'agent', goal: parsed })
          return success(next, { matches: next.advisorMatches.map((match) => ({ ...match, advisor: advisors.find((advisor) => advisor.id === match.advisorId) })) })
        },
      }),
      register({
        name: 'stage_candoor_handoff', title: 'Stage an advisor handoff',
        description: 'Open a visible, reviewable handoff brief for an allowlisted demo advisor. Packages accepted changes, score, remaining gaps, and agenda. It never books, authenticates, navigates, or writes externally.',
        inputSchema: objectSchema({
          advisorId: { type: 'string', enum: advisors.map((advisor) => advisor.id) },
          sessionTopic: { type: 'string', minLength: 5, maxLength: 120 },
          auditSummary: { type: 'string', minLength: 12, maxLength: 500 },
        }, ['advisorId', 'sessionTopic', 'auditSummary']),
        annotations: { readOnlyHint: false },
        execute(input, { signal }) {
          const cancelled = ensureActive(signal); if (cancelled) return cancelled
          const parsed = validate(toolInputSchemas.handoff, input); if (isFailure(parsed)) return parsed
          const next = act({ type: 'STAGE_HANDOFF', actor: 'agent', ...parsed })
          return success(next, { handoff: next.handoff, externalWrite: false })
        },
      }),
    ]

    Promise.all(registrations).catch(() => undefined)
    return () => controller.abort()
  }, [act, stateRef])
}
