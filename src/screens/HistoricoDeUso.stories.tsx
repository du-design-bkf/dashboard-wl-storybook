import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { HistoricoDeUsoScreen, mockTrips } from './HistoricoDeUso'

/**
 * Composicao de tela real, contrato replicado 1:1 do codigo de producao do
 * hubmob-dashboard (`TripDto`, `RideDetailDto`, `History.tsx`,
 * `HistoryTable.tsx`, `HistoryFilters.tsx`, `RideDetailModal.tsx`) - card
 * #12095. Aba "Trajeto" do modal real depende de mapa ao vivo (GPS via
 * SignalR), fora de escopo aqui - mantida como placeholder explicito.
 */
const meta = {
  title: 'Screens/Histórico de Uso',
  component: HistoricoDeUsoScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HistoricoDeUsoScreen>

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
    initialTrips: [],
  },
}

/**
 * Teste de interacao: filtra por nome de usuario e confere que as outras
 * corridas somem da tabela.
 */
export const FilterByUser: Story = {
  args: {
    initialTrips: mockTrips,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('João Pereira')).toBeInTheDocument()

    await userEvent.click(canvas.getByRole('button', { name: /^filtros$/i }))
    await userEvent.type(canvas.getByPlaceholderText('Buscar por usuário'), 'Maria')
    await userEvent.click(canvas.getByRole('button', { name: /aplicar filtros/i }))

    await waitFor(() => expect(canvas.queryByText('João Pereira')).not.toBeInTheDocument())
    await expect(canvas.getByText('Maria Silva')).toBeInTheDocument()
  },
}

/**
 * Teste de interacao: abre os detalhes de uma corrida concluida - entra
 * direto na aba Detalhes e mostra o custo da corrida.
 */
export const ViewCompletedRideDetails: Story = {
  args: {
    initialTrips: mockTrips,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('button', { name: /ver detalhes da corrida de maria silva/i }))

    const dialog = await body.findByRole('dialog')
    const dialogScope = within(dialog)

    await expect(dialogScope.getByRole('tab', { name: 'Detalhes', selected: true })).toBeInTheDocument()
    await expect(dialogScope.getByText('Custo da corrida')).toBeInTheDocument()
    await expect(dialogScope.getByText('R$ 7,05')).toBeInTheDocument()
  },
}

/**
 * Teste de interacao: corrida em andamento abre direto na aba Trajeto
 * (mesmo comportamento do RideDetailModal real).
 */
export const InProgressRideOpensRouteTab: Story = {
  args: {
    initialTrips: mockTrips,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('button', { name: /ver detalhes da corrida de joão pereira/i }))

    const dialog = await body.findByRole('dialog')
    const dialogScope = within(dialog)

    await expect(dialogScope.getByRole('tab', { name: 'Trajeto', selected: true })).toBeInTheDocument()
    await expect(dialogScope.getByTestId('route-placeholder')).toBeInTheDocument()

    await userEvent.click(dialogScope.getByRole('tab', { name: 'Detalhes' }))
    await expect(dialogScope.getByText('Em andamento')).toBeInTheDocument()
  },
}
