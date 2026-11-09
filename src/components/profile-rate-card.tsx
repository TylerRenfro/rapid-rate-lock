import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { formatCurrency, formatTermQuote } from "@/lib/format"
import { cardSummary } from "@/lib/profiles"
import { TERMS, type QuoteRow, type Term } from "@/lib/types"
import { cn } from "@/lib/utils"

/**
 * Figma: "Quick Quote / Profile rate card" (Layout=Row) holding three "Quick Quote / Rate option"s.
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

  return (
    <article
      aria-labelledby={titleId}
      className="flex flex-col gap-4 rounded-box border border-base-300 bg-base-100 p-4 shadow-md @lg:p-5"
    >
      <header className="flex items-center gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 id={titleId} className="text-trim text-lg leading-7 font-semibold">
            Profile {row.letter}
          </h3>
          <p className="text-sm leading-5">{cardSummary(row.profile)}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <p className="text-xs leading-4">Loan amount</p>
          <p className="text-trim text-lg leading-7 font-semibold">{formatCurrency(row.profile.loanAmount)}</p>
        </div>
      </header>

      <RadioGroup
        aria-labelledby={titleId}
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
