import * as React from 'react'
import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

/**
 * Contrato replicado do `ENTIDADES.md` real (fonte da API, fora do vault) -
 * `UsageGlobalPolicy` e `UsagePolicyPerType`, as 2 unicas entidades ligadas
 * a Configuracoes. Card #12100: "sem tela em lugar nenhum hoje", nenhum
 * codigo de front existe pra este modulo (nem mock, nem rota comentada -
 * mais cru que Pacotes). Escopo desta tela e so essas 2 entidades reais,
 * nao inventa preferencia de app/tema/notificacao sem contrato.
 *
 * `VehicleTypeId` e `DeviceTypeId` sao os 2 opcionais em `UsagePolicyPerType`
 * (regra pode mirar so tipo de veiculo, so tipo de equipamento, ou os 2).
 * Mesma tabela de tipos ja usada em Veiculos (#12091) e Dispositivos
 * (#12092), reaproveitada aqui por serem o mesmo enum real.
 */
const VEHICLE_TYPE_OPTIONS = [
  { value: '1', label: 'Bicicleta convencional' },
  { value: '2', label: 'Bicicleta elétrica a hidrogênio' },
  { value: '3', label: 'Bicicleta elétrica' },
  { value: '4', label: 'Triciclo elétrico' },
  { value: '5', label: 'Patinete elétrico' },
]

const DEVICE_TYPE_OPTIONS = [
  { value: '1', label: 'Doca' },
  { value: '2', label: 'Locker' },
]

function vehicleTypeLabel(id: number | null): string {
  if (id == null) return 'Todos'
  return VEHICLE_TYPE_OPTIONS.find((o) => o.value === String(id))?.label ?? '-'
}

function deviceTypeLabel(id: number | null): string {
  if (id == null) return 'Todos'
  return DEVICE_TYPE_OPTIONS.find((o) => o.value === String(id))?.label ?? '-'
}

export interface UsagePolicyRule {
  usagePolicyPerTypeId: number
  vehicleTypeId: number | null
  deviceTypeId: number | null
  maxConcurrent: number | null
}

export const mockGlobalMaxConcurrent = 120

export const mockPolicyRules: UsagePolicyRule[] = [
  { usagePolicyPerTypeId: 1, vehicleTypeId: 3, deviceTypeId: 1, maxConcurrent: 40 },
  { usagePolicyPerTypeId: 2, vehicleTypeId: 5, deviceTypeId: 2, maxConcurrent: 15 },
  { usagePolicyPerTypeId: 3, vehicleTypeId: null, deviceTypeId: 2, maxConcurrent: 30 },
]

interface RuleFormState {
  vehicleTypeId: string
  deviceTypeId: string
  maxConcurrent: string
}

function emptyRuleForm(): RuleFormState {
  return { vehicleTypeId: 'none', deviceTypeId: 'none', maxConcurrent: '' }
}

function ruleToForm(rule: UsagePolicyRule): RuleFormState {
  return {
    vehicleTypeId: rule.vehicleTypeId != null ? String(rule.vehicleTypeId) : 'none',
    deviceTypeId: rule.deviceTypeId != null ? String(rule.deviceTypeId) : 'none',
    maxConcurrent: rule.maxConcurrent != null ? String(rule.maxConcurrent) : '',
  }
}

export interface ConfiguracoesScreenProps {
  initialGlobalMaxConcurrent?: number
  initialRules?: UsagePolicyRule[]
}

