import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { LayoutDashboard, MapPin, Settings, Users } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from './sidebar'

/**
 * Menu lateral do dashboard (nome de produto: "Menu", nome de código shadcn:
 * `sidebar`, não renomear). `collapsible="icon"` recolhe pra uma trilha só de
 * ícones, em vez de sumir da tela (`offcanvas`), que é o comportamento
 * esperado num dashboard sempre visível.
 */
const meta = {
  title: 'UI/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

function DashboardShell() {
  return (
    <div className="min-h-svh w-full bg-[#dedede]">
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <p className="truncate px-2 text-xs font-bold tracking-wide text-sidebar-muted uppercase">
              Dashboard White-Label
            </p>
          </SidebarHeader>
          <SidebarContent>
            {/* Item avulso: sem SidebarGroup/label, igual ao "Visão geral" do side-bar-2.0 */}
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive tooltip="Visão geral">
                  <LayoutDashboard />
                  <span>Visão geral</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarGroup>
              <SidebarGroupLabel>Operação</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Estações">
                      <MapPin />
                      <span>Estações</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Usuários">
                      <Users />
                      <span>Usuários</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Configurações">
                  <Settings />
                  <span>Configurações</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-12 items-center gap-2 border-b px-2">
            <SidebarTrigger />
            <p className="text-sm text-muted-foreground">Conteúdo da página</p>
          </header>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export const Default: Story = {
  render: () => <DashboardShell />,
}

/**
 * Teste de interação: clicar no trigger recolhe o menu pra trilha de ícones
 * (`data-state="collapsed"`), clicar de novo expande (`data-state="expanded"`).
 * Comprova que o comportamento de recolher/expandir funciona de verdade, não
 * só visualmente.
 */
export const Collapsible: Story = {
  render: () => <DashboardShell />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: /toggle sidebar/i })
    const sidebar = canvasElement.querySelector('[data-slot="sidebar"]')

    if (!sidebar) throw new Error('sidebar not found')

    await expect(sidebar).toHaveAttribute('data-state', 'expanded')

    await userEvent.click(trigger)
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed')

    await userEvent.click(trigger)
    await expect(sidebar).toHaveAttribute('data-state', 'expanded')
  },
}
