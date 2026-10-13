import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Background from './components/Background'
import Lobby from './components/Lobby'
import ShuffleSequence from './components/ShuffleSequence'
import Reveal from './components/Reveal'
import RegistrationQR from './components/RegistrationQR'
import { useSheetPolling } from './hooks/useSheetPolling'
import { buildTeams, swapMembers } from './lib/teamAlgorithm'
import { setMuted, sfx, unlockAudio } from './lib/sounds'
import { buildRoster, makeWalkIn, visibleWalkIns } from './lib/roster'
import {
  loadAbsentIds,
  loadLastTeams,
  loadMuted,
  loadWalkIns,
  saveAbsentIds,
  saveLastTeams,
  saveMuted,
  saveWalkIns,
} from './lib/storage'
import { MIN_PARTICIPANTS_TO_SHUFFLE } from './config'

const MAX_POPS_PER_BATCH = 8

function EnterOverlay({ onEnter }) {
  return (
    <motion.div
      className="fixed inset-0 z-40 flex cursor-pointer flex-col items-center justify-center bg-void/80 backdrop-blur-md"
      onClick={onEnter}
      exit={{ opacity: 0 }}
    >
      <motion.p
        className="px-6 text-center font-display text-2xl font-black tracking-[0.15em] text-neon-green glow-green sm:text-4xl sm:tracking-[0.3em]"
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        CLICK TO ENTER THE ARENA
      </motion.p>
      <p className="mt-4 text-xs text-white/40">Enables sound effects</p>
    </motion.div>
  )
}

const topButton =
  'flex items-center rounded-lg border border-white/15 bg-panel/80 p-2 text-xs tracking-widest text-white/70 backdrop-blur hover:border-neon-green hover:text-neon-green xl:px-3'

const iconProps = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className: 'xl:hidden' }

function FullscreenIcon({ exit }) {
  return (
    <svg {...iconProps}>
      {exit ? <path d="M8 3v5H3M16 3v5h5M8 21v-5H3M16 21v-5h5" /> : <path d="M3 8V3h5M21 8V3h-5M3 16v5h5M21 16v5h-5" />}
    </svg>
  )
}

function SoundIcon({ muted }) {
  return (
    <svg {...iconProps}>
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      {muted ? <path d="m22 9-6 6M16 9l6 6" /> : <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />}
    </svg>
  )
}

// Text labels only on wide screens; icons below xl keep the corner clear of the centered header.
function TopControls({ muted, onToggleMute, isFullscreen, onToggleFullscreen }) {
  const fsLabel = isFullscreen ? 'EXIT FULLSCREEN' : 'FULLSCREEN'
  const soundLabel = muted ? 'SOUND: OFF' : 'SOUND: ON'
  return (
    <div className="fixed top-4 right-4 z-30 flex gap-2">
      <button type="button" onClick={onToggleFullscreen} title={`${fsLabel} (F)`} aria-label={fsLabel} className={topButton}>
        <FullscreenIcon exit={isFullscreen} />
        <span className="hidden xl:inline">{fsLabel}</span>
      </button>
      <button type="button" onClick={onToggleMute} title={`${soundLabel} (M)`} aria-label={soundLabel} className={topButton}>
        <SoundIcon muted={muted} />
        <span className="hidden xl:inline">{soundLabel}</span>
      </button>
    </div>
  )
}

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen?.()
  else document.documentElement.requestFullscreen?.().catch(() => {})
}

