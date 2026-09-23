import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { VisaoGeralScreen } from './VisaoGeral'

/**
 * Composição especulativa (card #12090), decisão do Eduardo 23/09. Sem
 * contrato real: `pages/Dashboard.tsx` do hubmob-dashboard não tem rota em
 * `appRoutes.tsx`, não existe "visão geral" nenhuma pra replicar. Valores
 * dos KPIs são ilustrativos; a forma reaproveita os enums reais já usados
 * nas outras 10 telas desta leva.
 */
const meta = {
  title: 'Screens/Visão Geral',
  component: VisaoGeralScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof VisaoGeralScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

/**
 * Teste de interacao: os 6 KPIs e a atividade recente renderizam.
 */
export const RendersKpisAndActivity: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('Estações ativas')).toBeInTheDocument()
    await expect(canvas.getByText('Veículos disponíveis')).toBeInTheDocument()
    await expect(canvas.getByText('Corridas em andamento')).toBeInTheDocument()
    await expect(canvas.getByText('Atividade recente')).toBeInTheDocument()
    await expect(canvas.getByText('Falha ao atualizar dispositivo')).toBeInTheDocument()
  },
}
