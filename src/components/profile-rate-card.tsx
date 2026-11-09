import { IconBeach, IconBuilding, IconHome } from "@tabler/icons-react"
import { CreditMeter } from "@/components/credit-meter"
import { ProfileBadge } from "@/components/profile-badge"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { formatCurrency, formatTermQuote } from "@/lib/format"
import { CREDIT_BAND, occupancyLabel } from "@/lib/profiles"
import { TERMS, type Occupancy, type QuoteRow, type Term } from "@/lib/types"
import { cn } from "@/lib/utils"

/** Tabler outline icons (the rest of the app uses Heroicons); the user picked these from the mockup. */
const OCCUPANCY_ICON: Record<Occupancy, typeof IconHome> = {
  primary: IconHome,
  "second-home": IconBeach,
  investment: IconBuilding,
}

/**
 * Figma: "Quick Quote / Profile rate card" (Layout=Row) holding three "Quick Quote / Rate option"s. * Selected = checked radio only, no highlight. Expired = "Expired" tag, disabled radios, options dimmed to 40%
 * (disabled controls are exempt from contrast minimums; the name and loan amount stay full strength).
 * Options sit side by side when the results area is wide enough, otherwise they stack.
 * Code only, not yet in Figma: the summary strip under the name (credit meter, down payment, occupancy).
 * It stays at full strength when quotes expire, since the profile facts don't expire.
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
  const { profile } = row
  const OccupancyIcon = OCCUPANCY_ICON[profile.occupancy]

  return (
    <article
      aria-labelledby={labelledBy}
      className="flex flex-col gap-4 rounded-box border border-base-300 bg-base-100 p-4 @lg:p-5"
    >
      {/*
        Narrow cards: name and loan amount share the top row, bottom-aligned so the name sits on the amount's line,
        and the summary strip runs the full card width beneath them. Wider cards: name over strip on the left,
        loan amount centered on the right across both rows.
      */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4">
        {/* Badge pins to the name line (28px) so it stays put when the Expired tag wraps under the name */}
        <div className="flex min-w-0 items-start gap-3 self-end">
          <ProfileBadge id={badgeId} letter={row.letter} className="mt-0.5" />
          {/* Wraps rather than squeezing: on narrow cards the tag drops under the name instead of truncating it */}
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2">
            {/* Quotes saved before customer name was required may not have one */}
            <h3 id={titleId} className="truncate text-lg leading-7 font-semibold">
              {row.profile.customerName.trim() || "Unnamed borrower"}
            </h3>
            {/* Soft red (4.6:1) so three cards don't shout; the timer's red ring is the loud signal */}
            {expired && <Badge variant="destructive">Expired</Badge>}
          </div>
        </div>
        <dl className="flex flex-col items-end gap-0.5 @lg:row-span-2 @lg:self-center">
          <dt className="text-xs leading-4 text-base-content/70">Loan amount</dt>
          <dd className="text-xl leading-7 font-semibold tabular-nums">{formatCurrency(row.profile.loanAmount)}</dd>
        </dl>
        {/*
          Credit · down payment · occupancy, indented to line up with the name (badge 24px + gap 12px).
          Fixed-width slots on wider cards keep the items lined up from card to card;
          each item stays whole, so narrow cards only wrap between items.
        */}
        <dl className="col-span-2 flex flex-wrap items-center gap-x-3 gap-y-1 pl-9 text-sm leading-5 @lg:col-span-1 @lg:gap-x-4">
          {/* Widths fit the longest values ("760–779", "12.5% down") */}
          <div className="flex items-center @lg:min-w-32">
            <dt className="sr-only">Credit</dt>
            <dd className="flex items-center gap-1.5 whitespace-nowrap tabular-nums">
              <CreditMeter band={CREDIT_BAND[profile.creditTier]} />
              {profile.creditTier}
            </dd>
          </div>
          <div className="flex items-center @lg:min-w-22">
            <dt className="sr-only">Down payment</dt>
            <dd className="whitespace-nowrap tabular-nums">{profile.downPayment}% down</dd>
          </div>
          <div className="flex items-center">
            <dt className="sr-only">Occupancy</dt>
            <dd className="flex items-center gap-1.5 whitespace-nowrap">
              <OccupancyIcon aria-hidden="true" className="size-4 shrink-0 text-base-content/70" />
              {occupancyLabel(profile.occupancy)}
            </dd>
          </div>
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
