import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import qrSrc from '../assets/registration-qr.png'
import { REGISTRATION_URL } from '../config'

const LAYOUT_ID = 'registration-qr'
const displayUrl = REGISTRATION_URL.replace(/^https?:\/\//, '')

export default function RegistrationQR() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* The thumbnail slot stays mounted while enlarged so it keeps receiving hover; the enlarged copy ignores the pointer. */}
      <button
        type="button"
        aria-label={`Registration QR code, or visit ${displayUrl} (hover to enlarge)`}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="fixed top-4 left-4 z-30 flex cursor-zoom-in flex-col items-center gap-1.5 rounded-xl border border-neon-green/50 bg-panel/80 p-2 box-glow-green backdrop-blur"
      >
        <span className="block h-20 w-20 sm:h-28 sm:w-28 lg:h-32 lg:w-32">
          {!open && (
            <motion.img
              layoutId={LAYOUT_ID}
              src={qrSrc}
              alt=""
              className="h-full w-full rounded-md bg-white"
            />
          )}
        </span>
        <span className="font-display text-[10px] tracking-[0.2em] text-neon-green sm:text-xs">SCAN TO JOIN</span>
        <span className="text-[10px] font-semibold text-neon-blue sm:text-xs">{displayUrl}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="qr-enlarged"
            className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center bg-void/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="rounded-3xl border-2 border-neon-green bg-white p-4 box-glow-green">
              <motion.img
                layoutId={LAYOUT_ID}
                src={qrSrc}
                alt="Scan to register for the hackathon"
                className="h-[min(62vh,80vw)] w-[min(62vh,80vw)]"
              />
            </div>
            <p className="mt-5 font-display text-lg font-black tracking-[0.3em] text-neon-green glow-green sm:text-2xl">
              SCAN OR VISIT
            </p>
            <p className="mt-2 font-display text-2xl font-black tracking-[0.1em] text-neon-blue glow-blue sm:text-4xl">
              {displayUrl}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
