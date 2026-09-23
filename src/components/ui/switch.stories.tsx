import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Switch } from './switch'

const meta = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: {
    disabled: false,
  },
  argTypes: {
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

/**
 * Teste de interação: clica de verdade e confere que o estado (aria-checked,
 * que reflete `data-checked`/`data-unchecked` do Radix) alterna.
 */
export const Toggle: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const toggle = canvas.getByRole('switch')

    await expect(toggle).toHaveAttribute('aria-checked', 'false')

    await userEvent.click(toggle)
    await expect(toggle).toHaveAttribute('aria-checked', 'true')

    await userEvent.click(toggle)
    await expect(toggle).toHaveAttribute('aria-checked', 'false')
  },
}
