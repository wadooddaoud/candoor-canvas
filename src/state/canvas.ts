import { useCallback, useReducer, useRef } from 'react'
import { advisors } from '../data/advisors'
import { demoBullets, demoGoal } from '../data/demo'
import { rankAdvisors } from '../lib/matching'
import { scoreResume } from '../lib/scoring'
import type { Actor, CanvasAction, CanvasState, HandoffBrief, TelemetryEvent } from '../types'

const now = () => new Date().toISOString()
const advisorById = (id: string) => advisors.find((advisor) => advisor.id === id)

function event(actor: Actor, action: string, detail: string): TelemetryEvent {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, actor, action, detail, createdAt: now() }
}

export function createInitialState(): CanvasState {
  const bullets = structuredClone(demoBullets)
  return {
    version: 1,
    candidate: { name: 'Jordan Lee', title: 'Product leader building useful AI systems' },
    goal: { ...demoGoal },
    bullets,
    score: scoreResume(bullets),
    advisorMatches: rankAdvisors(advisors, demoGoal),
    events: [event('system', 'canvas.ready', 'Demo workspace loaded')],
  }
}

const update = (state: CanvasState, patch: Partial<CanvasState>, item?: TelemetryEvent): CanvasState => ({
  ...state,
  ...patch,
  version: state.version + 1,
  events: item ? [item, ...state.events].slice(0, 12) : state.events,
})

export function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  if (action.type === 'RESET') return createInitialState()
  if (action.type === 'CLOSE_HANDOFF') return { ...state, handoff: undefined }

  if (action.type === 'DIAGNOSE') {
    const target = state.bullets.find((bullet) => bullet.id === action.bulletId)
    if (!target) return state
    const bullets = state.bullets.map((bullet) => bullet.id === action.bulletId
      ? { ...bullet, diagnosis: { issueType: action.issueType, feedback: action.feedback, createdAt: now() } }
      : bullet)
    return update(state, { bullets }, event(action.actor, 'diagnosis.added', `${action.bulletId} · ${action.issueType.replaceAll('_', ' ')}`))
  }

  if (action.type === 'PROPOSE') {
    if (!state.bullets.some((bullet) => bullet.id === action.bulletId)) return state
    const bullets = state.bullets.map((bullet) => bullet.id === action.bulletId
      ? { ...bullet, proposal: { newText: action.newText, rationale: action.rationale, createdAt: now() } }
      : bullet)
    return update(state, { bullets }, event(action.actor, 'rewrite.proposed', `${action.bulletId} · awaiting human review`))
  }

  if (action.type === 'APPLY') {
    const target = state.bullets.find((bullet) => bullet.id === action.bulletId)
    if (!target?.proposal) return state
    const bullets = state.bullets.map((bullet) => bullet.id === action.bulletId
      ? { ...bullet, text: bullet.proposal!.newText, proposal: undefined, diagnosis: undefined, accepted: true }
      : bullet)
    return update(state, { bullets, score: scoreResume(bullets) }, event(action.actor, 'rewrite.applied', `${action.bulletId} · evidence score recalculated`))
  }

  if (action.type === 'MATCH') {
    const advisorMatches = rankAdvisors(advisors, action.goal)
    return update(state, { goal: action.goal, advisorMatches, selectedAdvisorId: advisorMatches[0]?.advisorId }, event(action.actor, 'advisors.ranked', `${advisorMatches.length} matches · ${action.goal.focusArea}`))
  }

  if (action.type === 'SELECT_ADVISOR') {
    if (!advisorById(action.advisorId)) return state
    return update(state, { selectedAdvisorId: action.advisorId }, event(action.actor, 'advisor.selected', advisorById(action.advisorId)!.name))
  }

  if (action.type === 'STAGE_HANDOFF') {
    const advisor = advisorById(action.advisorId)
    if (!advisor) return state
    const acceptedChanges = state.bullets.filter((bullet) => bullet.accepted).map((bullet) => ({ bulletId: bullet.id, before: bullet.originalText, after: bullet.text }))
    const remainingGaps = state.bullets.filter((bullet) => !bullet.accepted).map((bullet) => bullet.diagnosis?.feedback ?? `${bullet.id} still needs stronger evidence`)
    const handoff: HandoffBrief = {
      advisorId: advisor.id, advisorName: advisor.name, sessionTopic: action.sessionTopic, auditSummary: action.auditSummary,
      agenda: [`Review the ${state.goal.targetRole} target`, 'Stress-test the revised impact story', `Coach the remaining ${state.goal.focusArea.toLowerCase()} gap`, 'Agree on next evidence-building actions'],
      acceptedChanges, remainingGaps, score: state.score.total, createdAt: now(),
    }
    return update(state, { handoff, selectedAdvisorId: advisor.id }, event(action.actor, 'handoff.staged', `${advisor.name} · no booking created`))
  }

  return state
}

export function useCanvasStore() {
  const [state, dispatch] = useReducer(canvasReducer, undefined, createInitialState)
  const stateRef = useRef(state)

  const act = useCallback((action: CanvasAction) => {
    const next = canvasReducer(stateRef.current, action)
    stateRef.current = next
    dispatch(action)
    return next
  }, [])

  return { state, stateRef, act }
}
