# Pralís — Catálogo de Componentes

> **Fonte de tokens:** [`DESIGN_TOKENS.json`](./DESIGN_TOKENS.json) — sempre referencie um caminho (ex.: `color.appDark.action`), nunca cole hex.
> **Índice de máquina:** [`COMPONENT_MAP.json`](./COMPONENT_MAP.json) — mesma lista em JSON, para tooling.
> **Filosofia / por quê:** [`../DESIGN_KNOWLEDGE_BASE_PRALIS/`](../DESIGN_KNOWLEDGE_BASE_PRALIS/) — não repetida aqui.

## Os dois mundos

| | 🌙 **APP** (colaborador) | ☀️ **ADMIN** (CMS) |
|---|---|---|
| Base | `color.appDark.bgBase` (escuro quente, nunca preto puro) | `color.admin.bgApp` (branco) |
| Ação | `color.appDark.action` (laranja) | `color.admin.accent` — **1 por tela** |
| Dourado | `color.appDark.gold` (brilho, celebração) | proibido na UI |
| Texto | `color.appDark.textPrimary` / `.textSecondary` (creme) | `color.admin.ink` / `.textSecondary` |
| Raio | `radius.card` (20) | `radius.md` (8) inputs/botões · `radius.lg` (12) cards |
| Elevação | sem sombra pesada, **sem blur, sem `repeat:Infinity`** | **borda 1px**, não sombra |
| Tipografia | Montserrat (`typography.fontFamily.body`) · MadeByDillan só no logo | Montserrat |
| Layout | mobile-first, app-shell | sidebar `grid.adminSidebar` (248px) |

`◐` = compartilhado entre os dois mundos.

**Contrato congelado (não tocar):** desbloqueio (`prevDone`), progresso, conclusão, assinatura, `Module`, `Story`. Evoluções são **aditivas** (novas props opcionais, novas variantes) — nunca alteram contrato.

---

## 1. Marca 🌙

| Componente | O que é | Quando usar | Quando NÃO usar | Tokens / estados |
|---|---|---|---|---|
| **SproutLogo** | Logo espiga animado (`pathLength` no traço) | Splash, header de marca, vazios de marca | Como ícone genérico de UI; repetido em lista | `color.brand.laranja`, `.dourado`, `.marrom`; `motion.easing.emphasized`, `motion.durations.progressDraw` |
| **PralisSymbol / PralisSymbolX** | Par de folhas; variante **X** é celebrativa | Marca compacta (Symbol); momento de conquista/conclusão (X) | X fora de celebração (perde o significado) | `color.brand.dourado`, `.laranja`; `motion.spring.default` |
| **AnimatedBackground** | Fundo fixo, theme-aware, sutil | Camada de fundo do app-shell | Atrás de texto longo sem contraste; com `repeat:Infinity` (proibido) | `color.appDark.bgBase`/`bgDeep`; `motion.rules.animateOnly` |
| **Icon** | Wrapper do registry lucide | Qualquer ícone de UI do app | Multicor; ícone fora do registry | `iconography.stroke` (1.5), `iconography.sizes`, `iconography.color` |
| **ModuleIcon** | SVGs temáticos de padaria (flower, sprout, grain, wheat, bread, croissant, cake, star, heart, chef) | Identidade de um módulo/trilha | Como ícone funcional genérico (use `Icon`) | `color.appDark.gold`, `.action`; `iconography.brandIcons` |

**Evoluir:** novos `ModuleIcon` entram como novas keys no set; estados de logo entram como props opcionais. Nunca trocar a paleta de marca.

---

## 2. Lis (mascote) 🌙

| Componente | O que é | Quando usar | Quando NÃO usar | Tokens / estados |
|---|---|---|---|---|
| **LisAvatar** | Mascote, 7+ estados emocionais, Rive → PNG fallback | Presença da Lis (header, cards, conclusão) | Como avatar de usuário; em loop infinito | estados: `idle, happy, celebrating, thinking, encouraging, sad, surprised…`; `loading` (Rive→PNG); `color.appDark.action` |
| **LisHeaderAvatar** | LisAvatar + ring de progresso | Header do feed/trilha mostrando avanço | Onde não há progresso a comunicar | ring: `color.appDark.gold` (feito) / `.action` (atual); `motion.durations.progressDraw` |
| **LisCard** | Fala da Lis (typewriter) + avatar/vídeo | Onboarding, dica, transição narrada | Texto puramente informativo/denso | typewriter `motion.stagger.appNarrative`; `color.appDark.surfaceCard`, `radius.card`; respeita `reducedMotion` (mostra texto inteiro) |

