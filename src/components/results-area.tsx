import { LockBar } from "@/components/lock-bar"
import { ProfileRateCard } from "@/components/profile-rate-card"
import { QuoteTimer } from "@/components/quote-timer"
import { ResultsEmpty } from "@/components/results-empty"
import { getQuoteStatus, useNow } from "@/lib/clock"
import { refreshableProfiles, useQuoteStore } from "@/lib/store"
import type { Quote } from "@/lib/types"

function ResultsView({ quote }: { quote: Quote }) {
  // The one shared clock: ticks until this quote's deadline, then stops.
  const now = useNow(quote.expiresAt, Math.max(50, 250 / quote.speed))
  const status = getQuoteStatus(quote, now)
  const expired = status.phase === "expired"

  const selections = useQuoteStore((s) => s.selections)
  const selectRate = useQuoteStore((s) => s.selectRate)
  const refresh = useQuoteStore((s) => s.refresh)
  // Only the quoted borrowers count: a blank profile added since the search doesn't block a refresh
  const canRefresh = useQuoteStore((s) => refreshableProfiles(quote, s.profiles) !== null)

  const count = quote.rows.length
  const noun = count === 1 ? "profile" : "profiles"

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 @2xl:flex-row @2xl:items-center @2xl:gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="text-2xl leading-8 font-bold">Rapid Rates</h2>
          {/* Same in every phase: the timer and the lock bar carry the quote's state */}
          <p className="text-sm leading-5">
            {count} {noun} · Pick one rate per profile, then lock in for 1 hour.
          </p>
        </div>
        <QuoteTimer status={status} canRefresh={canRefresh} onRefresh={refresh} />
      </header>

      {/* Announce phase changes once, not every tick */}
      <p className="sr-only" aria-live="polite">
        {status.phase === "warning"
          ? "Quotes expire in under 15 seconds."
          : expired
            ? "Quotes expired. Refresh to get current pricing."
            : ""}
      </p>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-4">
          {quote.rows.map((row) => (
            <ProfileRateCard
              key={row.profileId}
              row={row}
              selected={selections[row.profileId]}
              expired={expired}
              onSelect={(term) => selectRate(row.profileId, term)}
            />
          ))}
        </div>
        <p className="text-xs leading-4 text-base-content/70">Each option: interest rate • monthly principal &amp; interest. Pick one per profile.</p>
      </div>

      <LockBar quote={quote} expired={expired} canRefresh={canRefresh} onRefresh={refresh} />
    </div>
  )
}

export function ResultsArea() {
  const quote = useQuoteStore((s) => s.quote)

  return (
    <section
      id="results"
      aria-label="Rapid Rates results"
      className="@container flex min-w-0 flex-1 scroll-mt-2 flex-col p-4 sm:p-6 lg:min-h-0 lg:overflow-y-auto"
    >
      {quote ? <ResultsView key={quote.id} quote={quote} /> : <ResultsEmpty />}
    </section>
  )
}
