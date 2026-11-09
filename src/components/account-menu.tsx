import { ArrowRightStartOnRectangleIcon, Cog6ToothIcon, UserCircleIcon } from "@heroicons/react/16/solid"
import { ChevronDownIcon } from "@heroicons/react/20/solid"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const USER = { name: "Tyler Renfro", initials: "TR", role: "Broker" }

// Account pages aren't part of this prototype: items just close the menu.
const ITEMS = [
  { label: "Profile", icon: UserCircleIcon },
  { label: "Settings", icon: Cog6ToothIcon },
] as const

function UserAvatar({ className }: { className?: string }) {
  return (
    <Avatar className={className ?? "size-9 after:border-transparent"}>
      <AvatarFallback className="bg-neutral text-sm font-semibold text-neutral-content">{USER.initials}</AvatarFallback>
    </Avatar>
  )
}

/** Outlined pill (avatar · name · chevron) that opens the account menu. Name hides on small screens. */
export function AccountMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account menu for ${USER.name}`}
        className="group/account flex h-11 items-center gap-2 rounded-full border border-input bg-base-100 py-1 pr-2.5 pl-1 text-sm leading-5 font-semibold transition-colors outline-none hover:bg-base-200 focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:bg-base-200 sm:pr-3"
      >
        <UserAvatar />
        <span className="hidden whitespace-nowrap sm:inline">{USER.name}</span>
        <ChevronDownIcon
          aria-hidden="true"
          className="size-5 shrink-0 transition-transform duration-200 group-data-[state=open]/account:rotate-180 motion-reduce:transition-none"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-60 p-1.5">
        <DropdownMenuLabel className="flex items-center gap-3 px-2 py-2 text-sm font-normal text-base-content">
          <UserAvatar />
          <div className="flex min-w-0 flex-col">
            <span className="truncate leading-5 font-semibold">{USER.name}</span>
            <span className="truncate text-xs leading-4 text-base-content/70">{USER.role}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="-mx-1.5 my-1.5" />
        <DropdownMenuGroup>
          {ITEMS.map(({ label, icon: Icon }) => (
            <DropdownMenuItem key={label} className="gap-2.5 px-2 py-1.5">
              <Icon aria-hidden="true" />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="-mx-1.5 my-1.5" />
        <DropdownMenuItem className="gap-2.5 px-2 py-1.5">
          <ArrowRightStartOnRectangleIcon aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
