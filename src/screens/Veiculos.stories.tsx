import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { mockVehicles, VeiculosScreen } from './Veiculos'

/**
 * Composição de tela real, contrato replicado 1:1 do código de produção
 * do hubmob-dashboard (`VehicleDto`, `Vehicles.tsx`, `VehicleFormModal.tsx`,
 * `VehicleDeleteModal.tsx`, `VehicleInfoModal.tsx`) - mesma fonte já usada
 * no card #12091. Estação/Doca/Foto ficam fixas em "-": o código nunca
 * resolve esse vínculo hoje, não é lacuna de design.
 */
const meta = {
  title: 'Screens/Veículos',
  component: VeiculosScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof VeiculosScreen>

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
    initialVehicles: [],
  },
}

/**
 * Teste de interação: cria um veículo novo pelo Drawer e confere a linha
 * nova na tabela, com o tipo certo já traduzido pelo select.
 */
export const CreateVehicle: Story = {
  args: {
    initialVehicles: mockVehicles,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('button', { name: /novo veículo/i }))

    const sheet = await body.findByRole('dialog')
    const sheetScope = within(sheet)

    await userEvent.type(sheetScope.getByPlaceholderText('Nome do veículo'), 'BF-0099')
    await userEvent.click(sheetScope.getByRole('button', { name: /adicionar/i }))

    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument())
    await expect(canvas.getByText('BF-0099')).toBeInTheDocument()
  },
}

/**
 * Teste de interação: exclui um veículo existente e confere que some.
 */
export const DeleteVehicle: Story = {
  args: {
    initialVehicles: mockVehicles,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await expect(canvas.getByText('BF-0002')).toBeInTheDocument()

    await userEvent.click(canvas.getByRole('button', { name: /excluir bf-0002/i }))

    const dialog = await body.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: /^excluir$/i }))

    await waitFor(() => expect(canvas.queryByText('BF-0002')).not.toBeInTheDocument())
  },
}

/**
 * Teste de interação: abre o info de um veículo e confere que os dados
 * reais (id/token) aparecem, não placeholder.
 */
export const ViewVehicleInfo: Story = {
  args: {
    initialVehicles: mockVehicles,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('button', { name: /info de bf-0001/i }))

    const dialog = await body.findByRole('dialog')
    await expect(within(dialog).getByText('tok_bf0001')).toBeInTheDocument()
  },
}

/**
 * Teste de interação: ferramenta avulsa de QR Code, sem veículo selecionado.
 * Botão "Gerar" fica desabilitado até digitar um texto.
 */
export const GenerateStandaloneQrCode: Story = {
  args: {
    initialVehicles: mockVehicles,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('button', { name: /gerar qr code/i }))

    const dialog = await body.findByRole('dialog')
    const dialogScope = within(dialog)
    const generateButton = dialogScope.getByRole('button', { name: /^gerar$/i })

    await expect(generateButton).toBeDisabled()

    await userEvent.type(dialogScope.getByPlaceholderText('Texto do QR Code'), 'https://bikefacil.com')
    await expect(generateButton).toBeEnabled()

    await userEvent.click(generateButton)

    await expect(dialogScope.getByTestId('qr-result')).toBeInTheDocument()
  },
}