export default function App() {
  const [phase, setPhase] = useState('lobby')
  const [entered, setEntered] = useState(false)
  const [muted, setMutedState] = useState(loadMuted)
  const [teams, setTeams] = useState([])
  const [lastTeams, setLastTeams] = useState(loadLastTeams)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleNew = useCallback((fresh) => {
    fresh.slice(0, MAX_POPS_PER_BATCH).forEach((_, i) => setTimeout(sfx.pop, i * 120))
  }, [])

  const { participants, newIds, lastUpdated, error, loading } = useSheetPolling({
    enabled: phase === 'lobby',
    onNewParticipants: handleNew,
  })

  const [absentIds, setAbsentIds] = useState(loadAbsentIds)
  const [walkIns, setWalkIns] = useState(loadWalkIns)
  const shownWalkIns = useMemo(() => visibleWalkIns(participants, walkIns), [participants, walkIns])
  const roster = useMemo(() => buildRoster(participants, absentIds, walkIns), [participants, absentIds, walkIns])

  useEffect(() => saveAbsentIds(absentIds), [absentIds])
  useEffect(() => saveWalkIns(walkIns), [walkIns])

  const toggleAbsent = useCallback((p) => {
    setAbsentIds((prev) => {
      const next = new Set(prev)
      if (next.has(p.id)) next.delete(p.id)
      else next.add(p.id)
      return next
    })
  }, [])

  const addWalkIn = (details) => {
    const walkIn = makeWalkIn(details)
    setWalkIns((prev) => [...prev.filter((w) => w.id !== walkIn.id), walkIn])
    sfx.pop()
  }

  const removeWalkIn = useCallback((p) => {
    if (window.confirm(`Remove walk-in ${p.name}?`)) setWalkIns((prev) => prev.filter((w) => w.id !== p.id))
  }, [])

  const resetCheckIns = () => {
    if (!window.confirm('Mark everyone present and remove all walk-ins?')) return
    setAbsentIds(new Set())
    setWalkIns([])
  }

  const startShuffle = () => {
    const built = buildTeams(roster)
    setTeams(built)
    saveLastTeams(built)
    setLastTeams({ teams: built, savedAt: new Date().toISOString() })
    setPhase('shuffling')
  }

  const swap = (a, b) => {
    const next = swapMembers(teams, a, b)
    if (next === teams) return
    setTeams(next)
    saveLastTeams(next)
    setLastTeams({ teams: next, savedAt: new Date().toISOString() })
  }

  const showLastTeams = () => {
    if (!lastTeams) return
    setTeams(lastTeams.teams)
    setPhase('reveal')
  }

  const enter = () => {
    unlockAudio()
    setEntered(true)
  }

  const toggleMute = useCallback(() => setMutedState((m) => !m), [])

  useEffect(() => {
    setMuted(muted)
    saveMuted(muted)
  }, [muted])

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement))
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.('input, textarea, select')) return
      if (e.key === 'f' || e.key === 'F') toggleFullscreen()
      if (e.key === 'm' || e.key === 'M') toggleMute()
    }
    document.addEventListener('fullscreenchange', onFs)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('fullscreenchange', onFs)
      window.removeEventListener('keydown', onKey)
    }
  }, [toggleMute])

  return (
    <MotionConfig reducedMotion="user">
      <Background />
      <TopControls
        muted={muted}
        onToggleMute={toggleMute}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
      <AnimatePresence mode="wait">
        {phase === 'lobby' && (
          <Lobby
            key="lobby"
            participants={participants}
            walkIns={shownWalkIns}
            roster={roster}
            absentIds={absentIds}
            newIds={newIds}
            lastUpdated={lastUpdated}
            error={error}
            loading={loading}
            onShuffle={startShuffle}
            lastTeams={lastTeams}
            onShowLastTeams={showLastTeams}
            onToggleAbsent={toggleAbsent}
            onAddWalkIn={addWalkIn}
            onRemoveWalkIn={removeWalkIn}
            onResetCheckIns={resetCheckIns}
          />
        )}
        {phase === 'shuffling' && (
          <ShuffleSequence key="shuffle" participants={roster} onDone={() => setPhase('reveal')} />
        )}
        {phase === 'reveal' && (
          <Reveal
            key="reveal"
            teams={teams}
            canReshuffle={roster.length >= MIN_PARTICIPANTS_TO_SHUFFLE}
            onReshuffle={startShuffle}
            onSwap={swap}
            onBack={() => setPhase('lobby')}
          />
        )}
      </AnimatePresence>
      {phase === 'lobby' && <RegistrationQR />}
      <AnimatePresence>{!entered && <EnterOverlay key="enter" onEnter={enter} />}</AnimatePresence>
    </MotionConfig>
  )
}