**Evoluir:** novos estados emocionais = novas entradas no enum (aditivo). Sempre garantir fallback PNG.

---

## 3. Story / conteúdo 🌙

> Renderizados **dentro do `StoryPlayer`** conforme o `type` da `Story` (contrato congelado). Cada card é "burro": recebe a Story, emite avanço/conclusão.

| Componente | O que é | Quando usar | Quando NÃO usar | Tokens / estados |
|---|---|---|---|---|
| **StoryPlayer** | Shell: barra de progresso, setas, swipe (drag-x), teclado, auto-advance, prop `preview` | Reprodução de qualquer trilha de Stories; reuso no admin via `preview` | Fora do fluxo de Story; como carrossel genérico | `motion.durations.panel`, `motion.spring.default`; `accessibility.focus` (setas/teclado); `zIndex.stickyHeader` |
| **StoryProgressBar** | Segmentos: ouro=feito, laranja=atual | Topo do StoryPlayer | Como barra de loading genérica | `color.appDark.gold` / `.action`; `motion.durations.progressDraw` |
| **TextCard** | Texto + narração TTS | Conteúdo textual de um Story | Vídeo (use VideoCard); listas (use SummaryCard) | `color.appDark.textPrimary`/`.textSecondary`, `radius.card`; estado `playing` (TTS) |
| **VideoCard** | Player de vídeo — **SEMPRE dark** | Story de vídeo | Forçar tema claro (proibido aqui) | `color.appDark.bgDeep`; estados `loading, playing, paused, error`; `elevation.brandTailwind.play` |
| **QuizCard** | Quiz A–E, feedback, review, confetti | Verificação de aprendizado | Coleta de opinião (use PollCard) | estados `idle, selected, correct, incorrect, review`; `color.appDark.success`/`successBg`, `.danger`/`dangerBg`; confetti `motion.durations.celebration` |
| **PollCard** | Enquete single/multiple | Opinião/sentimento, sem certo/errado | Avaliação com resposta correta (use QuizCard) | estados `idle, selected, submitted`; `color.appDark.action`, `radius.card` |
| **SummaryCard** | Bullets de resumo | Fechar um bloco com pontos-chave | Texto corrido longo (use TextCard) | `color.appDark.surfaceCard`, `.gold` (marcadores); `motion.stagger.appNarrative` |
| **ValuesCard** | Os 5 valores | Apresentar valores institucionais | Conteúdo genérico de lista | `color.appDark.gold`, `.action`; stagger `motion.stagger.appNarrative` |
| **WordByWord** | Revela texto palavra a palavra | Ênfase narrativa/dramática pontual | Texto longo (cansa); respeitar `reducedMotion` | `motion.stagger.appNarrative`, `motion.easing.emphasized` |
| **TopicIllustration** | SVG por tópico | Ilustrar o tema de um Story | Como ícone de UI funcional | `color.appDark.gold`, `.action`; `motion.rules.animateOnly` |
| **CompletionCard** | Conclusão + badge + confetti | Fim de módulo/trilha (celebração) | Como tela de erro/vazio | `color.appDark.gold`, `.success`; `PralisSymbolX`; confetti `motion.durations.celebration` |

**Evoluir:** novo tipo de conteúdo = novo card + novo `case` no StoryPlayer, sem mexer nos tipos existentes nem no contrato de conclusão.

---

## 4. Navegação / estado 🌙

