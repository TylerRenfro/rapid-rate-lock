import { AccountMenu } from "@/components/account-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const NAV_ITEMS = ["Dashboard", "Quick Quote", "Pipeline", "Compliance"] as const
const CURRENT = "Quick Quote"

/** Figma: library Navbar with "Slot / 💎 Quick Quote nav" (center) and "Slot / 💎 Broker" (end),
 * the latter now an account menu. The section nav uses shadcn Tabs (line variant). */
export function AppNavbar() {
  return (
    <header className="flex min-h-16 flex-wrap items-center border-b border-base-300 bg-base-100 p-2">
      <div className="flex flex-1 items-center">
        <a
          href="/"
          className="flex min-h-12 items-center rounded-lg px-2 font-logo text-xl leading-7 font-semibold whitespace-nowrap sm:px-[18px]"
        >
          Rapid Rate Lock
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
                <TabsTrigger key={item} value={item} asChild className="px-1.5 sm:px-3">
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
                  className="cursor-default px-1.5 hover:text-foreground/60 sm:px-3"
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
