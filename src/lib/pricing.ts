import type { CompleteProfile, CreditTier, LoanPurpose, Occupancy, PropertyType, Term, TermQuote } from "./types"

/**
 * Mock pricing engine. Not real pricing — tuned so the Figma sample profiles
 * (780+ / 20%, 700–719 / 10%, 640–659 / 5%, $450k purchase) reproduce the
 * rates and payments shown in the designs on the first search.
 */
const BASE_30_YR = 6.0

const TERM_OFFSET: Record<Term, number> = { 15: -0.625, 20: -0.25, 30: 0 }

const CREDIT_ADJ: Record<CreditTier, number> = {
  "780+": 0,
  "760–779": 0.125,
  "740–759": 0.125,
  "720–739": 0.25,
  "700–719": 0.25,
  "680–699": 0.375,
  "660–679": 0.5,
  "640–659": 0.75,
  "620–639": 1.0,
}

const PURPOSE_ADJ: Record<LoanPurpose, number> = { purchase: 0, "rate-term": 0.125, "cash-out": 0.375 }
const OCCUPANCY_ADJ: Record<Occupancy, number> = { primary: 0, "second-home": 0.375, investment: 0.75 }
const PROPERTY_ADJ: Record<PropertyType, number> = { "single-family": 0, townhouse: 0, condo: 0.125, "multi-unit": 0.25 }

function downPaymentAdj(pct: number) {
  if (pct >= 20) return 0
  if (pct >= 10) return 0.125
  if (pct >= 5) return 0.25
  return 0.375
}

const toEighth = (n: number) => Math.round(n * 8) / 8

/** Monthly principal & interest for a fixed-rate loan. */
export function monthlyPayment(principal: number, ratePct: number, years: number) {
  const r = ratePct / 100 / 12
  const n = years * 12
  if (r === 0) return principal / n
  return (principal * r) / (1 - Math.pow(1 + r, -n))
}

/** A small "market move" between searches so refreshed quotes visibly change. */
export function randomMarketMove() {
  const moves = [-0.125, 0, 0, 0.125]
  return moves[Math.floor(Math.random() * moves.length)]
}

export function priceProfile(p: CompleteProfile, marketMove = 0): Record<Term, TermQuote> {
  const adj =
    CREDIT_ADJ[p.creditTier] +
    downPaymentAdj(p.downPayment) +
    PURPOSE_ADJ[p.loanPurpose] +
    OCCUPANCY_ADJ[p.occupancy] +
    PROPERTY_ADJ[p.propertyType] +
    marketMove

  const quote = (term: Term): TermQuote => {
    const rate = toEighth(BASE_30_YR + TERM_OFFSET[term] + adj)
    return { rate, monthly: Math.round(monthlyPayment(p.loanAmount, rate, term)) }
  }

  return { 15: quote(15), 20: quote(20), 30: quote(30) }
}
