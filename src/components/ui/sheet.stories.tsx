import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Button } from './button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet'

const meta = {
  title: 'UI/Sheet',
  component: Sheet,
  tags: ['autodocs'],
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

function EditStationSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Editar estação</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar estação</SheetTitle>
          <SheetDescription>
            Ajuste os dados da estação Parque Ibirapuera.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancelar</Button>
          </SheetClose>
          <Button>Salvar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export const Default: Story = {
  render: () => <EditStationSheet />,
}

/**
 * Mesmo padrão do Dialog: abre pelo trigger, confere o conteúdo real do
 * painel (portal no body), fecha pelo Cancelar e confere que sumiu.
 */
export const OpenAndClose: Story = {
  render: () => <EditStationSheet />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('button', { name: /editar estação/i }))

    const sheet = await body.findByRole('dialog')
    await expect(within(sheet).getByText('Editar estação')).toBeInTheDocument()

    await userEvent.click(within(sheet).getByRole('button', { name: /cancelar/i }))

    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument())
  },
}
