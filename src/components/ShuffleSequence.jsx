import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SHUFFLE_DURATION_MS } from '../config'
import { sfx, stopAll } from '../lib/sounds'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*@<>/\\{}[]=+'
const COLORS = ['#39ff14', '#b026ff', '#00d4ff', '#ff2bd6', '#ffb800']
const LOG_LINES = [
  'Initializing team formation kernel...',
  'Parsing registration matrix...',
  'Distributing ADVANCED operators...',
  'Balancing skill vectors [FE/BE/AI/DOC]...',
  'Running anti-monoculture heuristics...',
  'Optimizing swap graph...',
  'Generating callsigns...',
  'Teams compiled. Deploying...',
]
const GOLDEN_ANGLE = 2.39996

function scramble(text, amount) {
  return [...text]
    .map((ch) => (ch === ' ' || Math.random() > amount ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
    .join('')
}

export default function ShuffleSequence({ participants, onDone }) {
  const [frame, setFrame] = useState(0)
  const [progress, setProgress] = useState(0)
  const startRef = useRef(performance.now())
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  const [viewport] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  const seeds = useMemo(() => participants.map(() => Math.random()), [participants])

  useEffect(() => {
    startRef.current = performance.now()
    sfx.riser()
    let tickTimer
    const scheduleTick = () => {
      const p = Math.min(1, (performance.now() - startRef.current) / SHUFFLE_DURATION_MS)
      if (p >= 1) return
      sfx.tick(p)
      tickTimer = setTimeout(scheduleTick, 260 - 220 * p * p)
    }
    scheduleTick()

    const frameTimer = setInterval(() => {
      const p = Math.min(1, (performance.now() - startRef.current) / SHUFFLE_DURATION_MS)
      setProgress(p)
      setFrame((f) => f + 1)
    }, 110)

    const doneTimer = setTimeout(() => onDoneRef.current(), SHUFFLE_DURATION_MS + 250)
    return () => {
      clearTimeout(tickTimer)
      clearInterval(frameTimer)
      clearTimeout(doneTimer)
      stopAll()
    }
  }, [])

  const countdown = Math.max(1, Math.ceil(5 - progress * 5))
  const logCount = Math.min(LOG_LINES.length, Math.floor(progress * LOG_LINES.length) + 1)
  const vortex = progress > 0.55
  const maxR = Math.min(viewport.w, viewport.h) * 0.42

  return (
    <motion.div
      className="fixed inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.2, filter: 'blur(12px)' }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0, 0.12, 0] }}
        transition={{ duration: 0.25, repeat: Infinity }}
        style={{ background: 'radial-gradient(circle, #b026ff 0%, transparent 70%)' }}
      />

      {participants.map((p, i) => {
        let x
        let y
        if (vortex) {
          const vp = (progress - 0.55) / 0.45
          const angle = i * GOLDEN_ANGLE + frame * (0.25 + vp * 0.6)
          const r = maxR * (0.3 + 0.7 * seeds[i]) * (1 - vp * 0.85)
          x = Math.cos(angle) * r * 1.4
          y = Math.sin(angle) * r
        } else {
          const rx = Math.sin(frame * 12.9898 + i * 78.233 + seeds[i] * 100)
          const ry = Math.cos(frame * 39.346 + i * 11.135 + seeds[i] * 100)
          x = rx * viewport.w * 0.42
          y = ry * viewport.h * 0.38
        }
        const color = COLORS[(i + frame) % COLORS.length]
        return (
          <motion.div
            key={p.id}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md border bg-panel/80 px-2 py-1 text-xs font-bold whitespace-nowrap sm:text-sm"
            animate={{ x, y, opacity: vortex ? 1 - progress * 0.4 : 0.9, scale: vortex ? 1 - progress * 0.35 : 1 }}
            transition={{ type: 'spring', stiffness: vortex ? 120 : 260, damping: vortex ? 18 : 22 }}
            style={{ color, borderColor: color, boxShadow: `0 0 10px ${color}` }}
          >
            {scramble(p.name, vortex ? 0.15 + progress * 0.5 : 0.55)}
          </motion.div>
        )
      })}

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="rounded-2xl border border-neon-green/50 bg-void/85 px-8 py-6 box-glow-green backdrop-blur-md sm:px-12">
          <motion.p
            className="text-center font-display text-lg font-bold tracking-[0.25em] text-neon-green glow-green sm:text-2xl"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            PROCESSING ALGORITHMS...
          </motion.p>
          <motion.div
            key={countdown}
            initial={{ scale: 2.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 14 }}
            className="my-3 text-center font-display text-7xl font-black text-neon-purple glow-purple sm:text-8xl"
          >
            {countdown}
          </motion.div>
          <div className="h-2 w-64 overflow-hidden rounded-full bg-white/10 sm:w-96">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress * 100}%`,
                background: 'linear-gradient(90deg, #39ff14, #00d4ff, #b026ff)',
                boxShadow: '0 0 12px #00d4ff',
              }}
            />
          </div>
          <div className="mt-4 h-32 w-64 overflow-hidden text-left text-[11px] leading-5 text-neon-green/80 sm:w-96 sm:text-xs">
            {LOG_LINES.slice(0, logCount).slice(-6).map((line, i, arr) => (
              <motion.div key={line} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <span className="text-neon-blue">$</span> {line}
                {i === arr.length - 1 && progress < 1 && <span className="animate-pulse">_</span>}
                {i < arr.length - 1 && <span className="text-neon-green"> [OK]</span>}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
