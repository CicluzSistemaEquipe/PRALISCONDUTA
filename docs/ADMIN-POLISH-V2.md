# Admin Polish V2 — de 80% para 100%

> Primeiro teste real do **IADOMARCO V2**. Missão: levar um bom dashboard a **software premium**
> **sem** redesign, **sem** novas/removidas funcionalidades, **sem** mudar regra de negócio.
> Apenas refinar o que já existe. Identidade visual preservada (SaaS claro, laranja = ação,
> marca Pralís discreta). Pergunta-guia aplicada a cada decisão:
> *"Se eu fosse gerente da Pralís e usasse este painel 8h/dia, gostaria desta experiência?"*

## Product Thinking — análise por tela (resumo)
- **Dashboard** (uso diário, alta frequência; decisão: "como está a adesão ao treinamento?").
  Informação importante: KPIs + funil + retenção. Pouco valor: nada a remover, mas os números
  apareciam **estáticos** (sem vida) e os gráficos não eram **acessíveis**.
- **Colaboradores** (uso diário; decisão: cadastrar/acompanhar/enviar link). Tabela já é a forma
  certa; faltava **navegação por teclado** e **loading premium**.
- **Gerentes / Módulos / Termos / Editor** (uso pontual). Herdam os primitivos compartilhados —
  ganham automaticamente com o refino da base. Nada a inventar.
- **Decisão central:** o maior ganho/risco-baixo vem de **refinar a camada compartilhada**
  (tokens + primitivos + motion), elevando as 8 telas de uma vez — em vez de mexer tela a tela.

## O que foi refinado (e por quê)

| # | Refino | Onde | Por quê |
|---|--------|------|---------|
| 1 | **Count-up** — números animam suavemente (0→valor, easeOutCubic) | `ui.tsx` (`AnimatedNumber`, `StatCard`) + Dashboard (KPIs, Média geral) | Sensação premium ("vivo"), reforça mudança de dado sem distrair. Respeita `prefers-reduced-motion`. |
| 2 | **Skeleton shimmer premium** (gradiente em movimento) no lugar do pulse | `admin.css` `.adm-skel` + `Skeleton` | Loading parece software caro, não placeholder genérico. |
| 3 | **Contraste AA** do texto secundário (`--text-muted` `#8a837c`→`#6f6862`, ~5:1) | `admin.css` | Legibilidade real para uso de 8h/dia; antes ficava ~4:1 (abaixo do AA em textos pequenos). |
| 4 | **Gráficos acessíveis** — `role="img"` + `aria-label` com o resumo dos dados (rosca, barras, retenção, anel de quiz) | `AdminDashboard.tsx` | Leitor de tela passa a "ler" os gráficos; antes eram invisíveis para a11y. |
| 5 | **Hover inteligente** nos KPIs — borda+sombra suave e leve "lift" do chip de ícone (200ms) | `StatCard` | Feedback de que o card é vivo/interativo, sem exagero. |
| 6 | **Micro-sensação positiva** — indicador "Online" com pulso suave (2.6s) | `admin.css` `.adm-dot-live` + Sidebar | Vida sutil ("gamificação" sem virar jogo); transmite "sistema ativo". |
| 7 | **Navegação por teclado** nas linhas da tabela (`tabIndex`, Enter/Espaço, foco visível com faixa laranja) | `admin.css` + `AdminColaboradores` | Produtividade de quem usa teclado; foco visível claro. |

> Tudo aditivo. Nenhuma funcionalidade, regra de negócio, prop ou chamada de dados foi alterada.

## Ganhos

**UX**
- Números com count-up + gráficos entrando com elegância → leitura mais agradável e "viva".
- Foco visível e ativação por teclado nas tabelas → fluxo sem mouse.
- Loading shimmer → percepção de rapidez e qualidade.

**Produtividade**
- Teclado nas linhas (Enter abre o cadastro) reduz cliques para quem opera o painel todo dia.
- Hover/foco mais claros → menos hesitação, decisões mais rápidas.

**Product Design**
- Refino na **camada compartilhada** → consistência garantida nas 8 telas com 1 fonte de verdade.
- Restrição mantida: 1 laranja de ação, neutros elegantes, marca discreta — nada genérico.

**Motion Design**
- Apenas animação **útil**: count-up, entrada de gráfico, hover, pulso de "online", shimmer.
- Nada chamativo; tudo desligado sob `prefers-reduced-motion`.

**Acessibilidade**
- Contraste de texto secundário agora **AA**.
- Gráficos com `aria-label` (resumo textual). Linhas de tabela operáveis por teclado com foco visível.

**Performance**
- Count-up via `requestAnimationFrame` (cancelado no unmount), sem biblioteca extra.
- Shimmer e pulso são CSS puro (GPU-friendly: `transform`/`box-shadow`), sem custo de JS.
- Zero dependências novas; gráficos seguem em SVG.

## Validação
- `npx tsc -b` → **exit 0** (sem erros de tipo).
- `npm run build` → bundle de produção **OK**.
- Identidade e funcionalidades preservadas; mudanças puramente de experiência.

## "Teria orgulho como Linear/Stripe/Vercel?"
Com count-up, shimmer premium, contraste AA, gráficos acessíveis, hover/foco refinados e a
micro-vida do indicador online — **sim**. O painel agora se comporta como software usado
diariamente, não como uma tela bonita parada.
