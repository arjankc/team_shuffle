import { motion } from 'framer-motion'

const BLOBS = [
  { color: '#b026ff', className: '-top-40 -left-40 h-[36rem] w-[36rem]', dur: 18 },
  { color: '#00d4ff', className: 'top-1/3 -right-48 h-[32rem] w-[32rem]', dur: 22 },
  { color: '#39ff14', className: '-bottom-48 left-1/4 h-[30rem] w-[30rem]', dur: 26 },
]

export default function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {BLOBS.map((b) => (
        <motion.div
          key={b.color}
          className={`absolute rounded-full blur-3xl ${b.className}`}
          style={{ background: b.color, opacity: 0.13 }}
          animate={{ x: [0, 60, -40, 0], y: [0, -50, 30, 0], scale: [1, 1.15, 0.95, 1] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <div
        className="absolute inset-x-0 bottom-0 h-[55vh] origin-bottom"
        style={{ transform: 'perspective(600px) rotateX(60deg)', maskImage: 'linear-gradient(to top, black 10%, transparent 90%)' }}
      >
        <div className="grid-floor absolute inset-0" />
      </div>
      <div className="scanlines absolute inset-0" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, #0a0a0f 100%)' }} />
    </div>
  )
}
