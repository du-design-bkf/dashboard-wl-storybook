import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Input } from './input'

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number'],
    },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Buscar estação...',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Buscar estação...',
    disabled: true,
  },
}

/**
 * Teste de interação: digita de verdade (userEvent.type simula tecla a
 * tecla) e confere que o valor do input reflete o que foi digitado.
 */
export const Typing: Story = {
  args: {
    placeholder: 'Buscar estação...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText('Buscar estação...')

    await userEvent.type(input, 'Ibirapuera')

    await expect(input).toHaveValue('Ibirapuera')
  },
}
