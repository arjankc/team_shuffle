import { AnimatePresence, motion, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import NameChip from './NameChip'
import WalkInForm from './WalkInForm'
import { LEVEL_META, SKILL_META } from '../lib/meta'
import { DEMO_MODE, MIN_PARTICIPANTS_TO_SHUFFLE } from '../config'

// Shrinks the lobby as headcount grows so everyone fits on one projector screen without scrolling.
function densityFor(count) {
  if (count > 60) return 'dense'
  if (count > 30) return 'compact'
  return 'normal'
}

const COUNTER_SIZE = {
  normal: 'text-[7rem] sm:text-[10rem]',
  compact: 'text-[6rem] sm:text-[8rem]',
  dense: 'text-[4.5rem] sm:text-[6rem]',
}

const controlButton = 'text-[11px] tracking-widest underline-offset-4 hover:underline'

function AnimatedCount({ value }) {
  const spring = useSpring(0, { stiffness: 90, damping: 18 })
  const display = useTransform(spring, (v) => String(Math.round(v)).padStart(3, '0'))
  useEffect(() => {
    spring.set(value)
  }, [spring, value])
  return <motion.span>{display}</motion.span>
}

function Legend({ participants }) {
  const count = (key, value) => participants.filter((p) => p[key] === value).length
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] tracking-wider text-white/60 uppercase">
      {Object.entries(LEVEL_META).map(([lvl, m]) => (
        <span key={lvl} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: m.color, boxShadow: `0 0 6px ${m.color}` }} />
          {lvl}
          <span className="font-bold tabular-nums" style={{ color: m.color }}>
            {count('level', lvl)}
          </span>
        </span>
      ))}
      <span className="text-white/20">|</span>
      {Object.entries(SKILL_META).map(([skill, m]) => (
        <span key={skill} className="flex items-center gap-1.5" style={{ color: m.color }}>
          {m.icon}
          <span className="text-white/60">{skill}</span>
          <span className="font-bold tabular-nums">{count('skill', skill)}</span>
        </span>
      ))}
    </div>
  )
}

