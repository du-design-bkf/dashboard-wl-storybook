import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

const meta = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

function StatusSelect() {
  return (
    <Select defaultValue="operacional">
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="operacional">Operacional</SelectItem>
        <SelectItem value="manutencao">Manutenção</SelectItem>
        <SelectItem value="inativa">Inativa</SelectItem>
      </SelectContent>
    </Select>
  )
}

export const Default: Story = {
  render: () => <StatusSelect />,
}

/**
 * Teste de interação: abre o select, escolhe uma opção diferente da atual e
 * confere que o trigger passa a mostrar o valor escolhido.
 */
export const SelectOption: Story = {
  render: () => <StatusSelect />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('combobox'))

    const option = await body.findByRole('option', { name: 'Manutenção' })
    await userEvent.click(option)

    await expect(canvas.getByRole('combobox')).toHaveTextContent('Manutenção')
  },
}
