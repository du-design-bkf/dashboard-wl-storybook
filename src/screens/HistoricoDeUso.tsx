import * as React from 'react'
import { useMemo, useState } from 'react'
import { CheckCircle2, Clock, Eye, SlidersHorizontal } from 'lucide-react'
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
 * Contrato replicado do codigo real do hubmob-dashboard (`TripDto`,
 * `RideDetailDto`, `History.tsx`, `HistoryTable.tsx`, `HistoryFilters.tsx`,
 * `HistoryBadges.tsx`, `RideDetailModal.tsx`), nao inventado. A aba "Trajeto"
 * do modal real depende de mapa ao vivo com posicao via SignalR (GPS em
 * tempo real) - fora de escopo pra uma composicao estatica, mantida como
 * placeholder explicito, nao lacuna de design. "Encerrar corrida" nao entra:
 * a tela global de Historico so chama a tabela com `onOpenDetails`, nunca
 * `onEndRide` - essa acao vive em outra tela (monitoramento).
 */
function formatDate(value?: string | null): string {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDistanceMeters(meters?: number | null): string {
  if (meters == null || !Number.isFinite(meters)) return '-'
  return `${Math.round(meters).toLocaleString('pt-BR')} m`
}

function formatCentsToBRL(cents?: number | null): string {
  if (cents == null) return '-'
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface RideCost {
  servicePlanId: number
  pricePerMinuteCents: number
  grossAmountCents: number
  discountCents: number
  netAmountCents: number
}

export interface Trip {
  rideId: number
  userName: string
  vehicleName: string
  vehicleTypeName: string
  pointType: string
  stationPickup?: string | null
  stationDropoff?: string | null
  startedAt: string
  endedAt?: string | null
  usedMinutes?: number | null
  isInProgress: boolean
  distanceMeters?: number | null
  rideCost?: RideCost | null
}

export const mockTrips: Trip[] = [
  {
    rideId: 5001,
    userName: 'Maria Silva',
    vehicleName: 'BF-0001',
    vehicleTypeName: 'Bicicleta elétrica',
    pointType: 'Doca',
    stationPickup: 'Parque Ibirapuera',
    stationDropoff: 'Vila Madalena',
    startedAt: '2026-09-20T13:05:00Z',
    endedAt: '2026-09-20T13:28:00Z',
    usedMinutes: 23,
    isInProgress: false,
    distanceMeters: 4820,
    rideCost: {
      servicePlanId: 2,
      pricePerMinuteCents: 35,
      grossAmountCents: 805,
      discountCents: 100,
      netAmountCents: 705,
    },
  },
  {
    rideId: 5002,
    userName: 'João Pereira',
    vehicleName: 'BF-0002',
    vehicleTypeName: 'Bicicleta convencional',
    pointType: 'Doca',
    stationPickup: 'Vila Madalena',
    stationDropoff: null,
    startedAt: '2026-09-23T15:40:00Z',
    endedAt: null,
    usedMinutes: null,
    isInProgress: true,
    distanceMeters: 1120,
    rideCost: null,
  },
  {
    rideId: 5003,
    userName: 'Ana Costa',
    vehicleName: 'BF-0003',
    vehicleTypeName: 'Patinete elétrico',
    pointType: 'Locker',
    stationPickup: 'Pinheiros',
    stationDropoff: 'Pinheiros',
    startedAt: '2026-09-18T09:12:00Z',
    endedAt: '2026-09-18T09:19:00Z',
    usedMinutes: 7,
    isInProgress: false,
    distanceMeters: 1560,
    rideCost: {
      servicePlanId: 1,
      pricePerMinuteCents: 50,
      grossAmountCents: 350,
      discountCents: 0,
      netAmountCents: 350,
    },
  },
]

interface FilterState {
  userName: string
  vehicleTypeName: string
  startDate: string
  endDate: string
}

const EMPTY_FILTERS: FilterState = {
  userName: '',
  vehicleTypeName: '',
  startDate: '',
  endDate: '',
}

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function TripStatusBadge({ isInProgress }: { isInProgress: boolean }) {
  const variant: StatusBadgeStatus = isInProgress ? 'busy' : 'ok'
  const Icon = isInProgress ? Clock : CheckCircle2
  return (
    <StatusBadge status={variant} className="gap-1.5">
      <Icon className="size-3.5" />
      {isInProgress ? 'Em andamento' : 'Concluída'}
    </StatusBadge>
  )
}

export interface HistoricoDeUsoScreenProps {
  initialTrips?: Trip[]
  loading?: boolean
}

export function HistoricoDeUsoScreen({
  initialTrips = mockTrips,
  loading = false,
}: HistoricoDeUsoScreenProps) {
  const [trips] = useState(initialTrips)
  const [showFilters, setShowFilters] = useState(false)
  const [draft, setDraft] = useState<FilterState>(EMPTY_FILTERS)
  const [applied, setApplied] = useState<FilterState>(EMPTY_FILTERS)
  const [selectedRide, setSelectedRide] = useState<Trip | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'route'>('details')

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      if (
        applied.userName.trim() &&
        !trip.userName.toLowerCase().includes(applied.userName.trim().toLowerCase())
      )
        return false
      if (
        applied.vehicleTypeName.trim() &&
        !trip.vehicleTypeName.toLowerCase().includes(applied.vehicleTypeName.trim().toLowerCase())
      )
        return false
      if (applied.startDate && trip.startedAt.slice(0, 10) < applied.startDate) return false
      if (applied.endDate && trip.startedAt.slice(0, 10) > applied.endDate) return false
      return true
    })
  }, [trips, applied])

  function openDetails(trip: Trip) {
    setActiveTab(trip.isInProgress ? 'route' : 'details')
    setSelectedRide(trip)
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Histórico</h1>
        <Button variant="outline" onClick={() => setShowFilters((v) => !v)}>
          <SlidersHorizontal />
          Filtros
        </Button>
      </div>

      {showFilters && (
        <div className="mb-4 rounded-xl border p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Nome de usuário</label>
              <Input
                placeholder="Buscar por usuário"
                value={draft.userName}
                onChange={(e) => setDraft((f) => ({ ...f, userName: e.target.value }))}
                className="w-[214px]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Tipo de veículo</label>
              <Input
                placeholder="Ex.: Bicicleta convencional"
                value={draft.vehicleTypeName}
                onChange={(e) => setDraft((f) => ({ ...f, vehicleTypeName: e.target.value }))}
                className="w-[214px]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Selecionar período</label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={draft.startDate}
                  onChange={(e) => setDraft((f) => ({ ...f, startDate: e.target.value }))}
                  className="w-[150px]"
                />
                <span className="text-sm text-muted-foreground">até</span>
                <Input
                  type="date"
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
      ) : filteredTrips.length === 0 ? (
        <EmptyState message="Nenhuma viagem encontrada" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Tipo de veículo</TableHead>
              <TableHead>Estação de retirada</TableHead>
              <TableHead>Estação de devolução</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Término</TableHead>
              <TableHead>Distância</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTrips.map((trip) => (
              <TableRow key={trip.rideId}>
                <TableCell className="font-medium">{trip.userName}</TableCell>
                <TableCell>{trip.vehicleName}</TableCell>
                <TableCell>{trip.vehicleTypeName}</TableCell>
                <TableCell>{trip.stationPickup ?? '-'}</TableCell>
                <TableCell>{trip.stationDropoff ?? '-'}</TableCell>
                <TableCell>{formatDate(trip.startedAt)}</TableCell>
                <TableCell>{trip.endedAt ? formatDate(trip.endedAt) : '-'}</TableCell>
                <TableCell>{formatDistanceMeters(trip.distanceMeters)}</TableCell>
                <TableCell>
                  <TripStatusBadge isInProgress={trip.isInProgress} />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Ver detalhes da corrida de ${trip.userName}`}
                    onClick={() => openDetails(trip)}
                  >
                    <Eye />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!selectedRide} onOpenChange={(open) => !open && setSelectedRide(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da corrida {selectedRide ? `#${selectedRide.rideId}` : ''}</DialogTitle>
          </DialogHeader>

          {selectedRide && (
            <div className="space-y-4">
              <div className="flex gap-px border-b" role="tablist">
                {(['details', 'route'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab}
                    onClick={() => setActiveTab(tab)}
                    className={`h-10 px-4 text-sm font-semibold transition-colors ${
                      activeTab === tab
                        ? 'border-b-2 border-foreground text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab === 'details' ? 'Detalhes' : 'Trajeto'}
                  </button>
                ))}
              </div>

              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-x-8 gap-y-4">
                    <InfoField label="Usuário" value={selectedRide.userName} />
                    <InfoField label="Veículo" value={selectedRide.vehicleName} />
                    <InfoField label="Tipo de veículo" value={selectedRide.vehicleTypeName} />
                    <InfoField label="Tipo de ponto" value={selectedRide.pointType} />
                    <InfoField label="Estação de retirada" value={selectedRide.stationPickup ?? '-'} />
                    <InfoField label="Estação de devolução" value={selectedRide.stationDropoff ?? '-'} />
                    <InfoField label="Início" value={formatDate(selectedRide.startedAt)} />
                    <InfoField
                      label="Término"
                      value={selectedRide.endedAt ? formatDate(selectedRide.endedAt) : '-'}
                    />
                    <InfoField
                      label="Duração"
                      value={selectedRide.usedMinutes != null ? `${selectedRide.usedMinutes} min` : '-'}
                    />
                    <InfoField label="Distância" value={formatDistanceMeters(selectedRide.distanceMeters)} />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <TripStatusBadge isInProgress={selectedRide.isInProgress} />
                    </div>
                  </div>

                  {selectedRide.rideCost && (
                    <div className="space-y-3 border-t pt-4">
                      <h3 className="text-sm font-semibold">Custo da corrida</h3>
                      <div className="flex flex-wrap gap-x-8 gap-y-4">
                        <InfoField label="Plano de serviço" value={String(selectedRide.rideCost.servicePlanId)} />
                        <InfoField
                          label="Preço por minuto"
                          value={formatCentsToBRL(selectedRide.rideCost.pricePerMinuteCents)}
                        />
                        <InfoField
                          label="Valor bruto"
                          value={formatCentsToBRL(selectedRide.rideCost.grossAmountCents)}
                        />
                        <InfoField label="Desconto" value={formatCentsToBRL(selectedRide.rideCost.discountCents)} />
                        <InfoField
                          label="Valor líquido"
                          value={formatCentsToBRL(selectedRide.rideCost.netAmountCents)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'route' && (
                <div
                  data-testid="route-placeholder"
                  className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center"
                >
                  <p className="text-sm text-muted-foreground">
                    Mapa de trajeto ao vivo (posição via GPS/SignalR).
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Fora de escopo desta composição estática.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
