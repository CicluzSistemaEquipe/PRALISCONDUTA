# 04 · Component Library — Pralís

> Mapa de **todos os componentes reais** do sistema, extraído do código
> (`src/app/`, `src/admin/`). Para cada um: o que é, quando usar, quando **não** usar,
> como evoluir. Use este doc para reaproveitar antes de inventar.

**Legenda de mundo:** 🌙 = colaborador (dark) · ☀️ = admin (light) · ◐ = compartilhado.

---

## 1. Marca & identidade

| Componente | 🌍 | O que é | Quando usar | Quando **não** usar |
|---|---|---|---|---|
| `SproutLogo` | 🌙 | Logo oficial (espiga, grãos animados via pathLength) | Splash, login, marca em destaque | Como ícone pequeno repetido (use `ModuleIcon`) |
| `PralisSymbol` / `PralisSymbolX` | 🌙 | Par de folhas + "X" triplo celebrativo | Celebração, conclusão, momento de marca | Em lista/tabela (vira ruído) |
| `AnimatedBackground` | 🌙◐ | Fundo fixo da marca (espigas + gradiente quente), theme-aware | Toda tela do app; aceita `theme` p/ forçar dark | No admin (admin tem fundo branco próprio) |
| `Icon` | ◐ | Registry tree-shakeable de ícones lucide | Qualquer ícone de UI | Ícones de marca (use SVGs próprios) |
| `ModuleIcon` | ◐ | SVGs temáticos de padaria (wheat, bread, croissant…) | Identificar módulos/categorias | Como ícone de ação genérico |

**Evolução:** centralizar todos os SVGs de marca num só lugar; expor tamanhos
padronizados (16/20/24/32/48). Manter `pathLength` para o "desenho" da marca.

---

## 2. Lis (a guia)

| Componente | 🌍 | O que é | Quando usar | Quando **não** usar |
|---|---|---|---|---|
| `LisAvatar` | 🌙 | Mascote Lis (tenta Rive, fallback PNG); 7+ estados emocionais | Boas-vindas, dúvida, feedback, celebração | Como simples ícone decorativo repetido |
| `LisHeaderAvatar` | 🌙 | Avatar Lis com **ring de progresso** (estilo stories) | Header do Feed — progresso global vivo | Onde não há progresso a comunicar |
| `LisCard` | 🌙 | Lis fala com **typewriter** + avatar/vídeo hero | Transições narrativas dentro do story | Para texto longo (use `TextCard`) |

**Regra:** o **estado** da Lis deve casar com o momento (acertou → comemora; errou →
alerta gentil). A Lis humaniza, nunca infantiliza. Hoje vídeos/avatar têm placeholders
— trocar quando os assets finais chegarem (sem mudar a API).

**Evolução:** áudio sincronizado + cues de texto (roadmap P2); manter contrato de
`state` estável.

---

## 3. Conteúdo do story (núcleo do treinamento)

> Renderizados dentro do `StoryPlayer`, conforme o tipo de `Story` do contrato
> `Module`/`Story`. **Não alterar a lógica/contrato** ao mexer no visual.

| Componente | 🌍 | O que é | Quando usar | Quando **não** usar |
|---|---|---|---|---|
| `StoryPlayer` | 🌙 | Shell do story: container, barra, setas, swipe (drag-x), teclado, auto-advance | Render de qualquer módulo; aceita `preview` (usado no admin) | Fora do fluxo de módulo |
| `StoryProgressBar` | 🌙 | Barra de segmentos (ouro=feito, laranja=atual) | Topo do story | Como barra de progresso genérica de página |
| `TextCard` | 🌙 | Slide de texto: título, parágrafos, highlights, narração TTS/áudio | Explicar conteúdo | Para 1 frase curta (use `LisCard`) |
| `VideoCard` | 🌙 | Player de vídeo (progresso, mute, watched). **Permanece dark sempre** | Vídeo do módulo (entra antes do quiz) | Para áudio puro |
| `QuizCard` | 🌙 | Quiz interativo: intro, A–E, feedback, review, score, confetti | Confirmar aprendizado | Para opinião sem certo/errado (use `PollCard`) |
| `PollCard` | 🌙 | Enquete (single/multiple), opção branca quando selecionada | Coletar opinião da equipe (poll) | Quando há resposta correta (use `QuizCard`) |
| `SummaryCard` | 🌙 | Resumo em bullets numerados | Fechar um bloco/módulo | No meio de uma explicação |
| `ValuesCard` | 🌙 | Card dos 5 valores com chips animados | Onboarding / módulos de cultura | Fora de contexto de valores |
| `WordByWord` | 🌙 | Texto com entrada palavra-a-palavra + highlight laranja | Ênfase narrativa pontual | Em blocos longos (custo de atenção) |
| `TopicIllustration` | 🌙 | SVG ilustrativo por tópico (30+ variações) | Dar imagem a um conceito | Quando já há vídeo/imagem real |
| `CompletionCard` | 🌙 | Conclusão: Lis feliz, badge, score, confetti, próximos passos | Fim de módulo/treinamento | Como toast de sucesso simples |

