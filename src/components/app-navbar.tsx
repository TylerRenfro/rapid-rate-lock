import { useCallback, useEffect, useRef, useState } from "react"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import { HomeIcon } from "@heroicons/react/24/solid"
import { AccountMenu, UserAvatar } from "@/components/account-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ACCOUNT_ITEMS, SIGN_OUT, USER } from "@/lib/account"
import { cn } from "cn"

const NAV_ITEMS = ["Dashboard", "Quick Quote", "Pipeline", "Compliance"] as const
const CURRENT = "Quick Quote"
const DISABLED_TITLE = "Not part of this prototype"
const MOBILE_NAV_ID = "mobile-nav"

// Recolors the line-variant trigger (text, underline, focus ring) for the primary-filled bar.
const TRIGGER_ON_PRIMARY =
  "text-primary-foreground/70 hover:text-primary-foreground data-active:text-primary-foreground after:bg-primary-foreground focus-visible:border-primary-foreground focus-visible:ring-primary-foreground/50 focus-visible:outline-primary-foreground"

const FOCUS_ON_PRIMARY = "outline-none focus-visible:ring-3 focus-visible:ring-primary-foreground/50"

/** Closes the mobile menu once the viewport reaches md, where the inline tabs take over. */
function useCloseAtDesktop(open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return
    const query = window.matchMedia("(min-width: 48rem)")
    const onChange = () => query.matches && close()
    onChange()
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [open, close])
}

/** Figma: library Navbar with "Slot / 💎 Quick Quote nav" (center) and "Slot / 💎 Broker" (end),
 * the latter now an account menu. From md up the section nav is shadcn Tabs (line variant);
 * below md it collapses behind a hamburger into a disclosure panel under the bar.
 * The bar is filled with brand primary, so tabs and focus rings switch to primary-foreground. */
export function AppNavbar() {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useCloseAtDesktop(open, close)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setOpen(false)
      toggleRef.current?.focus()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open])

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="flex min-h-16 items-center p-2">
        <div className="flex flex-1 items-center">
          <a
            href="/"
            className={cn(
              "flex min-h-12 items-center gap-2 rounded-lg px-2 font-logo text-xl leading-7 font-semibold whitespace-nowrap sm:px-[18px]",
              FOCUS_ON_PRIMARY,
            )}
          >
            <HomeIcon aria-hidden="true" className="size-6 shrink-0" />
            Lending Portal
          </a>
        </div>

        <nav aria-label="Main" className="hidden py-1.5 md:block">
          {/* Value is fixed: other sections aren't part of this prototype */}
          <Tabs value={CURRENT} onValueChange={() => {}} activationMode="manual">
            <TabsList variant="line" className="gap-2">
              {NAV_ITEMS.map((item) =>
                item === CURRENT ? (
                  <TabsTrigger key={item} value={item} asChild className={cn(TRIGGER_ON_PRIMARY, "px-3")}>
                    <a href="/" aria-current="page">
                      {item}
                    </a>
                  </TabsTrigger>
                ) : (
                  <TabsTrigger
                    key={item}
                    value={item}
                    aria-disabled="true"
                    title={DISABLED_TITLE}
                    className={cn(TRIGGER_ON_PRIMARY, "cursor-default px-3 hover:text-primary-foreground/70")}
                  >
                    {item}
                  </TabsTrigger>
                ),
              )}
            </TabsList>
          </Tabs>
        </nav>

        <div className="flex items-center justify-end md:flex-1">
          <div className="hidden md:block">
            <AccountMenu />
          </div>
          <button
            ref={toggleRef}
            type="button"
            aria-label="Main menu"
            aria-expanded={open}
            aria-controls={MOBILE_NAV_ID}
            onClick={() => setOpen((value) => !value)}
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-primary-foreground/10 aria-expanded:bg-primary-foreground/10 md:hidden",
              FOCUS_ON_PRIMARY,
            )}
          >
            {open ? (
              <XMarkIcon aria-hidden="true" className="size-6" />
            ) : (
              <Bars3Icon aria-hidden="true" className="size-6" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div
          id={MOBILE_NAV_ID}
          className="border-t border-primary-foreground/15 px-2 pt-2 pb-3 duration-150 animate-in fade-in slide-in-from-top-1 motion-reduce:animate-none md:hidden"
        >
          <nav aria-label="Main">
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <li key={item}>
                  {item === CURRENT ? (
                    <a
                      href="/"
                      aria-current="page"
                      className={cn(
                        "flex min-h-11 items-center rounded-lg bg-primary-foreground/10 px-3 text-sm leading-5 font-semibold",
                        FOCUS_ON_PRIMARY,
                      )}
                    >
                      {item}
                    </a>
                  ) : (
                    <a
                      role="link"
                      aria-disabled="true"
                      title={DISABLED_TITLE}
                      className="flex min-h-11 cursor-default items-center rounded-lg px-3 text-sm leading-5 font-medium text-primary-foreground/70"
                    >
                      {item}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Account menu, folded in on mobile. Account pages aren't part of this prototype: items just close the panel. */}
          <section aria-label="Account" className="mt-3 border-t border-primary-foreground/15 pt-3">
            <div className="flex items-center gap-3 px-3 pb-2">
              <UserAvatar fallbackClassName="bg-primary-foreground/15 text-primary-foreground" />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm leading-5 font-semibold">{USER.name}</span>
                <span className="truncate text-xs leading-4 text-primary-foreground/70">{USER.role}</span>
              </div>
            </div>
            <ul className="flex flex-col gap-1">
              {[...ACCOUNT_ITEMS, SIGN_OUT].map(({ label, icon: Icon }) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={close}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm leading-5 font-medium text-primary-foreground/85 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground",
                      FOCUS_ON_PRIMARY,
                    )}
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </header>
  )
}
