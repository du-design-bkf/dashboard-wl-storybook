import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { mockPromotions, PromocoesScreen } from './Promocoes'

/**
 * Composicao de tela real, contrato replicado 1:1 do codigo de producao do
 * hubmob-dashboard (`PromotionDto`, `Promotions.tsx`, `PromotionCard.tsx`,
 * `PromotionForm.tsx`, `PromotionTypeStep.tsx`, `PromotionAudienceStep.tsx`,
 * `PromotionServicePlanSelect.tsx`) - card #12096 (portar Promocoes do
 * Hubmob #11731 pro Dashboard White-Label). Criar/editar troca a "view" do
 * componente (list/form), replicando a navegacao de pagina real em vez de
 * forcar num modal.
 */
const meta = {
  title: 'Screens/Promoções',
  component: PromocoesScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PromocoesScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const Loading: Story = {
  args: {
    loading: true,
  },
}

export const Empty: Story = {
  args: {
    initialPromotions: [],
  },
}

export const OperatorRole: Story = {
  args: {
    role: 'Operator',
  },
}

/**
 * Teste de interacao: filtra por Ativas e confere que a promocao inativa
 * some da grade.
 */
export const FilterByStatus: Story = {
  args: {
    initialPromotions: mockPromotions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await expect(canvas.getByText('Piloto IFPR')).toBeInTheDocument()

    await userEvent.click(canvas.getByRole('combobox', { name: /filtrar por status/i }))
    await userEvent.click(await body.findByRole('option', { name: 'Ativas' }))

    await waitFor(() => expect(canvas.queryByText('Piloto IFPR')).not.toBeInTheDocument())
    await expect(canvas.getByText('Black Friday')).toBeInTheDocument()
  },
}

/**
 * Teste de interacao: promocao herdada (isInherited) nao mostra editar nem
 * excluir - so a promocao propria mostra.
 */
export const InheritedPromotionHasNoActions: Story = {
  args: {
    initialPromotions: mockPromotions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('Colaborador Bike Fácil')).toBeInTheDocument()
    await expect(canvas.queryByRole('button', { name: /editar colaborador bike fácil/i })).not.toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: /editar black friday/i })).toBeInTheDocument()
  },
}

/**
 * Teste de interacao: cria uma promocao de desconto nova - nome, percentual,
 * plano de valores e periodo - e confere que aparece na grade.
 */
export const CreateDiscountPromotion: Story = {
  args: {
    initialPromotions: mockPromotions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: /adicionar promoção/i }))

    await userEvent.type(canvas.getByPlaceholderText('Ex: Black Friday'), 'Volta às aulas')
    await userEvent.type(canvas.getByPlaceholderText('Ex: 20'), '15')
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Bicicleta convencional' }))

    await userEvent.type(canvas.getByLabelText('Início'), '2026-10-01T00:00')

    await userEvent.click(canvas.getByRole('button', { name: /^cadastrar$/i }))

    await waitFor(() => expect(canvas.getByText('Promoções')).toBeInTheDocument())
    await expect(canvas.getByText('Volta às aulas')).toBeInTheDocument()
    await expect(canvas.getByText('15% de desconto')).toBeInTheDocument()
  },
}

/**
 * Teste de interacao: toggle "Promocao ativa" fica desabilitado ate
 * selecionar ao menos 1 plano de valores.
 */
export const ActiveToggleRequiresServicePlan: Story = {
  args: {
    initialPromotions: mockPromotions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: /adicionar promoção/i }))

    const activeSwitch = canvas.getByRole('switch', { name: /promoção ativa/i })
    await expect(activeSwitch).toBeDisabled()

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Patinete elétrico' }))
    await expect(activeSwitch).toBeEnabled()
  },
}

/**
 * Teste de interacao: exclui uma promocao existente e confere que some da
 * grade.
 */
export const DeletePromotion: Story = {
  args: {
    initialPromotions: mockPromotions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await expect(canvas.getByText('Bônus de pesquisa')).toBeInTheDocument()

    await userEvent.click(canvas.getByRole('button', { name: /excluir bônus de pesquisa/i }))

    const dialog = await body.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: /^excluir$/i }))

    await waitFor(() => expect(canvas.queryByText('Bônus de pesquisa')).not.toBeInTheDocument())
  },
}
