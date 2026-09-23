import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { HistoricoDeLogsScreen, mockLogs } from './HistoricoDeLogs'

/**
 * Composicao de tela real, contrato replicado 1:1 do codigo de producao do
 * hubmob-dashboard (`LogDto`, `Logs.tsx`, `LogTable.tsx`, `LogFilters.tsx`,
 * `LogBadges.tsx`, `LogDetail.tsx`) - card #12099. Unica tela desta leva sem
 * mock nem rota comentada: dado real e vivo. Detalhe troca a "view" do
 * componente em vez de modal, igual ao card #12096 (a tela real navega pra
 * pagina propria `/logs/:id`).
 */
const meta = {
  title: 'Screens/Histórico de Logs',
  component: HistoricoDeLogsScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HistoricoDeLogsScreen>

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
    initialLogs: [],
  },
}

/**
 * Teste de interacao: filtra por Tipo=Error e confere que so o log de erro
 * sobra na tabela.
 */
export const FilterByType: Story = {
  args: {
    initialLogs: mockLogs,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await expect(canvas.getByText('Veículo')).toBeInTheDocument()

    await userEvent.click(canvas.getByRole('button', { name: /^filtros$/i }))
    await userEvent.click(canvas.getByRole('combobox', { name: 'Tipo' }))
    await userEvent.click(await body.findByRole('option', { name: 'Error' }))
    await userEvent.click(canvas.getByRole('button', { name: /^filtrar$/i }))

    await waitFor(() => expect(canvas.queryByText('Veículo')).not.toBeInTheDocument())
    await expect(canvas.getAllByText('Dispositivo').length).toBeGreaterThan(0)
  },
}

/**
 * Teste de interacao: log de auditoria (Update) mostra o diff - campo
 * alterado riscado no "antes" e o unico campo sem mudanca aparece na
 * secao separada.
 */
export const ViewAuditLogDiff: Story = {
  args: {
    initialLogs: mockLogs,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: /ver detalhes do log 4201/i }))

    await expect(canvas.getByText('Log de auditoria #4201')).toBeInTheDocument()
    await expect(canvas.getByText('Campos Alterados')).toBeInTheDocument()
    await expect(canvas.getByText('stationStatus')).toBeInTheDocument()
    await expect(canvas.getByText('Campos sem alteração')).toBeInTheDocument()
    await expect(canvas.getByText('stationName')).toBeInTheDocument()
  },
}

/**
 * Teste de interacao: log de Create (so afterJson, sem beforeJson) nao tem
 * diff nenhum - mostra "Nenhum campo alterado" mesmo sem ser erro.
 */
export const CreateLogHasNoDiff: Story = {
  args: {
    initialLogs: mockLogs,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: /ver detalhes do log 4202/i }))

    await expect(canvas.getByText('Nenhum campo alterado.')).toBeInTheDocument()
    await expect(canvas.queryByText('Campos sem alteração')).not.toBeInTheDocument()
  },
}

/**
 * Teste de interacao: log tipo Error pula o diff inteiro - mostra Status
 * Code, Message e o stack trace (detail), nunca Campos Alterados.
 */
export const ViewErrorLogDetail: Story = {
  args: {
    initialLogs: mockLogs,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: /ver detalhes do log 4204/i }))

    await expect(canvas.getByText('500')).toBeInTheDocument()
    await expect(canvas.getByText(/conexão com o banco recusada/)).toBeInTheDocument()
    await expect(canvas.getByText(/SqlException/)).toBeInTheDocument()
    await expect(canvas.queryByText('Campos Alterados')).not.toBeInTheDocument()

    await userEvent.click(canvas.getByRole('button', { name: /histórico de logs/i }))
    await expect(canvas.getByText('Histórico de Logs')).toBeInTheDocument()
  },
}
