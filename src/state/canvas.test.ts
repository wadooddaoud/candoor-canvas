import { describe, expect, it } from 'vitest'
import { guidedDemo } from '../data/demo'
import { canvasReducer, createInitialState } from './canvas'

describe('canvas reducer', () => {
  it('keeps proposals reviewable and only scores accepted changes', () => {
    const guide = guidedDemo[0]
    const initial = createInitialState()
    const diagnosed = canvasReducer(initial, { type: 'DIAGNOSE', actor: 'agent', bulletId: guide.bulletId, issueType: guide.issueType, feedback: guide.feedback })
    const proposed = canvasReducer(diagnosed, { type: 'PROPOSE', actor: 'agent', bulletId: guide.bulletId, newText: guide.newText, rationale: guide.rationale })
    expect(proposed.score.total).toBe(initial.score.total)
    expect(proposed.bullets[0].text).toBe(initial.bullets[0].text)
    const applied = canvasReducer(proposed, { type: 'APPLY', actor: 'human', bulletId: guide.bulletId })
    expect(applied.score.total).toBeGreaterThan(initial.score.total)
    expect(applied.bullets[0].proposal).toBeUndefined()
    expect(applied.bullets[0].diagnosis).toBeUndefined()
    expect(applied.bullets[0].accepted).toBe(true)
    expect(applied.version).toBe(initial.version + 3)
  })

  it('rejects applying without a proposal and resets cleanly', () => {
    const initial = createInitialState()
    expect(canvasReducer(initial, { type: 'APPLY', actor: 'agent', bulletId: 'b1' })).toBe(initial)
    const changed = canvasReducer(initial, { type: 'SELECT_ADVISOR', actor: 'human', advisorId: 'maya-chen' })
    const reset = canvasReducer(changed, { type: 'RESET', actor: 'human' })
    expect(reset.version).toBe(1)
    expect(reset.selectedAdvisorId).toBeUndefined()
    expect(reset.handoff).toBeUndefined()
  })

  it('packages accepted changes and remaining gaps without an external write', () => {
    const guide = guidedDemo[0]
    let state = createInitialState()
    state = canvasReducer(state, { type: 'PROPOSE', actor: 'agent', bulletId: guide.bulletId, newText: guide.newText, rationale: guide.rationale })
    state = canvasReducer(state, { type: 'APPLY', actor: 'human', bulletId: guide.bulletId })
    state = canvasReducer(state, { type: 'STAGE_HANDOFF', actor: 'agent', advisorId: 'maya-chen', sessionTopic: 'Executive storytelling', auditSummary: 'One rewrite accepted; two evidence gaps remain.' })
    expect(state.handoff?.acceptedChanges).toHaveLength(1)
    expect(state.handoff?.remainingGaps).toHaveLength(2)
    expect(state.handoff?.advisorName).toBe('Maya Chen')
  })
})
