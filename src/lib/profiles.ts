import { CREDIT_TIERS, type CompleteProfile, type LoanPurpose, type Occupancy, type Profile, type PropertyType, type QuoteRow } from "./types"
import { uid } from "./uid"

export const MAX_PROFILES = 3

export { CREDIT_TIERS }

export const LOAN_PURPOSES: { value: LoanPurpose; label: string }[] = [
  { value: "purchase", label: "Purchase" },
  { value: "rate-term", label: "Rate/term refinance" },
  { value: "cash-out", label: "Cash-out refinance" },
]

export const OCCUPANCIES: { value: Occupancy; label: string; phrase: string }[] = [
  { value: "primary", label: "Primary", phrase: "primary residence" },
  { value: "second-home", label: "Second home", phrase: "second home" },
  { value: "investment", label: "Investment", phrase: "investment property" },
]

export const PROPERTY_TYPES: { value: PropertyType; label: string; phrase: string }[] = [
  { value: "single-family", label: "Single-family", phrase: "single-family" },
  { value: "townhouse", label: "Townhouse", phrase: "townhouse" },
  { value: "condo", label: "Condo", phrase: "condo" },
  { value: "multi-unit", label: "2–4 unit", phrase: "2–4 unit" },
]

export function createProfile(): Profile {
  return {
    id: uid(),
    customerName: "",
    creditTier: "",
    loanPurpose: "",
    loanAmount: null,
    downPayment: null,
    zip: "",
    occupancy: "",
    propertyType: "",
  }
}

export function isComplete(p: Profile): p is CompleteProfile {
  return (
    p.creditTier !== "" &&
    p.loanPurpose !== "" &&
    p.loanAmount !== null &&
    p.loanAmount > 0 &&
    p.downPayment !== null &&
    p.downPayment >= 0 &&
    p.downPayment < 100 &&
    /^\d{5}$/.test(p.zip) &&
    p.occupancy !== "" &&
    p.propertyType !== ""
  )
}

export const profileLetter = (index: number) => String.fromCharCode(65 + index)

export const purposeLabel = (v: LoanPurpose) => LOAN_PURPOSES.find((o) => o.value === v)?.label ?? v

/** "Profile A · 780+ · 20% down" (collapsed panel title) */
export function collapsedTitle(p: Profile, letter: string) {
  if (!isComplete(p)) return `Profile ${letter} · Incomplete`
  return `Profile ${letter} · ${p.creditTier} · ${p.downPayment}% down`
}

/** "780+ credit · 20% down · Purchase" (rate card subtitle) */
export function cardSummary(p: CompleteProfile) {
  return `${p.creditTier} credit · ${p.downPayment}% down · ${purposeLabel(p.loanPurpose)}`
}

/** "All profiles: purchase, primary residence, single-family." when every row shares them. */
export function sharedScenarioNote(rows: QuoteRow[]) {
  if (rows.length < 2) return null
  const [first] = rows
  const same = rows.every(
    (r) =>
      r.profile.loanPurpose === first.profile.loanPurpose &&
      r.profile.occupancy === first.profile.occupancy &&
      r.profile.propertyType === first.profile.propertyType,
  )
  if (!same) return null
  const occupancy = OCCUPANCIES.find((o) => o.value === first.profile.occupancy)?.phrase
  const property = PROPERTY_TYPES.find((o) => o.value === first.profile.propertyType)?.phrase
  return `All profiles: ${purposeLabel(first.profile.loanPurpose).toLowerCase()}, ${occupancy}, ${property}.`
}

/** ["A"] → "Profile A", ["A","B"] → "Profiles A and B", ["A","B","C"] → "Profiles A, B and C" */
export function profilesPhrase(letters: string[]) {
  if (letters.length === 1) return `Profile ${letters[0]}`
  return `Profiles ${letters.slice(0, -1).join(", ")} and ${letters[letters.length - 1]}`
}
