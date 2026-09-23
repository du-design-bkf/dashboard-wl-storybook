import type { Meta, StoryObj } from '@storybook/react-vite'
import { toast } from 'sonner'
import { expect, userEvent, within } from 'storybook/test'
import { Button } from './button'
import { Toaster } from './sonner'

const meta = {
  title: 'UI/Toast (Sonner)',
  component: Toaster,
  tags: ['autodocs'],
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

function ToastDemo() {
  return (
    <>
      <Toaster />
      <Button onClick={() => toast.success('Estação salva com sucesso')}>
        Salvar estação
      </Button>
    </>
  )
}

export const Default: Story = {
  render: () => <ToastDemo />,
}

/**
 * Teste de interação: clica no botão real, dispara o toast via API do
 * sonner (`toast.success`) e confere que o texto aparece no portal.
 */
export const ShowsToastOnAction: Story = {
  render: () => <ToastDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('button', { name: /salvar estação/i }))

    await expect(
      await body.findByText('Estação salva com sucesso')
    ).toBeInTheDocument()
  },
}
