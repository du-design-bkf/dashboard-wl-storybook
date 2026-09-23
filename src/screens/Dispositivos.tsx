import * as React from 'react'
import { useMemo, useState } from 'react'
import { Info, Pencil, Plus, Search, SlidersHorizontal, Trash2, Unlock } from 'lucide-react'
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
 * Contrato replicado do codigo real do hubmob-dashboard (`DeviceDto`,
 * `Devices.tsx`, `DeviceTable.tsx`, `DeviceFilters.tsx`, `EditDeviceModal.tsx`,
 * `LiberateDeviceModal.tsx`, `DeviceTokenModal.tsx`, `CreateMenu.tsx`), nao
 * inventado. 2 quirks reais preservados de proposito, nao sao lacuna de
 * design: (1) status tem 7 valores no badge/edicao mas so 2 (Ativo/Inativo)
 * no filtro/busca-rapida/criacao; (2) criar usa Dialog, editar tambem usa
 * Dialog - diferente de Estacoes/Veiculos, que usam Sheet nos dois.
 */
const VEHICLE_TYPE_NAMES: Record<number, string> = {
  1: 'Bicicleta convencional',
  2: 'Bicicleta elétrica a hidrogênio',
  3: 'Bicicleta elétrica',
  4: 'Triciclo elétrico',
  5: 'Patinete elétrico',
}

const DEVICE_TYPE_DOCK = 1
const DEVICE_TYPE_LOCKER = 2

export const mockDeviceTypes = [
  { deviceTypeId: DEVICE_TYPE_DOCK, deviceTypeName: 'Doca' },
  { deviceTypeId: DEVICE_TYPE_LOCKER, deviceTypeName: 'Locker' },
]

export const mockStations = [
  { stationId: 101, stationName: 'Parque Ibirapuera' },
  { stationId: 102, stationName: 'Vila Madalena' },
  { stationId: 103, stationName: 'Pinheiros' },
]

const DEVICE_STATUS_CONFIG: Record<number, { label: string; variant: StatusBadgeStatus }> = {
  0: { label: 'Em uso', variant: 'busy' },
  1: { label: 'Disponível', variant: 'ok' },
  2: { label: 'Aberto em uso', variant: 'busy' },
  3: { label: 'Fechado em uso', variant: 'busy' },
  4: { label: 'Aberto disponível', variant: 'ok' },
  5: { label: 'Manutenção', variant: 'critical' },
  6: { label: 'Inativo', variant: 'inactive' },
}

interface VehicleParked {
  vehicleId: number
  vehicleName: string
  vehicleTag: string
  vehicleTypeId: number
}

export interface Device {
  deviceId: number
  deviceName: string
  deviceTag?: string
  deviceStatus: number
  deviceTypeId: number
  stationId: number | null
  token?: string
  vehicleParked?: VehicleParked | null
}

export const mockDevices: Device[] = [
  {
    deviceId: 1,
    deviceName: 'DOCK-01',
    deviceTag: 'lote-2026-a',
    deviceStatus: 1,
    deviceTypeId: DEVICE_TYPE_DOCK,
    stationId: 101,
    vehicleParked: null,
  },
  {
    deviceId: 2,
    deviceName: 'DOCK-02',
    deviceStatus: 0,
    deviceTypeId: DEVICE_TYPE_DOCK,
    stationId: 101,
    vehicleParked: {
      vehicleId: 1,
      vehicleName: 'BF-0001',
      vehicleTag: 'lote-2026-a',
      vehicleTypeId: 3,
    },
  },
  {
    deviceId: 3,
    deviceName: 'DOCK-03',
    deviceStatus: 5,
    deviceTypeId: DEVICE_TYPE_DOCK,
    stationId: 102,
    vehicleParked: null,
  },
  {
    deviceId: 4,
    deviceName: 'LOCKER-01',
    deviceTag: 'BKF-E01D03',
    deviceStatus: 4,
    deviceTypeId: DEVICE_TYPE_LOCKER,
    stationId: 102,
    token: 'tok_locker01',
  },
  {
    deviceId: 5,
    deviceName: 'LOCKER-02',
    deviceStatus: 6,
    deviceTypeId: DEVICE_TYPE_LOCKER,
    stationId: 103,
    token: 'tok_locker02',
  },
]

interface FilterState {
  deviceTypeId: string
  deviceStatus: string
  stationId: string
  deviceTag: string
}

const EMPTY_FILTERS: FilterState = {
  deviceTypeId: '',
  deviceStatus: '',
  stationId: '',
  deviceTag: '',
}

