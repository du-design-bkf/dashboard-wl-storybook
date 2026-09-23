import * as React from "react"
import { cn } from "cn"
import { Inbox } from "lucide-react"

export interface EmptyStateProps extends React.ComponentProps<"div"> {
  message?: string
  showIcon?: boolean
  action?: React.ReactNode
}

function EmptyState({
  message = "Sem registros no período selecionado",
  showIcon = true,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-6 text-center",
        className
      )}
      {...props}
    >
      {showIcon ? (
        <Inbox aria-hidden="true" className="size-5 text-muted-foreground" />
      ) : null}
      <p className="text-sm text-muted-foreground">{message}</p>
      {action}
    </div>
  )
}

export { EmptyState }
