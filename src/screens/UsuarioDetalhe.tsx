import { useState } from 'react'
import { Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AccountStatusBadge,
  ActivityBadge,
  BikeFacilBadge,
  PresenceIndicator,
  type AccountStatus,
  type Activity,
  type Presence,
} from '@/components/ui/user-badges'

/**
 * Contrato replicado do codigo real (`UserDetail.tsx`, `UserStatusSummaryDto`).
 * 4 abas no codigo real, so 3 implementadas: "Ultimas cobrancas" e
 * `<p>Em desenvolvimento.</p>` literal, nao e placeholder meu.
 */
export interface UserDetail {
  userId: string
  fullName: string
  email: string
  address: string
  createdAt: string
  role: string
  bikeFacilMarker: boolean
  presence: Presence
  activity: Activity
  accountStatus: AccountStatus
}

export const mockUserDetail: UserDetail = {
  userId: 'u2',
  fullName: 'Bruno Costa',
  email: 'bruno.costa@example.com',
  address: 'Av. Ibirapuera, 1000 - São Paulo/SP',
  createdAt: '2026-09-20',
  role: 'rider',
  bikeFacilMarker: false,
  presence: 'online',
  activity: 'in_ride',
  accountStatus: 'active',
}

const mockRides = [
  { id: 'r1', data: '22/09/2026', duracao: '18 min', status: 'Concluída' },
  { id: 'r2', data: '20/09/2026', duracao: '9 min', status: 'Concluída' },
]

const mockLockerUsages = [
  { id: 'l1', data: '21/09/2026', locker: 'L-014', status: 'Concluído' },
]

const mockPromotions = ['Primeira corrida grátis', 'Indique um amigo']

export interface UsuarioDetalheScreenProps {
  user?: UserDetail
  canGrantBikeFacilMarker?: boolean
}

export function UsuarioDetalheScreen({
  user = mockUserDetail,
  canGrantBikeFacilMarker = true,
}: UsuarioDetalheScreenProps) {
  const [liveTrackingOpen, setLiveTrackingOpen] = useState(false)
  const [bikeFacilMarker, setBikeFacilMarker] = useState(user.bikeFacilMarker)

  return (
    <div className="p-6">
      <p className="mb-1 text-sm text-muted-foreground">
        Usuários / {user.fullName}
      </p>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{user.fullName}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <PresenceIndicator presence={user.presence} />
          <ActivityBadge activity={user.activity} />
          <AccountStatusBadge status={user.accountStatus} />
          {user.activity === 'in_ride' && (
            <Button variant="outline" size="sm" onClick={() => setLiveTrackingOpen(true)}>
              <Radio />
              Acompanhar corrida ao vivo
            </Button>
          )}
          {user.activity === 'in_locker_usage' && (
            <Button variant="outline" size="sm" onClick={() => setLiveTrackingOpen(true)}>
              <Radio />
              Acompanhar uso de locker ao vivo
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg border p-4">
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Nome completo</p>
          <Input value={user.fullName} disabled />
        </div>
        <div>
          <p className="mb-1 text-xs text-muted-foreground">ID</p>
          <Input value={user.userId} disabled />
        </div>
        <div className="col-span-2">
          <p className="mb-1 text-xs text-muted-foreground">Endereço</p>
          <Input defaultValue={user.address} />
        </div>
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Acesso</p>
          <div className="flex items-center gap-2">
            <Select defaultValue={user.role}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rider">Rider</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {bikeFacilMarker && <BikeFacilBadge />}
            {canGrantBikeFacilMarker && (
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Switch
                  checked={bikeFacilMarker}
                  onCheckedChange={setBikeFacilMarker}
                  size="sm"
                />
                Marcador Bike Fácil
              </label>
            )}
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Criado em</p>
          <Input value={user.createdAt} disabled />
        </div>
      </div>

      <Tabs defaultValue="corridas">
        <TabsList>
          <TabsTrigger value="corridas">Histórico de Corridas</TabsTrigger>
          <TabsTrigger value="lockers">Histórico de Uso de Lockers</TabsTrigger>
          <TabsTrigger value="cobrancas">Últimas cobranças</TabsTrigger>
          <TabsTrigger value="promocoes">Promoções do usuário</TabsTrigger>
        </TabsList>
        <TabsContent value="corridas">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRides.map((ride) => (
                <TableRow key={ride.id}>
                  <TableCell>{ride.data}</TableCell>
                  <TableCell>{ride.duracao}</TableCell>
                  <TableCell>{ride.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="lockers">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Locker</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLockerUsages.map((usage) => (
                <TableRow key={usage.id}>
                  <TableCell>{usage.data}</TableCell>
                  <TableCell>{usage.locker}</TableCell>
                  <TableCell>{usage.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="cobrancas">
          <p className="text-sm text-muted-foreground">Em desenvolvimento.</p>
        </TabsContent>
        <TabsContent value="promocoes">
          <ul className="flex flex-col gap-2">
            {mockPromotions.map((promo) => (
              <li key={promo} className="rounded-lg border p-3 text-sm">
                {promo}
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>

      <Dialog open={liveTrackingOpen} onOpenChange={setLiveTrackingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acompanhamento ao vivo</DialogTitle>
            <DialogDescription>
              Placeholder: no código real conecta via SignalR
              (`useUserStatusRealtime`). Sem integração de dados aqui.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
