import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { isComplete, profileLetter, profilesPhrase } from "@/lib/profiles"
import { useQuoteStore } from "@/lib/store"

/** Figma: "Quick Quote / Empty state" — frame 01 (nothing ready) and frame 02 (profiles ready). */
export function ResultsEmpty() {
  const profiles = useQuoteStore((s) => s.profiles)
  const ready = profiles.length > 0 && profiles.every(isComplete)
  const count = profiles.length

  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <div className="flex max-w-3xl flex-col items-center gap-4 px-2 py-6 text-center text-pretty">
        <span className="rounded-full bg-base-300 p-4">
          <MagnifyingGlassIcon className="size-8" />
        </span>
        {ready ? (
          <>
            <h2 className="text-2xl leading-8 font-bold">
              {count} {count === 1 ? "profile" : "profiles"} ready to compare
            </h2>
            <p className="text-base leading-7">
              Search to compare 15, 20 and 30-year fixed rates for{" "}
              <span className="whitespace-nowrap">{profilesPhrase(profiles.map((_, i) => profileLetter(i)))}</span>.
              Quotes stay live for 60 seconds.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl leading-8 font-bold">Search for Rapid Rates</h2>
            <p className="text-base leading-7">
              Build up to 3 borrower profiles, then search to compare 15, 20 and 30-year fixed rates. Quotes stay live
              for 60 seconds.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
