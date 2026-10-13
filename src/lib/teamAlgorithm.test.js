import { describe, expect, it } from 'vitest'
import { buildTeams, computeTeamSizes, generateTeamNames, swapMembers } from './teamAlgorithm'

const LEVELS = ['Advanced', 'Intermediate', 'Beginner']
const SKILLS = ['Frontend', 'Backend', 'AI', 'Doc']

function makePeople(n, pick = (i) => ({ level: LEVELS[i % 3], skill: SKILLS[i % 4] })) {
  return Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: `Person ${i}`, github: '', track: '', ...pick(i) }))
}

describe('computeTeamSizes', () => {
  it.each([
    [0, []],
    [3, [3]],
    [4, [4]],
    [5, [5]],
    [6, [3, 3]],
    [7, [4, 3]],
    [8, [4, 4]],
    [9, [5, 4]],
    [10, [5, 5]],
    [11, [4, 4, 3]],
  ])('splits %i people into %j', (n, sizes) => {
    expect(computeTeamSizes(n)).toEqual(sizes)
  })

  it('always accounts for everyone and keeps teams between 3 and 5', () => {
    for (let n = 3; n <= 200; n++) {
      const sizes = computeTeamSizes(n)
      expect(sizes.reduce((a, b) => a + b, 0)).toBe(n)
      sizes.forEach((s) => expect(s).toBeGreaterThanOrEqual(3))
      sizes.forEach((s) => expect(s).toBeLessThanOrEqual(5))
    }
  })
})

describe('generateTeamNames', () => {
  it('returns unique names', () => {
    const names = generateTeamNames(60)
    expect(names).toHaveLength(60)
    expect(new Set(names).size).toBe(60)
  })
})

describe('swapMembers', () => {
  const teams = [
    { id: 1, name: 'A', members: [{ id: 'a1' }, { id: 'a2' }] },
    { id: 2, name: 'B', members: [{ id: 'b1' }, { id: 'b2' }] },
    { id: 3, name: 'C', members: [{ id: 'c1' }] },
  ]

  it('swaps two members in place without mutating the input', () => {
    const next = swapMembers(teams, { teamId: 1, memberId: 'a2' }, { teamId: 2, memberId: 'b1' })
    expect(next[0].members.map((m) => m.id)).toEqual(['a1', 'b1'])
    expect(next[1].members.map((m) => m.id)).toEqual(['a2', 'b2'])
    expect(next[2]).toBe(teams[2])
    expect(teams[0].members.map((m) => m.id)).toEqual(['a1', 'a2'])
  })

  it('ignores same-team or unknown selections', () => {
    expect(swapMembers(teams, { teamId: 1, memberId: 'a1' }, { teamId: 1, memberId: 'a2' })).toBe(teams)
    expect(swapMembers(teams, { teamId: 1, memberId: 'zz' }, { teamId: 2, memberId: 'b1' })).toBe(teams)
  })
})

describe('buildTeams', () => {
  it('places every participant exactly once and respects team sizes', () => {
    for (let n = 3; n <= 60; n++) {
      const people = makePeople(n)
      const teams = buildTeams(people)
      const ids = teams.flatMap((t) => t.members.map((m) => m.id))
      expect(ids.sort()).toEqual(people.map((p) => p.id).sort())
      expect(teams.map((t) => t.members.length)).toEqual(computeTeamSizes(n))
    }
  })

  it('gives every team an Advanced member before any team gets two', () => {
    const people = makePeople(20, (i) => ({ level: i < 5 ? 'Advanced' : 'Beginner', skill: SKILLS[i % 4] }))
    const teams = buildTeams(people)
    teams.forEach((t) => expect(t.members.filter((m) => m.level === 'Advanced')).toHaveLength(1))
  })

  it('avoids single-skill teams when the mix allows it', () => {
    for (let run = 0; run < 20; run++) {
      const teams = buildTeams(makePeople(24))
      teams.forEach((t) => expect(new Set(t.members.map((m) => m.skill)).size).toBeGreaterThan(1))
    }
  })

  it('handles everyone having the same level and skill', () => {
    const teams = buildTeams(makePeople(9, () => ({ level: 'Beginner', skill: 'Frontend' })))
    expect(teams.flatMap((t) => t.members)).toHaveLength(9)
  })

  it('returns no teams for no participants', () => {
    expect(buildTeams([])).toEqual([])
  })
})
