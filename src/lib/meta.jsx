export const LEVEL_META = {
  Advanced: { color: '#b026ff', label: 'ADV', stars: 3 },
  Intermediate: { color: '#00d4ff', label: 'INT', stars: 2 },
  Beginner: { color: '#39ff14', label: 'BEG', stars: 1 },
}

const iconProps = {
  width: 12,
  height: 12,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const SKILL_META = {
  Frontend: {
    color: '#00d4ff',
    icon: (
      <svg {...iconProps}>
        <polyline points="8 6 2 12 8 18" />
        <polyline points="16 6 22 12 16 18" />
      </svg>
    ),
  },
  Backend: {
    color: '#ffb800',
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="3" width="18" height="7" rx="1.5" />
        <rect x="3" y="14" width="18" height="7" rx="1.5" />
        <line x1="7" y1="6.5" x2="7.01" y2="6.5" />
        <line x1="7" y1="17.5" x2="7.01" y2="17.5" />
      </svg>
    ),
  },
  AI: {
    color: '#ff2bd6',
    icon: (
      <svg {...iconProps}>
        <rect x="6" y="6" width="12" height="12" rx="2" />
        <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
      </svg>
    ),
  },
  Doc: {
    color: '#39ff14',
    icon: (
      <svg {...iconProps}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
}

export function LevelBadge({ level, compact = false }) {
  const m = LEVEL_META[level] || LEVEL_META.Beginner
  return (
    <span
      title={level}
      className="inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider"
      style={{ color: m.color, background: `${m.color}1f`, border: `1px solid ${m.color}88` }}
    >
      {!compact && '★'.repeat(m.stars)}
      <span>{m.label}</span>
    </span>
  )
}

export function SkillBadge({ skill, iconOnly = false }) {
  const m = SKILL_META[skill] || SKILL_META.Frontend
  return (
    <span
      title={skill}
      className="inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase"
      style={{ color: m.color, background: `${m.color}1f`, border: `1px solid ${m.color}88` }}
    >
      {m.icon}
      {!iconOnly && <span>{skill}</span>}
    </span>
  )
}
