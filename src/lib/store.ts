import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { QUOTE_WINDOW_MS, readSpeed } from "./clock"
import { priceProfile, randomMarketMove } from "./pricing"
import { MAX_PROFILES, createProfile, isComplete, profileLetter, profileValues } from "./profiles"
import type { Profile, ProfileValues, Quote, Term } from "./types"
import { uid } from "./uid"

/** Everything lives under this one localStorage key. Bump the version to reset old saved state. */
export const STORAGE_KEY = "rapid-rate-lock:v1"

interface QuoteState {
  /** Saved profiles: search, results, header previews and status icons all read these. */
  profiles: Profile[]
  /** Unsaved edits per profile id (kept across reloads); Save / Update copies one onto its profile. */
  drafts: Record<string, ProfileValues>
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
  /** Edit a profile's draft; the saved profile is untouched until saveProfile. */
  editDraft: (id: string, patch: Partial<ProfileValues>) => void
  /** Save / Update: commit the draft (if any), mark the profile saved and collapse it. */
  saveProfile: (id: string) => void
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
    drafts: {},
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
        const { profiles, drafts, openProfileId } = get()
        if (profiles.length <= 1) return
        const { [id]: _removed, ...rest } = drafts
        set({
          profiles: profiles.filter((p) => p.id !== id),
          drafts: rest,
          openProfileId: openProfileId === id ? null : openProfileId,
        })
      },

      editDraft: (id, patch) => {
        const { profiles, drafts } = get()
        const profile = profiles.find((p) => p.id === id)
        if (!profile) return
        set({ drafts: { ...drafts, [id]: { ...(drafts[id] ?? profileValues(profile)), ...patch } } })
      },

      saveProfile: (id) => {
        const { profiles, drafts } = get()
        const { [id]: draft, ...rest } = drafts
        set({
          profiles: profiles.map((p) => (p.id === id ? { ...p, ...draft, saved: true } : p)),
          drafts: rest,
          openProfileId: null,
        })
      },

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
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) => {
        const state = persisted as QuoteState
        if (version < 2) {
          // v1 had no Save step (edits applied live), so any profile with something filled in counts as saved.
          state.profiles = state.profiles.map((p) => ({
            ...p,
            saved: Object.values(profileValues(p)).some((v) => v !== "" && v !== null),
          }))
          state.drafts = {}
        }
        return state
      },
      partialize: ({ profiles, drafts, openProfileId, quote, selections, lockedKey, searches }) => ({
        profiles,
        drafts,
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