export function ConfiguracoesScreen({
  initialGlobalMaxConcurrent = mockGlobalMaxConcurrent,
  initialRules = mockPolicyRules,
}: ConfiguracoesScreenProps) {
  const [globalMaxConcurrent, setGlobalMaxConcurrent] = useState(initialGlobalMaxConcurrent)
  const [globalDraft, setGlobalDraft] = useState(String(initialGlobalMaxConcurrent))
  const [globalSaved, setGlobalSaved] = useState(false)

  const [rules, setRules] = useState(initialRules)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<UsagePolicyRule | null>(null)
  const [deletingRule, setDeletingRule] = useState<UsagePolicyRule | null>(null)
  const [form, setForm] = useState<RuleFormState>(emptyRuleForm())

  function saveGlobalPolicy(e: React.FormEvent) {
    e.preventDefault()
    setGlobalMaxConcurrent(Number(globalDraft))
    setGlobalSaved(true)
  }

  function openCreate() {
    setEditingRule(null)
    setForm(emptyRuleForm())
    setDialogOpen(true)
  }

  function openEdit(rule: UsagePolicyRule) {
    setEditingRule(rule)
    setForm(ruleToForm(rule))
    setDialogOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const payload = {
      vehicleTypeId: form.vehicleTypeId === 'none' ? null : Number(form.vehicleTypeId),
      deviceTypeId: form.deviceTypeId === 'none' ? null : Number(form.deviceTypeId),
      maxConcurrent: form.maxConcurrent ? Number(form.maxConcurrent) : null,
    }

    if (editingRule) {
      setRules((prev) =>
        prev.map((r) => (r.usagePolicyPerTypeId === editingRule.usagePolicyPerTypeId ? { ...r, ...payload } : r))
      )
    } else {
      setRules((prev) => [
        ...prev,
        {
          usagePolicyPerTypeId: Math.max(0, ...prev.map((r) => r.usagePolicyPerTypeId)) + 1,
          ...payload,
        },
      ])
    }

    setDialogOpen(false)
  }

  function confirmDelete() {
    if (!deletingRule) return
    setRules((prev) => prev.filter((r) => r.usagePolicyPerTypeId !== deletingRule.usagePolicyPerTypeId))
    setDeletingRule(null)
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-semibold">Configurações</h1>

      <div className="rounded-2xl border p-5">
        <h2 className="text-sm font-semibold">Política global de uso</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Limite de usos simultâneos aplicado a toda a conta, antes de qualquer regra por tipo.
        </p>
        <form onSubmit={saveGlobalPolicy} className="mt-4 flex items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Máximo de usos simultâneos</label>
            <Input
              type="number"
              min={0}
              aria-label="Máximo de usos simultâneos"
              value={globalDraft}
              onChange={(e) => {
                setGlobalDraft(e.target.value)
                setGlobalSaved(false)
              }}
              className="w-[160px]"
              required
            />
          </div>
          <Button type="submit">Salvar</Button>
          {globalSaved && (
            <span className="text-sm text-muted-foreground" role="status">
              Salvo: {globalMaxConcurrent} usos simultâneos.
            </span>
          )}
        </form>
      </div>

      <div className="rounded-2xl border p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Política por tipo</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sobrescreve o limite global pra combinações de tipo de veículo e/ou equipamento.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus />
            Adicionar regra
          </Button>
        </div>

        {rules.length === 0 ? (
          <EmptyState
            message="Nenhuma regra por tipo cadastrada"
            action={
              <Button size="sm" onClick={openCreate}>
                Adicionar regra
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo de veículo</TableHead>
                <TableHead>Tipo de equipamento</TableHead>
                <TableHead>Máx. simultâneo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.usagePolicyPerTypeId}>
                  <TableCell>{vehicleTypeLabel(rule.vehicleTypeId)}</TableCell>
                  <TableCell>{deviceTypeLabel(rule.deviceTypeId)}</TableCell>
                  <TableCell>{rule.maxConcurrent ?? '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Editar regra ${rule.usagePolicyPerTypeId}`}
                        onClick={() => openEdit(rule)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Excluir regra ${rule.usagePolicyPerTypeId}`}
                        onClick={() => setDeletingRule(rule)}
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
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingRule ? 'Editar regra' : 'Adicionar regra'}</DialogTitle>
              <DialogDescription>
                Tipo de veículo e tipo de equipamento são opcionais - uma regra pode mirar só um dos
                dois, ou os dois juntos.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <Select
                value={form.vehicleTypeId}
                onValueChange={(v) => setForm((f) => ({ ...f, vehicleTypeId: v }))}
              >
                <SelectTrigger aria-label="Tipo de veículo">
                  <SelectValue placeholder="Tipo de veículo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum (todos)</SelectItem>
                  {VEHICLE_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={form.deviceTypeId}
                onValueChange={(v) => setForm((f) => ({ ...f, deviceTypeId: v }))}
              >
                <SelectTrigger aria-label="Tipo de equipamento">
                  <SelectValue placeholder="Tipo de equipamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum (todos)</SelectItem>
                  {DEVICE_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={0}
                placeholder="Máximo de usos simultâneos"
                aria-label="Máximo de usos simultâneos"
                value={form.maxConcurrent}
                onChange={(e) => setForm((f) => ({ ...f, maxConcurrent: e.target.value }))}
                required
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">{editingRule ? 'Salvar' : 'Adicionar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingRule} onOpenChange={(open) => !open && setDeletingRule(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir regra?</DialogTitle>
            <DialogDescription>
              Tipo de veículo: <strong>{deletingRule ? vehicleTypeLabel(deletingRule.vehicleTypeId) : ''}</strong>
              <br />
              Tipo de equipamento:{' '}
              <strong>{deletingRule ? deviceTypeLabel(deletingRule.deviceTypeId) : ''}</strong>
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
