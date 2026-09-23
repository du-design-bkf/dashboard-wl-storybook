import { LifeBuoy } from "lucide-react"
import { StatusBadge } from "./status-badge"

/**
 * Replica os 4 status de usuario do hubmob-dashboard
 * (`src/utils/user-status.ts`, `src/utils/user-access.ts`), reaproveitando
 * o `StatusBadge` (ok/busy/critical/inactive) deste catalogo em vez de
 * cor crua por estado.
 */
export type Presence = "online" | "offline"
export type Activity = "available" | "in_ride" | "reserved" | "in_locker_usage"
export type AccountStatus = "active" | "blocked" | "pending" | "unknown"
export type AccessStatus = "pendingFirstAccess" | "active" | "unknown"

export function PresenceIndicator({ presence }: { presence: Presence }) {
  const online = presence === "online"
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span
        data-state={presence}
        className={`size-2.5 rounded-full ${online ? "bg-status-ok-ink" : "bg-status-inactive-ink"}`}
      />
      {online ? "Online" : "Offline"}
    </span>
  )
}

const ACTIVITY_LABEL: Record<Activity, string> = {
  available: "Disponível",
  in_ride: "Em corrida",
  reserved: "Com reserva",
  in_locker_usage: "Com locker aberto",
}

export function ActivityBadge({ activity }: { activity: Activity }) {
  return (
    <StatusBadge status={activity === "available" ? "ok" : "busy"}>
      {ACTIVITY_LABEL[activity]}
    </StatusBadge>
  )
}

const ACCOUNT_LABEL: Record<AccountStatus, string> = {
  active: "Ativa",
  blocked: "Bloqueada",
  pending: "Pendente",
  unknown: "Desconhecida",
}

const ACCOUNT_TO_STATUS: Record<AccountStatus, "ok" | "busy" | "critical" | "inactive"> = {
  active: "ok",
  blocked: "critical",
  pending: "busy",
  unknown: "inactive",
}

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  return <StatusBadge status={ACCOUNT_TO_STATUS[status]}>{ACCOUNT_LABEL[status]}</StatusBadge>
}

const ACCESS_LABEL: Record<AccessStatus, string> = {
  pendingFirstAccess: "Pendente 1º acesso",
  active: "Ativo",
  unknown: "Desconhecida",
}

const ACCESS_TO_STATUS: Record<AccessStatus, "ok" | "busy" | "inactive"> = {
  pendingFirstAccess: "busy",
  active: "ok",
  unknown: "inactive",
}

export function AccessStatusBadge({ status }: { status: AccessStatus }) {
  return <StatusBadge status={ACCESS_TO_STATUS[status]}>{ACCESS_LABEL[status]}</StatusBadge>
}

/**
 * Marcador Bike Fácil: NÃO é situação nem nível de acesso, é o marcador que
 * acompanha o perfil e libera o modo suporte (acesso de suporte a qualquer
 * conta). Cor própria, nunca as cores de status.
 */
export function BikeFacilBadge() {
  return (
    <span
      title="Marcador Bike Fácil: acesso de suporte a qualquer conta"
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
    >
      <LifeBuoy className="size-3.5" />
      Bike Fácil
    </span>
  )
}
