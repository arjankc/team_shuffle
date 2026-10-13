import { TEAM_SIZE } from '../config.js'

const ADJECTIVES = ['Neon', 'Quantum', 'Byte', 'Cyber', 'Pixel', 'Binary', 'Turbo', 'Glitch', 'Hyper', 'Async', 'Stealth', 'Atomic', 'Rogue', 'Cosmic', 'Electric', 'Lambda', 'Null', 'Recursive', 'Shadow', 'Vector', 'Kernel', 'Sudo', 'Spectral', 'Infinite']
const NOUNS = ['Ninjas', 'Busters', 'Hackers', 'Wizards', 'Pirates', 'Samurai', 'Phantoms', 'Coders', 'Raptors', 'Mavericks', 'Titans', 'Dragons', 'Rebels', 'Squad', 'Syndicate', 'Collective', 'Commanders', 'Voyagers', 'Owls', 'Foxes', 'Comets', 'Pandas', 'Knights', 'Daemons']

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Team sizes: groups of 4, with the remainder absorbed into teams of 5 or a team of 3. */
export function computeTeamSizes(n, size = TEAM_SIZE) {
  if (n <= 0) return []
  if (n < size) return [n]
  const k = Math.floor(n / size)
  const r = n % size
  const sizes = Array(k).fill(size)
  if (r === 0) return sizes
  if (r === 1) {
    sizes[0] += 1
    return sizes
  }
  if (r === 2) {
    if (k >= 2) {
      sizes[0] += 1
      sizes[1] += 1
      return sizes
    }
    return [size - 1, size - 1]
  }
  return [...sizes, r]
}

export function generateTeamNames(count) {
  const combos = shuffle(ADJECTIVES.flatMap((a) => NOUNS.map((n) => `${a} ${n}`)))
  const usedAdj = new Set()
  const names = []
  for (const combo of combos) {
    if (names.length === count) break
    const adj = combo.split(' ')[0]
    if (usedAdj.has(adj) && usedAdj.size < ADJECTIVES.length) continue
    usedAdj.add(adj)
    names.push(combo)
  }
  while (names.length < count) names.push(`Team ${names.length + 1}`)
  return names
}

const countBy = (members, key, value) => members.reduce((c, m) => c + (m[key] === value ? 1 : 0), 0)

function teamCost(members) {
  if (!members.length) return 0
  const skills = {}
  members.forEach((m) => (skills[m.skill] = (skills[m.skill] || 0) + 1))
  const counts = Object.values(skills)
  let cost = counts.reduce((s, c) => s + (c - 1) ** 2, 0)
  if (members.length > 1 && counts.length === 1) cost += 100
  if (!members.some((m) => m.level === 'Advanced')) cost += 50
  return cost
}

function improveBySwaps(teams) {
  for (let pass = 0; pass < 20; pass++) {
    let improved = false
    for (let a = 0; a < teams.length; a++) {
      for (let b = a + 1; b < teams.length; b++) {
        const A = teams[a].members
        const B = teams[b].members
        for (let i = 0; i < A.length; i++) {
          for (let j = 0; j < B.length; j++) {
            if (A[i].level !== B[j].level || A[i].skill === B[j].skill) continue
            const before = teamCost(A) + teamCost(B)
            ;[A[i], B[j]] = [B[j], A[i]]
            if (teamCost(A) + teamCost(B) < before) improved = true
            else [A[i], B[j]] = [B[j], A[i]]
          }
        }
      }
    }
    if (!improved) break
  }
}

/** Swaps two members between teams; `a` and `b` are `{ teamId, memberId }`. Returns new team objects. */
export function swapMembers(teams, a, b) {
  if (a.teamId === b.teamId) return teams
  const memberA = teams.find((t) => t.id === a.teamId)?.members.find((m) => m.id === a.memberId)
  const memberB = teams.find((t) => t.id === b.teamId)?.members.find((m) => m.id === b.memberId)
  if (!memberA || !memberB) return teams
  const replace = (members, from, to) => members.map((m) => (m.id === from.id ? to : m))
  return teams.map((t) => {
    if (t.id === a.teamId) return { ...t, members: replace(t.members, memberA, memberB) }
    if (t.id === b.teamId) return { ...t, members: replace(t.members, memberB, memberA) }
    return t
  })
}

/**
 * Builds balanced teams:
 *  - Advanced members are spread first so each team gets one before any gets two.
 *  - Intermediate then Beginner fill remaining slots, preferring teams lacking that level/skill.
 *  - A swap pass between same-level members reduces single-skill teams.
 */
export function buildTeams(participants) {
  const sizes = computeTeamSizes(participants.length)
  const names = generateTeamNames(sizes.length)
  const teams = sizes.map((capacity, i) => ({ id: i + 1, name: names[i], capacity, members: [] }))
  if (!teams.length) return []

  const pool = shuffle(participants)
  const ordered = ['Advanced', 'Intermediate', 'Beginner'].flatMap((lvl) => pool.filter((p) => p.level === lvl))

  for (const person of ordered) {
    const open = teams.filter((t) => t.members.length < t.capacity)
    let best = null
    let bestScore = Infinity
    for (const team of shuffle(open)) {
      const score =
        countBy(team.members, 'level', person.level) * 100 +
        countBy(team.members, 'skill', person.skill) * 10 +
        team.members.length / team.capacity
      if (score < bestScore) {
        bestScore = score
        best = team
      }
    }
    best.members.push(person)
  }

  improveBySwaps(teams)

  const levelRank = { Advanced: 0, Intermediate: 1, Beginner: 2 }
  teams.forEach((t) => t.members.sort((x, y) => levelRank[x.level] - levelRank[y.level]))
  return teams
}
