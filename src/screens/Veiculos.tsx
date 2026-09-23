import * as React from 'react'
import { useState } from 'react'
import { Info, Pencil, Plus, QrCode, Trash2 } from 'lucide-react'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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
 * Contrato replicado do codigo real do hubmob-dashboard (`VehicleDto`,
 * `vehicleParcer.ts`, `Vehicles.tsx`), nao inventado. Estacao/Doca/Foto sao
 * fixas em "-": o codigo nunca resolve esse vinculo hoje.
 */
export const VEHICLE_TYPE_NAMES: Record<number, string> = {
  1: 'Bicicleta convencional',
  2: 'Bicicleta elétrica a hidrogênio',
  3: 'Bicicleta elétrica',
  4: 'Triciclo elétrico',
  5: 'Patinete elétrico',
}

export interface Vehicle {
  vehicleId: number
  vehicleName: string
  vehicleTag?: string
  vehicleTypeId: number
  vehicleStatus: '0' | '1'
  createdAt: string
  updatedAt: string
  token: string
}

export const mockVehicles: Vehicle[] = [
  {
    vehicleId: 1,
    vehicleName: 'BF-0001',
    vehicleTag: 'lote-2026-a',
    vehicleTypeId: 3,
    vehicleStatus: '1',
    createdAt: '2026-01-10',
    updatedAt: '2026-08-01',
    token: 'tok_bf0001',
  },
  {
    vehicleId: 2,
    vehicleName: 'BF-0002',
    vehicleTypeId: 1,
    vehicleStatus: '1',
    createdAt: '2026-01-10',
    updatedAt: '2026-07-15',
    token: 'tok_bf0002',
  },
  {
    vehicleId: 3,
    vehicleName: 'BF-0003',
    vehicleTag: 'manutenção',
    vehicleTypeId: 5,
    vehicleStatus: '0',
    createdAt: '2026-02-02',
    updatedAt: '2026-09-01',
    token: 'tok_bf0003',
  },
]

interface VehicleFormState {
  vehicleName: string
  vehicleTag: string
  vehicleTypeId: string
  status: '0' | '1'
}

function vehicleToForm(vehicle: Vehicle | null): VehicleFormState {
  return {
    vehicleName: vehicle?.vehicleName ?? '',
    vehicleTag: vehicle?.vehicleTag ?? '',
    vehicleTypeId: String(vehicle?.vehicleTypeId ?? 1),
    status: vehicle?.vehicleStatus ?? '1',
  }
}

export interface VeiculosScreenProps {
  initialVehicles?: Vehicle[]
  loading?: boolean
}

