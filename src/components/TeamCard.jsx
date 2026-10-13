import { motion } from 'framer-motion'
import { LevelBadge, SkillBadge } from '../lib/meta'

const ACCENTS = ['#39ff14', '#b026ff', '#00d4ff']
const SELECTED = '#ffb800'

export const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.85, rotateX: -25 },
  show: { opacity: 1, y: 0, scale: 1, rotateX: 0, transition: { type: 'spring', stiffness: 160, damping: 16 } },
}

export default function TeamCard({ team, index, compact = false, introDone = false, selectedId, onMemberClick }) {
  const accent = ACCENTS[index % ACCENTS.length]

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl p-[2px]"
      style={{
        background: `linear-gradient(135deg, ${accent}, transparent 45%, transparent 55%, ${accent})`,
        boxShadow: `0 0 18px ${accent}55, 0 0 50px ${accent}22`,
        perspective: 800,
      }}
    >
      <div className={`relative h-full overflow-hidden rounded-[14px] bg-panel/95 backdrop-blur ${compact ? 'p-3' : 'p-5'}`}>
        <div
          className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl"
          style={{ background: accent, opacity: 0.18 }}
        />
        <div className="flex items-baseline justify-between">
          <span className="font-display text-[11px] tracking-[0.3em]" style={{ color: accent }}>
            TEAM_{String(team.id).padStart(2, '0')}
          </span>
          <span className="text-[11px] text-white/40">{team.members.length} members</span>
        </div>
        <h3
          className={`mt-1 font-display leading-tight font-black text-white ${compact ? 'mb-2 text-base' : 'mb-4 text-2xl'}`}
          style={{ textShadow: `0 0 10px ${accent}, 0 0 28px ${accent}88` }}
        >
          {team.name}
        </h3>
        <ul className={compact ? 'space-y-1' : 'space-y-2.5'}>
          {team.members.map((m, i) => {
            const selected = m.id === selectedId
            return (
              <motion.li
                key={m.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: introDone ? 0 : 0.35 + index * 0.15 + i * 0.07 }}
              >
                <button
                  type="button"
                  onClick={() => onMemberClick?.(team, m)}
                  title={selected ? 'Selected: click again to cancel' : 'Click, then click someone in another team to swap'}
                  className={`w-full cursor-pointer rounded-lg border text-left transition hover:border-white/30 ${
                    compact ? 'px-2 py-1' : 'px-3 py-2'
                  } ${selected ? '' : 'border-white/5 bg-white/[0.03]'}`}
                  style={selected ? { borderColor: SELECTED, background: `${SELECTED}22`, boxShadow: `0 0 12px ${SELECTED}88` } : undefined}
                >
                  {compact ? (
                    <div className="flex items-center gap-1.5" title={m.github ? `@${m.github}` : undefined}>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{m.name}</span>
                      <LevelBadge level={m.level} compact />
                      <SkillBadge skill={m.skill} iconOnly />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-semibold text-white">{m.name}</span>
                        {m.github && <span className="shrink-0 truncate text-xs text-white/40">@{m.github}</span>}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <LevelBadge level={m.level} />
                        <SkillBadge skill={m.skill} />
                        {m.track && (
                          <span className="truncate self-center text-[10px] tracking-wide text-white/40" title="Preferred track">
                            # {m.track}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </button>
              </motion.li>
            )
          })}
        </ul>
      </div>
    </motion.div>
  )
}
