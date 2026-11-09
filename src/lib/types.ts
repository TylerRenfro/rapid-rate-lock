export const TERMS = [15, 20, 30] as const
export type Term = (typeof TERMS)[number]

export const CREDIT_TIERS = [
  "780+",
  "760–779",
  "740–759",
  "720–739",
  "700–719",
  "680–699",
  "660–679",
  "640–659",
  "620–639",
] as const
export type CreditTier = (typeof CREDIT_TIERS)[number]

export type LoanPurpose = "purchase" | "rate-term" | "cash-out"
export type Occupancy = "primary" | "second-home" | "investment"
export type PropertyType = "single-family" | "townhouse" | "condo" | "multi-unit"

/** A borrower profile as edited in the side panel. Empty string / null = not filled in yet. */
export interface Profile {
  id: string
  customerName: string
  creditTier: CreditTier | ""
  loanPurpose: LoanPurpose | ""
  loanAmount: number | null
  downPayment: number | null
  zip: string
  occupancy: Occupancy | ""
  propertyType: PropertyType | ""
}

/** A profile with every pricing field filled in (customer name stays optional). */
export interface CompleteProfile extends Profile {
  creditTier: CreditTier
  loanPurpose: LoanPurpose
  loanAmount: number
  downPayment: number
  occupancy: Occupancy
  propertyType: PropertyType
}

export interface TermQuote {
  /** Interest rate in percent, e.g. 6.125 */
  rate: number
  /** Monthly principal & interest in dollars */
  monthly: number
}

/** One profile's priced result, snapshotted at search time. */
export interface QuoteRow {
  profileId: string
  letter: string
  profile: CompleteProfile
  rates: Record<Term, TermQuote>
}

export interface Quote {
  id: string
  /** Epoch ms when the search ran */
  fetchedAt: number
  /** Epoch ms when the quotes stop being live. Remaining time is always expiresAt − now. */
  expiresAt: number
  /** Clock speed the quote was created with (?speed=N); scales the displayed countdown. */
  speed: number
  rows: QuoteRow[]
}
