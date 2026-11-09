/**
 * Short random id. Avoids crypto.randomUUID, which is missing on plain-http
 * origins (e.g. testing the dev server from a phone on the LAN).
 */
export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}
