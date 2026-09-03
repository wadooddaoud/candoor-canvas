import { describe, expect, it } from 'vitest'
import { demoBullets } from '../data/demo'
import { scoreResume } from './scoring'

describe('scoreResume', () => {
  it('is deterministic and remains within 0–100', () => {
    const first = scoreResume(demoBullets)
    expect(scoreResume(structuredClone(demoBullets))).toEqual(first)
    expect(first.total).toBeGreaterThanOrEqual(0)
    expect(first.total).toBeLessThanOrEqual(100)
  })

  it('awards the full visible rubric to evidence-rich bullets', () => {
    const bullets = Array.from({ length: 3 }, (_, index) => ({ id: `b${index}`, originalText: '', text: 'Owned the AI product platform for 18 engineering teams, increasing deployment velocity by 42%.', accepted: true }))
    expect(scoreResume(bullets).total).toBe(100)
  })

  it('awards zero to content without rubric signals', () => {
    expect(scoreResume([{ id: 'x', originalText: '', text: 'Assisted with various things.', accepted: false }]).total).toBe(0)
  })
})
