import { motion } from 'framer-motion'
import { memo, useMemo } from 'react'
import { LEVEL_META, SKILL_META } from '../lib/meta'

const DENSITY_CLASSES = {
  normal: 'gap-2 px-3 py-2 text-sm sm:text-base',
  compact: 'gap-1.5 px-2.5 py-1.5 text-sm',
  dense: 'gap-1.5 px-2 py-1 text-xs',
}

function NameChip({ participant, isNew, index, absent = false, density = 'normal', onActivate }) {
  const skill = SKILL_META[participant.skill] || SKILL_META.Frontend
  const level = LEVEL_META[participant.level] || LEVEL_META.Beginner
  const float = useMemo(
    () => ({ y: 4 + Math.random() * 6, duration: 3 + Math.random() * 3, delay: Math.random() * 2 }),
    [],
  )
  const title = participant.walkIn
    ? 'Walk-in: click to remove'
    : absent
      ? 'Absent: click to mark present'
      : 'Click to mark absent'

  return (
    <motion.div
      layout
      initial={isNew ? { y: -120, scale: 0, opacity: 0, rotate: -8 } : { opacity: 0, scale: 0.6 }}
      animate={{ y: 0, scale: 1, opacity: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={
        isNew
          ? { type: 'spring', stiffness: 380, damping: 11, mass: 0.9 }
          : { duration: 0.4, delay: Math.min(index * 0.03, 1.2) }
      }
    >
      <motion.button
        type="button"
        onClick={() => onActivate?.(participant)}
        title={title}
        aria-pressed={participant.walkIn ? undefined : absent}
        animate={{ y: [0, -float.y, 0] }}
        transition={{ duration: float.duration, delay: float.delay, repeat: Infinity, ease: 'easeInOut' }}
        className={`relative flex cursor-pointer items-center rounded-lg border bg-panel/80 backdrop-blur-sm transition-[opacity,filter] hover:brightness-125 ${DENSITY_CLASSES[density]} ${absent ? 'opacity-35 grayscale' : ''}`}
        style={{
          borderColor: `${skill.color}aa`,
          boxShadow: isNew
            ? `0 0 14px ${skill.color}, 0 0 40px ${skill.color}88`
            : `0 0 8px ${skill.color}55, inset 0 0 10px ${skill.color}22`,
        }}
      >
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: level.color, boxShadow: `0 0 8px ${level.color}` }} />
        <span className={`font-semibold whitespace-nowrap text-white ${absent ? 'line-through' : ''}`}>{participant.name}</span>
        <span className="shrink-0" style={{ color: skill.color }}>
          {skill.icon}
        </span>
        {participant.walkIn && (
          <span className="absolute -top-2 -right-2 rounded bg-neon-amber px-1 text-[9px] font-black text-void">WALK-IN</span>
        )}
        {isNew && !participant.walkIn && (
          <motion.span
            className="absolute -top-2 -right-2 rounded bg-neon-green px-1 text-[9px] font-black text-void"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ delay: 0.2 }}
          >
            NEW
          </motion.span>
        )}
      </motion.button>
    </motion.div>
  )
}

export default memo(NameChip)
