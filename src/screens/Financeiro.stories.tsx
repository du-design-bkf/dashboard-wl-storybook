import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { FinanceiroScreen, mockTransactions } from './Financeiro'

/**
 * Composicao de tela real, contrato replicado do `FinanceDto` do
 * hubmob-dashboard (`types/Finance.ts`, `parcers/financeParcer.ts`) - card
 * #12097. Achado 23/09: a tela real usa mock aleatorio hoje, o hook real
 * esta comentado ("pagina do financeiro sera a ultima a ser
 * disponibilizada"). Composta em cima do `FinanceDto` comentado por decisao
 * do Eduardo, sem os campos de payload cru (`requestJson`/`responseJson`) na
 * listagem - so no detalhe. Tela e somente-leitura (real so passa
 * `actions={['info']}`, sem criar/editar/excluir).
 */
const meta = {
  title: 'Screens/Financeiro',
  component: FinanceiroScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof FinanceiroScreen>

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
    initialTransactions: [],
  },
}

/**
 * Teste de interacao: filtra por codigo de autorizacao e confere que as
 * outras transacoes somem da tabela.
 */
export const FilterByAuthorizationCode: Story = {
  args: {
    initialTransactions: mockTransactions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('#8802')).toBeInTheDocument()

    await userEvent.click(canvas.getByRole('button', { name: /^filtros$/i }))
    await userEvent.type(canvas.getByPlaceholderText('Ex.: AUTH-2F8C91'), '2F8C91')
    await userEvent.click(canvas.getByRole('button', { name: /aplicar filtros/i }))

    await waitFor(() => expect(canvas.queryByText('#8802')).not.toBeInTheDocument())
    await expect(canvas.getByText('#8801')).toBeInTheDocument()
  },
}

/**
 * Teste de interacao: abre o detalhe de uma transacao negada - status,
 * valor e o payload cru do gateway (request/response) aparecem so aqui,
 * nunca na listagem.
 */
export const ViewDeniedTransactionDetails: Story = {
  args: {
    initialTransactions: mockTransactions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('button', { name: /ver detalhes da transação 8802/i }))

    const dialog = await body.findByRole('dialog')
    const dialogScope = within(dialog)

    await expect(dialogScope.getByText('Negada')).toBeInTheDocument()
    await expect(dialogScope.getByText(/insufficient_funds/)).toBeInTheDocument()
  },
}
