import * as React from "react"
import { cn } from "cn"

export type StatusBadgeStatus = "ok" | "busy" | "critical" | "inactive"

const statusClassName: Record<StatusBadgeStatus, string> = {
  ok: "bg-status-ok-soft text-status-ok-ink",
  busy: "bg-status-busy-soft text-status-busy-ink",
  critical: "bg-status-critical-soft text-status-critical-ink",
  inactive: "bg-status-inactive-soft text-status-inactive-ink",
}

function StatusBadge({
  status,
  className,
  ...props
}: React.ComponentProps<"span"> & { status: StatusBadgeStatus }) {
  return (
    <span
      data-slot="status-badge"
      data-status={status}
      className={cn(
        "inline-flex h-5 w-fit shrink-0 items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        statusClassName[status],
        className
      )}
      {...props}
    />
  )
}

export { StatusBadge }
