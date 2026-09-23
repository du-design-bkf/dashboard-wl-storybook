import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ConfiguracoesScreen, mockPolicyRules } from './Configuracoes'

/**
 * Composicao de tela - card #12100. Sem front existente pra replicar (mais
 * cru que Pacotes: nem mock, nem rota comentada). Contrato vem do
 * `ENTIDADES.md` real (fonte da API, fora do vault) - as 2 unicas entidades
 * ligadas a Configuracoes: `UsageGlobalPolicy` (limite global de usos
 * simultaneos) e `UsagePolicyPerType` (override por tipo de veiculo e/ou
 * equipamento, os 2 campos opcionais). Escopo fechado nessas 2 entidades,
 * sem inventar preferencia de app/tema fora do contrato real.
 */
const meta = {
  title: 'Screens/Configurações',
  component: ConfiguracoesScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ConfiguracoesScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const Empty: Story = {
  args: {
    initialRules: [],
  },
}

/**
 * Teste de interacao: salva a politica global e confere a confirmacao com
 * o valor novo.
 */
export const SaveGlobalPolicy: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const input = canvas.getByLabelText('Máximo de usos simultâneos', { selector: 'input' })
    await userEvent.clear(input)
    await userEvent.type(input, '200')

    const form = input.closest('form')!
    await userEvent.click(within(form).getByRole('button', { name: /^salvar$/i }))

    await expect(canvas.getByText('Salvo: 200 usos simultâneos.')).toBeInTheDocument()
  },
}

/**
 * Teste de interacao: cria uma regra so com tipo de equipamento (sem tipo
 * de veiculo) - confere que "Nenhum (todos)" aparece na coluna de veiculo.
 */
export const CreateDeviceOnlyRule: Story = {
  args: {
    initialRules: mockPolicyRules,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('button', { name: /adicionar regra/i }))

    const dialog = await body.findByRole('dialog')
    const dialogScope = within(dialog)

    await userEvent.click(dialogScope.getByRole('combobox', { name: 'Tipo de equipamento' }))
    await userEvent.click(await body.findByRole('option', { name: 'Doca' }))

    await userEvent.type(dialogScope.getByLabelText('Máximo de usos simultâneos'), '50')
    await userEvent.click(dialogScope.getByRole('button', { name: /^adicionar$/i }))

    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument())

    const row = canvas.getByText('50').closest('tr')!
    await expect(within(row).getByText('Todos')).toBeInTheDocument()
    await expect(within(row).getByText('Doca')).toBeInTheDocument()
  },
}

/**
 * Teste de interacao: edita uma regra existente - Dialog vem pre-preenchido
 * e a alteracao reflete na tabela.
 */
export const EditRule: Story = {
  args: {
    initialRules: mockPolicyRules,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('button', { name: /editar regra 1/i }))

    const dialog = await body.findByRole('dialog')
    const dialogScope = within(dialog)

    const maxInput = dialogScope.getByLabelText('Máximo de usos simultâneos')
    await expect(maxInput).toHaveValue(40)

    await userEvent.clear(maxInput)
    await userEvent.type(maxInput, '60')
    await userEvent.click(dialogScope.getByRole('button', { name: /^salvar$/i }))

    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument())
    await expect(canvas.getByText('60')).toBeInTheDocument()
  },
}

/**
 * Teste de interacao: exclui uma regra existente e confere que some.
 */
export const DeleteRule: Story = {
  args: {
    initialRules: mockPolicyRules,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('button', { name: /excluir regra 2/i }))

    const dialog = await body.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: /^excluir$/i }))

    await waitFor(() => expect(canvas.queryByRole('button', { name: /editar regra 2/i })).not.toBeInTheDocument())
  },
}
