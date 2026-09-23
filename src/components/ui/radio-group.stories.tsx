import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { RadioGroup, RadioGroupItem } from './radio-group'

const meta = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

function StatusRadioGroup() {
  return (
    <RadioGroup defaultValue="operacional">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="operacional" id="operacional" />
        <label htmlFor="operacional" className="text-sm">
          Operacional
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="manutencao" id="manutencao" />
        <label htmlFor="manutencao" className="text-sm">
          Manutenção
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="inativa" id="inativa" />
        <label htmlFor="inativa" className="text-sm">
          Inativa
        </label>
      </div>
    </RadioGroup>
  )
}

export const Default: Story = {
  render: () => <StatusRadioGroup />,
}

/**
 * Teste de interação: clica numa opção diferente da padrão e confere que
 * ela vira a única marcada (comportamento de grupo, não só do item clicado).
 */
export const SelectDifferentOption: Story = {
  render: () => <StatusRadioGroup />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const operacional = canvas.getByRole('radio', { name: /operacional/i })
    const manutencao = canvas.getByRole('radio', { name: /manutenção/i })

    await expect(operacional).toBeChecked()
    await expect(manutencao).not.toBeChecked()

    await userEvent.click(manutencao)

    await expect(manutencao).toBeChecked()
    await expect(operacional).not.toBeChecked()
  },
}
