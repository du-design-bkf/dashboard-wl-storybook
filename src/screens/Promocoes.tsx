import * as React from 'react'
import { useMemo, useState } from 'react'
import { Check, ExternalLink, Pencil, Plus, Trash2, X } from 'lucide-react'
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
import { StatusBadge } from '@/components/ui/status-badge'
import { Switch } from '@/components/ui/switch'

/**
 * Contrato replicado do codigo real do hubmob-dashboard (`PromotionDto`,
 * `Promotions.tsx`, `PromotionCard.tsx`, `PromotionForm.tsx`,
 * `PromotionTypeStep.tsx`, `PromotionAudienceStep.tsx`,
 * `PromotionServicePlanSelect.tsx`, `constants/promotions.ts`), nao
 * inventado. Card #12096 (portar Promocoes do Hubmob #11731).
 *
 * 2 simplificacoes deliberadas, documentadas (nao sao lacuna de design):
 * (1) real usa navegacao de pagina pra criar/editar (`/promocoes/nova`),
 *     nao modal - aqui vira troca de "view" dentro do mesmo componente
 *     (list/form), mais fiel que forcar num Dialog como as outras telas;
 * (2) campo de valor do publico "Usuario especifico" e "Perfil/Role" no
 *     real busca async (`WebSearchSelect`/roles da API) - aqui vira input
 *     de texto simples, sem infra de busca. Simulacao de efeito do plano
 *     de valores (`promotionEffectLabel`) fica so no texto semantico
 *     (tipo + valor), sem reproduzir o calculo de preco do backend.
 */
const PROMOTION_TYPE_OPTIONS = [
  { value: '2', label: 'Desconto' },
  { value: '1', label: 'Minutos extras' },
]

const PROMOTION_RESET_TYPE_OPTIONS = [
  { value: '1', label: 'Diária' },
  { value: '2', label: 'Semanal' },
  { value: '3', label: 'Mensal' },
]

const PROMOTION_RESET_FREQUENCY_LABELS: Record<string, string> = {
  '1': 'por dia',
  '2': 'por semana',
  '3': 'por mês',
}

const AUDIENCE_TYPE_ALL = 'all'

const AUDIENCE_TYPE_OPTIONS = [
  { value: AUDIENCE_TYPE_ALL, label: 'Todos' },
  { value: '3', label: 'Usuário específico' },
  { value: '2', label: 'Perfil/Role' },
  { value: '1', label: 'Sufixo de e-mail' },
]

function audienceTypeLabel(type: string): string {
  return AUDIENCE_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type
}

function promotionTypeLabel(type: string): string {
  return PROMOTION_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type
}

function promotionResetTypeLabel(resetType: string | null): string {
  if (!resetType) return ''
  return PROMOTION_RESET_TYPE_OPTIONS.find((o) => o.value === resetType)?.label ?? resetType
}

function promotionResetFrequencyLabel(resetType: string | null): string {
  if (!resetType) return 'por período'
  return PROMOTION_RESET_FREQUENCY_LABELS[resetType] ?? 'por período'
}

