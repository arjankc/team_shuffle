import { describe, expect, it } from 'vitest'
import { buildRoster, makeWalkIn, visibleWalkIns } from './roster'

const person = (id, name) => ({ id, name, github: '', level: 'Beginner', skill: 'Frontend', track: '' })

describe('buildRoster', () => {
  const registered = [person('gh:ada', 'Ada'), person('gh:bob', 'Bob'), person('nm:cy', 'Cy')]

  it('drops absent registrants and appends walk-ins', () => {
    const walkIn = makeWalkIn({ name: 'Dee', github: '', level: 'Advanced', skill: 'AI' })
    const roster = buildRoster(registered, new Set(['gh:bob']), [walkIn])
    expect(roster.map((p) => p.name)).toEqual(['Ada', 'Cy', 'Dee'])
  })

  it('ignores a walk-in who has since registered via the form', () => {
    const byGithub = makeWalkIn({ name: 'Ada Lovelace', github: '@ADA', level: 'Advanced', skill: 'AI' })
    const byName = makeWalkIn({ name: ' cy ', github: '', level: 'Advanced', skill: 'AI' })
    expect(buildRoster(registered, new Set(), [byGithub, byName])).toHaveLength(3)
    expect(visibleWalkIns(registered, [byGithub, byName])).toEqual([])
  })
})

describe('makeWalkIn', () => {
  it('uses the GitHub username as id when given, otherwise a unique id', () => {
    expect(makeWalkIn({ name: ' Eve ', github: 'https://github.com/Eve/', level: 'Beginner', skill: 'Doc' })).toMatchObject({
      id: 'gh:eve',
      name: 'Eve',
      github: 'Eve',
      walkIn: true,
    })
    const a = makeWalkIn({ name: 'X', github: '', level: 'Beginner', skill: 'Doc' })
    const b = makeWalkIn({ name: 'X', github: '', level: 'Beginner', skill: 'Doc' })
    expect(a.id).toMatch(/^wi:/)
    expect(a.id).not.toBe(b.id)
  })
})
