import { motion } from 'framer-motion'
import { useState } from 'react'

const COLORS = ['#39ff14', '#b026ff', '#00d4ff', '#ff2bd6', '#ffb800']

export default function Confetti({ count = 90 }) {
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      color: COLORS[i % COLORS.length],
      angle: Math.random() * Math.PI * 2,
      distance: 200 + Math.random() * 500,
      size: 4 + Math.random() * 8,
      rotate: Math.random() * 720 - 360,
      duration: 1.4 + Math.random() * 1.2,
      round: Math.random() > 0.5,
    })),
  )

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-1/3 left-1/2"
          style={{
            width: p.size,
            height: p.round ? p.size : p.size * 0.4,
            background: p.color,
            borderRadius: p.round ? '50%' : 2,
            boxShadow: `0 0 8px ${p.color}`,
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: [0, Math.sin(p.angle) * p.distance * 0.6 - 120, Math.sin(p.angle) * p.distance * 0.6 + 400],
            opacity: [1, 1, 0],
            rotate: p.rotate,
          }}
          transition={{ duration: p.duration, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}
