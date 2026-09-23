import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination'

const meta = {
  title: 'UI/Pagination',
  component: Pagination,
  tags: ['autodocs'],
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

/**
 * `PaginationLink` é só um `<a>` estilizado, sem estado próprio: o exemplo
 * guarda a página atual localmente (`useState`), do mesmo jeito que uma
 * tela real de listagem faria.
 */
function StatefulPagination() {
  const [page, setPage] = useState(1)

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setPage((p) => Math.max(1, p - 1))
            }}
          />
        </PaginationItem>
        {[1, 2, 3].map((n) => (
          <PaginationItem key={n}>
            <PaginationLink
              href="#"
              isActive={page === n}
              onClick={(e) => {
                e.preventDefault()
                setPage(n)
              }}
            >
              {n}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setPage((p) => Math.min(3, p + 1))
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export const Default: Story = {
  render: () => <StatefulPagination />,
}

/**
 * Teste de interação: clica na página 2, confere que ela vira a ativa
 * (`aria-current="page"`) e que a 1 deixa de ser.
 */
export const NavigatesPages: Story = {
  render: () => <StatefulPagination />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page1 = canvas.getByRole('link', { name: '1' })
    const page2 = canvas.getByRole('link', { name: '2' })

    await expect(page1).toHaveAttribute('aria-current', 'page')

    await userEvent.click(page2)

    await expect(page2).toHaveAttribute('aria-current', 'page')
    await expect(page1).not.toHaveAttribute('aria-current', 'page')
  },
}
