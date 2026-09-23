import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { EstacoesScreen, mockStations } from './Estacoes'

/**
 * Composição de tela real, não é primitivo de UI. Contrato de dados,
 * colunas, ações e regras de papel (Operator cria, Admin edita/exclui)
 * replicados 1:1 do código de produção (`hubmob-dashboard/src/pages/Stations.tsx`
 * + `StationTable.tsx` + `CreateMenu.tsx`), não inventados. "Doca" não é
 * entidade própria: são os contadores de Dispositivo vinculados à estação.
 *
 * Não existe section confiável de "Estações" no Figma pra clonar visualmente
 * (node antigo 87:3448 foi dissolvido, card #12147 fechado por
 * formalização retroativa sem produção real) - esta tela usa como
 * referência de shell os módulos irmãos que têm Figma real (Veículos e
 * Dispositivos, cards #12091 e #12092): mesma casca de listagem, Drawer e
 * modal de confirmação.
 */
const meta = {
  title: 'Screens/Estações',
  component: EstacoesScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof EstacoesScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    role: 'Admin',
  },
}

export const OperatorRole: Story = {
  args: {
    role: 'Operator',
  },
  name: 'Papel Operator (sem editar/câmera/excluir)',
}

export const Loading: Story = {
  args: {
    loading: true,
  },
}

export const Empty: Story = {
  args: {
    initialStations: [],
  },
}

/**
 * Teste de interação: abre o Drawer de "Adicionar Estação", preenche os
 * campos obrigatórios, salva, confere que a nova linha aparece na tabela.
 */
export const CreateStation: Story = {
  args: {
    role: 'Admin',
    initialStations: mockStations,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('button', { name: /adicionar estação/i }))

    const sheet = await body.findByRole('dialog')
    const sheetScope = within(sheet)

    await userEvent.type(sheetScope.getByPlaceholderText('Nome da estação'), 'Moema')
    await userEvent.type(sheetScope.getByPlaceholderText('Rua'), 'Av. Ibirapuera')
    await userEvent.type(sheetScope.getByPlaceholderText('Número'), '1000')
    await userEvent.type(sheetScope.getByPlaceholderText('Bairro'), 'Moema')
    await userEvent.type(sheetScope.getByPlaceholderText('CEP'), '04029-000')
    await userEvent.type(sheetScope.getByPlaceholderText('Cidade'), 'São Paulo')
    await userEvent.type(sheetScope.getByPlaceholderText('Estado'), 'SP')
    await userEvent.type(sheetScope.getByPlaceholderText('País'), 'Brasil')

    await userEvent.click(sheetScope.getByRole('button', { name: /adicionar/i }))

    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument())
    await expect(canvas.getByText('Moema')).toBeInTheDocument()
  },
}

/**
 * Teste de interação: exclui uma estação existente e confere que a linha
 * some da tabela.
 */
export const DeleteStation: Story = {
  args: {
    role: 'Admin',
    initialStations: mockStations,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await expect(canvas.getByText('Pinheiros')).toBeInTheDocument()

    await userEvent.click(canvas.getByRole('button', { name: /excluir pinheiros/i }))

    const dialog = await body.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: /^excluir$/i }))

    await waitFor(() => expect(canvas.queryByText('Pinheiros')).not.toBeInTheDocument())
  },
}
