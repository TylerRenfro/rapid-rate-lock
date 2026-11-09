import { useEffect, useState } from "react"
import type { Quote } from "./types"

/** Quotes are live for 60 seconds. */
export const QUOTE_WINDOW_MS = 60_000
/** Warning state under 15 seconds. */
export const WARNING_MS = 15_000

/**
 * Hidden testing flag: ?speed=10 runs quote windows 10× faster (6 real seconds),
 * while the countdown still reads 1:00 → 0:00. Capped at 600×.
 */
export function readSpeed(): number {
  try {
    const raw = new URLSearchParams(window.location.search).get("speed")
    const n = raw === null ? 1 : Number(raw)
    return Number.isFinite(n) && n >= 1 ? Math.min(n, 600) : 1
  } catch {
    return 1
  }
}

/**
 * The one shared clock. Returns Date.now(), re-rendering a few times a second
 * until `until` (epoch ms) has passed, then stops. It also re-checks the moment
 * the tab becomes visible again, since browsers throttle timers in background tabs.
 * Because deadlines are stored as timestamps, a throttled or missed tick never
 * makes the countdown drift — it just catches up on the next render.
 */
export function useNow(until: number | null, intervalMs = 250) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const tick = () => setNow(Date.now())
    tick()
    if (until === null || Date.now() >= until) return

    const id = window.setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (t >= until) window.clearInterval(id)
    }, intervalMs)

    const onVisible = () => {
      if (document.visibilityState === "visible") tick()
    }
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("focus", tick)

    return () => {
      window.clearInterval(id)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("focus", tick)
    }
  }, [until, intervalMs])

  return now
}

export type QuotePhase = "live" | "warning" | "expired"

export interface QuoteStatus {
  phase: QuotePhase
  /** Remaining time as displayed (scaled back up by the speed flag) */
  displayMs: number
  /** 1 → 0 share of the window remaining, for the radial ring */
  fraction: number
}

export function getQuoteStatus(quote: Quote, now: number): QuoteStatus {
  const realLeft = quote.expiresAt - now
  if (realLeft <= 0) return { phase: "expired", displayMs: 0, fraction: 0 }
  const displayMs = Math.min(QUOTE_WINDOW_MS, realLeft * quote.speed)
  return {
    phase: displayMs < WARNING_MS ? "warning" : "live",
    displayMs,
    fraction: displayMs / QUOTE_WINDOW_MS,
  }
}
