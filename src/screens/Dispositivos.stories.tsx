import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { DispositivosScreen, mockDevices } from './Dispositivos'

/**
 * Composicao de tela real, contrato replicado 1:1 do codigo de producao do
 * hubmob-dashboard (`DeviceDto`, `Devices.tsx`, `DeviceTable.tsx`,
 * `DeviceFilters.tsx`, `EditDeviceModal.tsx`, `LiberateDeviceModal.tsx`,
 * `DeviceTokenModal.tsx`) - mesma fonte ja usada no card #12092.
 */
const meta = {
  title: 'Screens/Dispositivos',
  component: DispositivosScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DispositivosScreen>

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
    initialDevices: [],
  },
}

export const OperatorRole: Story = {
  args: {
    role: 'Operator',
  },
}

export const SupportRole: Story = {
  args: {
    role: 'Support',
  },
}

/**
 * Teste de interacao: filtra por tipo Locker e confere que as docas somem
 * da tabela.
 */
export const FilterByType: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('DOCK-01')).toBeInTheDocument()

    await userEvent.click(canvas.getByRole('button', { name: /^filtros$/i }))
    await userEvent.click(canvas.getByRole('combobox', { name: /tipo do dispositivo/i }))

    const listbox = await within(canvasElement.ownerDocument.body).findByRole('listbox')
    await userEvent.click(within(listbox).getByText('Locker'))

    await userEvent.click(canvas.getByRole('button', { name: /aplicar filtros/i }))

    await waitFor(() => expect(canvas.queryByText('DOCK-01')).not.toBeInTheDocument())
    await expect(canvas.getByText('LOCKER-01')).toBeInTheDocument()
  },
}

/**
 * Teste de interacao: libera uma doca para manutencao - botao fica
 * desabilitado ate a justificativa ser preenchida.
 */
export const ReleaseForMaintenance: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('button', { name: /liberar dock-01/i }))

    const dialog = await body.findByRole('dialog')
    const dialogScope = within(dialog)
    const releaseButton = dialogScope.getByRole('button', { name: /^liberar$/i })

    await expect(releaseButton).toBeDisabled()

    await userEvent.type(
      dialogScope.getByPlaceholderText(/pneu furado/i),
      'Pneu furado, recolher para oficina.'
    )
    await expect(releaseButton).toBeEnabled()

    await userEvent.click(releaseButton)

    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument())
    await expect(within(canvas.getByText('DOCK-01').closest('tr')!).getByText('Manutenção')).toBeInTheDocument()
  },
}

/**
 * Teste de interacao: mostra o token do locker com QR, so existe pra
 * dispositivo tipo Locker.
 */
export const ShowLockerToken: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('button', { name: /token de locker-01/i }))

    const dialog = await body.findByRole('dialog')
    await expect(within(dialog).getByText('tok_locker01')).toBeInTheDocument()
  },
}

/**
 * Teste de interacao: cadastra um dispositivo novo pelo Dialog e confere a
 * linha nova na tabela.
 */
export const CreateDevice: Story = {
  args: {
    initialDevices: mockDevices,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('button', { name: /adicionar dispositivo/i }))

    const dialog = await body.findByRole('dialog')
    const dialogScope = within(dialog)

    await userEvent.type(dialogScope.getByPlaceholderText('Ex: Sensor-Alpha'), 'DOCK-99')

    await userEvent.click(dialogScope.getByRole('combobox', { name: /tipo do dispositivo/i }))
    await userEvent.click(await body.findByRole('option', { name: 'Doca' }))

    await userEvent.click(dialogScope.getByRole('combobox', { name: /estação vinculada/i }))
    await userEvent.click(await body.findByRole('option', { name: 'Parque Ibirapuera' }))

    await userEvent.click(dialogScope.getByRole('button', { name: /^salvar$/i }))

    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument())
    await expect(canvas.getByText('DOCK-99')).toBeInTheDocument()
  },
}

/**
 * Teste de interacao: exclui um dispositivo existente e confere que some.
 */
export const DeleteDevice: Story = {
  args: {
    initialDevices: mockDevices,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await expect(canvas.getByText('DOCK-03')).toBeInTheDocument()

    await userEvent.click(canvas.getByRole('button', { name: /excluir dock-03/i }))

    const dialog = await body.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: /^excluir$/i }))

    await waitFor(() => expect(canvas.queryByText('DOCK-03')).not.toBeInTheDocument())
  },
}
