import type { Meta, StoryObj } from '@storybook/react-vite'
import { Separator } from './separator'

const meta = {
  title: 'UI/Separator',
  component: Separator,
  tags: ['autodocs'],
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Puramente presentacional, sem estado pra testar. Autodocs + os dois
 * orientations bastam.
 */
export const Horizontal: Story = {
  render: () => (
    <div className="w-64">
      <p className="text-sm">Estações</p>
      <Separator className="my-2" />
      <p className="text-sm">Veículos</p>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-3">
      <span className="text-sm">Visão geral</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Estações</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Usuários</span>
    </div>
  ),
}
