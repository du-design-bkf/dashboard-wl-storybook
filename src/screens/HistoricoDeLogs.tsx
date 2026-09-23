import * as React from 'react'
import { useMemo, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  Eye,
  Info as InfoIcon,
  Plus,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

/**
 * Contrato replicado do codigo real do hubmob-dashboard (`LogDto`,
 * `Logs.tsx`, `LogTable.tsx`, `LogFilters.tsx`, `LogBadges.tsx`,
 * `LogDetail.tsx`), nao inventado - unica tela viva desta leva (E), sem
 * mock nem rota comentada. Card #12099. Detalhe troca a "view" do componente
 * em vez de modal, mesmo tratamento do card #12096 (Promocoes): o real
 * navega pra pagina propria `/logs/:id`, passando o log inteiro via
 * `location.state` (nao busca de novo pelo id).
 *
 * `computeDiff` replicado 1:1: so compara beforeJson/afterJson quando os
 * DOIS existem (Create normalmente so tem afterJson, Delete so beforeJson -
 * nesses casos a tela real mostra "Nenhum campo alterado" mesmo sem erro).
 * Log tipo Error pula o diff inteiro e mostra Status Code + Message +
 * stack trace (`detail`) em vez de Campos Alterados.
 */
function formatDate(value?: string | null): string {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const LEVEL_CONFIG: Record<
  string,
  { label: string; className: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  Error: { label: 'Erro', className: 'bg-red-100 text-red-700 border border-red-200', Icon: AlertCircle },
  Warning: {
    label: 'Aviso',
    className: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    Icon: AlertTriangle,
  },
  Info: { label: 'Info', className: 'bg-blue-100 text-blue-700 border border-blue-200', Icon: InfoIcon },
  Audit: {
    label: 'Audit',
    className: 'bg-purple-100 text-purple-700 border border-purple-200',
    Icon: ShieldCheck,
  },
}

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Update: RefreshCw,
  Create: Plus,
  Delete: Trash2,
}

function LevelBadge({ level, size = 'sm' }: { level: string; size?: 'sm' | 'md' }) {
  const config = LEVEL_CONFIG[level] ?? {
    label: level || '-',
    className: 'bg-muted text-muted-foreground border',
    Icon: InfoIcon,
  }
  const Icon = config.Icon
  const textClass = size === 'md' ? 'text-sm font-semibold' : 'text-xs font-medium'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${textClass} ${config.className}`}>
      <Icon className={size === 'md' ? 'size-4' : 'size-3.5'} />
      {config.label}
    </span>
  )
}

function ActionBadge({ action, size = 'sm' }: { action: string; size?: 'sm' | 'md' }) {
  const Icon = ACTION_ICONS[action] ?? RefreshCw
  const textClass = size === 'md' ? 'text-sm font-semibold' : 'text-xs font-medium'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border bg-muted px-2.5 py-1 ${textClass}`}>
      <Icon className={size === 'md' ? 'size-4' : 'size-3.5'} />
      {action || '-'}
    </span>
  )
}

export interface LogEntry {
  logEntryId: number
  type?: string
  action?: string
  entityName?: string
  entityId?: string
  beforeJson?: string
  afterJson?: string
  userId?: string
  message?: string
  detail?: string
  statusCode?: number | null
  createdAt: string
}

export const mockLogs: LogEntry[] = [
  {
    logEntryId: 4201,
    type: 'Audit',
    action: 'Update',
    entityName: 'Estação',
    entityId: '101',
    beforeJson: '{"stationStatus":"0","stationName":"Parque Ibirapuera"}',
    afterJson: '{"stationStatus":"1","stationName":"Parque Ibirapuera"}',
    userId: 'tenant-8842',
    createdAt: '2026-09-23T14:12:00Z',
  },
  {
    logEntryId: 4202,
    type: 'Info',
    action: 'Create',
    entityName: 'Veículo',
    entityId: '3',
    afterJson: '{"vehicleName":"BF-0003","vehicleStatus":"1"}',
    userId: 'tenant-8842',
    createdAt: '2026-09-22T10:03:00Z',
  },
  {
    logEntryId: 4203,
    type: 'Warning',
    action: 'Delete',
    entityName: 'Dispositivo',
    entityId: '5',
    beforeJson: '{"deviceName":"LOCKER-02","deviceStatus":"6"}',
    userId: 'tenant-8842',
    createdAt: '2026-09-21T18:47:00Z',
  },
  {
    logEntryId: 4204,
    type: 'Error',
    action: 'Update',
    entityName: 'Dispositivo',
    entityId: '2',
    statusCode: 500,
    message: 'Erro ao atualizar dispositivo: conexão com o banco recusada.',
    detail:
      'System.Data.SqlClient.SqlException: A connection was successfully established, but then an error occurred during the login process.\n   at Hubmob.Api.Services.DeviceService.UpdateAsync(Int32 id, UpdateDeviceDto payload)\n   at Hubmob.Api.Controllers.DeviceController.Update(Int32 id, UpdateDeviceDto payload)',
    createdAt: '2026-09-20T08:15:00Z',
  },
]

