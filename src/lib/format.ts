import type { TermQuote } from "./types"

export const formatCurrency = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`

export const formatRate = (rate: number) => `${rate.toFixed(3)}%`

/** "6.000% • $2,698 / mo" */
export const formatTermQuote = (q: TermQuote) => `${formatRate(q.rate)} • ${formatCurrency(q.monthly)} / mo`

/** 48_200 → "0:49" (rounds up so the display hits 0:00 exactly at expiry) */
export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}