| Componente | O que é | Quando usar | Quando NÃO usar | Tokens / estados |
|---|---|---|---|---|
| **BottomNav** | 2 abas (Início→`/feed`, Perfil→`/perfil`); pílula laranja `layoutId="nav-pill"` | Navegação raiz do app | Dentro do StoryPlayer (fullscreen); >2 abas sem revisão | `color.appDark.navBg`, `.navActiveBg`; `motion.spring.navPill`; `zIndex.nav` (40); `breakpoints.behavior.touchTarget` (≥44px) |
| **ModuleCard** | Card de módulo: `locked/active/in-progress/done` + highlight recomendado | Lista da trilha/feed | Conteúdo não-módulo | estados acima; `color.appDark.action` (atual), `.gold` (done/glow), `.textLocked` (locked); `radius.card` |
| **SkeletonCard** | Placeholder na forma do ModuleCard | Carregamento da trilha | Após dados prontos; loading <300ms | `color.appDark.surfaceCardSoft`; opacity-only (`motion.rules.animateOnly`) |
| **Loading** | Indicador de marca | Boot/transição sem layout conhecido | Onde cabe skeleton (preferir skeleton) | `color.appDark.action`; sem `repeat:Infinity` em telas críticas |
| **ErrorBoundary** | Captura erro; auto-reload de chunk (PWA) | Raiz de rotas/áreas do app | Para validação de form (use estado de erro do campo) | estado `error`; `color.appDark.danger`/`dangerBg` |
| **ThemeToggle** ◐ | Alterna tema (app: dark↔light opcional) | Perfil do app | Forçar tema em telas que são sempre dark (ex.: VideoCard) | `color.appLight.*` vs `color.appDark.*`; `motion.durations.micro` |
| **DevToolbar** | Ferramenta de dev | Apenas em desenvolvimento | Em produção | n/a (fora do design canônico) |

---

## 5. Admin — shell ☀️

| Componente | O que é | Quando usar | Quando NÃO usar | Tokens / estados |
|---|---|---|---|---|
| **AdminLayout** | Raiz `.adm-root` (sidebar + topbar + conteúdo) | Envolver toda tela do CMS | No app colaborador | `color.admin.bgApp`; `grid.contentMaxWidth` (1200), `spacing.usage.contentPaddingDesktop` |
| **AdminSidebar** | Nav agrupada (Pessoas/Conteúdo/Análise), marca preta, item ativo laranja, rail colapsável, drawer mobile | Navegação primária do CMS | Como menu secundário/contextual | `grid.adminSidebar` (248→64 rail); ativo `color.admin.accent`; `color.admin.border`; drawer `breakpoints.behavior.adminSidebar` |
| **AdminTopbar** | Saudação + data/hora viva + sino | Topo de toda tela admin | Empilhar com outra topbar | `color.admin.ink`, `.textSecondary`; relógio vivo respeita `reducedMotion`; `zIndex.stickyHeader` |
| **AdminPageHeader** | Eyebrow + título + subtítulo + **1 ação** | Cabeçalho de cada tela do CMS | Múltiplas ações primárias (1 só accent por tela) | `typography.scaleAdmin.eyebrow/h1`; ação `color.admin.accent`; `radius.md` |
| **AdminGuard** | Gate de acesso ao admin | Proteger rotas do CMS | Lógica de UI; validação client como segurança | redirect/`loading`; sem token visual próprio |

---

## 6. Admin — primitivos (`ui.tsx`) ☀️

