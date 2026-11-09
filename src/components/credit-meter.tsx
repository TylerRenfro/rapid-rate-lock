import type { CreditBand } from "@/lib/profiles"
import { cn } from "@/lib/utils"

const BAND_FILL: Record<CreditBand, string> = {
  4: "bg-credit-strong",
  3: "bg-credit-good",
  2: "bg-credit-fair",
  1: "bg-credit-weak",
}

/**
 * 4-chunk credit meter for the rate card: fills one chunk per band, all in that band's color.
 * Decorative only — the tier text beside it carries the value, so color is never the only cue.
 */
export function CreditMeter({ band, className }: { band: CreditBand; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("inline-flex shrink-0 gap-0.5", className)}>
      {[1, 2, 3, 4].map((chunk) => (
        <span key={chunk} className={cn("h-2 w-3 rounded-xs", chunk <= band ? BAND_FILL[band] : "bg-base-300")} />
      ))}
    </span>
  )
}
