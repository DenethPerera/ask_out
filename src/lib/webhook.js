// --- Backend notification --------------------------------------------------
// Sends the answer to our Express/MongoDB backend which:
//   1. Saves the response to MongoDB
//   2. Emails deneth676@gmail.com in real time
//
// In production this reads from VITE_API_URL (set in Vercel env vars).
// In local dev it falls back to localhost:3001.
// Normalise the env var: strip trailing slash, then ensure it ends with /api/answer
// Works whether VITE_API_URL is the base URL or the full endpoint path.
const _base = (import.meta.env.VITE_API_URL ?? 'http://localhost:3001').replace(/\/+$/, '')
const API_URL = _base.endsWith('/api/answer') ? _base : `${_base}/api/answer`

/**
 * @param {'yes'|'no'} answer
 * @param {number} dodgeCount  How many times she tried to dodge the No button
 */
export async function notifyAnswer(answer, dodgeCount = 0) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer, dodgeCount }),
      // Lets the request finish even if the tab is closed right after.
      keepalive: true,
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      console.warn('Backend notification failed:', data)
    }
  } catch (err) {
    // Never let a failed notification interrupt her moment.
    console.warn('Backend notification error:', err)
  }
}

// Convenience alias kept for backwards-compat
export const notifyYes = () => notifyAnswer('yes', 0)
