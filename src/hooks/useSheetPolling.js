import { useCallback, useEffect, useRef, useState } from 'react'
import { DEMO_INTERVAL_MS, DEMO_MODE, POLL_INTERVAL_MS, SHEET_CSV_URL } from '../config'
import { parseParticipants } from '../lib/parse'
import { makeDemoParticipant } from '../lib/demo'

const NEW_HIGHLIGHT_MS = 4000
const FETCH_TIMEOUT_MS = 8000

function withCacheBuster(url) {
  return `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`
}

/**
 * Polls the published CSV and tracks which participants arrived after the first load,
 * so only genuinely new registrations get the pop-in treatment.
 */
export function useSheetPolling({ enabled, onNewParticipants }) {
  const [participants, setParticipants] = useState([])
  const [newIds, setNewIds] = useState(() => new Set())
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const knownIds = useRef(new Set())
  const initialized = useRef(false)
  const highlightTimer = useRef(null)
  const onNewRef = useRef(onNewParticipants)
  onNewRef.current = onNewParticipants

  const ingest = useCallback((list) => {
    const fresh = list.filter((p) => !knownIds.current.has(p.id))
    fresh.forEach((p) => knownIds.current.add(p.id))
    setParticipants((prev) => {
      const latest = new Map(list.map((p) => [p.id, p]))
      const updated = prev.map((p) => latest.get(p.id) || p)
      const prevIds = new Set(prev.map((p) => p.id))
      return [...updated, ...list.filter((p) => !prevIds.has(p.id))]
    })
    if (initialized.current && fresh.length) {
      setNewIds(new Set(fresh.map((p) => p.id)))
      clearTimeout(highlightTimer.current)
      highlightTimer.current = setTimeout(() => setNewIds(new Set()), NEW_HIGHLIGHT_MS)
      onNewRef.current?.(fresh)
    }
    initialized.current = true
    setLastUpdated(new Date())
    setLoading(false)
  }, [])

  const inFlight = useRef(false)

  const fetchSheet = useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    try {
      const res = await fetch(withCacheBuster(SHEET_CSV_URL), { cache: 'no-store', signal: controller.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      if (/^\s*</.test(text)) throw new Error('Sheet returned HTML - is it published to the web as CSV?')
      ingest(parseParticipants(text))
      setError(null)
    } catch (err) {
      setError(err.name === 'AbortError' ? 'Request timed out' : err.message || 'Failed to fetch sheet')
      setLoading(false)
    } finally {
      clearTimeout(timeout)
      inFlight.current = false
    }
  }, [ingest])

  useEffect(() => {
    if (!enabled) return undefined
    if (DEMO_MODE) {
      if (!initialized.current) ingest(Array.from({ length: 6 }, makeDemoParticipant))
      const id = setInterval(() => {
        const batch = Array.from({ length: Math.random() < 0.3 ? 2 : 1 }, makeDemoParticipant)
        ingest(batch)
      }, DEMO_INTERVAL_MS)
      return () => clearInterval(id)
    }
    fetchSheet()
    const id = setInterval(fetchSheet, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [enabled, fetchSheet, ingest])

  return { participants, newIds, lastUpdated, error, loading }
}