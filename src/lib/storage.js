import { DEMO_MODE } from '../config'

const SUFFIX = DEMO_MODE ? ':demo' : ''
const TEAMS_KEY = `team-shuffle:last-teams${SUFFIX}`
const ABSENT_KEY = `team-shuffle:absent${SUFFIX}`
const WALK_INS_KEY = `team-shuffle:walk-ins${SUFFIX}`
const MUTED_KEY = 'team-shuffle:muted'

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key))
  } catch {
    return null
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be unavailable (private mode, quota); persistence is best-effort.
  }
}

export function loadLastTeams() {
  const saved = read(TEAMS_KEY)
  return Array.isArray(saved?.teams) && saved.teams.length ? saved : null
}

export function saveLastTeams(teams) {
  write(TEAMS_KEY, { teams, savedAt: new Date().toISOString() })
}

export function loadAbsentIds() {
  const saved = read(ABSENT_KEY)
  return new Set(Array.isArray(saved) ? saved : [])
}

export function saveAbsentIds(ids) {
  write(ABSENT_KEY, [...ids])
}

export function loadWalkIns() {
  const saved = read(WALK_INS_KEY)
  return Array.isArray(saved) ? saved.filter((w) => w && w.id && w.name) : []
}

export function saveWalkIns(walkIns) {
  write(WALK_INS_KEY, walkIns)
}

export function loadMuted() {
  return read(MUTED_KEY) === true
}

export function saveMuted(muted) {
  write(MUTED_KEY, muted)
}
