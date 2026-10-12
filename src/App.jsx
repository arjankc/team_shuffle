import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import Background from './components/Background'
import Lobby from './components/Lobby'
import ShuffleSequence from './components/ShuffleSequence'
import Reveal from './components/Reveal'
import { useSheetPolling } from './hooks/useSheetPolling'
import { buildTeams } from './lib/teamAlgorithm'
import { setMuted, sfx, unlockAudio } from './lib/sounds'
import { loadLastTeams, loadMuted, saveLastTeams, saveMuted } from './lib/storage'
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
  'rounded-lg border border-white/15 bg-panel/80 px-3 py-2 text-xs tracking-widest text-white/70 backdrop-blur hover:border-neon-green hover:text-neon-green'

function TopControls({ muted, onToggleMute, isFullscreen, onToggleFullscreen }) {
  return (
    <div className="fixed top-4 right-4 z-30 flex gap-2">
      <button type="button" onClick={onToggleFullscreen} title="Fullscreen (F)" className={topButton}>
        {isFullscreen ? 'EXIT FULLSCREEN' : 'FULLSCREEN'}
      </button>
      <button type="button" onClick={onToggleMute} title="Mute (M)" className={topButton}>
        {muted ? 'SOUND: OFF' : 'SOUND: ON'}
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

  const startShuffle = () => {
    const built = buildTeams(participants)
    setTeams(built)
    saveLastTeams(built)
    setLastTeams({ teams: built, savedAt: new Date().toISOString() })
    setPhase('shuffling')
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
      if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.('input, textarea')) return
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
    <>
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
            newIds={newIds}
            lastUpdated={lastUpdated}
            error={error}
            loading={loading}
            onShuffle={startShuffle}
            lastTeams={lastTeams}
            onShowLastTeams={showLastTeams}
          />
        )}
        {phase === 'shuffling' && (
          <ShuffleSequence key="shuffle" participants={participants} onDone={() => setPhase('reveal')} />
        )}
        {phase === 'reveal' && (
          <Reveal
            key="reveal"
            teams={teams}
            canReshuffle={participants.length >= MIN_PARTICIPANTS_TO_SHUFFLE}
            onReshuffle={startShuffle}
            onBack={() => setPhase('lobby')}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>{!entered && <EnterOverlay key="enter" onEnter={enter} />}</AnimatePresence>
    </>
  )
}
