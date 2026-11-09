import { ArrowPathIcon } from "@heroicons/react/20/solid"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { QuoteStatus } from "@/lib/clock"
import { formatCountdown } from "@/lib/format"
import { cn } from "@/lib/utils"

const RADIUS = 36
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Figma: library "Radial progress" (80px, 8px stroke). Draws the share of the window still remaining. */
function RadialCountdown({ fraction, label, warning }: { fraction: number; label: string; warning: boolean }) {
  return (
    <div className={cn("relative size-20 shrink-0", warning ? "text-warning" : "text-primary")}>
      <svg viewBox="0 0 80 80" className="size-full -rotate-90" aria-hidden="true">
        <circle
          cx="40"
          cy="40"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
          className="transition-[stroke-dashoffset] duration-300 ease-linear motion-reduce:transition-none"
        />
      </svg>
      <span className={cn("absolute inset-0 grid place-items-center text-base leading-7 tabular-nums", !warning && "text-base-content")}>
        {label}
      </span>
    </div>
  )
}

/** Figma: "Quick Quote / Quote timer" — Live (>15s), Warning (<15s), Expired (refresh all). */
export function QuoteTimer({
  status,
  canRefresh,
  onRefresh,
}: {
  status: QuoteStatus
  canRefresh: boolean
  onRefresh: () => void
}) {
  if (status.phase === "expired") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="error">Quotes expired</Badge>
        <Button size="lg" disabled={!canRefresh} onClick={onRefresh}>
          <ArrowPathIcon />
          Refresh all rates
        </Button>
      </div>
    )
  }

  const warning = status.phase === "warning"
  const label = formatCountdown(status.displayMs)

  return (
    <div role="timer" aria-label={`Quotes expire in ${label}`} className="flex flex-row-reverse items-center justify-end gap-3 @2xl:flex-row">
      <div className="flex flex-col items-start gap-0.5 @2xl:items-end">
        <p className={cn("text-sm leading-5 font-semibold", warning && "text-warning")}>
          {warning ? "Quotes expiring soon" : "Quotes expire in"}
        </p>
        <p className="text-xs leading-4">All rates share one 60-second window</p>
      </div>
      <RadialCountdown fraction={status.fraction} label={label} warning={warning} />
    </div>
  )
}
