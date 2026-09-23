import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Button } from './button'
import { EmptyState } from './empty-state'

/**
 * Não vem do catálogo do shadcn: componente próprio do DS, mesmo padrão já
 * usado em produção no `hubmob-dashboard` (ícone + mensagem, tokens do
 * dashboard-wl-storybook). Card DevOps de referência: #12106.
 */
const meta = {
  title: 'UI/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const CustomMessage: Story = {
  args: {
    message: 'Nenhuma estação encontrada com esse filtro',
  },
}

export const WithAction: Story = {
  args: {
    message: 'Nenhuma estação cadastrada ainda',
    action: <Button size="sm">Cadastrar estação</Button>,
  },
}

/**
 * Confere que a mensagem custom realmente substitui a default (render de
 * conteúdo dinâmico, não interação de usuário).
 */
export const RendersCustomMessage: Story = {
  args: {
    message: 'Nenhuma estação encontrada com esse filtro',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(
      canvas.getByText('Nenhuma estação encontrada com esse filtro')
    ).toBeInTheDocument()
  },
}
