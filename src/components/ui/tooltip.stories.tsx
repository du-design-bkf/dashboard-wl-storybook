import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Button } from './button'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

/**
 * `TooltipProvider` já está no decorator global (`.storybook/preview.tsx`),
 * então as stories daqui não precisam declarar o provider de novo.
 */
const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

function HoverExample() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Estação</Button>
      </TooltipTrigger>
      <TooltipContent>Parque Ibirapuera, 12 bicicletas</TooltipContent>
    </Tooltip>
  )
}

export const Default: Story = {
  render: () => <HoverExample />,
}

/**
 * Teste de interação: passa o mouse de verdade sobre o trigger e confere
 * que o conteúdo do tooltip aparece no body (portal), com o texto certo.
 */
export const HoverShowsContent: Story = {
  render: () => <HoverExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.hover(canvas.getByRole('button', { name: /estação/i }))

    const tooltip = await body.findByRole('tooltip')
    await expect(tooltip).toHaveTextContent('Parque Ibirapuera, 12 bicicletas')
  },
}
