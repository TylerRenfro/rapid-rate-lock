import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { QUOTE_WINDOW_MS, readSpeed } from "./clock"
import { priceProfile, randomMarketMove } from "./pricing"
import { MAX_PROFILES, createProfile, isComplete, profileLetter } from "./profiles"
import type { Profile, Quote, Term } from "./types"
import { uid } from "./uid"

/** Everything lives under this one localStorage key. Bump the version to reset old saved state. */
export const STORAGE_KEY = "rapid-rate-lock:v1"

interface QuoteState {
  profiles: Profile[]
  /** The profile expanded in the side panel (one at a time), or null when all are collapsed */
  openProfileId: string | null
  quote: Quote | null
  /** Chosen term per profile id — one per profile */
  selections: Record<string, Term>
  /** Snapshot of the selection the broker locked; the button shows "Locked" while it still matches */
  lockedKey: string | null
  /** Number of searches run; the first one uses no market move so it matches the Figma numbers */
  searches: number
}

interface QuoteActions {
  addProfile: () => void
  removeProfile: (id: string) => void
  updateProfile: (id: string, patch: Partial<Omit<Profile, "id">>) => void
  setOpenProfile: (id: string | null) => void
  search: () => void
  selectRate: (profileId: string, term: Term) => void
  clearSelections: () => void
  lockSelections: () => void
}

/** Identifies one quote + selection combination, so any change un-locks the button. */
export function selectionKey(quote: Quote | null, selections: Record<string, Term>) {
  if (!quote) return null
  return `${quote.id}:${quote.rows.map((r) => `${r.profileId}=${selections[r.profileId] ?? "-"}`).join(",")}`
}

function initialState(): QuoteState {
  const first = createProfile()
  return {
    profiles: [first],
    openProfileId: first.id,
    quote: null,
    selections: {},
    lockedKey: null,
    searches: 0,
  }
}

export const useQuoteStore = create<QuoteState & QuoteActions>()(
  persist(
    (set, get) => ({
      ...initialState(),

      addProfile: () => {
        const { profiles } = get()
        if (profiles.length >= MAX_PROFILES) return
        const next = createProfile()
        set({ profiles: [...profiles, next], openProfileId: next.id })
      },

      removeProfile: (id) => {
        const { profiles, openProfileId } = get()
        if (profiles.length <= 1) return
        set({
          profiles: profiles.filter((p) => p.id !== id),
          openProfileId: openProfileId === id ? null : openProfileId,
        })
      },

      updateProfile: (id, patch) =>
        set({ profiles: get().profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)) }),

      setOpenProfile: (id) => set({ openProfileId: id }),

      search: () => {
        const { profiles, searches } = get()
        if (profiles.length === 0 || !profiles.every(isComplete)) return
        const speed = readSpeed()
        const now = Date.now()
        const move = searches === 0 ? 0 : randomMarketMove()
        const rows = profiles.filter(isComplete).map((profile, i) => ({
          profileId: profile.id,
          letter: profileLetter(i),
          profile: { ...profile },
          rates: priceProfile(profile, move),
        }))
        set({
          quote: { id: uid(), fetchedAt: now, expiresAt: now + QUOTE_WINDOW_MS / speed, speed, rows },
          selections: {},
          lockedKey: null,
          openProfileId: null,
          searches: searches + 1,
        })
      },

      selectRate: (profileId, term) => set({ selections: { ...get().selections, [profileId]: term } }),

      clearSelections: () => set({ selections: {} }),

      lockSelections: () => {
        const { quote, selections } = get()
        if (!quote || Object.keys(selections).length === 0) return
        set({ lockedKey: selectionKey(quote, selections) })
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ profiles, openProfileId, quote, selections, lockedKey, searches }) => ({
        profiles,
        openProfileId,
        quote,
        selections,
        lockedKey,
        searches,
      }),
    },
  ),
)

/** Keep two open tabs in sync: when another tab writes our key, reload it here. */
export function syncAcrossTabs() {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) void useQuoteStore.persist.rehydrate()
  }
  window.addEventListener("storage", onStorage)
  return () => window.removeEventListener("storage", onStorage)
}
