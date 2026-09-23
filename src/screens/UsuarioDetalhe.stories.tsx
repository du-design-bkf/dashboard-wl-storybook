import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { mockUserDetail, UsuarioDetalheScreen } from './UsuarioDetalhe'

/**
 * Composição de tela real, contrato replicado 1:1 do `UserDetail.tsx` do
 * hubmob-dashboard. 4 abas no código real, só 3 implementadas: "Últimas
 * cobranças" é `<p>Em desenvolvimento.</p>` literal, não é lacuna minha.
 * Acompanhamento ao vivo (SignalR) fica como placeholder: fora de escopo
 * de um catálogo de componentes estático.
 */
const meta = {
  title: 'Screens/Detalhe do Usuário',
  component: UsuarioDetalheScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof UsuarioDetalheScreen>

export default meta
type Story = StoryObj<typeof meta>

export const InRide: Story = {
  args: {
    user: mockUserDetail,
  },
  name: 'Em corrida (com botão de acompanhamento ao vivo)',
}

export const Available: Story = {
  args: {
    user: { ...mockUserDetail, activity: 'available' },
  },
}

/**
 * Teste de interação: troca de aba mostra o conteúdo real (Promoções em
 * vez de Corridas), inclusive o stub "Em desenvolvimento." da aba não
 * implementada.
 */
export const SwitchesTabs: Story = {
  args: {
    user: mockUserDetail,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getAllByText('Concluída')[0]).toBeInTheDocument()

    await userEvent.click(canvas.getByRole('tab', { name: 'Promoções do usuário' }))
    await expect(canvas.getByText('Primeira corrida grátis')).toBeInTheDocument()

    await userEvent.click(canvas.getByRole('tab', { name: 'Últimas cobranças' }))
    await expect(canvas.getByText('Em desenvolvimento.')).toBeInTheDocument()
  },
}

/**
 * Teste de interação: botão de acompanhamento ao vivo só existe quando
 * `activity === 'in_ride'`, clicar abre o modal placeholder.
 */
export const OpensLiveTracking: Story = {
  args: {
    user: mockUserDetail,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(
      canvas.getByRole('button', { name: /acompanhar corrida ao vivo/i })
    )

    await expect(await body.findByText('Acompanhamento ao vivo')).toBeInTheDocument()
  },
}

/**
 * Teste de interação: marcador Bike Fácil não existe até o toggle ser
 * ligado (é concessão, não estado inicial padrão neste mock).
 */
export const GrantsBikeFacilMarker: Story = {
  args: {
    user: mockUserDetail,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.queryByText('Bike Fácil')).not.toBeInTheDocument()

    await userEvent.click(canvas.getByRole('switch'))

    await expect(canvas.getByText('Bike Fácil')).toBeInTheDocument()
  },
}
