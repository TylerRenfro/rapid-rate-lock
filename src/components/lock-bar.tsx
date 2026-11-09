import { Fragment, type ReactNode } from "react"
import { CheckIcon, LockClosedIcon as LockMiniIcon } from "@heroicons/react/20/solid"
import { LockClosedIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { formatTermQuote } from "@/lib/format"
import { selectionKey, useQuoteStore } from "@/lib/store"
import type { Quote } from "@/lib/types"
import { cn } from "@/lib/utils"

/**
 * Figma: "Quick Quote / Lock bar" — Active (a live selection) or Disabled (quotes expired).
 * Locking only changes the button for now; real lock tracking is still to be designed.
 * It goes back to "Lock in for 1 hour" when the selection changes or a new search runs.
 */
export function LockBar({ quote, expired }: { quote: Quote; expired: boolean }) {
  const selections = useQuoteStore((s) => s.selections)
  const lockedKey = useQuoteStore((s) => s.lockedKey)
  const clearSelections = useQuoteStore((s) => s.clearSelections)
  const lockSelections = useQuoteStore((s) => s.lockSelections)

  const chosen = quote.rows.flatMap((row) => {
    const term = selections[row.profileId]
    return term ? [{ row, term }] : []
  })
  const count = chosen.length
  const locked = !expired && count > 0 && lockedKey === selectionKey(quote, selections)

  let title: string
  let subtitle: ReactNode
  if (expired) {
    title = "No live quotes to lock"
    subtitle = "Quotes expired. Refresh rates to select and lock."
  } else if (count === 0) {
    title = "No rates selected"
    subtitle = "Pick one rate per profile. Locked rates are held for 1 hour."
  } else {
    title = `${count} ${count === 1 ? "rate" : "rates"} selected`
    subtitle = chosen.map(({ row, term }, i) => (
      <Fragment key={row.profileId}>
        {i > 0 && <span aria-hidden="true">{"   ·   "}</span>}
        <span className="whitespace-nowrap">
          Profile {row.letter}: {term}-yr {formatTermQuote(row.rates[term])}
        </span>
      </Fragment>
    ))
  }

  // Only float over the cards once there is something to lock
  const sticky = !expired && count > 0

  return (
    <div
      className={cn(
        "z-10 flex flex-col gap-3 rounded-box bg-base-100 p-4 shadow-lg @2xl:min-h-18 @2xl:flex-row @2xl:items-center @2xl:gap-4 @2xl:px-6",
        sticky && "sticky bottom-4",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <span className="shrink-0 rounded-full bg-base-200 p-2">
          <LockClosedIcon className="size-6" />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-trim text-base leading-7 font-semibold">{title}</p>
          <p className="text-sm leading-5 whitespace-pre-wrap">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        {!expired && count > 0 && (
          <Button variant="ghost" onClick={clearSelections}>
            Clear
          </Button>
        )}
        {locked ? (
          <Button size="lg" variant="secondary" aria-disabled="true" className="pointer-events-none flex-1 @2xl:flex-none">
            <CheckIcon />
            Locked for 1 hour
          </Button>
        ) : (
          <Button size="lg" className="flex-1 @2xl:flex-none" disabled={expired || count === 0} onClick={lockSelections}>
            <LockMiniIcon />
            Lock in for 1 hour
          </Button>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {locked ? `${count === 1 ? "Rate" : "Rates"} locked for 1 hour.` : ""}
      </p>
    </div>
  )
}
