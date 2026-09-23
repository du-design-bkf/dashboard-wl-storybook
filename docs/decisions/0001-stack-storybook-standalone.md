# 0001. Stack do Storybook e repo standalone

- Status: Aceita
- Data: 2026-09-23

## Contexto

Em 22/09/2026, decidiu-se migrar a entrega dos componentes do Dashboard White-Label de "Figma estático" pra "Storybook funcional". Até esse momento não existia app nem repo de código pro Dashboard White-Label, só o protótipo Figma (`DASHBOARD-WHITE-LABEL-BKF`) e planejamento (cards DevOps #11495/#12091/#12092/#12238).

Existe um projeto irmão real, `hubmob-dashboard` (dentro do monorepo `bikefacil-whitelabel-web`), que já resolveu boa parte dessas escolhas: Vite + React 19 + TypeScript + Tailwind v4 + Shadcn/ui + Storybook 10, com o ADR próprio (`0001-storybook-vitrine-ui.md` daquele repo) documentando por que optaram por manter Storybook dentro do repo do app em vez de separado (componentes ali são acoplados a hooks/contexto do app, ex. `ui/sidebar.tsx` importa `@/hooks/use-mobile`).

## Decisão

1. **Stack**: seguir o mesmo padrão do `hubmob-dashboard` (Vite + React 19 + TS + Tailwind v4 CSS-first + Shadcn/ui + Storybook 10), pra reduzir fricção de review com o time de dev (Ildo já conhece esse padrão).

2. **Repo standalone**, não dentro de um monorepo de app: o motivo que levou o `hubmob-dashboard` a rejeitar repo separado (acoplamento a hooks/contexto do app) não se aplica aqui, porque não existe app ainda. O `dashboard-wl-storybook` nasce como catálogo de componentes puro. Se/quando o app real do Dashboard White-Label for construído, decide-se ali (com ADR próprio) se os componentes voltam a ser incorporados ao repo do app ou seguem separados.

3. **Testes de interação desde o início** (`@storybook/addon-vitest`, play functions rodando em Chromium via Playwright): diverge de propósito do `hubmob-dashboard`, que descartou test runner. Aqui o objetivo declarado é um projeto exemplar/de referência (evidência de design engineering), então o padrão de qualidade pesa mais que velocidade de setup.

4. **Shadcn CLI**: o `hubmob-dashboard` usa o estilo antigo (`"style": "new-york"`, pacotes `@radix-ui/react-*` individuais, `cn()` escrito à mão em `lib/utils.ts`). A versão atual da CLI (`shadcn@4.21.0`, instalada em 23/09/2026) não oferece mais esse formato: os estilos viraram presets (`Nova`, `Vega`, `Maia`, ...) sobre uma "base" (`radix`, `base` ou `aria`). Optou-se pelo preset **Nova** com base **radix** (ícones Lucide, igual ao irmão), gerando `components.json` com `"style": "radix-nova"`, pacote unificado `radix-ui` e utilitário `cn` via pacote `cn` em vez de função local. Isso é uma divergência de forma (não de comportamento visual) em relação ao irmão, que existe porque a ferramenta oficial mudou de versão entre os dois projetos, não por escolha deliberada de arquitetura.

## Alternativas consideradas

- **Next.js**: rejeitado, foge do padrão já usado no `hubmob-dashboard` sem necessidade (não há SSR/rotas de app aqui).
- **Repo dentro do futuro app do Dashboard White-Label**: rejeitado por enquanto porque esse app ainda não existe; reavaliar quando ele for criado.
- **Sem testes de interação** (replicar decisão do `hubmob-dashboard`): rejeitado porque o propósito deste projeto é ser peça exemplar de referência.
- **Forçar CLI antiga do Shadcn** (`style: new-york`) pra bater 100% com o irmão: rejeitado por enquanto; manteria paridade de schema mas usaria uma versão da ferramenta já descontinuada, contrariando o objetivo de setup exemplar/atual.

## Trade-off aceito

- Setup inicial mais pesado (Playwright + Vitest + browser real) só pra ter testes de interação desde o dia um.
- Código gerado pelo Shadcn (`button.tsx`, `components.json`) tem formato ligeiramente diferente do `hubmob-dashboard` (preset `radix-nova` vs. `new-york`), o que pode exigir atenção na hora de portar/comparar componentes entre os dois repos no futuro.
