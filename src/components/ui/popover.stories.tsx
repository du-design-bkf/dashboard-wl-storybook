import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

const meta = {
  title: 'UI/Popover',
  component: Popover,
  tags: ['autodocs'],
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

function FilterPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Filtros</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-sm font-medium">Filtrar estações</p>
        <p className="text-sm text-muted-foreground">
          Só operacionais, sem chamados abertos.
        </p>
      </PopoverContent>
    </Popover>
  )
}

export const Default: Story = {
  render: () => <FilterPopover />,
}

/**
 * Teste de interação: abre pelo trigger, confere o conteúdo real (portal no
 * body), fecha pressionando Escape e confere que sumiu.
 */
export const OpenAndCloseWithEscape: Story = {
  render: () => <FilterPopover />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('button', { name: /filtros/i }))

    await expect(await body.findByText('Filtrar estações')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')

    await waitFor(() =>
      expect(body.queryByText('Filtrar estações')).not.toBeInTheDocument()
    )
  },
}
