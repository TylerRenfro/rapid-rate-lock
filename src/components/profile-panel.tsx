import { ChevronDownIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/20/solid"
import { ProfileFields } from "@/components/profile-fields"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MAX_PROFILES, collapsedTitle, isComplete, profileLetter } from "@/lib/profiles"
import { useQuoteStore } from "@/lib/store"
import type { Profile } from "@/lib/types"

/**
 * Figma: open = "Quick Quote / Profile editor" (no border, "Profile A"),
 * closed = library Collapse (base-300 border, "Profile A · 780+ · 20% down").
 * One 20px chevron for both states; it flips when the profile opens.
 */
function ProfileItem({ profile, letter, open, canRemove }: { profile: Profile; letter: string; open: boolean; canRemove: boolean }) {
  return (
    <AccordionItem
      value={profile.id}
      className={cn("rounded-box border bg-base-200", open ? "border-transparent" : "border-base-300")}
    >
      <AccordionTrigger className={cn("w-full p-4", open && "pb-2")}>
        <span className="text-trim flex-1 text-base leading-7 font-semibold">
          {open ? `Profile ${letter}` : collapsedTitle(profile, letter)}
        </span>
        <ChevronDownIcon
          aria-hidden="true"
          className="size-5 shrink-0 transition-transform duration-200 group-data-[state=open]/accordion-trigger:rotate-180 motion-reduce:transition-none"
        />
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <ProfileFields profile={profile} canRemove={canRemove} />
      </AccordionContent>
    </AccordionItem>
  )
}

export function ProfilePanel() {
  const profiles = useQuoteStore((s) => s.profiles)
  const openProfileId = useQuoteStore((s) => s.openProfileId)
  const hasQuote = useQuoteStore((s) => s.quote !== null)
  const setOpenProfile = useQuoteStore((s) => s.setOpenProfile)
  const addProfile = useQuoteStore((s) => s.addProfile)
  const search = useQuoteStore((s) => s.search)

  const canSearch = profiles.length > 0 && profiles.every(isComplete)
  const intro =
    profiles.length === 1 && openProfileId === profiles[0].id
      ? "Build up to 3 profiles to compare rates side by side."
      : `${profiles.length} of ${MAX_PROFILES} profiles · Expand a profile to edit it.`

  const handleSearch = () => {
    search()
    // When the panel is stacked above the results (below lg), bring the results into view.
    if (!window.matchMedia("(min-width: 64rem)").matches) {
      requestAnimationFrame(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }))
    }
  }

  return (
    <aside
      aria-labelledby="profiles-heading"
      className="flex flex-col gap-4 border-b border-base-300 bg-base-100 p-4 lg:h-full lg:w-96 lg:shrink-0 lg:border-r lg:border-b-0"
    >
      <div className="flex flex-col gap-1">
        <h2 id="profiles-heading" className="text-trim text-lg leading-7 font-semibold">
          Borrower profiles
        </h2>
        <p className="text-sm leading-5">{intro}</p>
      </div>

      {/* Scrolls on desktop; a little padding keeps focus rings from being clipped */}
      <div className="-m-1 flex flex-col gap-2 p-1 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        <Accordion
          type="single"
          collapsible
          value={openProfileId ?? ""}
          onValueChange={(v) => setOpenProfile(v || null)}
          className="gap-2"
        >
          {profiles.map((p, i) => (
            <ProfileItem
              key={p.id}
              profile={p}
              letter={profileLetter(i)}
              open={openProfileId === p.id}
              canRemove={profiles.length > 1}
            />
          ))}
        </Accordion>

        {profiles.length < MAX_PROFILES && (
          <Button variant="outline" className="w-full" onClick={addProfile}>
            <PlusIcon className="size-3.5" />
            Add profile
          </Button>
        )}
      </div>

      {/* Pinned footer: sticks to the bottom of the screen while the panel is in view (stacked layout)
          and to the bottom of the panel on desktop, so search stays reachable however many profiles are open. */}
      <div className="sticky bottom-0 z-10 -mx-4 -mb-4 mt-auto border-t border-base-300 bg-base-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button size="lg" className="w-full" disabled={!canSearch} onClick={handleSearch}>
          <MagnifyingGlassIcon />
          {hasQuote ? "Search again" : "Search Rapid Rates"}
        </Button>
      </div>
    </aside>
  )
}
