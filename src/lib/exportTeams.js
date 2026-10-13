export function teamsToText(teams) {
  return teams
    .map((t) =>
      [
        `Team ${t.id}: ${t.name}`,
        ...t.members.map((m) => `  - ${m.name}${m.github ? ` (@${m.github})` : ''} [${m.level}, ${m.skill}]`),
      ].join('\n'),
    )
    .join('\n\n')
}

// Form answers are untrusted; a leading quote stops spreadsheets from evaluating them as formulas.
export function csvCell(v) {
  const s = String(v ?? '')
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
  return `"${safe.replace(/"/g, '""')}"`
}

export function teamsToCsv(teams) {
  const rows = [['Team #', 'Team Name', 'Full Name', 'GitHub Username', 'Skill Level', 'Primary Skill', 'Preferred Track']]
  teams.forEach((t) => t.members.forEach((m) => rows.push([t.id, t.name, m.name, m.github, m.level, m.skill, m.track])))
  return rows.map((r) => r.map(csvCell).join(',')).join('\r\n')
}

export function downloadTeamsCsv(teams) {
  const csv = teamsToCsv(teams)
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `hacktoberfest-teams-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.csv`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
