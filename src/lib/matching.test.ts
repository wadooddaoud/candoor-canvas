import { describe, expect, it } from 'vitest'
import { advisors } from '../data/advisors'
import { demoGoal } from '../data/demo'
import { rankAdvisors } from './matching'

describe('rankAdvisors', () => {
  it('ranks deterministically with explicit reasons', () => {
    const first = rankAdvisors(advisors, demoGoal)
    const second = rankAdvisors([...advisors].reverse(), demoGoal)
    expect(first).toEqual(second)
    expect(first[0].advisorId).toBe('maya-chen')
    expect(first.every((match) => match.reasons.length > 0)).toBe(true)
  })
})
