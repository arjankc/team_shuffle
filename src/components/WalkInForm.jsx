import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { PRIMARY_SKILLS, SKILL_LEVELS } from '../lib/parse'

const field =
  'w-full rounded-md border border-white/15 bg-void/80 px-3 py-2 text-sm text-white outline-none focus:border-neon-green'

export default function WalkInForm({ onAdd, onClose }) {
  const [name, setName] = useState('')
  const [github, setGithub] = useState('')
  const [level, setLevel] = useState('Beginner')
  const [skill, setSkill] = useState('Frontend')

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name, github, level, skill })
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 px-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.form
        onSubmit={submit}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl border border-neon-amber/60 bg-panel p-6"
      >
        <h2 className="font-display text-lg font-black tracking-[0.2em] text-neon-amber">ADD WALK-IN</h2>
        <div className="mt-5 space-y-3 text-xs tracking-wider text-white/60">
          <label className="block">
            FULL NAME
            <input autoFocus required value={name} onChange={(e) => setName(e.target.value)} className={`${field} mt-1`} />
          </label>
          <label className="block">
            GITHUB USERNAME (OPTIONAL)
            <input value={github} onChange={(e) => setGithub(e.target.value)} className={`${field} mt-1`} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              LEVEL
              <select value={level} onChange={(e) => setLevel(e.target.value)} className={`${field} mt-1`}>
                {SKILL_LEVELS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
            <label className="block">
              PRIMARY SKILL
              <select value={skill} onChange={(e) => setSkill(e.target.value)} className={`${field} mt-1`}>
                {PRIMARY_SKILLS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-xs tracking-widest text-white/60 hover:text-white">
            CANCEL
          </button>
          <button
            type="submit"
            className="rounded-lg border border-neon-amber px-4 py-2 font-display text-xs font-bold tracking-[0.2em] text-neon-amber hover:bg-neon-amber/15"
          >
            ADD
          </button>
        </div>
      </motion.form>
    </motion.div>
  )
}
