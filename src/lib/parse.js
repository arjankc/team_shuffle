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

function normalizeSkill(raw) {
  const v = (raw || '').trim().toLowerCase()
  if (!v) return 'Frontend'
  if (v.includes('front') || v.includes('ui') || v.includes('design')) return 'Frontend'
  if (v.includes('back') || v.includes('api') || v.includes('server') || v.includes('devops')) return 'Backend'
  if (v.includes('ai') || v.includes('ml') || v.includes('machine') || v.includes('data')) return 'AI'
  if (v.includes('doc') || v.includes('writ') || v.includes('content')) return 'Doc'
  return 'Frontend'
}

function cleanGithub(raw) {
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
  const cols = resolveColumns(meta.fields || [])
  if (!cols.name) throw new Error('No "Full Name" column found in sheet')
  // Map preserves first-seen order while later submissions overwrite earlier ones,
  // so a person who re-submits to correct their details gets the latest values.
  const byId = new Map()

  for (const row of data) {
    const name = (row[cols.name] || '').trim()
    if (!name) continue
    const github = cleanGithub(row[cols.github])
    const timestamp = (row[cols.timestamp] || '').trim()
    const id = github ? `gh:${github.toLowerCase()}` : `nm:${name.toLowerCase()}`
    byId.set(id, {
      id,
      name,
      github,
      timestamp,
      level: normalizeLevel(row[cols.level]),
      skill: normalizeSkill(row[cols.skill]),
      track: (row[cols.track] || '').trim(),
    })
  }
  return [...byId.values()]
}
