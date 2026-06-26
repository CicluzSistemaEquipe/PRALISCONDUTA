# 06 · UX Guidelines — Pralís

> Regras de experiência aplicáveis a qualquer tela. UX é o valor "Cuidado com as
> pessoas" virando interface. Tudo aqui é verificável no review (doc 11).

---

## 1. Hierarquia

- **Uma mensagem principal por tela.** Defina o elemento #1 e dê a ele tamanho, peso
  e espaço. Tudo o mais é secundário.
- **Escala clara:** título (display/serif no app, H1 22/700 no admin) → corpo
  (Montserrat 14–16) → label (11–13 UPPER tracking). Sem "tudo do mesmo tamanho".
- **Cor como hierarquia:** laranja marca **a** ação principal. Um laranja por tela.
- **Espaço antes de caixa:** agrupe por whitespace + hairline, não por aninhar cards.

## 2. Escaneabilidade

- Layout em **blocos previsíveis** (eyebrow → título → conteúdo → ação).
- **Listas e tabelas** com alinhamento firme; números **tabulares**; à esquerda o
  identificador (avatar+nome), à direita o valor/ação.
- **Texto curto.** Frases diretas. Bullets em vez de parágrafos quando possível.
- **Ícone + rótulo** juntos para reconhecimento rápido (status, navegação).

## 3. Redução de cliques e decisões

- Otimize o **caminho feliz**: a tarefa mais comum em menos passos.
- **Padrões inteligentes** (defaults) que acertam na maioria dos casos.
- **Evite escolhas falsas** — não pergunte o que o sistema pode inferir.
- **Atalhos** para tarefas repetidas (busca, filtros, ações no hover, futuro ⌘K).

## 4. Progressive disclosure

- Mostre o **essencial** primeiro; o avançado aparece sob demanda (acordeão, "mais
  opções", drawer, drill-down).
- No editor, complexidade revelada por bloco — não tudo de uma vez.
- No relatório, do agregado (KPI) ao detalhe (indivíduo) por interação.

## 5. Estados (obrigatórios em todo bloco/lista)

| Estado | Padrão Pralís |
|---|---|
| **Loading** | Skeleton com pulse suave (não spinner solto) |
| **Empty** | Ícone + frase humana + **1 CTA** (`EmptyState`) — nunca tela vazia |
| **Error** | Mensagem clara + **retry**; nunca stack trace cru |
| **Sem dados (gráfico)** | Baseline tracejada + "Sem dados ainda" — nunca "0%" quebrado |
| **Disabled** | Opacidade reduzida + motivo (tooltip/helper) quando útil |
| **Success** | Feedback otimista + toast (com undo quando possível) |

## 6. Feedback

- **Toda ação responde** imediatamente (estado otimista + confirmação).
- **Toast** para resultado de ação (curto, com undo quando faz sentido).
- **Microanimação** confirma toque (botão `scale(0.97/0.98)`, check que desenha).
- **Erros** explicam o que houve e o que fazer — em PT-BR claro, sem culpar o usuário.

## 7. Comunicação visual de estado (app)

Os 5 estados de módulo/jornada têm **linguagem visual própria** (cor + ícone + forma),
legíveis sem ler:
- **Disponível** — neutro, convidativo.
- **Recomendado** — `highlight`/glow laranja-dourado.
- **Em andamento** — barra de progresso parcial.
- **Concluído** — verde + check.
- **Bloqueado** — atenuado/lock; rótulo do porquê (ex.: "conclua o anterior").

## 8. Microinterações & motion (resumo)

- Motion **comunica estado e continuidade**, nunca decora. Detalhe no doc 07.
- App: entrada de conteúdo, desenho de progresso, feedback de toque — **leve**
  (sem loops infinitos, sem blur). Admin: snappy (120–280ms).
- Sempre com **`prefers-reduced-motion`**: desliga transforms, mantém opacidade.

## 9. Formulários

- **Label sempre visível** acima do campo (não placeholder como label).
- **Validação inline** com helper text; erro em `--danger` + ícone.
- **Foco visível** (`--ring`); Enter envia; Esc fecha modal.
- **Agrupe** campos relacionados; ações primária à direita, secundária ghost à esquerda.
- **Estado de salvando** (loading no botão) + sucesso (toast) + erro (mantém dados).

## 10. Acessibilidade (WCAG 2.2 AA)

- **Contraste:** ≥4.5:1 texto, ≥3:1 grande/ícone. Texto sobre laranja/dourado:
  validar; sobre branco use laranja escuro `#c9501a`.
- **Toque ≥44px** (mobile); **foco visível** sempre; ordem de foco lógica.
- **Teclado:** Tab navega, Enter ativa, Esc fecha, setas no story.
- **ARIA correto:** `aria-label` em ícones-ação, `aria-current="page"`, `role` em
  toggles/tabs, `aria-hidden` em decoração.
- **Não só cor:** status sempre cor + ícone + texto.
- **Reduced motion** respeitado. **Imagens** com `alt` significativo (decorativas
  com `alt=""`).
- **Conteúdo:** linguagem simples, abreviações explicadas, números legíveis.

## 11. Conteúdo & microcopy

- **PT-BR claro**, verbo de ação nos CTAs ("Continuar", "Publicar", "Assinar").
- **Tom Pralís** com o colaborador (caloroso); **preciso** com o TI.
- **Datas:** relativas + absolutas no hover. **Vazios:** humanos, nunca "null".
- **Sem jargão** com o usuário final; sem "erro 500" — diga o que fazer.

## 12. Performance é UX

- App do colaborador **leve em qualquer celular**: sem blur, sem loop infinito,
  imagens/vídeos otimizados, code-splitting por rota.
- Skeletons rápidos > spinners; conteúdo aparece progressivamente.
- Detalhe e budgets em `11_DESIGN_REVIEW_CHECKLIST.md` (gate de performance).

---

## 13. Anti-padrões de UX (proibidos)

- ❌ Tela vazia sem orientação · ❌ erro sem saída · ❌ ação sem feedback ·
  ❌ status só por cor · ❌ placeholder como label · ❌ mais de 1 ação primária ·
  ❌ modal que não fecha no Esc · ❌ dark patterns / urgência falsa ·
  ❌ animação que bloqueia a tarefa · ❌ texto cinza-claro ilegível.

---

### Conexões
- Movimento detalhado → `07_MOTION_GUIDELINES.md`
- Checklist verificável → `11_DESIGN_REVIEW_CHECKLIST.md`
- Regras permanentes → `10_DESIGN_RULES.md`
