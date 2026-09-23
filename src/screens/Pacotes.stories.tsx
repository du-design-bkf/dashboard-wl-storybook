import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { mockPackages, PacotesScreen } from './Pacotes'

/**
 * Composicao de tela - card #12098. Sem contrato real disponivel (rota
 * comentada no hubmob-dashboard, sem tipo nem tela - confirmado na propria
 * descricao do card: "Rota comentada no codigo, sem tela"). Base real usada:
 * print de dashboard de cliente antigo (Bike Beach) trazido pelo Eduardo
 * 23/09, estruturado em campos proprios (nome/preco/minutos/descricao) em
 * vez da string concatenada do original - aprimorar essa estrutura fica
 * pra depois, por decisao dele.
 */
const meta = {
  title: 'Screens/Pacotes',
  component: PacotesScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PacotesScreen>

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
    initialPackages: [],
  },
}

/**
 * Teste de interacao: cria um pacote novo pelo Dialog e confere o preco
 * formatado em BRL na linha nova.
 */
export const CreatePackage: Story = {
  args: {
    initialPackages: mockPackages,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('button', { name: /adicionar pacote/i }))

    const dialog = await body.findByRole('dialog')
    const dialogScope = within(dialog)

    await userEvent.type(dialogScope.getByPlaceholderText('Nome do pacote'), 'Pacote de 15 min')
    await userEvent.type(dialogScope.getByLabelText('Preço'), '9.90')
    await userEvent.type(dialogScope.getByLabelText('Minutos inclusos'), '15')

    await userEvent.click(dialogScope.getByRole('button', { name: /^adicionar$/i }))

    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument())
    await expect(canvas.getByText('Pacote de 15 min')).toBeInTheDocument()
    await expect(canvas.getByText('R$ 9,90')).toBeInTheDocument()
  },
}

/**
 * Teste de interacao: edita um pacote existente - Dialog vem pre-preenchido
 * e a alteracao reflete na tabela.
 */
export const EditPackage: Story = {
  args: {
    initialPackages: mockPackages,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('button', { name: /editar pacote de 30 min/i }))

    const dialog = await body.findByRole('dialog')
    const dialogScope = within(dialog)

    await expect(dialogScope.getByDisplayValue('Pacote de 30 min')).toBeInTheDocument()

    await userEvent.clear(dialogScope.getByLabelText('Preço'))
    await userEvent.type(dialogScope.getByLabelText('Preço'), '18.00')
    await userEvent.click(dialogScope.getByRole('button', { name: /^salvar$/i }))

    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument())
    await expect(canvas.getByText('R$ 18,00')).toBeInTheDocument()
  },
}

/**
 * Teste de interacao: exclui um pacote existente e confere que some.
 */
export const DeletePackage: Story = {
  args: {
    initialPackages: mockPackages,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await expect(canvas.getByText('Pacote de 180 minutos')).toBeInTheDocument()

    await userEvent.click(canvas.getByRole('button', { name: /excluir pacote de 180 minutos/i }))

    const dialog = await body.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: /^excluir$/i }))

    await waitFor(() => expect(canvas.queryByText('Pacote de 180 minutos')).not.toBeInTheDocument())
  },
}