**Evolução:** ao adicionar um novo tipo de bloco, ele deve ser **aditivo** ao contrato
`Story` (como o `poll` foi), com editor no admin e render no app — sem tocar
desbloqueio/progresso/conclusão.

---

## 4. Navegação & estados (app)

| Componente | 🌍 | O que é | Quando usar | Quando **não** usar |
|---|---|---|---|---|
| `BottomNav` | 🌙 | Rodapé **2 abas** (Início → /feed, Perfil → /perfil), pílula ativa laranja (`layoutId="nav-pill"`) | Navegação principal do app | Em telas fullscreen de story |
| `ModuleCard` | 🌙 | Card de módulo com estados locked/active/in-progress/done + highlight | Listagem da trilha (Feed/Progress) | Para conteúdo que não é módulo |
| `SkeletonCard` | 🌙 | Placeholder pulsante | Enquanto carrega dados | Como elemento decorativo |
| `Loading` | 🌙 | Tela cheia de carregamento com logo | Boot/splash de rota | Para carregamento parcial (use skeleton) |
| `ErrorBoundary` | ◐ | Captura erro de chunk + auto-reload (PWA) | Envolver árvores de rota | Para validação de formulário |
| `ThemeToggle` | ◐ | Alterna dark/light (Perfil → Aparência) | Preferência de tema do colaborador | No admin (admin é sempre claro) |
| `DevToolbar` | 🌙 | Painel dev (`?dev=1`) | Desenvolvimento/QA | Em produção visível ao usuário |

---

## 5. Admin — layout & shell ☀️

| Componente | O que é | Quando usar | Quando **não** usar |
|---|---|---|---|
| `AdminLayout` | Shell: sidebar + topbar + `<Outlet>`, raiz `.adm-root` | Toda rota `/admin/*` | Fora do admin |
| `AdminSidebar` | Nav agrupada (Pessoas · Conteúdo · Análise), marca preta, ativo laranja, rail colapsável, drawer mobile | Navegação do painel | — |
| `AdminTopbar` | Saudação por hora, data/hora ao vivo, sino de notificações | Cabeçalho global do admin | — |
| `AdminPageHeader` | Eyebrow + título + subtítulo + **1 ação primária** | Topo de cada página | Com várias ações primárias |
| `AdminGuard` | Protege rota (sessão); redireciona p/ login | Envolver páginas restritas (ex.: `requireDono`) | Em páginas públicas |

---

## 6. Admin — dados & primitivos ☀️ (`ui.tsx`)

| Componente | O que é | Quando usar | Quando **não** usar |
|---|---|---|---|
| `StatCard` | KPI: ícone + valor (count-up tabular) + label + delta; `tone` (orange/green/gold/brown/neutral) | Métricas no dashboard | Para texto longo |
| `SectionCard` | Bloco branco com título H3 + ação opcional | Agrupar conteúdo | Aninhado em outro card |
| `EmptyState` | Ícone + texto + CTA | Lista/tabela vazia | Para erro (use estado de erro) |
| `ModalShell` / `ModalHeader` | Modal acessível (ESC, foco preso) | Criar/editar/confirmar | Para navegação de página |
| `Avatar` (+ iniciais) | Avatar com fallback de iniciais (marrom) | Pessoas em tabelas/cards | Decoração |
| `StatusBadge` | Pill de status (cor + texto) | Estado de pessoa/módulo | Como botão |
| `AnimatedNumber` | Count-up com easeOutExpo | KPIs no 1º load | Em valores que mudam toda hora |
| `Skeleton` | Placeholder de carregamento | Loading de tabela/card | — |

