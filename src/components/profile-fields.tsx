import { useState, type ReactNode } from "react"
import { TrashIcon } from "@heroicons/react/20/solid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/format"
import { CREDIT_TIERS, LOAN_PURPOSES, OCCUPANCIES, PROPERTY_TYPES, hasUnsavedChanges } from "@/lib/profiles"
import { useQuoteStore } from "@/lib/store"
import type { Profile, ProfileValues } from "@/lib/types"

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <Label htmlFor={id} className="gap-0.5 px-1 py-2 leading-5 font-normal">
        {label}
        {/* Visual cue only; the control itself carries required / aria-required for assistive tech. */}
        <span aria-hidden="true" className="text-error">
          *
        </span>
      </Label>
      {children}
    </div>
  )
}

function SelectField<T extends string>({
  id,
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  id: string
  label: string
  placeholder: string
  value: T | ""
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <Field id={id} label={label}>
      <Select value={value} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger id={id} aria-required="true" className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent position="popper">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

/** Shows "20%" at rest and the bare number while editing, so backspace never fights the % sign. */
function DownPaymentInput({ id, value, onChange }: { id: string; value: number | null; onChange: (v: number | null) => void }) {
  const [editing, setEditing] = useState(false)
  const display = value === null ? "" : editing ? String(value) : `${value}%`
  return (
    <Input
      id={id}
      required
      inputMode="decimal"
      autoComplete="off"
      placeholder="0%"
      value={display}
      onFocus={() => setEditing(true)}
      onBlur={() => setEditing(false)}
      onChange={(e) => {
        const cleaned = e.target.value.replace(/[^\d.]/g, "")
        if (cleaned === "") return onChange(null)
        const n = Number.parseFloat(cleaned)
        if (Number.isFinite(n)) onChange(Math.min(99, Math.round(n * 10) / 10))
      }}
    />
  )
}

const tierOptions = CREDIT_TIERS.map((t) => ({ value: t, label: t }))

/**
 * Edits go to the profile's draft; Save (never saved) / Update (saved) commits them and collapses the card.
 * Enter in a text field saves too. noValidate: saving an incomplete profile is allowed (it then shows the warning icon).
 */
export function ProfileFields({ profile, canRemove }: { profile: Profile; canRemove: boolean }) {
  const draft = useQuoteStore((s) => s.drafts[profile.id])
  const editDraft = useQuoteStore((s) => s.editDraft)
  const saveProfile = useQuoteStore((s) => s.saveProfile)
  const removeProfile = useQuoteStore((s) => s.removeProfile)
  const values = draft ?? profile
  const update = (patch: Partial<ProfileValues>) => editDraft(profile.id, patch)
  const id = (field: string) => `${profile.id}-${field}`
  // Update is only useful once something has changed; a never-saved profile can always be saved.
  const canSave = !profile.saved || hasUnsavedChanges(profile, draft)

  return (
    <form
      noValidate
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (canSave) saveProfile(profile.id)
      }}
    >
      <Field id={id("name")} label="Customer name">
        <Input
          id={id("name")}
          required
          autoComplete="off"
          value={values.customerName}
          onChange={(e) => update({ customerName: e.target.value })}
        />
      </Field>

      <SelectField
        id={id("credit")}
        label="Credit score"
        placeholder="Select tier"
        value={values.creditTier}
        options={tierOptions}
        onChange={(creditTier) => update({ creditTier })}
      />

      <SelectField
        id={id("purpose")}
        label="Loan purpose"
        placeholder="Select"
        value={values.loanPurpose}
        options={LOAN_PURPOSES}
        onChange={(loanPurpose) => update({ loanPurpose })}
      />

      <Field id={id("amount")} label="Loan amount">
        <Input
          id={id("amount")}
          required
          inputMode="numeric"
          autoComplete="off"
          placeholder="$0"
          value={values.loanAmount ? formatCurrency(values.loanAmount) : ""}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 8)
            update({ loanAmount: digits ? Number(digits) : null })
          }}
        />
      </Field>

      <Field id={id("down")} label="Down payment">
        <DownPaymentInput id={id("down")} value={values.downPayment} onChange={(downPayment) => update({ downPayment })} />
      </Field>

      <Field id={id("zip")} label="ZIP code">
        <Input
          id={id("zip")}
          required
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="e.g. 78701"
          value={values.zip}
          onChange={(e) => update({ zip: e.target.value.replace(/\D/g, "").slice(0, 5) })}
        />
      </Field>

      <SelectField
        id={id("occupancy")}
        label="Occupancy"
        placeholder="Select"
        value={values.occupancy}
        options={OCCUPANCIES}
        onChange={(occupancy) => update({ occupancy })}
      />

      <SelectField
        id={id("property")}
        label="Property type"
        placeholder="Select"
        value={values.propertyType}
        options={PROPERTY_TYPES}
        onChange={(propertyType) => update({ propertyType })}
      />

      <div className="mt-2 flex items-center justify-between gap-2">
        <Button type="submit" disabled={!canSave}>
          {profile.saved ? "Update" : "Save"}
        </Button>
        {canRemove && (
          <Button type="button" variant="ghost" onClick={() => removeProfile(profile.id)}>
            <TrashIcon />
            Delete
          </Button>
        )}
      </div>
    </form>
  )
}
