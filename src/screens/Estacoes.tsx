import * as React from 'react'
import { useState } from 'react'
import { Camera, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

/**
 * Contrato replicado do codigo real do hubmob-dashboard
 * (`src/types/stations.ts`, `StationAvailabilityDto`), nao inventado.
 * "Doca" nao e entidade propria: sao os contadores agregados de Dispositivo
 * vinculados a estacao.
 */
export interface StationAddress {
  street: string
  streetNumber: string
  neighborhood: string
  city: string
  state: string
  country: string
  zipcode: string
  complement: string
  latitude: number
  longitude: number
}

export interface Station {
  stationId: number
  stationName: string
  cameraUrl?: string
  stationStatus: '0' | '1'
  totalDevices: number
  freeDevices: number
  inUse: number
  address?: StationAddress
}

const emptyAddress: StationAddress = {
  street: '',
  streetNumber: '',
  neighborhood: '',
  city: '',
  state: '',
  country: 'Brasil',
  zipcode: '',
  complement: '',
  latitude: 0,
  longitude: 0,
}

export const mockStations: Station[] = [
  {
    stationId: 101,
    stationName: 'Parque Ibirapuera',
    cameraUrl: 'https://camera.example.com/101',
    stationStatus: '1',
    totalDevices: 12,
    freeDevices: 8,
    inUse: 4,
    address: { ...emptyAddress, city: 'São Paulo', state: 'SP' },
  },
  {
    stationId: 102,
    stationName: 'Vila Madalena',
    stationStatus: '1',
    totalDevices: 6,
    freeDevices: 0,
    inUse: 6,
    address: { ...emptyAddress, city: 'São Paulo', state: 'SP' },
  },
  {
    stationId: 103,
    stationName: 'Pinheiros',
    stationStatus: '0',
    totalDevices: 8,
    freeDevices: 8,
    inUse: 0,
    address: { ...emptyAddress, city: 'São Paulo', state: 'SP' },
  },
]

interface StationFormState {
  stationName: string
  street: string
  streetNumber: string
  neighborhood: string
  zipcode: string
  city: string
  state: string
  country: string
  complement: string
  latitude: string
  longitude: string
  status: '0' | '1'
}

function stationToForm(station: Station | null): StationFormState {
  const a = station?.address ?? emptyAddress
  return {
    stationName: station?.stationName ?? '',
    street: a.street,
    streetNumber: a.streetNumber,
    neighborhood: a.neighborhood,
    zipcode: a.zipcode,
    city: a.city,
    state: a.state,
    country: a.country,
    complement: a.complement,
    latitude: String(a.latitude),
    longitude: String(a.longitude),
    status: station?.stationStatus ?? '1',
  }
}

export interface EstacoesScreenProps {
  initialStations?: Station[]
  loading?: boolean
  /** Papel do usuario logado: Admin ve editar/câmeras/excluir, Operator só cria. */
  role?: 'Admin' | 'Operator'
}

export function EstacoesScreen({
  initialStations = mockStations,
  loading = false,
  role = 'Admin',
}: EstacoesScreenProps) {
  const [stations, setStations] = useState(initialStations)
  const [editingStation, setEditingStation] = useState<Station | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deletingStation, setDeletingStation] = useState<Station | null>(null)
  const [form, setForm] = useState<StationFormState>(stationToForm(null))

  const isAdmin = role === 'Admin'

  function openCreate() {
    setEditingStation(null)
    setForm(stationToForm(null))
    setSheetOpen(true)
  }

  function openEdit(station: Station) {
    setEditingStation(station)
    setForm(stationToForm(station))
    setSheetOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const address = {
      street: form.street,
      streetNumber: form.streetNumber,
      neighborhood: form.neighborhood,
      city: form.city,
      state: form.state,
      country: form.country,
      zipcode: form.zipcode,
      complement: form.complement,
      latitude: Number(form.latitude) || 0,
      longitude: Number(form.longitude) || 0,
    }

    if (editingStation) {
      setStations((prev) =>
        prev.map((s) =>
          s.stationId === editingStation.stationId
            ? { ...s, stationName: form.stationName, stationStatus: form.status, address }
            : s
        )
      )
    } else {
      setStations((prev) => [
        ...prev,
        {
          stationId: Math.max(0, ...prev.map((s) => s.stationId)) + 1,
          stationName: form.stationName,
          stationStatus: form.status,
          totalDevices: 0,
          freeDevices: 0,
          inUse: 0,
          address,
        },
      ])
    }

    setSheetOpen(false)
  }

  function confirmDelete() {
    if (!deletingStation) return
    setStations((prev) => prev.filter((s) => s.stationId !== deletingStation.stationId))
    setDeletingStation(null)
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Estações</h1>
        <Button onClick={openCreate}>
          <Plus />
          Adicionar Estação
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : stations.length === 0 ? (
        <EmptyState
          message="Nenhuma estação cadastrada ainda"
          action={
            <Button size="sm" onClick={openCreate}>
              Adicionar Estação
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Total de Docas</TableHead>
              <TableHead>Docas livres</TableHead>
              <TableHead>Docas ocupadas</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead>Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {stations.map((station) => (
              <TableRow key={station.stationId}>
                <TableCell>{station.stationId}</TableCell>
                <TableCell className="font-medium">{station.stationName}</TableCell>
                <TableCell>
                  {station.address ? `${station.address.city}-${station.address.state}` : '-'}
                </TableCell>
                <TableCell>{station.totalDevices}</TableCell>
                <TableCell>{station.freeDevices}</TableCell>
                <TableCell>{station.inUse}</TableCell>
                <TableCell>
                  <StatusBadge status={station.stationStatus === '1' ? 'ok' : 'inactive'}>
                    {station.stationStatus === '1' ? 'Ativo' : 'Inativo'}
                  </StatusBadge>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Editar ${station.stationName}`}
                        onClick={() => openEdit(station)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Câmera de ${station.stationName}`}
                        disabled={!station.cameraUrl}
                        title={station.cameraUrl ? undefined : 'Câmera não disponível'}
                      >
                        <Camera />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Excluir ${station.stationName}`}
                        onClick={() => setDeletingStation(station)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <form onSubmit={handleSubmit} className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle>
                {editingStation ? 'Editar estação' : 'Adicionar estação'}
              </SheetTitle>
              <SheetDescription>
                Dados replicados 1:1 do formulário real (`CreateStationModal`).
              </SheetDescription>
            </SheetHeader>
            <div className="grid flex-1 auto-rows-min gap-3 overflow-y-auto px-4">
              <Input
                placeholder="Nome da estação"
                value={form.stationName}
                onChange={(e) => setForm((f) => ({ ...f, stationName: e.target.value }))}
                required
              />
              <Input
                placeholder="Rua"
                value={form.street}
                onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Número"
                  value={form.streetNumber}
                  onChange={(e) => setForm((f) => ({ ...f, streetNumber: e.target.value }))}
                  required
                />
                <Input
                  placeholder="Bairro"
                  value={form.neighborhood}
                  onChange={(e) => setForm((f) => ({ ...f, neighborhood: e.target.value }))}
                  required
                />
              </div>
              <Input
                placeholder="CEP"
                value={form.zipcode}
                onChange={(e) => setForm((f) => ({ ...f, zipcode: e.target.value }))}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Cidade"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  required
                />
                <Input
                  placeholder="Estado"
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  required
                />
              </div>
              <Input
                placeholder="País"
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                required
              />
              <Input
                placeholder="Complemento"
                value={form.complement}
                onChange={(e) => setForm((f) => ({ ...f, complement: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Latitude"
                  value={form.latitude}
                  onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
                />
                <Input
                  placeholder="Longitude"
                  value={form.longitude}
                  onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
                />
              </div>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v as '0' | '1' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status inicial" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Ativo</SelectItem>
                  <SelectItem value="0">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <SheetFooter>
              <Button type="submit">
                {editingStation ? 'Salvar' : 'Adicionar'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={!!deletingStation} onOpenChange={(open) => !open && setDeletingStation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir estação?</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a estação{' '}
              <strong>{deletingStation?.stationName}</strong> (id {deletingStation?.stationId})?
              Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
