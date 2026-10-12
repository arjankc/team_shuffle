// Sound effects are synthesized into WAV blobs at startup and played with HTML5 Audio,
// so the app ships with no audio assets.

const SAMPLE_RATE = 44100

function encodeWav(samples) {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)
  const writeStr = (offset, s) => [...s].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)))
  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, SAMPLE_RATE, true)
  view.setUint32(28, SAMPLE_RATE * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeStr(36, 'data')
  view.setUint32(40, samples.length * 2, true)
  samples.forEach((s, i) => view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s)) * 0x7fff, true))
  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }))
}

function render(duration, fn) {
  const n = Math.floor(SAMPLE_RATE * duration)
  const out = new Float32Array(n)
  for (let i = 0; i < n; i++) out[i] = fn(i / SAMPLE_RATE, i / n)
  return out
}

// Bubbly "bloop": sine with a fast upward pitch sweep and quick decay.
function makePop() {
  let phase = 0
  return render(0.18, (t, p) => {
    const freq = 380 + 900 * Math.min(1, p * 3)
    phase += (2 * Math.PI * freq) / SAMPLE_RATE
    const env = Math.min(1, t * 400) * Math.exp(-t * 22)
    return Math.sin(phase) * env * 0.7
  })
}

// Mechanical tick: short filtered noise burst plus a high click tone.
function makeTick(freq) {
  let last = 0
  return render(0.05, (t) => {
    const noise = Math.random() * 2 - 1
    last = last * 0.6 + noise * 0.4
    const env = Math.exp(-t * 120)
    return (last * 0.6 + Math.sin(2 * Math.PI * freq * t) * 0.5) * env * 0.6
  })
}

// Futuristic "ta-da": rising arpeggio resolving into a shimmering major chord.
function makeSuccess() {
  const notes = [523.25, 659.25, 783.99, 1046.5]
  const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5]
  return render(1.8, (t) => {
    let s = 0
    notes.forEach((f, i) => {
      const start = i * 0.09
      if (t >= start && t < start + 0.25) {
        const lt = t - start
        s += Math.sign(Math.sin(2 * Math.PI * f * lt)) * 0.12 * Math.exp(-lt * 10)
      }
    })
    if (t >= 0.38) {
      const lt = t - 0.38
      const env = Math.min(1, lt * 30) * Math.exp(-lt * 1.6)
      const vibrato = 1 + 0.004 * Math.sin(2 * Math.PI * 6 * lt)
      chord.forEach((f) => {
        s += Math.sin(2 * Math.PI * f * vibrato * lt) * 0.09 * env
        s += Math.sin(2 * Math.PI * f * 2 * lt) * 0.025 * env
      })
    }
    return s
  })
}

// Low riser/whoosh used under the shuffle sequence.
function makeRiser() {
  let phase = 0
  return render(5.5, (t, p) => {
    const freq = 60 + 340 * p * p
    phase += (2 * Math.PI * freq) / SAMPLE_RATE
    const env = Math.min(1, t * 2) * (p < 0.95 ? 1 : (1 - p) * 20)
    const saw = ((phase / (2 * Math.PI)) % 1) * 2 - 1
    return (saw * 0.08 + Math.sin(phase * 0.5) * 0.12) * env * (0.4 + p * 0.6)
  })
}

let urls = null
function getUrls() {
  if (!urls) {
    urls = {
      pop: encodeWav(makePop()),
      tickLow: encodeWav(makeTick(1800)),
      tickMid: encodeWav(makeTick(2600)),
      tickHigh: encodeWav(makeTick(3600)),
      success: encodeWav(makeSuccess()),
      riser: encodeWav(makeRiser()),
    }
  }
  return urls
}

let muted = false
let unlocked = false
const active = new Set()

export function setMuted(value) {
  muted = value
  if (muted) stopAll()
}

export function isMuted() {
  return muted
}

/** Must be called from a user gesture so browsers allow later playback. */
export function unlockAudio() {
  if (unlocked) return
  unlocked = true
  const a = new Audio(getUrls().pop)
  a.volume = 0
  a.play().catch(() => {})
}

function play(name, { volume = 0.6, rate = 1 } = {}) {
  if (muted) return null
  const audio = new Audio(getUrls()[name])
  audio.volume = volume
  audio.playbackRate = rate
  audio.preservesPitch = false
  active.add(audio)
  audio.addEventListener('ended', () => active.delete(audio))
  audio.play().catch(() => active.delete(audio))
  return audio
}

export function stopAll() {
  active.forEach((a) => a.pause())
  active.clear()
}

export const sfx = {
  pop: () => play('pop', { volume: 0.55, rate: 0.9 + Math.random() * 0.3 }),
  tick: (progress) =>
    play(progress < 0.4 ? 'tickLow' : progress < 0.75 ? 'tickMid' : 'tickHigh', { volume: 0.35 + progress * 0.3 }),
  riser: () => play('riser', { volume: 0.5 }),
  success: () => play('success', { volume: 0.7 }),
}
