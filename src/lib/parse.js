import Papa from 'papaparse'

export const SKILL_LEVELS = ['Advanced', 'Intermediate', 'Beginner']
export const PRIMARY_SKILLS = ['Frontend', 'Backend', 'AI', 'Doc']

// Headers may be the short names from the spec or the full Google Form question text.
const COLUMN_MATCHERS = {
  timestamp: [/timestamp/i],
  name: [/full\s*name/i, /^name$/i],
  github: [/github/i],
  level: [/skill\s*level/i, /experience/i, /\brate\b/i, /level/i],
  skill: [/primary/i, /area of interest/i, /skill/i],
  track: [/track/i],
}

function resolveColumns(headers) {
  const used = new Set()
  const mapping = {}
  for (const [key, patterns] of Object.entries(COLUMN_MATCHERS)) {
    for (const pattern of patterns) {
      const header = headers.find((h) => !used.has(h) && pattern.test(h))
      if (header) {
        mapping[key] = header
        used.add(header)
        break
      }
    }
  }
  return mapping
}

function normalizeLevel(raw) {
  const v = (raw || '').trim().toLowerCase()
  if (v.startsWith('adv') || v.includes('expert') || v.includes('senior')) return 'Advanced'
  if (v.startsWith('int') || v.includes('mid')) return 'Intermediate'
  return 'Beginner'
}

// Matched against word starts so short keywords don't hit inside other words ("html" is not "ml").
// Order matters: "Database" must resolve to Backend before the AI rule sees "data".
const SKILL_RULES = [
  ['Frontend', /\b(front|ui\b|ux\b|design|html|css|react)/],
  ['Backend', /\b(back|api\b|server|devops|database|db\b|infra|cloud)/],
  ['AI', /\b(ai\b|ml\b|llm|machine|data|deep)/],
  ['Doc', /\b(doc|writ|content)/],
]

function normalizeSkill(raw) {
  const v = (raw || '').trim().toLowerCase()
  const match = SKILL_RULES.find(([, pattern]) => pattern.test(v))
  return match ? match[0] : 'Frontend'
}

export function cleanGithub(raw) {
  return (raw || '')
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/+$/, '')
}

export function parseParticipants(csvText) {
  const { data, meta } = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim(),
  })
  return rowsToParticipants(data, meta.fields || [])
}

/** Parses the Apps Script feed: `{ headers: string[], rows: any[][] }`. */
export function parseFeed(feed) {
  if (!feed || !Array.isArray(feed.headers) || !Array.isArray(feed.rows)) {
    throw new Error(feed?.error || 'Feed returned an unexpected response')
  }
  const headers = feed.headers.map((h) => String(h).trim())
  const rows = feed.rows.map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] == null ? '' : String(r[i])])))
  return rowsToParticipants(rows, headers)
}

/** `rows` are objects keyed by header text. */
export function rowsToParticipants(rows, headers) {
  const cols = resolveColumns(headers)
  if (!cols.name) throw new Error('No "Full Name" column found in sheet')
  // Map preserves first-seen order while later submissions overwrite earlier ones,
  // so a person who re-submits to correct their details gets the latest values.
  const byId = new Map()
  // A submission without a GitHub username is attributed to the latest entry with the same name,
  // and a name-only entry is replaced once that person submits with a username.
  const idByName = new Map()

  for (const row of rows) {
    const name = (row[cols.name] || '').trim()
    if (!name) continue
    const github = cleanGithub(row[cols.github])
    const timestamp = (row[cols.timestamp] || '').trim()
    const nameKey = name.toLowerCase()
    const id = github ? `gh:${github.toLowerCase()}` : idByName.get(nameKey) || `nm:${nameKey}`
    if (github) byId.delete(`nm:${nameKey}`)
    idByName.set(nameKey, id)
    byId.set(id, {
      id,
      name,
      github: github || byId.get(id)?.github || '',
      timestamp,
      level: normalizeLevel(row[cols.level]),
      skill: normalizeSkill(row[cols.skill]),
      track: (row[cols.track] || '').trim(),
    })
  }
  return [...byId.values()]
}
