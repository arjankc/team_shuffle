import { describe, expect, it } from 'vitest'
import { csvCell, teamsToCsv, teamsToText } from './exportTeams'

const teams = [
  {
    id: 1,
    name: 'Neon Ninjas',
    members: [
      { name: 'Ada', github: 'ada', level: 'Advanced', skill: 'Backend', track: 'Web' },
      { name: 'Bob', github: '', level: 'Beginner', skill: 'Doc', track: '' },
    ],
  },
]

describe('csvCell', () => {
  it('quotes values and escapes embedded quotes', () => {
    expect(csvCell('say "hi"')).toBe('"say ""hi"""')
    expect(csvCell(null)).toBe('""')
    expect(csvCell(3)).toBe('"3"')
  })

  it.each(['=HYPERLINK("x")', '+1', '-2+3', '@SUM(A1)'])('neutralises formula-like value %j', (v) => {
    expect(csvCell(v).startsWith(`"'`)).toBe(true)
  })
})

describe('teamsToCsv', () => {
  it('writes a header plus one row per member', () => {
    const lines = teamsToCsv(teams).split('\r\n')
    expect(lines).toHaveLength(3)
    expect(lines[1]).toBe('"1","Neon Ninjas","Ada","ada","Advanced","Backend","Web"')
  })
})

describe('teamsToText', () => {
  it('lists members with optional GitHub handles', () => {
    expect(teamsToText(teams)).toBe(
      'Team 1: Neon Ninjas\n  - Ada (@ada) [Advanced, Backend]\n  - Bob [Beginner, Doc]',
    )
  })
})
