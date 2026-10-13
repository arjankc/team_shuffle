import { cleanGithub } from './parse'

/**
 * Who actually takes part in the shuffle: registrants not marked absent, plus walk-ins.
 * A walk-in who later also registers through the form (same GitHub username or same name) is dropped
 * so they are not counted twice.
 */
export function buildRoster(participants, absentIds, walkIns) {
  const registeredIds = new Set(participants.map((p) => p.id))
  const registeredNames = new Set(participants.map((p) => p.name.trim().toLowerCase()))
  return [
    ...participants.filter((p) => !absentIds.has(p.id)),
    ...activeWalkIns(walkIns, registeredIds, registeredNames),
  ]
}

export function visibleWalkIns(participants, walkIns) {
  return activeWalkIns(
    walkIns,
    new Set(participants.map((p) => p.id)),
    new Set(participants.map((p) => p.name.trim().toLowerCase())),
  )
}

function activeWalkIns(walkIns, registeredIds, registeredNames) {
  return walkIns.filter((w) => !registeredIds.has(w.id) && !registeredNames.has(w.name.trim().toLowerCase()))
}

export function makeWalkIn({ name, github, level, skill }) {
  const cleanName = name.trim()
  const gh = cleanGithub(github)
  return {
    id: gh ? `gh:${gh.toLowerCase()}` : `wi:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: cleanName,
    github: gh,
    timestamp: new Date().toISOString(),
    level,
    skill,
    track: '',
    walkIn: true,
  }
}
