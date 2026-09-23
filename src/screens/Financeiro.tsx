import * as React from 'react'
import { useMemo, useState } from 'react'
import { Eye, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge, type StatusBadgeStatus } from '@/components/ui/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

/**
 * Contrato replicado do `FinanceDto` real do hubmob-dashboard
 * (`types/Finance.ts`, `parcers/financeParcer.ts`) - card #12097. Achado
 * 23/09 confirmado com o Eduardo antes de compor: a tela real (`Finance.tsx`)
 * nao tem dado real hoje, usa `mockData('finance', 50)` com colunas
 * aleatorias (Descricao/Codigo/Valor/Hora via `Math.random()`), e o proprio
 * hook real (`useFinances`) esta comentado no codigo com a nota do dev "a
 * pagina do financeiro sera a ultima a ser disponibilizada". O `FinanceDto`
 * comentado existe mas nunca foi ligado.
 *
 * Decisao (Eduardo, 23/09): compor em cima do `FinanceDto` comentado mesmo
 * assim, e nao do mock aleatorio. `requestJson`/`responseJson` (payload cru
 * de gateway de pagamento) ficam de fora da tabela - so aparecem no detalhe,
 * que e onde um payload tecnico faz sentido existir, nunca em coluna de
 * lista. Tela e somente-leitura: o `ScreenBase` real so passa
 * `actions={['info']}` pra este tipo, sem criar/editar/excluir.
 *
 * `statusMessage` nao tem enum/catalogo documentado em lugar nenhum (unico
 * campo real, string livre do gateway) - a cor do badge aqui e inferencia
 * por palavra-chave, nao contrato confirmado; ajustar se o backend formalizar
 * os valores possiveis.
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

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function statusVariant(statusMessage: string): StatusBadgeStatus {
  const normalized = statusMessage.toLowerCase()
  if (normalized.includes('aprovad') || normalized.includes('sucesso')) return 'ok'
  if (normalized.includes('pendente') || normalized.includes('process')) return 'busy'
  if (normalized.includes('negad') || normalized.includes('recusad') || normalized.includes('erro'))
    return 'critical'
  return 'inactive'
}

export interface Transaction {
  transactionId: number
  statusId: number
  statusMessage: string
  authorizationCode: string
  authorizedAmount: number
  createdAt: string
  updatedAt: string
  requestJson: string
  responseJson: string
}

export const mockTransactions: Transaction[] = [
  {
    transactionId: 8801,
    statusId: 1,
    statusMessage: 'Aprovada',
    authorizationCode: 'AUTH-2F8C91',
    authorizedAmount: 12.5,
    createdAt: '2026-09-20T13:28:30Z',
    updatedAt: '2026-09-20T13:28:31Z',
    requestJson: '{"amount":1250,"card":"**** 4242","currency":"BRL"}',
    responseJson: '{"status":"approved","authCode":"AUTH-2F8C91"}',
  },
  {
    transactionId: 8802,
    statusId: 3,
    statusMessage: 'Negada',
    authorizationCode: '-',
    authorizedAmount: 0,
    createdAt: '2026-09-21T09:05:12Z',
    updatedAt: '2026-09-21T09:05:13Z',
    requestJson: '{"amount":800,"card":"**** 1090","currency":"BRL"}',
    responseJson: '{"status":"declined","reason":"insufficient_funds"}',
  },
  {
    transactionId: 8803,
    statusId: 2,
    statusMessage: 'Pendente',
    authorizationCode: '-',
    authorizedAmount: 0,
    createdAt: '2026-09-23T15:40:02Z',
    updatedAt: '2026-09-23T15:40:02Z',
    requestJson: '{"amount":350,"card":"**** 7731","currency":"BRL"}',
    responseJson: '{"status":"processing"}',
  },
  {
    transactionId: 8804,
    statusId: 1,
    statusMessage: 'Aprovada',
    authorizationCode: 'AUTH-9A11C0',
    authorizedAmount: 3.5,
    createdAt: '2026-09-18T09:19:44Z',
    updatedAt: '2026-09-18T09:19:45Z',
    requestJson: '{"amount":350,"card":"**** 5521","currency":"BRL"}',
    responseJson: '{"status":"approved","authCode":"AUTH-9A11C0"}',
  },
]

interface FilterState {
  authorizationCode: string
  startDate: string
  endDate: string
}

const EMPTY_FILTERS: FilterState = {
  authorizationCode: '',
  startDate: '',
  endDate: '',
}

export interface FinanceiroScreenProps {
  initialTransactions?: Transaction[]
  loading?: boolean
}

export function FinanceiroScreen({
  initialTransactions = mockTransactions,
  loading = false,
}: FinanceiroScreenProps) {
  const [transactions] = useState(initialTransactions)
  const [showFilters, setShowFilters] = useState(false)
  const [draft, setDraft] = useState<FilterState>(EMPTY_FILTERS)
  const [applied, setApplied] = useState<FilterState>(EMPTY_FILTERS)
  const [selected, setSelected] = useState<Transaction | null>(null)

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (
        applied.authorizationCode.trim() &&
        !t.authorizationCode.toLowerCase().includes(applied.authorizationCode.trim().toLowerCase())
      )
        return false
      if (applied.startDate && t.createdAt.slice(0, 10) < applied.startDate) return false
      if (applied.endDate && t.createdAt.slice(0, 10) > applied.endDate) return false
      return true
    })
  }, [transactions, applied])

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Financeiro</h1>
        <Button variant="outline" onClick={() => setShowFilters((v) => !v)}>
          <SlidersHorizontal />
          Filtros
        </Button>
      </div>

      {showFilters && (
        <div className="mb-4 rounded-xl border p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Código de autorização</label>
              <Input
                placeholder="Ex.: AUTH-2F8C91"
                value={draft.authorizationCode}
                onChange={(e) => setDraft((f) => ({ ...f, authorizationCode: e.target.value }))}
                className="w-[214px]"
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
                  className="w-[150px]"
                />
                <span className="text-sm text-muted-foreground">até</span>
                <Input
                  type="date"
                  aria-label="Data final"
                  value={draft.endDate}
                  onChange={(e) => setDraft((f) => ({ ...f, endDate: e.target.value }))}
                  className="w-[150px]"
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
              <Button onClick={() => setApplied(draft)}>Aplicar filtros</Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState message="Nenhuma transação encontrada" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transação</TableHead>
              <TableHead>Código de autorização</TableHead>
              <TableHead>Valor autorizado</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t) => (
              <TableRow key={t.transactionId}>
                <TableCell className="font-medium">#{t.transactionId}</TableCell>
                <TableCell>{t.authorizationCode}</TableCell>
                <TableCell>{formatBRL(t.authorizedAmount)}</TableCell>
                <TableCell>
                  <StatusBadge status={statusVariant(t.statusMessage)}>{t.statusMessage}</StatusBadge>
                </TableCell>
                <TableCell>{formatDate(t.createdAt)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Ver detalhes da transação ${t.transactionId}`}
                    onClick={() => setSelected(t)}
                  >
                    <Eye />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Transação #{selected?.transactionId}</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <StatusBadge status={statusVariant(selected.statusMessage)}>
                    {selected.statusMessage}
                  </StatusBadge>
                </dd>
                <dt className="text-muted-foreground">Código de autorização</dt>
                <dd className="font-mono text-xs">{selected.authorizationCode}</dd>
                <dt className="text-muted-foreground">Valor autorizado</dt>
                <dd>{formatBRL(selected.authorizedAmount)}</dd>
                <dt className="text-muted-foreground">Criado em</dt>
                <dd>{formatDate(selected.createdAt)}</dd>
                <dt className="text-muted-foreground">Atualizado em</dt>
                <dd>{formatDate(selected.updatedAt)}</dd>
              </dl>

              <div className="space-y-2 border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground">Requisição (gateway)</p>
                <pre className="overflow-x-auto rounded-lg border bg-muted p-2 font-mono text-xs">
                  {selected.requestJson}
                </pre>
                <p className="text-xs font-medium text-muted-foreground">Resposta (gateway)</p>
                <pre className="overflow-x-auto rounded-lg border bg-muted p-2 font-mono text-xs">
                  {selected.responseJson}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