type DiffEntry = { field: string; before: string; after: string }
type UnchangedEntry = { field: string; value: string }

function displayValue(v: unknown): string {
  if (v === null || v === undefined) return '-'
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  const s = String(v)
  return s === '' ? '-' : s
}

function computeDiff(
  beforeJson: string | undefined,
  afterJson: string | undefined
): { changed: DiffEntry[]; unchanged: UnchangedEntry[] } {
  if (!beforeJson || !afterJson) return { changed: [], unchanged: [] }
  try {
    const b = JSON.parse(beforeJson) as Record<string, unknown>
    const a = JSON.parse(afterJson) as Record<string, unknown>
    const allKeys = Array.from(new Set([...Object.keys(b), ...Object.keys(a)]))
    const changed: DiffEntry[] = []
    const unchanged: UnchangedEntry[] = []
    for (const key of allKeys) {
      const bStr = displayValue(b[key])
      const aStr = displayValue(a[key])
      if (bStr !== aStr) {
        changed.push({ field: key, before: bStr, after: aStr })
      } else {
        unchanged.push({ field: key, value: bStr })
      }
    }
    return { changed, unchanged }
  } catch {
    return { changed: [], unchanged: [] }
  }
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-base font-bold">{value}</span>
    </div>
  )
}

interface FilterState {
  type: string
  action: string
  entityId: string
  entityName: string
  startDate: string
  endDate: string
}

const EMPTY_FILTERS: FilterState = {
  type: '',
  action: '',
  entityId: '',
  entityName: '',
  startDate: '',
  endDate: '',
}

export interface HistoricoDeLogsScreenProps {
  initialLogs?: LogEntry[]
  loading?: boolean
}

