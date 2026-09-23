import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card'

const meta = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Estação Parque Ibirapuera</CardTitle>
        <CardDescription>12 bicicletas disponíveis</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm">
            Ver
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Status operacional, sem chamados abertos.
        </p>
      </CardContent>
      <CardFooter>
        <Button size="sm" className="w-full">
          Gerenciar estação
        </Button>
      </CardFooter>
    </Card>
  ),
}

export const Compact: Story = {
  render: () => (
    <Card size="sm" className="w-64">
      <CardHeader>
        <CardTitle>KPI</CardTitle>
        <CardDescription>Viagens hoje</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">238</p>
      </CardContent>
    </Card>
  ),
}
