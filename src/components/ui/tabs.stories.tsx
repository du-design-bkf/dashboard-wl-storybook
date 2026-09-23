import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

function StationTabsDemo() {
  return (
    <Tabs defaultValue="corridas" className="w-96">
      <TabsList>
        <TabsTrigger value="corridas">Corridas</TabsTrigger>
        <TabsTrigger value="lockers">Lockers</TabsTrigger>
        <TabsTrigger value="cobrancas">Cobranças</TabsTrigger>
      </TabsList>
      <TabsContent value="corridas">Histórico de corridas do usuário.</TabsContent>
      <TabsContent value="lockers">Histórico de uso de lockers.</TabsContent>
      <TabsContent value="cobrancas">Em desenvolvimento.</TabsContent>
    </Tabs>
  )
}

export const Default: Story = {
  render: () => <StationTabsDemo />,
}

/**
 * Teste de interação: clica numa aba diferente da inicial e confere que o
 * conteúdo real muda (não só o estado visual do trigger).
 */
export const SwitchesTabContent: Story = {
  render: () => <StationTabsDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('Histórico de corridas do usuário.')).toBeVisible()

    await userEvent.click(canvas.getByRole('tab', { name: 'Lockers' }))

    await expect(canvas.getByText('Histórico de uso de lockers.')).toBeVisible()
  },
}
