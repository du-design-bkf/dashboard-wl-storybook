import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  AccessStatusBadge,
  AccountStatusBadge,
  ActivityBadge,
  BikeFacilBadge,
  PresenceIndicator,
} from './user-badges'

/**
 * Não vem do catálogo do shadcn: 4 dimensões de status de usuário
 * replicadas do `hubmob-dashboard` (`UserStatusBadges.tsx`), reaproveitando
 * o `StatusBadge` deste catálogo em vez de cor crua por estado. São
 * dimensões distintas e coexistem no mesmo usuário (ex.: Presence=Online +
 * Activity=Em corrida + AccountStatus=Ativa ao mesmo tempo).
 */
const meta = {
  title: 'UI/UserBadges',
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const AllDimensions: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-1 text-xs text-muted-foreground">Presence</p>
        <div className="flex gap-3">
          <PresenceIndicator presence="online" />
          <PresenceIndicator presence="offline" />
        </div>
      </div>
      <div>
        <p className="mb-1 text-xs text-muted-foreground">Activity</p>
        <div className="flex flex-wrap gap-2">
          <ActivityBadge activity="available" />
          <ActivityBadge activity="in_ride" />
          <ActivityBadge activity="reserved" />
          <ActivityBadge activity="in_locker_usage" />
        </div>
      </div>
      <div>
        <p className="mb-1 text-xs text-muted-foreground">AccountStatus</p>
        <div className="flex flex-wrap gap-2">
          <AccountStatusBadge status="active" />
          <AccountStatusBadge status="blocked" />
          <AccountStatusBadge status="pending" />
          <AccountStatusBadge status="unknown" />
        </div>
      </div>
      <div>
        <p className="mb-1 text-xs text-muted-foreground">AccessStatus</p>
        <div className="flex flex-wrap gap-2">
          <AccessStatusBadge status="pendingFirstAccess" />
          <AccessStatusBadge status="active" />
          <AccessStatusBadge status="unknown" />
        </div>
      </div>
      <div>
        <p className="mb-1 text-xs text-muted-foreground">
          Marcador Bike Fácil (não é status)
        </p>
        <BikeFacilBadge />
      </div>
    </div>
  ),
}