interface DeviceFormState {
  deviceName: string
  deviceTag: string
  deviceTypeId: string
  stationId: string
  status: '0' | '1'
}

function deviceToForm(device: Device | null): DeviceFormState {
  return {
    deviceName: device?.deviceName ?? '',
    deviceTag: device?.deviceTag ?? '',
    deviceTypeId: device ? String(device.deviceTypeId) : '',
    stationId: device?.stationId != null ? String(device.stationId) : '',
    status: device ? (device.deviceStatus === 6 ? '0' : '1') : '1',
  }
}

export interface DispositivosScreenProps {
  initialDevices?: Device[]
  loading?: boolean
  /** Support so ve; Operator gerencia sem editar/excluir; Admin faz tudo. */
  role?: 'Admin' | 'Operator' | 'Support'
}

export function DispositivosScreen({
  initialDevices = mockDevices,
  loading = false,
  role = 'Admin',
}: DispositivosScreenProps) {
  const [devices, setDevices] = useState(initialDevices)
  const [showFilters, setShowFilters] = useState(false)
  const [draft, setDraft] = useState<FilterState>(EMPTY_FILTERS)
  const [applied, setApplied] = useState<FilterState>(EMPTY_FILTERS)

  const [createOpen, setCreateOpen] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [releasingDevice, setReleasingDevice] = useState<Device | null>(null)
  const [tokenDevice, setTokenDevice] = useState<Device | null>(null)
  const [deletingDevice, setDeletingDevice] = useState<Device | null>(null)
  const [justification, setJustification] = useState('')
  const [form, setForm] = useState<DeviceFormState>(deviceToForm(null))

  const isAdmin = role === 'Admin'
  const canManage = role === 'Admin' || role === 'Operator'

  const stationNameById = new Map(mockStations.map((s) => [s.stationId, s.stationName]))
  const deviceTypeNameById = new Map(mockDeviceTypes.map((t) => [t.deviceTypeId, t.deviceTypeName]))

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      if (applied.deviceTypeId && String(device.deviceTypeId) !== applied.deviceTypeId) return false
      if (applied.deviceStatus && String(device.deviceStatus) !== applied.deviceStatus) return false
      if (applied.stationId && String(device.stationId) !== applied.stationId) return false
      if (
        applied.deviceTag.trim() &&
        !(device.deviceTag ?? '').toLowerCase().includes(applied.deviceTag.trim().toLowerCase())
      )
        return false
      return true
    })
  }, [devices, applied])

  function applyFilters(next: FilterState) {
    setApplied(next)
  }

  function openCreate() {
    setForm(deviceToForm(null))
    setCreateOpen(true)
  }

  function openEdit(device: Device) {
    setEditingDevice(device)
    setForm(deviceToForm(device))
  }

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault()
    setDevices((prev) => [
      ...prev,
      {
        deviceId: Math.max(0, ...prev.map((d) => d.deviceId)) + 1,
        deviceName: form.deviceName,
        deviceTag: form.deviceTag || undefined,
        deviceStatus: form.status === '1' ? 1 : 0,
        deviceTypeId: Number(form.deviceTypeId),
        stationId: form.stationId ? Number(form.stationId) : null,
        token: Number(form.deviceTypeId) === DEVICE_TYPE_LOCKER ? `tok_${form.deviceName.toLowerCase()}` : undefined,
        vehicleParked: null,
      },
    ])
    setCreateOpen(false)
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingDevice) return
    setDevices((prev) =>
      prev.map((d) =>
        d.deviceId === editingDevice.deviceId
          ? {
              ...d,
              deviceName: form.deviceName,
              deviceTag: form.deviceTag || undefined,
              stationId: form.stationId ? Number(form.stationId) : null,
              deviceStatus: Number(form.status),
            }
          : d
      )
    )
    setEditingDevice(null)
  }

  function openRelease(device: Device) {
    setJustification('')
    setReleasingDevice(device)
  }

  function confirmRelease() {
    if (!releasingDevice || !justification.trim()) return
    setDevices((prev) =>
      prev.map((d) => (d.deviceId === releasingDevice.deviceId ? { ...d, deviceStatus: 5 } : d))
    )
    setReleasingDevice(null)
  }

  function confirmDelete() {
    if (!deletingDevice) return
    setDevices((prev) => prev.filter((d) => d.deviceId !== deletingDevice.deviceId))
    setDeletingDevice(null)
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Dispositivos</h1>
        <div className="flex items-center gap-2">
          {canManage && (
            <Button onClick={openCreate}>
              <Plus />
              Adicionar Dispositivo
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowFilters((v) => !v)}>
            <SlidersHorizontal />
            Filtros
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-4 rounded-xl border p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Tipo do Dispositivo</label>
              <Select
                value={draft.deviceTypeId}
                onValueChange={(v) => setDraft((f) => ({ ...f, deviceTypeId: v }))}
              >
                <SelectTrigger className="w-[200px]" aria-label="Tipo do Dispositivo">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  {mockDeviceTypes.map((t) => (
                    <SelectItem key={t.deviceTypeId} value={String(t.deviceTypeId)}>
                      {t.deviceTypeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={draft.deviceStatus}
                onValueChange={(v) => setDraft((f) => ({ ...f, deviceStatus: v }))}
              >
                <SelectTrigger className="w-[200px]" aria-label="Status">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Ativo</SelectItem>
                  <SelectItem value="0">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Estação Vinculada</label>
              <Select
                value={draft.stationId}
                onValueChange={(v) => setDraft((f) => ({ ...f, stationId: v }))}
              >
                <SelectTrigger className="w-[200px]" aria-label="Estação Vinculada">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  {mockStations.map((s) => (
                    <SelectItem key={s.stationId} value={String(s.stationId)}>
                      {s.stationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Etiqueta</label>
              <Input
                placeholder="Ex.: DOCK-01"
                value={draft.deviceTag}
                onChange={(e) => setDraft((f) => ({ ...f, deviceTag: e.target.value }))}
                className="w-[200px]"
              />
            </div>

            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDraft(EMPTY_FILTERS)
                  applyFilters(EMPTY_FILTERS)
                }}
              >
                Limpar
              </Button>
              <Button onClick={() => applyFilters(draft)}>Aplicar filtros</Button>
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
      ) : filteredDevices.length === 0 ? (
        <EmptyState
          message="Nenhum dispositivo encontrado"
          action={
            canManage ? (
              <Button size="sm" onClick={openCreate}>
                Adicionar Dispositivo
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo do Dispositivo</TableHead>
              <TableHead>Nome do Dispositivo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Estação Vinculada</TableHead>
              <TableHead>Veículo Estacionado</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDevices.map((device) => {
              const statusConfig = DEVICE_STATUS_CONFIG[device.deviceStatus]
              const isLocker = device.deviceTypeId === DEVICE_TYPE_LOCKER
              const isDock = device.deviceTypeId === DEVICE_TYPE_DOCK

              return (
                <TableRow key={device.deviceId}>
                  <TableCell>{deviceTypeNameById.get(device.deviceTypeId) ?? '-'}</TableCell>
                  <TableCell className="font-medium">{device.deviceName}</TableCell>
                  <TableCell>
                    <StatusBadge status={statusConfig?.variant ?? 'inactive'}>
                      {statusConfig?.label ?? '-'}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    {device.stationId != null ? (stationNameById.get(device.stationId) ?? '-') : '-'}
                  </TableCell>
                  <TableCell>
                    {isLocker ? (
                      <span className="text-muted-foreground">-</span>
                    ) : isDock ? (
                      device.vehicleParked ? (
                        <div className="flex flex-col">
                          <span className="font-medium">{device.vehicleParked.vehicleName}</span>
                          <span className="text-xs text-muted-foreground">
                            {device.vehicleParked.vehicleTag} ·{' '}
                            {VEHICLE_TYPE_NAMES[device.vehicleParked.vehicleTypeId]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Vazia</span>
                      )
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {canManage ? (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Liberar ${device.deviceName}`}
                          title="Liberar para manutenção"
                          onClick={() => openRelease(device)}
                        >
                          <Unlock />
                        </Button>
                        {isLocker && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Token de ${device.deviceName}`}
                            title="Mostrar token"
                            onClick={() => setTokenDevice(device)}
                          >
                            <Info />
                          </Button>
                        )}
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Editar ${device.deviceName}`}
                              onClick={() => openEdit(device)}
                            >
                              <Pencil />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Excluir ${device.deviceName}`}
                              onClick={() => setDeletingDevice(device)}
                            >
                              <Trash2 />
                            </Button>
                          </>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      {/* Criar - Dialog, nao Sheet (contrato real diverge de Estacoes/Veiculos) */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>Novo Dispositivo</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <Input
                placeholder="Ex: Sensor-Alpha"
                value={form.deviceName}
                onChange={(e) => setForm((f) => ({ ...f, deviceName: e.target.value }))}
                required
              />
              <Select
                value={form.deviceTypeId}
                onValueChange={(v) => setForm((f) => ({ ...f, deviceTypeId: v }))}
              >
                <SelectTrigger aria-label="Tipo do Dispositivo">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {mockDeviceTypes.map((t) => (
                    <SelectItem key={t.deviceTypeId} value={String(t.deviceTypeId)}>
                      {t.deviceTypeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={form.stationId}
                onValueChange={(v) => setForm((f) => ({ ...f, stationId: v }))}
              >
                <SelectTrigger aria-label="Estação Vinculada">
                  <SelectValue placeholder="Selecione a estação" />
                </SelectTrigger>
                <SelectContent>
                  {mockStations.map((s) => (
                    <SelectItem key={s.stationId} value={String(s.stationId)}>
                      {s.stationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Ex: BKF-E01D03"
                value={form.deviceTag}
                onChange={(e) => setForm((f) => ({ ...f, deviceTag: e.target.value }))}
              />
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v as '0' | '1' }))}
              >
                <SelectTrigger aria-label="Status inicial">
                  <SelectValue placeholder="Status inicial" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Ativo</SelectItem>
                  <SelectItem value="0">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Editar - status completo (7 valores), tipo travado (PUT nao aceita) */}
      <Dialog open={!!editingDevice} onOpenChange={(open) => !open && setEditingDevice(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Editar Dispositivo</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <Input
                value={form.deviceName}
                onChange={(e) => setForm((f) => ({ ...f, deviceName: e.target.value }))}
                required
              />
              <Input
                value={form.deviceTag}
                onChange={(e) => setForm((f) => ({ ...f, deviceTag: e.target.value }))}
                placeholder="Tag do Dispositivo"
              />
              <Select value={form.deviceTypeId} disabled>
                <SelectTrigger aria-label="Tipo do Dispositivo">
                  <SelectValue placeholder="Tipo do Dispositivo" />
                </SelectTrigger>
                <SelectContent>
                  {mockDeviceTypes.map((t) => (
                    <SelectItem key={t.deviceTypeId} value={String(t.deviceTypeId)}>
                      {t.deviceTypeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="-mt-2 text-xs text-muted-foreground">
                O tipo não pode ser alterado após o cadastro.
              </p>
              <Select
                value={form.stationId}
                onValueChange={(v) => setForm((f) => ({ ...f, stationId: v }))}
              >
                <SelectTrigger aria-label="Estação Vinculada">
                  <SelectValue placeholder="Estação Vinculada" />
                </SelectTrigger>
                <SelectContent>
                  {mockStations.map((s) => (
                    <SelectItem key={s.stationId} value={String(s.stationId)}>
                      {s.stationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v as '0' | '1' }))}
              >
                <SelectTrigger aria-label="Status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DEVICE_STATUS_CONFIG).map(([value, cfg]) => (
                    <SelectItem key={value} value={value}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Liberar para manutencao - justificativa obrigatoria, ate 500 chars */}
      <Dialog open={!!releasingDevice} onOpenChange={(open) => !open && setReleasingDevice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Liberar {releasingDevice?.deviceName ?? 'dispositivo'}</DialogTitle>
            <DialogDescription>
              A bicicleta encaixada será recolhida para manutenção e o equipamento aberto. Informe o
              motivo da liberação.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value.slice(0, 500))}
              maxLength={500}
              rows={4}
              placeholder="Ex.: Pneu furado, recolher para oficina."
              className="w-full resize-none rounded-lg border p-2.5 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <span className="self-end text-xs text-muted-foreground">{justification.length}/500</span>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={confirmRelease} disabled={!justification.trim()}>
              Liberar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Token do locker + QR (so dispositivo tipo Locker) */}
      <Dialog open={!!tokenDevice} onOpenChange={(open) => !open && setTokenDevice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Token do Locker</DialogTitle>
          </DialogHeader>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
            <dt className="text-muted-foreground">Nome do dispositivo</dt>
            <dd>{tokenDevice?.deviceName}</dd>
            <dt className="text-muted-foreground">Tipo</dt>
            <dd>Locker</dd>
            <dt className="text-muted-foreground">Token</dt>
            <dd className="font-mono text-xs">{tokenDevice?.token ?? '-'}</dd>
          </dl>
          {tokenDevice?.token ? (
            <div className="flex aspect-square w-32 items-center justify-center self-center rounded-lg border border-dashed">
              <Search className="size-10 text-muted-foreground" aria-hidden="true" />
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Nenhum token disponível para este locker.
            </p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingDevice} onOpenChange={(open) => !open && setDeletingDevice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir dispositivo?</DialogTitle>
            <DialogDescription>
              Nome do Dispositivo: <strong>{deletingDevice?.deviceName}</strong>
              <br />
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
