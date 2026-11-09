import { ArrowPathIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid"
import { Button } from "@/components/ui/button"
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

const LABEL = { live: "Quotes expire in", warning: "Quotes expiring soon", expired: "Quotes expired" } as const

/**
 * Figma: "Quick Quote / Quote timer" — Live (>15s), Warning (<15s), Expired.
 * One layout for all three, so the header never changes size; expiry freezes the ring at 0:00
 * and swaps the helper line for a small Refresh text button. The lock bar's Refresh button covers
 * narrow screens, where the timer has usually scrolled out of view by the time quotes expire.
 */
export function QuoteTimer({
  status,
  canRefresh,
  onRefresh,
}: {
  status: QuoteStatus
  canRefresh: boolean
  onRefresh: () => void
}) {
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
          {LABEL[status.phase]}
        </p>
        {expired ? (
          // 24px tall for the WCAG 2.2 target size; the 80px ring still sets the row height, so nothing shifts.
          // Flush left/right (px-0) so it lines up with the label; disabled stays text-only, not a grey pill.
          <Button
            variant="link"
            size="xs"
            className="h-6 px-0 disabled:bg-transparent disabled:text-base-content/40"
            disabled={!canRefresh}
            onClick={onRefresh}
          >
            <ArrowPathIcon />
            Refresh all rates
          </Button>
        ) : (
          <p className="text-xs leading-4">All rates share one 60-second window</p>
        )}
      </div>
      <RadialCountdown status={status} />
    </div>
  )
}
