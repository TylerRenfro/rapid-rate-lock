import { Fragment } from "react"
import { ProfileBadge } from "@/components/profile-badge"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { formatCurrency, formatTermQuote } from "@/lib/format"
import { cardSummary } from "@/lib/profiles"
import { TERMS, type QuoteRow, type Term } from "@/lib/types"
import { cn } from "@/lib/utils"

/**
 * Figma: "Quick Quote / Profile rate card" (Layout=Row) holding three "Quick Quote / Rate option"s. * Selected = checked radio only, no highlight. Expired = "Expired" tag, disabled radios, options dimmed to 40%
 * (disabled controls are exempt from contrast minimums; the name and loan amount stay full strength).
 * Options sit side by side when the results area is wide enough, otherwise they stack.
 */
export function ProfileRateCard({
  row,
  selected,
  expired,
  onSelect,
}: {
  row: QuoteRow
  selected: Term | undefined
  expired: boolean
  onSelect: (term: Term) => void
}) {
  const titleId = `rate-card-${row.profileId}`
  const badgeId = `${titleId}-badge`
  // Card and radio group read as "Profile A Jordan Lee"
  const labelledBy = `${badgeId} ${titleId}`

  return (
    <article
      aria-labelledby={labelledBy}
      className="flex flex-col gap-4 rounded-box border border-base-300 bg-base-100 p-4 @lg:p-5"
    >
      <header className="flex items-center gap-4">
        {/* Badge pins to the name line (28px) so it stays put when the summary wraps on narrow cards */}
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <ProfileBadge id={badgeId} letter={row.letter} className="mt-0.5" />
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Wraps rather than squeezing: on narrow cards the tag drops under the name instead of truncating it */}
            <div className="flex min-w-0 flex-wrap items-center gap-x-2">
              {/* Quotes saved before customer name was required may not have one */}
              <h3 id={titleId} className="truncate text-lg leading-7 font-semibold">
                {row.profile.customerName.trim() || "Unnamed borrower"}
              </h3>
              {/* Soft red (4.6:1) so three cards don't shout; the timer's red ring is the loud signal */}
              {expired && <Badge variant="destructive">Expired</Badge>}
            </div>
            {/* Each item stays whole ("3% down"), so narrow cards only break between items */}
            <p className="text-sm leading-5">
              {cardSummary(row.profile).map((item, i) => (
                <Fragment key={item}>
                  {i > 0 && " · "}
                  <span className="whitespace-nowrap">{item}</span>
                </Fragment>
              ))}
            </p>
          </div>
        </div>
        <dl className="flex shrink-0 flex-col items-end gap-0.5">
          <dt className="text-xs leading-4 text-base-content/70">Loan amount</dt>
          <dd className="text-xl leading-7 font-semibold tabular-nums">{formatCurrency(row.profile.loanAmount)}</dd>
        </dl>
      </header>

      <RadioGroup
        aria-labelledby={labelledBy}
        value={selected ? String(selected) : ""}
        onValueChange={(v) => onSelect(Number(v) as Term)}
        disabled={expired}
        className="grid-cols-1 gap-3 @3xl:grid-cols-3"
      >
        {TERMS.map((term) => {
          const optionId = `${row.profileId}-${term}`
          return (
            <label
              key={term}
              htmlFor={optionId}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-lg border border-base-300 bg-base-100 px-4 py-3 transition-colors @3xl:h-18 @3xl:py-4",
                expired ? "opacity-40" : "cursor-pointer hover:bg-base-200/60 active:bg-base-200",
              )}
            >
              <RadioGroupItem id={optionId} value={String(term)} />
              <span className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-3 gap-y-0.5 @3xl:flex-col @3xl:items-start @3xl:justify-center">
                <span className="text-sm leading-5">{term}-yr fixed</span>
                <span className="text-trim text-base leading-7 font-semibold whitespace-nowrap tabular-nums">
                  {formatTermQuote(row.rates[term])}
                </span>
              </span>
            </label>
          )
        })}
      </RadioGroup>
    </article>
  )
}
