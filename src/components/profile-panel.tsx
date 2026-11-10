import { CheckCircleIcon, ChevronDownIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/20/solid"
import { ProfileFields } from "@/components/profile-fields"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ProfileBadge } from "@/components/profile-badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MAX_PROFILES, hasUnsavedChanges, isComplete, profileLetter, profilePreview } from "@/lib/profiles"
import { useQuoteStore } from "@/lib/store"
import type { Profile } from "@/lib/types"

/**
 * Header: letter badge, then a live preview of the borrower (name, and "$450,000 · Single-family" once known),
 * then the status icon (check = complete, triangle = fields missing) and the chevron.
 * Open = no border, closed = base-300 border; the chevron flips when the profile opens.
 */
function ProfileItem({ profile, letter, open, canRemove }: { profile: Profile; letter: string; open: boolean; canRemove: boolean }) {
  const unsaved = useQuoteStore((s) => hasUnsavedChanges(profile, s.drafts[profile.id]))
  const complete = isComplete(profile)
  const StatusIcon = complete ? CheckCircleIcon : ExclamationTriangleIcon
  // Preview shows the saved version; it updates when the broker clicks Save / Update.
  const { name, detail } = profilePreview(profile)
  return (
    <AccordionItem
      value={profile.id}
      className={cn("rounded-box border bg-base-200", open ? "border-transparent" : "border-base-300")}
    >
      <AccordionTrigger className={cn("w-full gap-3 p-4", open && "pb-2")}>
        <ProfileBadge letter={letter} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className={cn("truncate text-base leading-6", name ? "font-semibold" : "text-base-content/70")}>
            {name || "New profile"}
          </span>
          {detail && <span className="truncate text-sm leading-5">{detail}</span>}
          {unsaved && <span className="text-xs leading-4 text-base-content/70">Unsaved changes</span>}
        </span>
        {/* No status until the first save, so a fresh profile doesn't open with a warning */}
        {profile.saved ? (
          <>
            <StatusIcon aria-hidden="true" className={cn("size-5 shrink-0", complete ? "text-success" : "text-warning")} />
            <span className="sr-only">{complete ? "Complete" : "Incomplete"}</span>
          </>
        ) : (
          <span className="sr-only">Not saved</span>
        )}
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
  const intro = `${profiles.length} of ${MAX_PROFILES} profiles · Expand a profile to edit it.`

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
      <div className="sticky bottom-0 z-10 -mx-4 -mb-4 mt-auto flex flex-col gap-2 border-t border-base-300 bg-base-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {/* Primary until the first search; outline once results show, so Lock / Refresh is the one primary on screen */}
        <Button
          size="lg"
          variant={hasQuote ? "outline" : "default"}
          className="w-full"
          disabled={!canSearch}
          aria-describedby={canSearch ? undefined : "search-hint"}
          onClick={handleSearch}
        >
          <MagnifyingGlassIcon />
          {hasQuote ? "Search again" : "Search Rapid Rates"}
        </Button>
        {/* One message however many profiles are incomplete; the status icons show which ones. */}
        {!canSearch && (
          <p id="search-hint" className="flex items-center justify-center gap-1.5 text-sm leading-5">
            <ExclamationTriangleIcon aria-hidden="true" className="size-4 shrink-0 text-warning" />
            Fill in and save every profile to search.
          </p>
        )}
      </div>
    </aside>
  )
}
