import * as React from 'react'
import { Bike, Building2, Percent, Route, Users, Wrench } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge, type StatusBadgeStatus } from '@/components/ui/status-badge'

/**
 * COMPOSIÇÃO ESPECULATIVA (card #12090), decisão do Eduardo 23/09 pra
 * fechar as 8 telas do Epic #12069 com as 9 do dashboard todas cobertas.
 * Diferente de toda tela anterior desta leva: não replica código nem
 * contrato real. `pages/Dashboard.tsx` não tem rota em `appRoutes.tsx`
 * (achado do começo do dia, ver Log de Decisões 23/09) - não existe "visão
 * geral" nenhuma pra copiar.
 *
 * Os números dos cards de KPI reaproveitam a FORMA dos contratos reais já
 * usados nas outras 10 telas desta leva (status de Estação/Veículo/
 * Dispositivo, corrida em andamento, promoção ativa - mesmos enums de
 * Estacoes.tsx/Veiculos.tsx/Dispositivos.tsx/HistoricoDeUso.tsx/
 * Promocoes.tsx), mas os VALORES são inventados pra ilustrar o layout. Não
 * é dado de produção, é esqueleto de composição.
 */
interface Kpi {
  key: string
  label: string
  value: string
  hint: string
  icon: React.ComponentType<{ className?: string }>
}

const mockKpis: Kpi[] = [
  { key: 'stations', label: 'Estações ativas', value: '18 / 21', hint: '3 inativas', icon: Building2 },
  { key: 'vehicles', label: 'Veículos disponíveis', value: '142', hint: 'de 168 cadastrados', icon: Bike },
  { key: 'devices', label: 'Dispositivos em manutenção', value: '7', hint: 'de 210 cadastrados', icon: Wrench },
  { key: 'rides', label: 'Corridas em andamento', value: '23', hint: 'nas últimas 24h: 412', icon: Route },
  { key: 'users', label: 'Usuários ativos', value: '1.284', hint: '+38 esta semana', icon: Users },
  { key: 'promotions', label: 'Promoções ativas', value: '3', hint: 'de 4 cadastradas', icon: Percent },
]

interface RecentActivity {
  id: number
  actionLabel: string
  entityName: string
  status: StatusBadgeStatus
  statusLabel: string
  when: string
}

const mockRecentActivity: RecentActivity[] = [
  {
    id: 1,
    actionLabel: 'Estação atualizada',
    entityName: 'Parque Ibirapuera',
    status: 'ok',
    statusLabel: 'Concluído',
    when: 'há 12 min',
  },
  {
    id: 2,
    actionLabel: 'Veículo cadastrado',
    entityName: 'BF-0142',
    status: 'ok',
    statusLabel: 'Concluído',
    when: 'há 34 min',
  },
  {
    id: 3,
    actionLabel: 'Dispositivo liberado p/ manutenção',
    entityName: 'DOCK-07',
    status: 'busy',
    statusLabel: 'Em andamento',
    when: 'há 1h',
  },
  {
    id: 4,
    actionLabel: 'Promoção criada',
    entityName: 'Volta às aulas',
    status: 'ok',
    statusLabel: 'Concluído',
    when: 'há 3h',
  },
  {
    id: 5,
    actionLabel: 'Falha ao atualizar dispositivo',
    entityName: 'LOCKER-02',
    status: 'critical',
    statusLabel: 'Erro',
    when: 'há 5h',
  },
]

export interface VisaoGeralScreenProps {
  kpis?: Kpi[]
  recentActivity?: RecentActivity[]
}

export function VisaoGeralScreen({
  kpis = mockKpis,
  recentActivity = mockRecentActivity,
}: VisaoGeralScreenProps) {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Visão geral</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumo da operação nesta conta. Composição especulativa - sem rota real hoje.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.key}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">{kpi.label}</CardTitle>
                  <Icon className="size-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{kpi.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atividade recente</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {recentActivity.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.actionLabel}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.entityName}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={item.status}>{item.statusLabel}</StatusBadge>
                  <span className="text-xs text-muted-foreground">{item.when}</span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
