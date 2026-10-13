import { describe, expect, it } from 'vitest'
import { parseFeed, parseParticipants } from './parse'

const csv = (rows) => rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')

const HEADER = ['Timestamp', 'Email Address', 'Full Name', 'GitHub Username', 'Skill Level', 'Primary Skill', 'Preferred Track']

describe('parseParticipants', () => {
  it('maps short headers and never exposes unrelated columns', () => {
    const [p] = parseParticipants(
      csv([HEADER, ['1/1/2026', 'ada@example.com', 'Ada Lovelace', 'ada', 'Advanced', 'Backend', 'Open Source']]),
    )
    expect(p).toEqual({
      id: 'gh:ada',
      name: 'Ada Lovelace',
      github: 'ada',
      timestamp: '1/1/2026',
      level: 'Advanced',
      skill: 'Backend',
      track: 'Open Source',
    })
    expect(JSON.stringify(p)).not.toContain('example.com')
  })

  it('matches long Google Form question headers', () => {
    const [p] = parseParticipants(
      csv([
        ['Timestamp', 'What is your Full Name?', 'Your GitHub profile', 'How would you rate your experience?', 'Primary area of interest', 'Which track do you prefer?'],
        ['t', 'Grace', 'https://github.com/grace/', 'Intermediate', 'AI', 'Web'],
      ]),
    )
    expect(p).toMatchObject({ name: 'Grace', github: 'grace', level: 'Intermediate', skill: 'AI', track: 'Web' })
  })

  it.each([
    ['Frontend', 'Frontend'],
    ['UI/UX', 'Frontend'],
    ['HTML/CSS', 'Frontend'],
    ['Backend', 'Backend'],
    ['Database', 'Backend'],
    ['APIs and servers', 'Backend'],
    ['AI', 'AI'],
    ['AI/ML', 'AI'],
    ['Data science', 'AI'],
    ['Machine Learning', 'AI'],
    ['Doc', 'Doc'],
    ['Documentation', 'Doc'],
    ['Technical writing', 'Doc'],
    ['', 'Frontend'],
  ])('classifies skill %j as %s', (raw, expected) => {
    const [p] = parseParticipants(csv([HEADER, ['t', 'e', 'X', 'x', 'Beginner', raw, '']]))
    expect(p.skill).toBe(expected)
  })

  it.each([
    ['Advanced', 'Advanced'],
    ['Expert', 'Advanced'],
    ['Intermediate', 'Intermediate'],
    ['Mid-level', 'Intermediate'],
    ['Beginner', 'Beginner'],
    ['', 'Beginner'],
  ])('classifies level %j as %s', (raw, expected) => {
    const [p] = parseParticipants(csv([HEADER, ['t', 'e', 'X', 'x', raw, 'Frontend', '']]))
    expect(p.level).toBe(expected)
  })

  it('keeps the latest submission for a repeated GitHub username, in first-seen order', () => {
    const list = parseParticipants(
      csv([
        HEADER,
        ['1', 'e', 'Ada', 'ada', 'Beginner', 'Frontend', ''],
        ['2', 'e', 'Bob', 'bob', 'Beginner', 'Frontend', ''],
        ['3', 'e', 'Ada L.', '@ADA', 'Advanced', 'Backend', ''],
      ]),
    )
    expect(list.map((p) => p.name)).toEqual(['Ada L.', 'Bob'])
    expect(list[0].level).toBe('Advanced')
  })

  it('merges a name-only submission with a later one that adds a GitHub username', () => {
    const list = parseParticipants(
      csv([
        HEADER,
        ['1', 'e', 'Linus', '', 'Beginner', 'Frontend', ''],
        ['2', 'e', 'linus', 'torvalds', 'Advanced', 'Backend', ''],
      ]),
    )
    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({ id: 'gh:torvalds', level: 'Advanced' })
  })

  it('attributes a later name-only submission to the existing GitHub entry', () => {
    const list = parseParticipants(
      csv([
        HEADER,
        ['1', 'e', 'Linus', 'torvalds', 'Beginner', 'Frontend', ''],
        ['2', 'e', 'Linus', '', 'Advanced', 'Backend', ''],
      ]),
    )
    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({ id: 'gh:torvalds', github: 'torvalds', level: 'Advanced' })
  })

  it('parses the Apps Script JSON feed with the same rules as the CSV', () => {
    const list = parseFeed({
      headers: ['Timestamp', 'Full Name', 'GitHub Username', 'How would you rate your current coding/technical experience?', 'What is your PRIMARY area of interest or skill for today?', 'Which track are you most interested in today?'],
      rows: [
        ['2026-10-13T08:00:00.000Z', 'Ada', 'ada', 'Advanced', 'AI and Machine Learning', 'AI Focus'],
        ['2026-10-13T08:01:00.000Z', 'Bob', null, 'Beginner', 'Documentation and Non-Code', 'I am flexible'],
      ],
    })
    expect(list).toEqual([
      { id: 'gh:ada', name: 'Ada', github: 'ada', timestamp: '2026-10-13T08:00:00.000Z', level: 'Advanced', skill: 'AI', track: 'AI Focus' },
      { id: 'nm:bob', name: 'Bob', github: '', timestamp: '2026-10-13T08:01:00.000Z', level: 'Beginner', skill: 'Doc', track: 'I am flexible' },
    ])
  })

  it('surfaces feed errors', () => {
    expect(() => parseFeed({ error: 'Sheet "X" not found' })).toThrow('Sheet "X" not found')
    expect(() => parseFeed(null)).toThrow(/unexpected/)
  })

  it('skips rows without a name and fails clearly without a name column', () => {
    expect(parseParticipants(csv([HEADER, ['t', 'e', '', 'x', '', '', '']]))).toEqual([])
    expect(() => parseParticipants(csv([['Timestamp', 'Email'], ['t', 'e']]))).toThrow(/Full Name/)
  })
})
