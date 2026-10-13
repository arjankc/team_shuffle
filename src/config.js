// Apps Script web app URL (see apps-script/Code.gs). Preferred: no caching and only the needed columns.
export const FEED_URL = ''

// Fallback when FEED_URL is empty: published Google Sheet CSV (File -> Share -> Publish to web -> CSV).
export const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-Q5TfdYLxEGjmA2g3kFWIMyuOAigs_0R56ZebsKVef2KOvfHtUFPFiIgos3VYiSGUBQRnJxLXilwI/pub?output=csv'

// Registration form link shown beside the QR code (src/assets/registration-qr.png should point to the same form).
export const REGISTRATION_URL = 'https://bit.ly/hckthimi'

export const POLL_INTERVAL_MS = 5000
export const SHUFFLE_DURATION_MS = 5500
export const TEAM_SIZE = 4
export const MIN_PARTICIPANTS_TO_SHUFFLE = 3

// Append ?demo=1 to the URL to inject fake registrations instead of reading the sheet;
// ?demo=80 starts with 80 people (useful for checking that large groups fit on screen).
const demoParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('demo') : null
export const DEMO_MODE = demoParam !== null
export const DEMO_SEED_COUNT = Number.parseInt(demoParam, 10) > 1 ? Math.min(Number.parseInt(demoParam, 10), 300) : 6
export const DEMO_INTERVAL_MS = 2500