export function VeiculosScreen({
  initialVehicles = mockVehicles,
  loading = false,
}: VeiculosScreenProps) {
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null)
  const [infoVehicle, setInfoVehicle] = useState<Vehicle | null>(null)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [qrText, setQrText] = useState('')
  const [qrMode, setQrMode] = useState<'exact' | 'pattern'>('exact')
  const [qrGenerated, setQrGenerated] = useState(false)
  const [form, setForm] = useState<VehicleFormState>(vehicleToForm(null))

  function openCreate() {
    setEditingVehicle(null)
    setForm(vehicleToForm(null))
    setSheetOpen(true)
  }

  function openEdit(vehicle: Vehicle) {
    setEditingVehicle(vehicle)
    setForm(vehicleToForm(vehicle))
    setSheetOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (editingVehicle) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.vehicleId === editingVehicle.vehicleId
            ? {
                ...v,
                vehicleName: form.vehicleName,
                vehicleTag: form.vehicleTag || undefined,
                vehicleTypeId: Number(form.vehicleTypeId),
                vehicleStatus: form.status,
                updatedAt: new Date().toISOString().slice(0, 10),
              }
            : v
        )
      )
    } else {
      const now = new Date().toISOString().slice(0, 10)
      setVehicles((prev) => [
        ...prev,
        {
          vehicleId: Math.max(0, ...prev.map((v) => v.vehicleId)) + 1,
          vehicleName: form.vehicleName,
          vehicleTag: form.vehicleTag || undefined,
          vehicleTypeId: Number(form.vehicleTypeId),
          vehicleStatus: form.status,
          createdAt: now,
          updatedAt: now,
          token: `tok_${form.vehicleName.toLowerCase().replace(/\s+/g, '-')}`,
        },
      ])
    }

    setSheetOpen(false)
  }

  function confirmDelete() {
    if (!deletingVehicle) return
    setVehicles((prev) => prev.filter((v) => v.vehicleId !== deletingVehicle.vehicleId))
    setDeletingVehicle(null)
  }

  function openQrDialog() {
    setQrText('')
    setQrMode('exact')
    setQrGenerated(false)
    setQrDialogOpen(true)
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Veículos</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openQrDialog}>
            <QrCode />
            Gerar QR Code
          </Button>
          <Button onClick={openCreate}>
            <Plus />
            Novo veículo
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          message="Nenhum veículo cadastrado ainda"
          action={
            <Button size="sm" onClick={openCreate}>
              Novo veículo
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Estação</TableHead>
              <TableHead>Doca</TableHead>
              <TableHead>Foto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.vehicleId}>
                <TableCell>{VEHICLE_TYPE_NAMES[vehicle.vehicleTypeId]}</TableCell>
                <TableCell className="font-medium">{vehicle.vehicleName}</TableCell>
                <TableCell>{vehicle.vehicleTag ?? '-'}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  <StatusBadge status={vehicle.vehicleStatus === '1' ? 'ok' : 'inactive'}>
                    {vehicle.vehicleStatus === '1' ? 'Ativo' : 'Inativo'}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Editar ${vehicle.vehicleName}`}
                      onClick={() => openEdit(vehicle)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Info de ${vehicle.vehicleName}`}
                      onClick={() => setInfoVehicle(vehicle)}
                    >
                      <Info />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Excluir ${vehicle.vehicleName}`}
                      onClick={() => setDeletingVehicle(vehicle)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <form onSubmit={handleSubmit} className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle>{editingVehicle ? 'Editar veículo' : 'Novo veículo'}</SheetTitle>
              <SheetDescription>
                4 campos, replicados do formulário real (`VehicleFormModal`).
              </SheetDescription>
            </SheetHeader>
            <div className="grid flex-1 auto-rows-min gap-3 px-4">
              <Input
                placeholder="Nome do veículo"
                value={form.vehicleName}
                onChange={(e) => setForm((f) => ({ ...f, vehicleName: e.target.value }))}
                required
              />
              <Input
                placeholder="Tag (opcional)"
                value={form.vehicleTag}
                onChange={(e) => setForm((f) => ({ ...f, vehicleTag: e.target.value }))}
              />
              <Select
                value={form.vehicleTypeId}
                onValueChange={(v) => setForm((f) => ({ ...f, vehicleTypeId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo do veículo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(VEHICLE_TYPE_NAMES).map(([id, name]) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Button type="submit">{editingVehicle ? 'Salvar' : 'Adicionar'}</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={!!deletingVehicle} onOpenChange={(open) => !open && setDeletingVehicle(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir veículo?</DialogTitle>
            <DialogDescription>
              Nome do Veículo: <strong>{deletingVehicle?.vehicleName}</strong>
              <br />
              Tag do Veículo: <strong>{deletingVehicle?.vehicleTag ?? '-'}</strong>
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

      <Dialog open={!!infoVehicle} onOpenChange={(open) => !open && setInfoVehicle(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Info do veículo</DialogTitle>
          </DialogHeader>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
            <dt className="text-muted-foreground">ID</dt>
            <dd>{infoVehicle?.vehicleId}</dd>
            <dt className="text-muted-foreground">Criado em</dt>
            <dd>{infoVehicle?.createdAt}</dd>
            <dt className="text-muted-foreground">Atualizado em</dt>
            <dd>{infoVehicle?.updatedAt}</dd>
            <dt className="text-muted-foreground">Token</dt>
            <dd className="font-mono text-xs">{infoVehicle?.token}</dd>
          </dl>
          <div className="flex aspect-square w-32 items-center justify-center self-center rounded-lg border border-dashed">
            <QrCode className="size-10 text-muted-foreground" aria-hidden="true" />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar QR Code</DialogTitle>
            <DialogDescription>
              Ferramenta avulsa, não amarrada a um veículo específico.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Texto do QR Code"
              value={qrText}
              onChange={(e) => {
                setQrText(e.target.value)
                setQrGenerated(false)
              }}
            />
            <RadioGroup
              value={qrMode}
              onValueChange={(v) => {
                setQrMode(v as 'exact' | 'pattern')
                setQrGenerated(false)
              }}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="exact" id="qr-exact" />
                <label htmlFor="qr-exact" className="text-sm">
                  Texto exato
                </label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="pattern" id="qr-pattern" />
                <label htmlFor="qr-pattern" className="text-sm">
                  Padrão do veículo
                </label>
              </div>
            </RadioGroup>
            <Button
              type="button"
              disabled={!qrText}
              onClick={() => setQrGenerated(true)}
            >
              Gerar
            </Button>
            {qrGenerated && (
              <div
                data-testid="qr-result"
                className="flex aspect-square w-32 items-center justify-center self-center rounded-lg border border-dashed"
              >
                <QrCode className="size-10 text-muted-foreground" aria-hidden="true" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