export function HistoricoDeLogsScreen({
  initialLogs = mockLogs,
  loading = false,
}: HistoricoDeLogsScreenProps) {
  const [logs] = useState(initialLogs)
  const [showFilters, setShowFilters] = useState(false)
  const [draft, setDraft] = useState<FilterState>(EMPTY_FILTERS)
  const [applied, setApplied] = useState<FilterState>(EMPTY_FILTERS)
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (applied.type && log.type !== applied.type) return false
      if (applied.action && log.action !== applied.action) return false
      if (
        applied.entityId.trim() &&
        !(log.entityId ?? '').toLowerCase().includes(applied.entityId.trim().toLowerCase())
      )
        return false
      if (
        applied.entityName.trim() &&
        !(log.entityName ?? '').toLowerCase().includes(applied.entityName.trim().toLowerCase())
      )
        return false
      if (applied.startDate && log.createdAt.slice(0, 10) < applied.startDate) return false
      if (applied.endDate && log.createdAt.slice(0, 10) > applied.endDate) return false
      return true
    })
  }, [logs, applied])

  if (selectedLog) {
    const isError = selectedLog.type === 'Error'
    const { changed, unchanged } = isError
      ? { changed: [] as DiffEntry[], unchanged: [] as UnchangedEntry[] }
      : computeDiff(selectedLog.beforeJson, selectedLog.afterJson)

    return (
      <div className="space-y-4 p-6">
        <div className="space-y-4 rounded-2xl border p-6">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            <button type="button" onClick={() => setSelectedLog(null)} className="hover:text-foreground">
              Histórico de Logs
            </button>
            <span>{'>'}</span>
            <span>{selectedLog.entityName ?? 'Entidade'}</span>
            <span>{'>'}</span>
            <span className="font-medium text-foreground">Detalhamento</span>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-lg font-bold">Log de auditoria #{selectedLog.logEntryId}</h1>
            <div className="flex items-center gap-2">
              {selectedLog.action && <ActionBadge action={selectedLog.action} size="md" />}
              {selectedLog.type && <LevelBadge level={selectedLog.type} size="md" />}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-[60px] shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <User className="size-7" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-bold">{selectedLog.entityName ?? '-'}</span>
              <span className="break-all font-mono text-sm text-muted-foreground">
                {selectedLog.entityId ?? '-'}
              </span>
            </div>
          </div>

          {isError ? (
            <div className="flex flex-wrap gap-10">
              <MetaField label="Data / Hora" value={formatDate(selectedLog.createdAt)} />
              <MetaField label="Status Code" value={String(selectedLog.statusCode ?? '-')} />
              {selectedLog.message && (
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm text-muted-foreground">Message</span>
                  <span className="break-words text-base font-bold">{selectedLog.message}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-10">
              <MetaField label="Entidade" value={selectedLog.entityName ?? '-'} />
              <MetaField label="Data / Hora" value={formatDate(selectedLog.createdAt)} />
              <MetaField label="Entity ID" value={selectedLog.entityId ?? '-'} />
              {selectedLog.userId && <MetaField label="Tenant ID" value={selectedLog.userId} />}
            </div>
          )}
        </div>

        {isError && selectedLog.detail && (
          <div className="space-y-3 rounded-2xl border p-6">
            <h2 className="text-base font-bold">Detalhes:</h2>
            <div className="border-b pb-2">
              <pre className="max-h-[500px] overflow-y-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
                {selectedLog.detail}
              </pre>
            </div>
          </div>
        )}

        {!isError && (
          <div className="space-y-3 rounded-2xl border p-6">
            <h2 className="text-base font-bold">Campos Alterados</h2>
            {changed.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum campo alterado.</p>
            ) : (
              <div className="w-full overflow-x-auto">
                <div className="min-w-[600px]">
                  <div className="flex gap-2.5 border-b pb-2">
                    <div className="w-[220px] shrink-0 text-base font-bold">Campo</div>
                    <div className="w-[220px] shrink-0 text-base font-bold">Antes</div>
                    <div className="w-[220px] shrink-0 text-base font-bold">Depois</div>
                  </div>
                  {changed.map((entry) => (
                    <div key={entry.field} className="flex gap-2.5 border-b py-2">
                      <div className="w-[220px] shrink-0 text-base">{entry.field}</div>
                      <div className="w-[220px] shrink-0 break-words text-base text-muted-foreground line-through">
                        {entry.before}
                      </div>
                      <div className="w-[220px] shrink-0 break-words text-base">{entry.after}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!isError && unchanged.length > 0 && (
          <div className="space-y-3 rounded-2xl border p-6">
            <h2 className="text-base font-bold">Campos sem alteração</h2>
            <div className="w-full overflow-x-auto">
              <div className="min-w-[400px]">
                {unchanged.map((entry) => (
                  <div key={entry.field} className="flex gap-2.5 border-b py-2">
                    <div className="w-[220px] shrink-0 text-base font-bold">{entry.field}</div>
                    <div className="shrink-0 break-words text-base text-muted-foreground">{entry.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="mb-3 mt-1 text-xl font-semibold">Histórico de Logs</h1>

      <Button variant="outline" onClick={() => setShowFilters((v) => !v)}>
        <SlidersHorizontal />
        Filtros
      </Button>

      {showFilters && (
        <div className="mt-4 rounded-2xl border p-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Tipo</label>
              <Select
                value={draft.type || 'all'}
                onValueChange={(v) => setDraft((f) => ({ ...f, type: v === 'all' ? '' : v }))}
              >
                <SelectTrigger className="w-[135px]" aria-label="Tipo">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Audit">Audit</SelectItem>
                  <SelectItem value="Info">Info</SelectItem>
                  <SelectItem value="Warning">Warning</SelectItem>
                  <SelectItem value="Error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Ação</label>
              <Select
                value={draft.action || 'all'}
                onValueChange={(v) => setDraft((f) => ({ ...f, action: v === 'all' ? '' : v }))}
              >
                <SelectTrigger className="w-[135px]" aria-label="Ação">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Create">Create</SelectItem>
                  <SelectItem value="Update">Update</SelectItem>
                  <SelectItem value="Delete">Delete</SelectItem>
                  <SelectItem value="Read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Id da entidade</label>
              <Input
                placeholder="Buscar por ID"
                value={draft.entityId}
                onChange={(e) => setDraft((f) => ({ ...f, entityId: e.target.value }))}
                className="w-[135px]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Nome da entidade</label>
              <Input
                placeholder="Buscar por nome"
                value={draft.entityName}
                onChange={(e) => setDraft((f) => ({ ...f, entityName: e.target.value }))}
                className="w-[141px]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Selecionar período</label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  aria-label="Data inicial"
                  value={draft.startDate}
                  onChange={(e) => setDraft((f) => ({ ...f, startDate: e.target.value }))}
                  className="w-[135px]"
                />
                <span className="text-sm text-muted-foreground">até</span>
                <Input
                  type="date"
                  aria-label="Data final"
                  value={draft.endDate}
                  onChange={(e) => setDraft((f) => ({ ...f, endDate: e.target.value }))}
                  className="w-[135px]"
                />
              </div>
            </div>

            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDraft(EMPTY_FILTERS)
                  setApplied(EMPTY_FILTERS)
                }}
              >
                Limpar
              </Button>
              <Button onClick={() => setApplied(draft)}>Filtrar</Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <EmptyState message="Nenhum log encontrado" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Id do Log</TableHead>
                <TableHead>Tipo de log</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Nome da entidade</TableHead>
                <TableHead>Id da identidade</TableHead>
                <TableHead>Data de criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.logEntryId}>
                  <TableCell>{log.logEntryId}</TableCell>
                  <TableCell>
                    <LevelBadge level={log.type ?? ''} />
                  </TableCell>
                  <TableCell>
                    <ActionBadge action={log.action ?? ''} />
                  </TableCell>
                  <TableCell>{log.entityName ?? '-'}</TableCell>
                  <TableCell className="max-w-[140px] truncate font-mono text-sm" title={log.entityId}>
                    {log.entityId ?? '-'}
                  </TableCell>
                  <TableCell>{formatDate(log.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Ver detalhes do log ${log.logEntryId}`}
                      onClick={() => setSelectedLog(log)}
                    >
                      <Eye />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
