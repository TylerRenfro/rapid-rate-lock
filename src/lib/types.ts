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

/**
 * A borrower profile as last saved from the side panel. Empty string / null = not filled in.
 * Edits in progress live in the store's drafts until Save / Update copies them here.
 */
export interface Profile {
  id: string
  /** False until the broker first saves it; unsaved profiles show no status icon. */
  saved: boolean
  customerName: string
  creditTier: CreditTier | ""
  loanPurpose: LoanPurpose | ""
  loanAmount: number | null
  downPayment: number | null
  zip: string
  occupancy: Occupancy | ""
  propertyType: PropertyType | ""
}

/** The editable fields of a profile; also the shape of an unsaved draft. */
export type ProfileValues = Omit<Profile, "id" | "saved">

/** A profile with every field filled in, customer name included. */
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
