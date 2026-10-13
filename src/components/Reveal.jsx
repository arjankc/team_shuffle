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

// Narrower, compact cards as the team count grows so all teams fit on one projector screen.
function layoutFor(teamCount) {
  if (teamCount > 15) return { compact: true, columns: 'repeat(auto-fit, minmax(200px, 260px))', gap: 'gap-3' }
  if (teamCount > 8) return { compact: true, columns: 'repeat(auto-fit, minmax(220px, 280px))', gap: 'gap-4' }
  return { compact: false, columns: 'repeat(auto-fit, minmax(260px, 320px))', gap: 'gap-6' }
}

export default function Reveal({ teams, canReshuffle, onReshuffle, onBack, onSwap }) {
  const [showConfetti, setShowConfetti] = useState(true)
  const [copied, setCopied] = useState(false)
  const [selected, setSelected] = useState(null)
  const [introDone, setIntroDone] = useState(false)
  const layout = layoutFor(teams.length)
  const actionSize = layout.compact ? 'px-5 py-2 text-xs' : 'px-6 py-3 text-sm'

  const handleMemberClick = (team, member) => {
    if (!selected || selected.teamId === team.id) {
      setSelected(selected?.memberId === member.id ? null : { teamId: team.id, memberId: member.id })
      return
    }
    onSwap(selected, { teamId: team.id, memberId: member.id })
    sfx.pop()
    setSelected(null)
  }

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setSelected(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setIntroDone(true), (1 + teams.length * 0.15) * 1000)
    return () => clearTimeout(t)
  }, [teams.length])

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
      className={`min-h-screen px-4 sm:px-8 ${layout.compact ? 'pt-16 pb-4 sm:pt-4' : 'pt-16 pb-16 sm:pt-10'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {showConfetti && <Confetti />}

      <motion.div
        className={`mx-auto flex max-w-7xl flex-col items-center text-center ${layout.compact ? 'mb-3' : 'mb-10'}`}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
      >
        <p className="font-display text-[10px] tracking-[0.3em] text-neon-blue glow-blue sm:text-sm sm:tracking-[0.5em]">TEAMS COMPILED SUCCESSFULLY</p>
        <h1
          className={`font-display font-black text-neon-green glow-green ${layout.compact ? 'mt-1 text-2xl sm:text-3xl' : 'mt-3 text-4xl sm:text-6xl'}`}
        >
          THE SQUADS ARE IN
        </h1>
        <p className={`text-sm text-white/50 ${layout.compact ? 'mt-1' : 'mt-3'}`}>
          {teams.length} teams // {total} hackers
          <span className={selected ? 'text-neon-amber' : 'text-white/30'}>
            {' // '}
            {selected ? 'Now click someone in another team (Esc to cancel)' : 'Click two people in different teams to swap them'}
          </span>
        </p>
      </motion.div>

      <motion.div
        className={`mx-auto grid max-w-[120rem] items-start justify-center [grid-template-columns:minmax(0,1fr)] sm:[grid-template-columns:var(--team-columns)] ${layout.gap}`}
        style={{ '--team-columns': layout.columns }}
        variants={container}
        initial="hidden"
        animate="show"
      >
        {teams.map((team, i) => (
          <TeamCard
            key={team.id}
            team={team}
            index={i}
            compact={layout.compact}
            introDone={introDone}
            selectedId={selected?.memberId}
            onMemberClick={handleMemberClick}
          />
        ))}
      </motion.div>

      <motion.div
        className={`flex flex-wrap justify-center gap-4 ${layout.compact ? 'mt-4' : 'mt-12'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: Math.min(0.6 + teams.length * 0.15, 2.5) }}
      >
        <button
          type="button"
          onClick={() => window.confirm('Reshuffle and replace these teams?') && onReshuffle()}
          disabled={!canReshuffle}
          className={`${actionSize} rounded-lg border border-neon-purple font-display font-bold tracking-[0.2em] text-neon-purple box-glow-purple transition hover:bg-neon-purple/15 disabled:cursor-not-allowed disabled:opacity-40`}
        >
          RESHUFFLE
        </button>
        <button
          type="button"
          onClick={copyText}
          className={`${actionSize} rounded-lg border border-neon-green font-display font-bold tracking-[0.2em] text-neon-green box-glow-green transition hover:bg-neon-green/15`}
        >
          {copied ? 'COPIED!' : 'COPY TEAMS'}
        </button>
        <button
          type="button"
          onClick={() => downloadTeamsCsv(teams)}
          className={`${actionSize} rounded-lg border border-neon-green font-display font-bold tracking-[0.2em] text-neon-green box-glow-green transition hover:bg-neon-green/15`}
        >
          DOWNLOAD CSV
        </button>
        <button
          type="button"
          onClick={onBack}
          className={`${actionSize} rounded-lg border border-neon-blue font-display font-bold tracking-[0.2em] text-neon-blue box-glow-blue transition hover:bg-neon-blue/15`}
        >
          BACK TO LOBBY
        </button>
      </motion.div>
    </motion.div>
  )
}
