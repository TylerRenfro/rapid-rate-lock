import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/** Round letter badge (A, B, C) that identifies a profile in the panel and in results. Reads as "Profile A". */
export function ProfileBadge({ letter, id, className }: { letter: string; id?: string; className?: string }) {
  return (
    <Badge id={id} variant="neutral" className={cn("size-6 px-0 text-sm font-semibold", className)}>
      <span className="sr-only">Profile </span>
      {letter}
    </Badge>
  )
}
