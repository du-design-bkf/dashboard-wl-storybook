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
 * Base real: print de um dashboard de cliente antigo (Bike Beach, WL
 * anterior ao Hubmob) trazido pelo Eduardo 23/09 - a rota real do
 * hubmob-dashboard (`Packets.tsx`) esta comentada, sem tela nem contrato
 * (card #12098 confirma: "Rota comentada no codigo, sem tela"). Sem outra
 * fonte, este e o unico dado real disponivel pro card.
 *
 * Estruturado, nao copiado literal: o dashboard antigo concatenava nome,
 * preco e minutos numa unica string ("PACOTE DE 30 MIN | R$ 15.00 | 30 MIN")
 * e a Descricao trazia specs da bike (aro/marchas) hardcoded no texto - virou
 * 3 campos proprios (nome, preco, minutos) + descricao livre. Por decisao do
 * Eduardo: aprimorar essa estrutura e trabalho futuro, isto e so a base.
 */
function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export interface Package {
  packageId: number
  name: string
  priceCents: number
  minutes: number
  description: string
}

export const mockPackages: Package[] = [
  {
    packageId: 1,
    name: 'Pacote de 30 min',
    priceCents: 1500,
    minutes: 30,
    description: 'Acesso a bicicletas convencionais e elétricas.',
  },
  {
    packageId: 2,
    name: 'Pacote de 45 min',
    priceCents: 2200,
    minutes: 45,
    description: 'Acesso a bicicletas convencionais e elétricas.',
  },
  {
    packageId: 3,
    name: 'Pacote de 1 hora',
    priceCents: 2800,
    minutes: 60,
    description: 'Acesso a bicicletas convencionais, elétricas e patinetes.',
  },
  {
    packageId: 4,
    name: 'Pacote de 180 minutos',
    priceCents: 5900,
    minutes: 180,
    description: 'Acesso completo à frota, inclui triciclo elétrico.',
  },
]

interface FormState {
  name: string
  price: string
  minutes: string
  description: string
}

function emptyForm(): FormState {
  return { name: '', price: '', minutes: '', description: '' }
}

function packageToForm(pkg: Package): FormState {
  return {
    name: pkg.name,
    price: (pkg.priceCents / 100).toFixed(2),
    minutes: String(pkg.minutes),
    description: pkg.description,
  }
}

export interface PacotesScreenProps {
  initialPackages?: Package[]
  loading?: boolean
}

export function PacotesScreen({
  initialPackages = mockPackages,
  loading = false,
}: PacotesScreenProps) {
  const [packages, setPackages] = useState(initialPackages)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())

  function openCreate() {
    setEditingPackage(null)
    setForm(emptyForm())
    setDialogOpen(true)
  }

  function openEdit(pkg: Package) {
    setEditingPackage(pkg)
    setForm(packageToForm(pkg))
    setDialogOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const priceCents = Math.round(Number(form.price.replace(',', '.')) * 100)

    if (editingPackage) {
      setPackages((prev) =>
        prev.map((p) =>
          p.packageId === editingPackage.packageId
            ? {
                ...p,
                name: form.name,
                priceCents,
                minutes: Number(form.minutes),
                description: form.description,
              }
            : p
        )
      )
    } else {
      setPackages((prev) => [
        ...prev,
        {
          packageId: Math.max(0, ...prev.map((p) => p.packageId)) + 1,
          name: form.name,
          priceCents,
          minutes: Number(form.minutes),
          description: form.description,
        },
      ])
    }

    setDialogOpen(false)
  }

  function confirmDelete() {
    if (!deletingPackage) return
    setPackages((prev) => prev.filter((p) => p.packageId !== deletingPackage.packageId))
    setDeletingPackage(null)
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pacotes</h1>
        <Button onClick={openCreate}>
          <Plus />
          Adicionar Pacote
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <EmptyState
          message="Nenhum pacote cadastrado ainda"
          action={
            <Button size="sm" onClick={openCreate}>
              Adicionar Pacote
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Pacote</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Minutos</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow key={pkg.packageId}>
                <TableCell className="font-medium">{pkg.name}</TableCell>
                <TableCell>{formatBRL(pkg.priceCents)}</TableCell>
                <TableCell>{pkg.minutes} min</TableCell>
                <TableCell className="max-w-xs truncate" title={pkg.description}>
                  {pkg.description}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Editar ${pkg.name}`}
                      onClick={() => openEdit(pkg)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Excluir ${pkg.name}`}
                      onClick={() => setDeletingPackage(pkg)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingPackage ? 'Editar pacote' : 'Adicionar pacote'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <Input
                placeholder="Nome do pacote"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Preço (R$)"
                  aria-label="Preço"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  required
                />
                <Input
                  type="number"
                  placeholder="Minutos inclusos"
                  aria-label="Minutos inclusos"
                  value={form.minutes}
                  onChange={(e) => setForm((f) => ({ ...f, minutes: e.target.value }))}
                  required
                />
              </div>
              <Input
                placeholder="Descrição"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">{editingPackage ? 'Salvar' : 'Adicionar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingPackage} onOpenChange={(open) => !open && setDeletingPackage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir pacote?</DialogTitle>
            <DialogDescription>
              Nome do Pacote: <strong>{deletingPackage?.name}</strong>
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
