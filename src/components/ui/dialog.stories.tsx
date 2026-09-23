import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Button } from './button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

function ConfirmDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Remover estação</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remover estação?</DialogTitle>
          <DialogDescription>
            Essa ação não pode ser desfeita. A estação sai da listagem
            imediatamente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button variant="destructive">Remover</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const Default: Story = {
  render: () => <ConfirmDialog />,
}

/**
 * Teste de interação: abre pelo trigger, confere o conteúdo real do modal
 * (não só que "algo" apareceu), fecha pelo Cancelar e confere que sumiu.
 */
export const OpenAndClose: Story = {
  render: () => <ConfirmDialog />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('button', { name: /remover estação/i }))

    const dialog = await body.findByRole('dialog')
    await expect(within(dialog).getByText('Remover estação?')).toBeInTheDocument()

    await userEvent.click(within(dialog).getByRole('button', { name: /cancelar/i }))

    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument())
  },
}
