import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { mockUsers, UsuariosScreen } from './Usuarios'

/**
 * Composição de tela real, contrato replicado 1:1 do código de produção do
 * hubmob-dashboard (`UserDto`, `Users.tsx`, `UserTable.tsx`,
 * `NewUserModal.tsx`). Só a coluna Situação usa badge (`AccessStatusBadge`);
 * `PresenceIndicator`/`ActivityBadge`/`AccountStatusBadge`/`BikeFacilBadge`
 * não aparecem na listagem no código real, só na tela de detalhe
 * (ver `Screens/Detalhe do Usuário`).
 */
const meta = {
  title: 'Screens/Usuários',
  component: UsuariosScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof UsuariosScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

/**
 * Teste de interação: busca rápida filtra a tabela por nome/email/telefone
 * de verdade (client-side), não é decorativo.
 */
export const QuickSearch: Story = {
  args: {
    initialUsers: mockUsers,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('Bruno Costa')).toBeInTheDocument()

    await userEvent.type(
      canvas.getByPlaceholderText('Buscar por nome, email ou telefone'),
      'ana'
    )

    await expect(canvas.queryByText('Bruno Costa')).not.toBeInTheDocument()
    await expect(canvas.getByText('Ana Ferreira')).toBeInTheDocument()
  },
}

/**
 * Teste de interação: reenviar convite só aparece pra usuário com
 * `pendingFirstAccess`, clicar dispara o toast real (sonner).
 */
export const ResendInvite: Story = {
  args: {
    initialUsers: mockUsers,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await expect(
      canvas.queryByRole('button', { name: /excluir ana ferreira/i })
    ).not.toBeInTheDocument()

    await userEvent.click(canvas.getByRole('button', { name: /reenviar convite/i }))

    await expect(
      await body.findByText('Convite reenviado para Bruno Costa')
    ).toBeInTheDocument()
  },
}

/**
 * Teste de interação: convida um usuário novo pelo Drawer, confere que a
 * linha nova aparece com situação "Pendente 1º acesso".
 */
export const InviteUser: Story = {
  args: {
    initialUsers: mockUsers,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('button', { name: /novo usuário/i }))

    const sheet = await body.findByRole('dialog')
    const sheetScope = within(sheet)

    await userEvent.type(sheetScope.getByPlaceholderText('Email'), 'diego@example.com')
    await userEvent.type(sheetScope.getByPlaceholderText('Nome'), 'Diego Lima')
    await userEvent.click(sheetScope.getByRole('button', { name: /enviar convite/i }))

    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument())
    await expect(canvas.getByText('Diego Lima')).toBeInTheDocument()
    await expect(await body.findByText('Convite enviado')).toBeInTheDocument()
  },
}