export default function Lobby({
  participants,
  walkIns,
  roster,
  absentIds,
  newIds,
  lastUpdated,
  error,
  loading,
  onShuffle,
  lastTeams,
  onShowLastTeams,
  onToggleAbsent,
  onAddWalkIn,
  onRemoveWalkIn,
  onResetCheckIns,
}) {
  const [addingWalkIn, setAddingWalkIn] = useState(false)
  const canShuffle = roster.length >= MIN_PARTICIPANTS_TO_SHUFFLE
  const liveColor = error ? '#ff3b3b' : '#39ff14'
  const absentCount = participants.filter((p) => absentIds.has(p.id)).length
  const chips = [...participants, ...walkIns]
  const density = densityFor(chips.length)
  const activateChip = (p) => (p.walkIn ? onRemoveWalkIn(p) : onToggleAbsent(p))

  return (
    <motion.div
      className="flex min-h-screen flex-col items-center px-4 pt-28 pb-40 sm:pt-8"
      exit={{ opacity: 0, filter: 'blur(8px)' }}
      transition={{ duration: 0.4 }}
    >
      {/* Below xl the header shares the top row with the fixed QR code and controls, so it is inset from both corners. */}
      <motion.p
        className="text-center font-display text-[10px] tracking-[0.3em] text-neon-purple glow-purple sm:px-32 sm:text-xs lg:text-sm lg:tracking-[0.5em] xl:px-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        HACKTOBERFEST // TEAM FORMATION PROTOCOL
      </motion.p>

      <div className="mt-6 flex flex-col items-center">
        <div className="flex items-center gap-3 text-sm tracking-[0.35em] text-neon-blue glow-blue">
          <motion.span
            className="h-3 w-3 rounded-full"
            animate={{ opacity: [1, 0.25, 1], scale: [1, 1.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            style={{ background: liveColor, boxShadow: `0 0 12px ${liveColor}` }}
          />
          LIVE REGISTRATIONS
        </div>
        <motion.div
          key={roster.length}
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 12 }}
          className={`font-display leading-none font-black text-neon-green glow-green tabular-nums ${COUNTER_SIZE[density]}`}
        >
          <AnimatedCount value={roster.length} />
        </motion.div>
        <div className="mt-2 flex items-center gap-3 text-xs text-white/40">
          {DEMO_MODE && <span className="rounded border border-neon-amber/60 px-1.5 text-neon-amber">DEMO MODE</span>}
          {loading ? 'Connecting to registration feed...' : lastUpdated ? `Last sync ${lastUpdated.toLocaleTimeString()}` : ''}
          {absentCount > 0 && <span className="text-red-300/80">{absentCount} absent</span>}
          {walkIns.length > 0 && <span className="text-neon-amber/80">{walkIns.length} walk-in{walkIns.length === 1 ? '' : 's'}</span>}
        </div>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 rounded border border-red-500/60 bg-red-500/10 px-3 py-1 text-xs text-red-300"
            >
              Feed error: {error}. Retrying...
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={density === 'dense' ? 'mt-4' : 'mt-8'}>
        <Legend participants={roster} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-white/40">
        <button type="button" onClick={() => setAddingWalkIn(true)} className={`${controlButton} text-neon-amber/80 hover:text-neon-amber`}>
          + WALK-IN
        </button>
        {(absentCount > 0 || walkIns.length > 0) && (
          <button type="button" onClick={onResetCheckIns} className={`${controlButton} hover:text-white`}>
            RESET CHECK-INS
          </button>
        )}
        {participants.length > 0 && <span className="text-[11px]">Click a name to mark them absent</span>}
      </div>

      <div
        className={`flex w-full flex-wrap content-start items-center justify-center ${
          density === 'dense' ? 'mt-5 max-w-[110rem] gap-2' : density === 'compact' ? 'mt-8 max-w-[96rem] gap-2.5 sm:gap-3' : 'mt-10 max-w-7xl gap-3 sm:gap-4'
        }`}
      >
        <AnimatePresence>
          {chips.map((p, i) => (
            <NameChip
              key={p.id}
              participant={p}
              isNew={newIds.has(p.id)}
              index={i}
              absent={absentIds.has(p.id)}
              density={density}
              onActivate={activateChip}
            />
          ))}
        </AnimatePresence>
        {!loading && chips.length === 0 && (
          <motion.p
            className="mt-12 text-white/40"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            &gt; Awaiting hackers... register now to join the arena_
          </motion.p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-void via-void/90 to-transparent pt-16 pb-8">
        <motion.button
          type="button"
          onClick={onShuffle}
          disabled={!canShuffle}
          whileHover={canShuffle ? { scale: 1.06 } : undefined}
          whileTap={canShuffle ? { scale: 0.95 } : undefined}
          animate={canShuffle ? { boxShadow: ['0 0 20px #39ff1488', '0 0 50px #b026ffaa', '0 0 20px #39ff1488'] } : {}}
          transition={{ boxShadow: { duration: 2.5, repeat: Infinity }, scale: { type: 'spring', stiffness: 400, damping: 15 } }}
          className="shuffle-btn rounded-xl p-[3px] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="block rounded-[10px] bg-void px-7 py-3 font-display text-lg font-black tracking-[0.2em] text-white sm:px-16 sm:py-4 sm:text-3xl sm:tracking-[0.3em]">
            SHUFFLE TEAMS
          </span>
        </motion.button>
        {lastTeams && (
          <button
            type="button"
            onClick={onShowLastTeams}
            title={`Saved ${new Date(lastTeams.savedAt).toLocaleString()}`}
            className="absolute bottom-3 text-[11px] tracking-widest text-white/40 underline-offset-4 hover:text-neon-blue hover:underline"
          >
            VIEW LAST TEAMS ({lastTeams.teams.length})
          </button>
        )}
      </div>

      <AnimatePresence>
        {addingWalkIn && (
          <WalkInForm
            key="walk-in"
            onClose={() => setAddingWalkIn(false)}
            onAdd={(details) => {
              onAddWalkIn(details)
              setAddingWalkIn(false)
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
