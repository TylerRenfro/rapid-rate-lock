import { ExclamationTriangleIcon } from "@heroicons/react/20/solid"
import type { QuoteStatus } from "@/lib/clock"
import { formatCountdown } from "@/lib/format"
import { cn } from "@/lib/utils"

const RADIUS = 36
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Figma: library "Radial progress" (80px, 8px stroke), drawn on a track so the elapsed share stays visible.
 * Live = primary arc, warning = amber arc, expired = no arc on a red track, frozen at 0:00.
 * Digits stay dark until expiry: amber text fails AA (3.3:1 on base-200), red passes (5.0:1).
 */
function RadialCountdown({ status }: { status: QuoteStatus }) {
  const expired = status.phase === "expired"
  const warning = status.phase === "warning"
  return (
    <div className="relative size-20 shrink-0">
      <svg viewBox="0 0 80 80" className="size-full -rotate-90" aria-hidden="true">
        <circle
          cx="40"
          cy="40"
          r={RADIUS}
          fill="none"
          strokeWidth="8"
          className={cn("transition-colors", expired ? "stroke-error" : "stroke-base-300")}
        />
        {/* No arc once expired: a round cap would still draw a dot at zero length */}
        {!expired && (
          <circle
            cx="40"
            cy="40"
            r={RADIUS}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - status.fraction)}
            className={cn(
              "transition-[stroke-dashoffset,stroke] duration-300 ease-linear motion-reduce:transition-none",
              warning ? "stroke-warning" : "stroke-primary",
            )}
          />
        )}
      </svg>
      <span
        className={cn(
          "absolute inset-0 grid place-items-center text-base leading-7 tabular-nums",
          expired ? "text-error" : "text-base-content",
        )}
      >
        {formatCountdown(status.displayMs)}
      </span>
    </div>
  )
}

const COPY = {
  live: { label: "Quotes expire in", helper: "All rates share one 60-second window" },
  warning: { label: "Quotes expiring soon", helper: "All rates share one 60-second window" },
  expired: { label: "Quotes expired", helper: "Refresh to get current pricing" },
} as const

/**
 * Figma: "Quick Quote / Quote timer" — Live (>15s), Warning (<15s), Expired.
 * One layout for all three, so the header never changes size; expiry freezes the ring at 0:00.
 * Refreshing lives in the lock bar, where the broker is when time runs out.
 */
export function QuoteTimer({ status }: { status: QuoteStatus }) {
  const { label, helper } = COPY[status.phase]
  const expired = status.phase === "expired"

  return (
    <div
      role="timer"
      aria-label={expired ? "Quotes expired" : `Quotes expire in ${formatCountdown(status.displayMs)}`}
      className="flex flex-row-reverse items-center justify-end gap-3 @2xl:flex-row"
    >
      <div className="flex flex-col items-start gap-0.5 @2xl:items-end">
        <p className={cn("flex items-center gap-1 text-sm leading-5 font-semibold", expired && "text-error")}>
          {status.phase === "warning" && <ExclamationTriangleIcon aria-hidden="true" className="size-4 shrink-0 text-warning" />}
          {label}
        </p>
        <p className="text-xs leading-4">{helper}</p>
      </div>
      <RadialCountdown status={status} />
    </div>
  )
}
