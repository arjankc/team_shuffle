import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import TeamCard from './TeamCard'
import Confetti from './Confetti'
import { sfx } from '../lib/sounds'
import { downloadTeamsCsv, teamsToText } from '../lib/exportTeams'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
}

export default function Reveal({ teams, canReshuffle, onReshuffle, onBack }) {
  const [showConfetti, setShowConfetti] = useState(true)
  const [copied, setCopied] = useState(false)

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(teamsToText(teams))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy the teams:', teamsToText(teams))
    }
  }
  const total = teams.reduce((s, t) => s + t.members.length, 0)

  const played = useRef(false)

  useEffect(() => {
    if (!played.current) {
      played.current = true
      sfx.success()
    }
    const t = setTimeout(() => setShowConfetti(false), 3200)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      className="min-h-screen px-4 pt-10 pb-16 sm:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {showConfetti && <Confetti />}

      <motion.div
        className="mx-auto mb-10 flex max-w-7xl flex-col items-center text-center"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
      >
        <p className="font-display text-[10px] tracking-[0.3em] text-neon-blue glow-blue sm:text-sm sm:tracking-[0.5em]">TEAMS COMPILED SUCCESSFULLY</p>
        <h1 className="mt-3 font-display text-4xl font-black text-neon-green glow-green sm:text-6xl">THE SQUADS ARE IN</h1>
        <p className="mt-3 text-sm text-white/50">
          {teams.length} teams // {total} hackers
        </p>
      </motion.div>

      <motion.div
        className="mx-auto flex max-w-7xl flex-wrap items-start justify-center gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {teams.map((team, i) => (
          <TeamCard key={team.id} team={team} index={i} />
        ))}
      </motion.div>

      <motion.div
        className="mt-12 flex flex-wrap justify-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: Math.min(0.6 + teams.length * 0.15, 2.5) }}
      >
        <button
          type="button"
          onClick={() => window.confirm('Reshuffle and replace these teams?') && onReshuffle()}
          disabled={!canReshuffle}
          className="rounded-lg border border-neon-purple px-6 py-3 font-display text-sm font-bold tracking-[0.2em] text-neon-purple box-glow-purple transition hover:bg-neon-purple/15 disabled:cursor-not-allowed disabled:opacity-40"
        >
          RESHUFFLE
        </button>
        <button
          type="button"
          onClick={copyText}
          className="rounded-lg border border-neon-green px-6 py-3 font-display text-sm font-bold tracking-[0.2em] text-neon-green box-glow-green transition hover:bg-neon-green/15"
        >
          {copied ? 'COPIED!' : 'COPY TEAMS'}
        </button>
        <button
          type="button"
          onClick={() => downloadTeamsCsv(teams)}
          className="rounded-lg border border-neon-green px-6 py-3 font-display text-sm font-bold tracking-[0.2em] text-neon-green box-glow-green transition hover:bg-neon-green/15"
        >
          DOWNLOAD CSV
        </button>
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-neon-blue px-6 py-3 font-display text-sm font-bold tracking-[0.2em] text-neon-blue box-glow-blue transition hover:bg-neon-blue/15"
        >
          BACK TO LOBBY
        </button>
      </motion.div>
    </motion.div>
  )
}
