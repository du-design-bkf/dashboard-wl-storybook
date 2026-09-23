import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Badge } from './badge'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'

const estacoes = [
  { nome: 'Parque Ibirapuera', bicicletas: 12, status: 'Operacional' },
  { nome: 'Vila Madalena', bicicletas: 4, status: 'Operacional' },
  { nome: 'Pinheiros', bicicletas: 0, status: 'Manutenção' },
]

const meta = {
  title: 'UI/Table',
  component: Table,
  tags: ['autodocs'],
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>Estações e docas</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Estação</TableHead>
          <TableHead>Bicicletas</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {estacoes.map((estacao) => (
          <TableRow key={estacao.nome}>
            <TableCell className="font-medium">{estacao.nome}</TableCell>
            <TableCell>{estacao.bicicletas}</TableCell>
            <TableCell>
              <Badge variant={estacao.status === 'Operacional' ? 'default' : 'outline'}>
                {estacao.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

/**
 * Confere renderização real dos dados (número de linhas e conteúdo de uma
 * célula), não é interação de usuário porque a Table crua não tem
 * comportamento próprio (sort/seleção ficam por conta de quem consome).
 */
export const RendersRowsFromData: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Estação</TableHead>
          <TableHead>Bicicletas</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {estacoes.map((estacao) => (
          <TableRow key={estacao.nome}>
            <TableCell>{estacao.nome}</TableCell>
            <TableCell>{estacao.bicicletas}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const rows = canvasElement.querySelectorAll('[data-slot="table-body"] tr')

    await expect(rows).toHaveLength(estacoes.length)
    await expect(canvas.getByText('Pinheiros')).toBeInTheDocument()
  },
}