| Componente | O que é | Quando usar | Quando NÃO usar | Tokens / estados |
|---|---|---|---|---|
| **StatCard** | KPI com count-up; `tone` orange/green/gold/brown/neutral | Métrica única destacada | Bloco de texto; tabela | `tone`→`color.admin.accent`/`success`/`warning`/`brandBrown`/`textSecondary`; `typography.scaleAdmin.kpi` (tabular); count-up `motion.durations.kpiCountUp` |
| **SectionCard** | Card de conteúdo com **borda** | Agrupar conteúdo numa seção | Como botão; aninhar cards fundo | `color.admin.border`, `radius.lg` (12); **borda, não sombra** (`elevation._principle`) |
| **EmptyState** | Ícone + texto + CTA | Lista/área sem dados | Estado de erro (use mensagem de erro) | `color.admin.textMuted`, `accent` (CTA); `radius.md` |
| **ModalShell / ModalHeader** | Modal: ESC + foco preso | Fluxo focado/confirmação | Conteúdo que cabe inline | `elevation.adminMd` (permitido em modal); `zIndex.modal` (70); `accessibility.focus` (ESC, trap); `motion.durations.panel` |
| **Avatar** ◐ | Iniciais | Identificar pessoa sem foto | Logo de marca (use PralisSymbol) | `color.admin.brownTint`/`brandBrown`; `radius.pill` |
| **StatusBadge** | Cor + ícone + texto | Sinalizar estado (ativo/pendente/erro) | Só cor (proibido por `accessibility.statusRule`) | `color.admin.success`/`warning`/`danger` + `Bg`; `radius.pill`; `typography.scaleAdmin.eyebrow` |
| **AnimatedNumber** ◐ | Número com easeOutExpo | Valor que muda/entra (KPI, contagem) | Texto estático | `motion.easing.emphasized`, `motion.durations.kpiCountUp`; `typography.numeric` (tabular) |
| **Skeleton** | Placeholder genérico admin | Carregamento de qualquer bloco admin | Loading <300ms | `color.admin.bgMuted`; opacity-only |

---

## 7. Admin — editor ☀️

| Componente | O que é | Quando usar | Quando NÃO usar | Tokens / estados |
|---|---|---|---|---|
| **AdminModuloEditor** | Abas (Informações + Conteúdo); timeline única de blocos | Criar/editar módulo no CMS | Edição rápida inline | abas `color.admin.accent` (ativa); `radius.lg`; `motion.stagger.adminLow`; estados `saving, error, dirty` |
| **SlideEditor** | Edita um slide/bloco de texto | Bloco textual na timeline | Quiz/Poll (use editores próprios) | `color.admin.border`, `radius.md`; `inputPadding` (`spacing.usage`) |
| **QuizEditor** | Edita quiz, **drag & drop** de alternativas | Configurar QuizCard | Enquete (use PollSlideEditor) | dnd `motion.spring.default`; `color.admin.accent`, `success`/`danger` (gabarito); `accessibility.focus` |
| **PollSlideEditor** | Edita enquete, **drag & drop** de opções | Configurar PollCard | Quiz com resposta certa | dnd `motion.spring.default`; `color.admin.accent`; `radius.md` |
| **ModulePreview** | Renderiza o **StoryPlayer real** num frame de celular (300×600, scale 0.8), prop `preview` | Pré-visualizar exatamente o que o colaborador verá | Reimplementar o player (sempre reusar o real) | usa todos os tokens do mundo 🌙 dentro do frame; `preview=true`; sem auto-advance |

**Evoluir editor:** novo tipo de bloco = novo editor + entrada na timeline; o `ModulePreview` herda de graça por reusar o StoryPlayer real. Nunca duplicar o player.

---

## 8. Compartilhado (contexto / store) ◐

| Componente | O que é | Quando usar | Quando NÃO usar |
|---|---|---|---|
| **SessionContext** | Sessão/usuário atual | Ler usuário/permissão em qualquer mundo | Como cache de dados de conteúdo (use adminStore) |
| **ThemeContext** | Tema ativo (app dark/light; admin é sempre claro) | Resolver tokens por tema | Forçar admin para dark |
| **adminStore** | Store de conteúdo (`useSyncExternalStore`) | Estado de conteúdo do CMS | Estado efêmero de um único componente (use `useState`) |

---

## Como evoluir (regra geral)

1. **Aditivo, sempre.** Novas props opcionais, novas variantes/`tone`, novos tipos de Story/ModuleIcon. Nunca remover ou redefinir o que existe.
2. **Não tocar no contrato congelado:** `prevDone` (desbloqueio), progresso, conclusão, assinatura, `Module`, `Story`.
3. **Token primeiro.** Antes de um valor novo, achar o caminho em `DESIGN_TOKENS.json`. Se não existir, é decisão de design — escalar, não inventar hex.
4. **Respeitar o mundo.** Componente 🌙 nunca importa estética ☀️ e vice-versa; `◐` lê tokens via `ThemeContext`.
5. **Reuso > reimplementação.** Ex.: preview no admin reusa o StoryPlayer real, não um clone.
