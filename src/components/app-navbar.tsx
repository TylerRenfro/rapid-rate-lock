import { HomeIcon } from "@heroicons/react/24/solid"
import { AccountMenu } from "@/components/account-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "cn"

const NAV_ITEMS = ["Dashboard", "Quick Quote", "Pipeline", "Compliance"] as const
const CURRENT = "Quick Quote"

// Recolors the line-variant trigger (text, underline, focus ring) for the primary-filled bar.
const TRIGGER_ON_PRIMARY =
  "text-primary-foreground/70 hover:text-primary-foreground data-active:text-primary-foreground after:bg-primary-foreground focus-visible:border-primary-foreground focus-visible:ring-primary-foreground/50 focus-visible:outline-primary-foreground"

/** Figma: library Navbar with "Slot / 💎 Quick Quote nav" (center) and "Slot / 💎 Broker" (end),
 * the latter now an account menu. The section nav uses shadcn Tabs (line variant).
 * The bar is filled with brand primary, so tabs and focus rings switch to primary-foreground. */
export function AppNavbar() {
  return (
    <header className="flex min-h-16 flex-wrap items-center bg-primary p-2 text-primary-foreground">
      <div className="flex flex-1 items-center">
        <a
          href="/"
          className="flex min-h-12 items-center gap-2 rounded-lg px-2 font-logo text-xl leading-7 font-semibold whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-primary-foreground/50 sm:px-[18px]"
        >
          <HomeIcon aria-hidden="true" className="size-6 shrink-0" />
          Lending Portal
        </a>
      </div>

      <nav
        aria-label="Main"
        className="order-last w-full overflow-x-auto pt-1 pb-1.5 [scrollbar-width:none] md:order-none md:w-auto [&::-webkit-scrollbar]:hidden"
      >
        {/* Value is fixed: other sections aren't part of this prototype */}
        <Tabs value={CURRENT} onValueChange={() => {}} activationMode="manual">
          <TabsList variant="line" className="mx-auto gap-0 sm:gap-2">
            {NAV_ITEMS.map((item) =>
              item === CURRENT ? (
                <TabsTrigger key={item} value={item} asChild className={cn(TRIGGER_ON_PRIMARY, "px-1.5 sm:px-3")}>
                  <a href="/" aria-current="page">
                    {item}
                  </a>
                </TabsTrigger>
              ) : (
                <TabsTrigger
                  key={item}
                  value={item}
                  aria-disabled="true"
                  title="Not part of this prototype"
                  className={cn(TRIGGER_ON_PRIMARY, "cursor-default px-1.5 hover:text-primary-foreground/70 sm:px-3")}
                >
                  {item}
                </TabsTrigger>
              ),
            )}
          </TabsList>
        </Tabs>
      </nav>

      <div className="flex items-center justify-end md:flex-1">
        <AccountMenu />
      </div>
    </header>
  )
}
