import { ProfileBadge } from "@/components/profile-badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { formatCurrency, formatTermQuote } from "@/lib/format"
import { cardSummary, loanDetails } from "@/lib/profiles"
import { TERMS, type QuoteRow, type Term } from "@/lib/types"
import { cn } from "@/lib/utils"

/**
 * Figma: "Quick Quote / Profile rate card" (Layout=Row) holding three "Quick Quote / Rate option"s.
 * Code adds a divider under the name, then a loan amount + quick facts row above the options (not yet in Figma).
 * Selected = checked radio only, no highlight. Expired = disabled radios, options dimmed to 60%.
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
      className="flex flex-col gap-4 rounded-box border border-base-300 bg-base-100 p-4 shadow-md @lg:p-5"
    >
      {/* Badge pins to the name line (28px) so it stays put when the summary wraps on narrow cards */}
      <header className="flex min-w-0 items-start gap-3">
        <ProfileBadge id={badgeId} letter={row.letter} className="mt-0.5" />
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Quotes saved before customer name was required may not have one */}
          <h3 id={titleId} className="truncate text-lg leading-7 font-semibold">
            {row.profile.customerName.trim() || "Unnamed borrower"}
          </h3>
          <p className="text-sm leading-5">{cardSummary(row.profile)}</p>
        </div>
      </header>

      <hr className="border-base-300" />

      {/* Loan amount leads; quick facts sit to its right, wrapping beneath it on narrow cards */}
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <dl className="flex flex-col gap-1">
          <dt className="text-xs leading-4">Loan amount</dt>
          <dd className="text-xl leading-7 font-semibold">{formatCurrency(row.profile.loanAmount)}</dd>
        </dl>
        <dl className="flex flex-wrap gap-x-6 gap-y-3">
          {loanDetails(row.profile).map((d) => (
            <div key={d.label} className="flex flex-col gap-1">
              <dt className="text-xs leading-4">{d.label}</dt>
              <dd className="text-sm leading-5 font-semibold whitespace-nowrap">{d.value}</dd>
            </div>
          ))}
        </dl>
      </div>

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
                expired ? "opacity-60" : "cursor-pointer hover:bg-base-200/60",
              )}
            >
              <RadioGroupItem id={optionId} value={String(term)} />
              <span className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-3 gap-y-0.5 @3xl:flex-col @3xl:items-start @3xl:justify-center">
                <span className="text-sm leading-5">{term}-yr fixed</span>
                <span className="text-trim text-base leading-7 font-semibold whitespace-nowrap">
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
