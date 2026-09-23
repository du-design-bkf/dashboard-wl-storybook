# Dashboard White-Label - Storybook

Catálogo de componentes de UI do Dashboard White-Label (BKF), construído com [Shadcn/ui](https://ui.shadcn.com) sobre Radix e documentado no [Storybook](https://storybook.js.org).

Referência visual/UX: protótipo Figma `DASHBOARD-WHITE-LABEL-BKF` (Reactions).

## Stack

- [Vite](https://vite.dev) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) (CSS-first, tema em `src/index.css`)
- [Shadcn/ui](https://ui.shadcn.com) (preset `radix-nova`, ícones Lucide)
- [Storybook 10](https://storybook.js.org) com `@storybook/addon-vitest` (testes de interação rodam de verdade em navegador via Playwright, não é mock)

Ver decisões de stack em `docs/decisions/`.

## Rodando localmente

```bash
npm install
npm run storybook          # abre o catálogo em http://localhost:6006
```

Outros comandos:

```bash
npm run dev                # app Vite isolado (não é o entregável principal)
npm run build-storybook    # build estático do Storybook (o que vai pro GitHub Pages)
npm run test-storybook     # roda os testes de interação (play functions) via Vitest
npm run lint
```

## Como adicionar um componente novo

1. Instalar o componente via Shadcn (gera em `src/components/ui/`):
   ```bash
   npx shadcn@latest add <nome-do-componente>
   ```
2. Criar `<nome>.stories.tsx` do lado do componente. Use `src/components/ui/button.stories.tsx` como modelo:
   - uma story por variante visual (`args` diferentes)
   - `tags: ['autodocs']` pra gerar a página de docs automática
   - pelo menos uma story com `play` function testando um comportamento real (clique, digitação, etc), usando `storybook/test` (`within`, `userEvent`, `expect`)
3. Rodar `npm run storybook` e conferir visualmente + a aba **Interactions** da story com `play`.
4. Rodar `npm run test-storybook` pra confirmar que o teste passa fora do modo interativo (é o mesmo teste que roda no CI).

## Deploy

Push em `main` builda o Storybook e publica no GitHub Pages via GitHub Actions (`.github/workflows/deploy-storybook.yml`).
