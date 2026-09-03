import { describe, expect, it } from 'vitest'
import { toolInputSchemas } from './useCanvasTools'

describe('WebMCP runtime schemas', () => {
  it('rejects extra properties and invalid enums', () => {
    expect(toolInputSchemas.diagnose.safeParse({ bulletId: 'b1', issueType: 'invented', feedback: 'Actionable feedback goes here.' }).success).toBe(false)
    expect(toolInputSchemas.apply.safeParse({ bulletId: 'b1', scoreDelta: 99 }).success).toBe(false)
  })

  it('accepts a bounded valid proposal', () => {
    expect(toolInputSchemas.propose.safeParse({ bulletId: 'b1', newText: 'Owned an AI platform used by 18 teams, reducing deployment time by 42%.', rationale: 'Adds quantified scope and impact.' }).success).toBe(true)
  })
})
