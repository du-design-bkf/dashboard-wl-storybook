import type { Meta, StoryObj } from '@storybook/react-vite'
import { ScrollArea } from './scroll-area'
import { Separator } from './separator'

const meta = {
  title: 'UI/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

const estacoes = Array.from({ length: 20 }, (_, i) => `Estação ${i + 1}`)

/**
 * Sem play function: o comportamento de scroll (arrastar a thumb, rolar com
 * roda do mouse) não é algo que valha a pena simular num teste headless,
 * fica pra QA visual real.
 */
export const Default: Story = {
  render: () => (
    <ScrollArea className="h-64 w-56 rounded-md border">
      <div className="p-3">
        {estacoes.map((estacao, i) => (
          <div key={estacao}>
            <p className="text-sm">{estacao}</p>
            {i < estacoes.length - 1 && <Separator className="my-2" />}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}