**Evolução:** estes primitivos são a base do design system do admin. Toda nova tela
do admin deve **reusar** `StatCard`/`SectionCard`/`EmptyState`/`ModalShell` antes de
criar algo novo. Próximos: command palette (⌘K), toasts com undo.

---

## 7. Admin — editor de conteúdo ☀️

| Componente | O que é | Quando usar | Quando **não** usar |
|---|---|---|---|
| `AdminModuloEditor` | Editor de módulo: abas Informações + Conteúdo, timeline única de blocos | Criar/editar módulo | — |
| `SlideEditor` | Edita um bloco (texto/vídeo/quiz/poll) inline | Dentro da timeline | Fora do editor |
| `QuizEditor` | CRUD de perguntas/opções/feedback, com drag&drop | Bloco de quiz | — |
| `PollSlideEditor` | Edita enquete (pergunta + opções), drag&drop | Bloco de enquete | — |
| `ModulePreview` | **Preview real**: renderiza o `StoryPlayer` num frame de celular (300×600, `scale 0.8`) | Ver o módulo como o colaborador vê | Como player de produção |

**Padrão-herói:** o `ModulePreview` usa o **mesmo** `StoryPlayer` do app com a prop
`preview` (desliga timers/efeitos colaterais). Isso garante que "o que você vê é o que
o colaborador recebe". Não duplicar a renderização.

---

## 8. Páginas (referência rápida)

**Colaborador 🌙:** `Splash` (/) · `Login` (/login) · `Acesso` (/acesso) ·
`Onboarding` (/conheca) · `Feed` (/feed — "Trilha Viva", herói "Continuar") ·
`Module` (/modulo/:id) · `Progress` (/progresso — ring + lista) · `Profile` (/perfil)
· `Completion` (/conclusao — assinatura).

> A `BottomNav` expõe só **Início** e **Perfil**. `Progress` (/progresso) e
> `Completion` (/conclusao) são alcançados **por dentro do fluxo** (a partir do Feed,
> do Perfil e do fim do módulo), não pela barra inferior — por isso a nav tem 2 abas.

**Admin ☀️:** `AdminLogin` · `AdminDashboard` (KPIs + barra empilhada) ·
`AdminColaboradores` (tabela + CRUD + 360º) · `AdminGerentes` · `AdminModulos` (lista
+ reorder + ativo/inativo) · `AdminModuloEditor` (editor + preview) ·
`AdminAcompanhamento`/Relatórios (tracking, filtros, drill-down) · `AdminTermos`.

---

## 9. Contextos & infra ◐

| Item | Papel |
|---|---|
| `SessionContext` | Sessão do colaborador (employee, progress, completeModule) |
| `ThemeContext` | Tema dark/light (`pralis_theme`, aplica `data-theme` no `<html>`) |
| `adminStore` | Fonte editável de **conteúdo** (módulos/termos/splash), `useSyncExternalStore` |

---

## 10. Regras de evolução da biblioteca

1. **Reusar antes de criar.** Procure aqui primeiro.
2. **Aditivo, não destrutivo.** Novos blocos/estados não podem quebrar o contrato
   `Module`/`Story` nem a lógica de desbloqueio/progresso/assinatura.
3. **Respeitar o mundo.** Componente do app não migra pro admin e vice-versa sem
   re-desenho — as linguagens são distintas (doc 02).
4. **Acessibilidade embutida.** Todo novo componente nasce com foco visível, aria
   adequado, estados loading/empty/error e respeito a `prefers-reduced-motion`.
5. **Tokens, não números mágicos.** Use as CSS vars (doc 03), nunca hex/px soltos.
6. **Placeholders são temporários.** Lis/vídeos/Lottie têm fallbacks — trocar por
   assets finais mantendo a API.

---

### Conexões
- Tokens visuais de cada componente → `03_VISUAL_IDENTITY.md`
- Como cada um se move → `07_MOTION_GUIDELINES.md`
- Como construir telas com eles → `05_PRODUCT_GUIDELINES.md`
