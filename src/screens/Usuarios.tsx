import * as React from 'react'
import { useState } from 'react'
import { ExternalLink, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Toaster } from '@/components/ui/sonner'
import { AccessStatusBadge, type AccessStatus } from '@/components/ui/user-badges'

/**
 * Contrato replicado do codigo real do hubmob-dashboard (`UserDto`,
 * `Users.tsx`, `UserTable.tsx`, `NewUserModal.tsx`), nao inventado.
 */
const REGISTRATION_ORIGIN_LABELS: Record<'selfSignup' | 'invite' | 'unknown', string> = {
  selfSignup: 'Cadastro próprio',
  invite: 'Convite',
  unknown: 'Desconhecida',
}

export interface User {
  userId: string
  fullName: string
  phone: string
  email: string
  accessStatus: AccessStatus
  origin: 'selfSignup' | 'invite' | 'unknown'
  createdAt: string
}

export const mockUsers: User[] = [
  {
    userId: 'u1',
    fullName: 'Ana Ferreira',
    phone: '(11) 91234-5678',
    email: 'ana.ferreira@example.com',
    accessStatus: 'active',
    origin: 'selfSignup',
    createdAt: '2026-01-12',
  },
  {
    userId: 'u2',
    fullName: 'Bruno Costa',
    phone: '(11) 99876-5432',
    email: 'bruno.costa@example.com',
    accessStatus: 'pendingFirstAccess',
    origin: 'invite',
    createdAt: '2026-09-20',
  },
  {
    userId: 'u3',
    fullName: 'Carla Souza',
    phone: '(11) 90000-1111',
    email: 'carla.souza@example.com',
    accessStatus: 'active',
    origin: 'invite',
    createdAt: '2026-05-03',
  },
]

export interface UsuariosScreenProps {
  initialUsers?: User[]
  /** `canManage` real do código: libera "Reenviar convite". */
  canManage?: boolean
}

export function UsuariosScreen({
  initialUsers = mockUsers,
  canManage = true,
}: UsuariosScreenProps) {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState({ email: '', name: '', phone: '', bikeFacilMarker: false })

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q)
    )
  })

  function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setUsers((prev) => [
      ...prev,
      {
        userId: `u${prev.length + 1}`,
        fullName: form.name,
        phone: form.phone,
        email: form.email,
        accessStatus: 'pendingFirstAccess',
        origin: 'invite',
        createdAt: new Date().toISOString().slice(0, 10),
      },
    ])
    setForm({ email: '', name: '', phone: '', bikeFacilMarker: false })
    setSheetOpen(false)
    toast.success('Convite enviado')
  }

  function handleResendInvite(user: User) {
    toast.success(`Convite reenviado para ${user.fullName}`)
  }

  return (
    <div className="p-6">
      <Toaster />
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Usuários</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar por nome, email ou telefone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72"
          />
          <Button onClick={() => setSheetOpen(true)}>
            <Plus />
            Novo usuário
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((user) => (
            <TableRow key={user.userId}>
              <TableCell className="font-medium">{user.fullName}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <AccessStatusBadge status={user.accessStatus} />
              </TableCell>
              <TableCell>{REGISTRATION_ORIGIN_LABELS[user.origin]}</TableCell>
              <TableCell>{user.createdAt}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm" aria-label={`Abrir ${user.fullName}`}>
                    <ExternalLink />
                  </Button>
                  {canManage && user.accessStatus === 'pendingFirstAccess' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResendInvite(user)}
                    >
                      Reenviar convite
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <form onSubmit={handleInvite} className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle>Novo usuário</SheetTitle>
              <SheetDescription>
                Convite via email, replicado do `NewUserModal` real.
              </SheetDescription>
            </SheetHeader>
            <div className="grid flex-1 auto-rows-min gap-3 px-4">
              <Input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
              <Input
                placeholder="Nome"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <Input
                placeholder="Telefone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
              <Select defaultValue="rider">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rider">Será criado como Rider</SelectItem>
                </SelectContent>
              </Select>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={form.bikeFacilMarker}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, bikeFacilMarker: checked }))
                  }
                />
                Conceder marcador Bike Fácil
              </label>
            </div>
            <SheetFooter>
              <Button type="submit">Enviar convite</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
