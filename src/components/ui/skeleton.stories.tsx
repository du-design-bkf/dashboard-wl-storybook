import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton } from './skeleton'

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Puramente presentacional (placeholder de loading), sem estado pra testar.
 */
export const Default: Story = {
  render: () => <Skeleton className="h-4 w-48" />,
}

export const CardLoading: Story = {
  render: () => (
    <div className="w-72 space-y-3 rounded-xl border p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-24 w-full" />
    </div>
  ),
}
