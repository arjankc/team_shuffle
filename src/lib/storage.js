import { DEMO_MODE } from '../config'

const TEAMS_KEY = DEMO_MODE ? 'team-shuffle:last-teams:demo' : 'team-shuffle:last-teams'
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

export function loadMuted() {
  return read(MUTED_KEY) === true
}

export function saveMuted(muted) {
  write(MUTED_KEY, muted)
}
