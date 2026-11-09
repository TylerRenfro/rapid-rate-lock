import { useState, type ReactNode } from "react"
import { TrashIcon } from "@heroicons/react/20/solid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/format"
import { CREDIT_TIERS, LOAN_PURPOSES, OCCUPANCIES, PROPERTY_TYPES } from "@/lib/profiles"
import { useQuoteStore } from "@/lib/store"
import type { Profile } from "@/lib/types"

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <Label htmlFor={id} className="px-1 py-2 leading-5 font-normal">
        {label}
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
        <SelectTrigger id={id} className="w-full">
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

export function ProfileFields({ profile, canRemove }: { profile: Profile; canRemove: boolean }) {
  const updateProfile = useQuoteStore((s) => s.updateProfile)
  const removeProfile = useQuoteStore((s) => s.removeProfile)
  const update = (patch: Partial<Omit<Profile, "id">>) => updateProfile(profile.id, patch)
  const id = (field: string) => `${profile.id}-${field}`

  return (
    <div className="flex flex-col gap-2">
      <Field id={id("name")} label="Customer name">
        <Input
          id={id("name")}
          autoComplete="off"
          value={profile.customerName}
          onChange={(e) => update({ customerName: e.target.value })}
        />
      </Field>

      <SelectField
        id={id("credit")}
        label="Credit score"
        placeholder="Select tier"
        value={profile.creditTier}
        options={tierOptions}
        onChange={(creditTier) => update({ creditTier })}
      />

      <SelectField
        id={id("purpose")}
        label="Loan purpose"
        placeholder="Select"
        value={profile.loanPurpose}
        options={LOAN_PURPOSES}
        onChange={(loanPurpose) => update({ loanPurpose })}
      />

      <Field id={id("amount")} label="Loan amount">
        <Input
          id={id("amount")}
          inputMode="numeric"
          autoComplete="off"
          placeholder="$0"
          value={profile.loanAmount ? formatCurrency(profile.loanAmount) : ""}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 8)
            update({ loanAmount: digits ? Number(digits) : null })
          }}
        />
      </Field>

      <Field id={id("down")} label="Down payment">
        <DownPaymentInput id={id("down")} value={profile.downPayment} onChange={(downPayment) => update({ downPayment })} />
      </Field>

      <Field id={id("zip")} label="ZIP code">
        <Input
          id={id("zip")}
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="e.g. 78701"
          value={profile.zip}
          onChange={(e) => update({ zip: e.target.value.replace(/\D/g, "").slice(0, 5) })}
        />
      </Field>

      <SelectField
        id={id("occupancy")}
        label="Occupancy"
        placeholder="Select"
        value={profile.occupancy}
        options={OCCUPANCIES}
        onChange={(occupancy) => update({ occupancy })}
      />

      <SelectField
        id={id("property")}
        label="Property type"
        placeholder="Select"
        value={profile.propertyType}
        options={PROPERTY_TYPES}
        onChange={(propertyType) => update({ propertyType })}
      />

      {canRemove && (
        <Button variant="ghost" className="mt-2 self-start" onClick={() => removeProfile(profile.id)}>
          <TrashIcon />
          Remove profile
        </Button>
      )}
    </div>
  )
}
