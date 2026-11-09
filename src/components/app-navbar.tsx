import { AccountMenu } from "@/components/account-menu"

const NAV_ITEMS = ["Dashboard", "Quick Quote", "Pipeline", "Compliance"] as const
const CURRENT = "Quick Quote"

/** Figma: library Navbar with "Slot / 💎 Quick Quote nav" (center) and "Slot / 💎 Broker" (end),
 * the latter now an account menu. */
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
        className="order-last w-full overflow-x-auto [scrollbar-width:none] md:order-none md:w-auto [&::-webkit-scrollbar]:hidden"
      >
        <ul className="mx-auto flex w-max items-center gap-0.5 py-1 sm:gap-1 md:py-0">
          {NAV_ITEMS.map((item) =>
            item === CURRENT ? (
              <li key={item}>
                <a
                  href="/"
                  aria-current="page"
                  className="flex h-7 items-center rounded-lg bg-neutral px-2 sm:px-3 text-sm leading-5 text-neutral-content"
                >
                  {item}
                </a>
              </li>
            ) : (
              <li key={item}>
                {/* Other sections aren't part of this prototype */}
                <span
                  aria-disabled="true"
                  title="Not part of this prototype"
                  className="flex h-7 cursor-default items-center rounded-lg px-2 sm:px-3 text-sm leading-5"
                >
                  {item}
                </span>
              </li>
            ),
          )}
        </ul>
      </nav>

      <div className="flex items-center justify-end md:flex-1">
        <AccountMenu />
      </div>
    </header>
  )
}
