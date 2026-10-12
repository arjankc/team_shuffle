import { motion } from 'framer-motion'
import { LevelBadge, SkillBadge } from '../lib/meta'

const ACCENTS = ['#39ff14', '#b026ff', '#00d4ff']

export const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.85, rotateX: -25 },
  show: { opacity: 1, y: 0, scale: 1, rotateX: 0, transition: { type: 'spring', stiffness: 160, damping: 16 } },
}

export default function TeamCard({ team, index }) {
  const accent = ACCENTS[index % ACCENTS.length]

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group relative w-full rounded-2xl p-[2px] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)]"
      style={{
        background: `linear-gradient(135deg, ${accent}, transparent 45%, transparent 55%, ${accent})`,
        boxShadow: `0 0 18px ${accent}55, 0 0 50px ${accent}22`,
        perspective: 800,
      }}
    >
      <div className="relative h-full overflow-hidden rounded-[14px] bg-panel/95 p-5 backdrop-blur">
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
          className="mt-1 mb-4 font-display text-2xl leading-tight font-black text-white"
          style={{ textShadow: `0 0 10px ${accent}, 0 0 28px ${accent}88` }}
        >
          {team.name}
        </h3>
        <ul className="space-y-2.5">
          {team.members.map((m, i) => (
            <motion.li
              key={m.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + index * 0.15 + i * 0.07 }}
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-semibold text-white">{m.name}</span>
                {m.github && (
                  <a
                    href={`https://github.com/${m.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 truncate text-xs text-white/40 hover:text-neon-blue"
                  >
                    @{m.github}
                  </a>
                )}
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
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}