function formatDate(value: string | null): string {
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

interface Audience {
  globalPromotionAudienceId: number
  type: string
  value: string
}

interface ServicePlan {
  servicePlanId: number
  companyId: number
  label: string
}

export interface Promotion {
  globalPromotionId: number
  name: string
  type: '1' | '2'
  minutes: number
  resetType: string | null
  discountPercent: number | null
  isActive: boolean
  triggerOnFeedback: boolean
  isInherited: boolean
  startsAt: string
  endsAt: string | null
  audiences: Audience[]
  servicePlans: ServicePlan[]
}

export const mockServicePlans: ServicePlan[] = [
  { servicePlanId: 1, companyId: 900, label: 'Bicicleta convencional' },
  { servicePlanId: 2, companyId: 900, label: 'Bicicleta elétrica' },
  { servicePlanId: 3, companyId: 900, label: 'Patinete elétrico' },
]

export const mockPromotions: Promotion[] = [
  {
    globalPromotionId: 1,
    name: 'Black Friday',
    type: '2',
    minutes: 0,
    resetType: null,
    discountPercent: 20,
    isActive: true,
    triggerOnFeedback: false,
    isInherited: false,
    startsAt: '2026-11-20T00:00:00Z',
    endsAt: '2026-11-30T23:59:00Z',
    audiences: [{ globalPromotionAudienceId: 1, type: 'all', value: '' }],
    servicePlans: [mockServicePlans[0], mockServicePlans[1]],
  },
  {
    globalPromotionId: 2,
    name: 'Bônus de pesquisa',
    type: '1',
    minutes: 15,
    resetType: '1',
    discountPercent: null,
    isActive: true,
    triggerOnFeedback: true,
    isInherited: false,
    startsAt: '2026-08-01T00:00:00Z',
    endsAt: null,
    audiences: [{ globalPromotionAudienceId: 2, type: 'all', value: '' }],
    servicePlans: [mockServicePlans[0]],
  },
  {
    globalPromotionId: 3,
    name: 'Colaborador Bike Fácil',
    type: '2',
    minutes: 0,
    resetType: null,
    discountPercent: 50,
    isActive: true,
    triggerOnFeedback: false,
    isInherited: true,
    startsAt: '2026-01-01T00:00:00Z',
    endsAt: null,
    audiences: [
      { globalPromotionAudienceId: 3, type: '2', value: 'Colaborador' },
    ],
    servicePlans: mockServicePlans,
  },
  {
    globalPromotionId: 4,
    name: 'Piloto IFPR',
    type: '1',
    minutes: 30,
    resetType: '2',
    discountPercent: null,
    isActive: false,
    triggerOnFeedback: false,
    isInherited: false,
    startsAt: '2026-07-01T00:00:00Z',
    endsAt: '2026-08-14T23:59:00Z',
    audiences: [
      { globalPromotionAudienceId: 4, type: '3', value: 'aluno-001' },
    ],
    servicePlans: [],
  },
]

interface FormState {
  name: string
  type: '1' | '2'
  minutes: string
  discountPercent: string
  resetType: string
  triggerOnFeedback: boolean
  audiences: Audience[]
  servicePlanIds: number[]
  startsAt: string
  endsAt: string
  isActive: boolean
}

function emptyForm(): FormState {
  return {
    name: '',
    type: '2',
    minutes: '',
    discountPercent: '',
    resetType: '',
    triggerOnFeedback: false,
    audiences: [{ globalPromotionAudienceId: 0, type: AUDIENCE_TYPE_ALL, value: '' }],
    servicePlanIds: [],
    startsAt: '',
    endsAt: '',
    isActive: true,
  }
}

function promotionToForm(promotion: Promotion): FormState {
  return {
    name: promotion.name,
    type: promotion.type,
    minutes: promotion.minutes ? String(promotion.minutes) : '',
    discountPercent: promotion.discountPercent != null ? String(promotion.discountPercent) : '',
    resetType: promotion.resetType ?? '',
    triggerOnFeedback: promotion.triggerOnFeedback,
    audiences: promotion.audiences.length ? promotion.audiences : emptyForm().audiences,
    servicePlanIds: promotion.servicePlans.map((p) => p.servicePlanId),
    startsAt: promotion.startsAt.slice(0, 16),
    endsAt: promotion.endsAt ? promotion.endsAt.slice(0, 16) : '',
    isActive: promotion.isActive,
  }
}

function PromotionStepCard({
  step,
  title,
  subtitle,
  children,
}: {
  step: number
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border p-4">
      <div className="mb-1 flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background">
          {step}
        </span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {subtitle && <p className="mb-3 text-sm text-muted-foreground">{subtitle}</p>}
      <div className={subtitle ? undefined : 'mt-3'}>{children}</div>
    </div>
  )
}

export interface PromocoesScreenProps {
  initialPromotions?: Promotion[]
  loading?: boolean
  /** "+ Adicionar promoção" só aparece pra Manager+ - editar/excluir no card não é gated por role no código real. */
  role?: 'Admin' | 'Manager' | 'Operator' | 'Support'
}

export function PromocoesScreen({
  initialPromotions = mockPromotions,
  loading = false,
  role = 'Admin',
}: PromocoesScreenProps) {
  const [promotions, setPromotions] = useState(initialPromotions)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [deletingPromotion, setDeletingPromotion] = useState<Promotion | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())

  const canCreate = role === 'Admin' || role === 'Manager'

  const filteredPromotions = useMemo(() => {
    if (statusFilter === 'active') return promotions.filter((p) => p.isActive)
    if (statusFilter === 'inactive') return promotions.filter((p) => !p.isActive)
    return promotions
  }, [promotions, statusFilter])

  function openCreate() {
    setForm(emptyForm())
    setEditingPromotion(null)
    setView('create')
  }

  function openEdit(promotion: Promotion) {
    setForm(promotionToForm(promotion))
    setEditingPromotion(promotion)
    setView('edit')
  }

  function updateAudience(index: number, patch: Partial<Audience>) {
    setForm((f) => ({
      ...f,
      audiences: f.audiences.map((a, i) => (i === index ? { ...a, ...patch } : a)),
    }))
  }

  function addAudience() {
    setForm((f) => ({
      ...f,
      audiences: [...f.audiences, { globalPromotionAudienceId: 0, type: '', value: '' }],
    }))
  }

  function removeAudience(index: number) {
    setForm((f) => ({ ...f, audiences: f.audiences.filter((_, i) => i !== index) }))
  }

  function toggleServicePlan(id: number) {
    setForm((f) => ({
      ...f,
      servicePlanIds: f.servicePlanIds.includes(id)
        ? f.servicePlanIds.filter((p) => p !== id)
        : [...f.servicePlanIds, id],
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const reachesEveryone = form.audiences.some((a) => a.type === AUDIENCE_TYPE_ALL)
    const audiences = reachesEveryone
      ? [{ globalPromotionAudienceId: 0, type: AUDIENCE_TYPE_ALL, value: '' }]
      : form.audiences

    const servicePlans = mockServicePlans.filter((p) => form.servicePlanIds.includes(p.servicePlanId))

    const payload: Omit<Promotion, 'globalPromotionId' | 'isInherited'> = {
      name: form.name,
      type: form.type,
      minutes: form.type === '1' ? Number(form.minutes) : 0,
      resetType: form.type === '1' ? form.resetType : null,
      discountPercent: form.type === '2' ? Number(form.discountPercent) : null,
      isActive: form.isActive,
      triggerOnFeedback: form.type === '1' ? form.triggerOnFeedback : false,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : new Date().toISOString(),
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      audiences,
      servicePlans,
    }

    if (view === 'edit' && editingPromotion) {
      setPromotions((prev) =>
        prev.map((p) =>
          p.globalPromotionId === editingPromotion.globalPromotionId
            ? { ...p, ...payload, isInherited: p.isInherited }
            : p
        )
      )
    } else {
      setPromotions((prev) => [
        ...prev,
        {
          ...payload,
          globalPromotionId: Math.max(0, ...prev.map((p) => p.globalPromotionId)) + 1,
          isInherited: false,
        },
      ])
    }

    setView('list')
  }

  function confirmDelete() {
    if (!deletingPromotion) return
    setPromotions((prev) => prev.filter((p) => p.globalPromotionId !== deletingPromotion.globalPromotionId))
    setDeletingPromotion(null)
  }

  const hasServicePlan = form.servicePlanIds.length > 0
  const reachesEveryone = form.audiences.some((a) => a.type === AUDIENCE_TYPE_ALL)

  if (view !== 'list') {
    return (
      <div className="p-6">
        <nav className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <button type="button" onClick={() => setView('list')} className="hover:text-foreground">
            Promoções
          </button>
          <span>{'>'}</span>
          <span>{view === 'create' ? 'Nova promoção' : 'Editar promoção'}</span>
        </nav>
        <h1 className="mb-4 text-xl font-semibold">
          {view === 'create' ? 'Nova promoção' : 'Editar promoção'}
        </h1>

        <form onSubmit={handleSubmit} className="rounded-2xl border p-6">
          <div className="mb-4">
            <PromotionStepCard step={1} title="Nome da promoção" subtitle="Como será o nome para o público">
              <Input
                placeholder="Ex: Black Friday"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </PromotionStepCard>
          </div>

          <div className="mb-4">
            <PromotionStepCard step={2} title="Tipo da promoção" subtitle="Defina o tipo e onde ela vale">
              <div className="mb-3 inline-flex rounded-lg border p-1">
                {PROMOTION_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: opt.value as '1' | '2' }))}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      form.type === opt.value
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {form.type === '1' && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    type="number"
                    placeholder="Ex: 30"
                    value={form.minutes}
                    onChange={(e) => setForm((f) => ({ ...f, minutes: e.target.value }))}
                  />
                  <Select
                    value={form.resetType}
                    onValueChange={(v) => setForm((f) => ({ ...f, resetType: v }))}
                  >
                    <SelectTrigger aria-label="Renovação">
                      <SelectValue placeholder="Renovação" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROMOTION_RESET_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {form.type === '1' && (
                <div className="mt-3 flex items-center justify-between gap-4 rounded-2xl border p-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Mediante feedback de checkout</span>
                    <p className="text-xs text-muted-foreground">
                      Os minutos só são concedidos quando o usuário responde a pesquisa de check-out.
                    </p>
                  </div>
                  <Switch
                    aria-label="Mediante feedback de checkout"
                    checked={form.triggerOnFeedback}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, triggerOnFeedback: v }))}
                  />
                </div>
              )}

              {form.type === '2' && (
                <div className="mt-3">
                  <Input
                    type="number"
                    placeholder="Ex: 20"
                    value={form.discountPercent}
                    onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
                  />
                </div>
              )}

              <div className="mt-4 border-t pt-4">
                <p className="mb-1 text-sm font-medium">Onde a promoção vale</p>
                <p className="mb-2 text-xs text-muted-foreground">
                  Selecione os planos de valores alcançados pela promoção.
                </p>
                <div className="flex flex-col gap-2">
                  {mockServicePlans.map((plan) => {
                    const isSelected = form.servicePlanIds.includes(plan.servicePlanId)
                    return (
                      <button
                        key={plan.servicePlanId}
                        type="button"
                        role="checkbox"
                        aria-checked={isSelected}
                        aria-label={plan.label}
                        onClick={() => toggleServicePlan(plan.servicePlanId)}
                        className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                          isSelected ? 'border-primary bg-accent' : 'hover:bg-muted'
                        }`}
                      >
                        <span
                          className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                            isSelected ? 'border-primary bg-primary text-primary-foreground' : ''
                          }`}
                        >
                          {isSelected && <Check className="size-3" />}
                        </span>
                        <span className="text-sm font-medium">{plan.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </PromotionStepCard>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PromotionStepCard step={3} title="Público" subtitle="Defina o público a quem será direcionado">
              <div className="flex flex-col gap-2">
                {form.audiences.map((audience, index) => {
                  const isAll = audience.type === AUDIENCE_TYPE_ALL
                  return (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-36 shrink-0">
                        <Select
                          value={audience.type}
                          onValueChange={(v) => updateAudience(index, { type: v, value: '' })}
                        >
                          <SelectTrigger aria-label={`Tipo de público ${index + 1}`}>
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {AUDIENCE_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        {isAll ? (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Vale para todos os usuários
                          </p>
                        ) : (
                          <Input
                            placeholder="Digite o valor"
                            value={audience.value}
                            onChange={(e) => updateAudience(index, { value: e.target.value })}
                          />
                        )}
                      </div>
                      {form.audiences.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Remover público ${index + 1}`}
                          onClick={() => removeAudience(index)}
                        >
                          <X />
                        </Button>
                      )}
                    </div>
                  )
                })}

                {reachesEveryone && form.audiences.length > 1 && (
                  <p className="text-xs text-amber-700">
                    Com &quot;Todos&quot; selecionado a promoção vale para qualquer usuário; as demais
                    linhas de público serão descartadas ao salvar.
                  </p>
                )}

                <button
                  type="button"
                  onClick={addAudience}
                  className="flex w-fit items-center gap-1 text-sm font-medium hover:text-foreground"
                >
                  <Plus className="size-4" />
                  Adicionar público
                </button>
              </div>
            </PromotionStepCard>

            <PromotionStepCard step={4} title="Duração">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Início</label>
                  <Input
                    type="datetime-local"
                    aria-label="Início"
                    value={form.startsAt}
                    onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Fim (opcional)</label>
                  <Input
                    type="datetime-local"
                    aria-label="Fim (opcional)"
                    value={form.endsAt}
                    onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                  />
                </div>
              </div>
            </PromotionStepCard>
          </div>

          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border p-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Promoção ativa</span>
              {!hasServicePlan && (
                <p className="text-xs text-muted-foreground">
                  Promoção sem plano de valores não pode ficar ativa. Selecione ao menos um plano no
                  passo &quot;Tipo da promoção&quot;.
                </p>
              )}
            </div>
            <Switch
              aria-label="Promoção ativa"
              checked={form.isActive}
              disabled={!hasServicePlan}
              onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setView('list')}>
              Cancelar
            </Button>
            <Button type="submit">{view === 'edit' ? 'Salvar' : 'Cadastrar'}</Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Promoções</h1>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          {canCreate && (
            <Button onClick={openCreate}>
              <Plus />
              Adicionar promoção
            </Button>
          )}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-[160px]" aria-label="Filtrar por status">
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="inactive">Inativas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredPromotions.length === 0 ? (
        <EmptyState message="Nenhuma promoção encontrada" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPromotions.map((promotion) => {
            const detail =
              promotion.type === '2' && promotion.discountPercent != null
                ? `${promotion.discountPercent}% de desconto`
                : promotion.type === '1'
                  ? `${promotion.minutes} minutos extras`
                  : promotionTypeLabel(promotion.type)
            const cadence = promotion.resetType
              ? promotion.triggerOnFeedback
                ? `Novo ganho: ${promotionResetFrequencyLabel(promotion.resetType).replace('por', 'a cada')}`
                : `Renovação: ${promotionResetTypeLabel(promotion.resetType)}`
              : ''

            return (
              <div key={promotion.globalPromotionId} className="rounded-2xl border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={promotion.isActive ? 'ok' : 'inactive'}>
                      {promotion.isActive ? 'Ativa' : 'Inativa'}
                    </StatusBadge>
                    {promotion.isInherited && (
                      <span
                        title="Promoção da conta mãe - só pode ser editada na conta de origem"
                        className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                      >
                        Herdada
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                      {promotionTypeLabel(promotion.type)}
                    </span>
                    {!promotion.isInherited && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Editar ${promotion.name}`}
                          onClick={() => openEdit(promotion)}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Excluir ${promotion.name}`}
                          onClick={() => setDeletingPromotion(promotion)}
                        >
                          <Trash2 />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="mt-3 text-base font-semibold">{promotion.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
                {promotion.isInherited && (
                  <p className="mt-1 text-xs text-muted-foreground">Vem da conta mãe e vale nesta conta.</p>
                )}
                {promotion.servicePlans.length === 0 && (
                  <p className="mt-1 text-xs text-amber-700">
                    Sem plano de valores; edite e selecione um plano para reativar.
                  </p>
                )}
                {cadence && <p className="mt-1 text-sm text-muted-foreground">{cadence}</p>}

                {promotion.servicePlans.length > 0 && (
                  <div className="mt-3 border-t pt-3">
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">Planos de valores</p>
                    <div className="flex flex-wrap gap-1.5">
                      {promotion.servicePlans.map((plan) => (
                        <span
                          key={plan.servicePlanId}
                          className="max-w-full truncate rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {plan.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {promotion.audiences.length > 0 && promotion.audiences[0].type !== AUDIENCE_TYPE_ALL && (
                  <div className="mt-3 border-t pt-3">
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">Público</p>
                    <div className="flex flex-wrap gap-1.5">
                      {promotion.audiences.map((audience) => {
                        const label = audienceTypeLabel(audience.type)
                        const isSpecificUser = label === 'Usuário específico'
                        return (
                          <span
                            key={audience.globalPromotionAudienceId}
                            className="inline-flex max-w-full items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                          >
                            {label}: {audience.value}
                            {isSpecificUser && <ExternalLink className="size-3" />}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Início: {formatDate(promotion.startsAt)}</span>
                  <span>Fim: {formatDate(promotion.endsAt)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={!!deletingPromotion} onOpenChange={(open) => !open && setDeletingPromotion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir promoção?</DialogTitle>
            <DialogDescription>
              Nome da Promoção: <strong>{deletingPromotion?.name}</strong>
              <br />
              Tipo: <strong>{deletingPromotion ? promotionTypeLabel(deletingPromotion.type) : ''}</strong>
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
