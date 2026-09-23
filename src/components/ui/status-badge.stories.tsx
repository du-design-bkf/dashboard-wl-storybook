import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatusBadge } from './status-badge'

/**
 * Não vem do catálogo do shadcn: componente próprio do DS do dashboard,
 * mesmos tokens de cor (`status-ok`/`busy`/`critical`/`inactive`, par
 * ink+soft) já usados em produção no `hubmob-dashboard`. Card DevOps de
 * referência: #12102 ("Parear StatusBadge com código").
 */
const meta = {
  title: 'UI/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['ok', 'busy', 'critical', 'inactive'],
    },
  },
} satisfies Meta<typeof StatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Ok: Story = {
  args: { status: 'ok', children: 'Operacional' },
}

export const Busy: Story = {
  args: { status: 'busy', children: 'Ocupado' },
}

export const Critical: Story = {
  args: { status: 'critical', children: 'Expirado' },
}

export const Inactive: Story = {
  args: { status: 'inactive', children: 'Inativo' },
}

export const AllStatuses: Story = {
  args: { status: 'ok' },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status="ok">Operacional</StatusBadge>
      <StatusBadge status="busy">Ocupado</StatusBadge>
      <StatusBadge status="critical">Expirado</StatusBadge>
      <StatusBadge status="inactive">Inativo</StatusBadge>
    </div>
  ),
}
