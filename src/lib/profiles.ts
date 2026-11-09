import {
  CREDIT_TIERS,
  type CompleteProfile,
  type LoanPurpose,
  type Occupancy,
  type Profile,
  type ProfileValues,
  type PropertyType,
} from "./types"
import { formatCurrency } from "./format"
import { uid } from "./uid"

export const MAX_PROFILES = 3

export { CREDIT_TIERS }

export const LOAN_PURPOSES: { value: LoanPurpose; label: string }[] = [
  { value: "purchase", label: "Purchase" },
  { value: "rate-term", label: "Rate/term refinance" },
  { value: "cash-out", label: "Cash-out refinance" },
]

export const OCCUPANCIES: { value: Occupancy; label: string }[] = [
  { value: "primary", label: "Primary" },
  { value: "second-home", label: "Second home" },
  { value: "investment", label: "Investment" },
]

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "single-family", label: "Single-family" },
  { value: "townhouse", label: "Townhouse" },
  { value: "condo", label: "Condo" },
  { value: "multi-unit", label: "2–4 unit" },
]

export function createProfile(): Profile {
  return {
    id: uid(),
    saved: false,
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
    p.customerName.trim() !== "" &&
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

/** The editable fields of a profile (drops id and saved). */
export function profileValues(p: Profile): ProfileValues {
  const { id: _id, saved: _saved, ...values } = p
  return values
}

/** True when a draft exists and differs from the saved profile in any field. */
export function hasUnsavedChanges(p: Profile, draft: ProfileValues | undefined) {
  if (!draft) return false
  return (Object.keys(draft) as (keyof ProfileValues)[]).some((k) => draft[k] !== p[k])
}

export const profileLetter = (index: number) => String.fromCharCode(65 + index)

export const purposeLabel = (v: LoanPurpose) => LOAN_PURPOSES.find((o) => o.value === v)?.label ?? v

/**
 * Panel header preview, built from whatever is filled in so far:
 * name = "Jordan Lee" (empty until typed), detail = "$450,000 · Single-family" (either part may be missing).
 */
export function profilePreview(p: Profile) {
  const property = PROPERTY_TYPES.find((o) => o.value === p.propertyType)?.label
  const detail = [p.loanAmount ? formatCurrency(p.loanAmount) : null, property].filter(Boolean).join(" · ")
  return { name: p.customerName.trim(), detail }
}

/** ["780+ credit", "20% down", "Purchase"] (rate card subtitle, shown joined by " · ") */
export function cardSummary(p: CompleteProfile) {
  return [`${p.creditTier} credit`, `${p.downPayment}% down`, purposeLabel(p.loanPurpose)]
}

/** ["A"] → "Profile A", ["A","B"] → "Profiles A and B", ["A","B","C"] → "Profiles A, B and C" */
export function profilesPhrase(letters: string[]) {
  if (letters.length === 1) return `Profile ${letters[0]}`
  return `Profiles ${letters.slice(0, -1).join(", ")} and ${letters[letters.length - 1]}`
}
