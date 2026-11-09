import { ArrowRightStartOnRectangleIcon, Cog6ToothIcon, UserCircleIcon } from "@heroicons/react/16/solid"

export const USER = { name: "Tyler Renfro", initials: "TR", role: "Broker" }

// Account pages aren't part of this prototype: items just close the menu.
// Used by the desktop AccountMenu dropdown and the mobile hamburger panel in AppNavbar.
export const ACCOUNT_ITEMS = [
  { label: "Profile", icon: UserCircleIcon },
  { label: "Settings", icon: Cog6ToothIcon },
] as const
export const SIGN_OUT = { label: "Sign out", icon: ArrowRightStartOnRectangleIcon } as const
