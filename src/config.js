// Published Google Sheet CSV (File -> Share -> Publish to web -> CSV).
export const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-Q5TfdYLxEGjmA2g3kFWIMyuOAigs_0R56ZebsKVef2KOvfHtUFPFiIgos3VYiSGUBQRnJxLXilwI/pub?output=csv'

export const POLL_INTERVAL_MS = 5000
export const SHUFFLE_DURATION_MS = 5500
export const TEAM_SIZE = 4
export const MIN_PARTICIPANTS_TO_SHUFFLE = 3

// Append ?demo=1 to the URL to inject fake registrations instead of reading the sheet.
export const DEMO_MODE = new URLSearchParams(window.location.search).has('demo')
export const DEMO_INTERVAL_MS = 2500
