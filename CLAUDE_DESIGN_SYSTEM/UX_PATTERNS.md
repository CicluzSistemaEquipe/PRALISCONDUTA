# UX_PATTERNS — Pralís (acionável)

> Padrões de **comportamento** das telas. Valores em `DESIGN_TOKENS.json`.
> Filosofia (o *porquê*) em `../DESIGN_KNOWLEDGE_BASE_PRALIS/06_UX_GUIDELINES.md` —
> aponte para lá, não repita. Auditoria: `CLAUDE_PROMPTS/audit-ux.md` ·
> Review final: `CLAUDE_PROMPTS/design-review.md` (gate RED bloqueia entrega).

**Dois mundos, sempre decidir antes de qualquer pixel:**

| | 🌙 App colaborador | ☀️ Admin / CMS |
|---|---|---|
| Objetivo | engajar, acolher, **fazer concluir** | produtividade, clareza, velocidade |
| Fundo | escuro quente `#0d0800` (light opcional creme `#fdf8f2`) | branco `#FFFFFF` |
| Ação | laranja `#f37435` | laranja `#F26B2A` — **1 por tela** |
| Pergunta-chave | em <3s: onde parei / o que faço / quanto falta | qual o número, e o que faço com ele |

---

## 1. Hierarquia — 1 mensagem principal por tela

- **Defina o elemento #1** e dê a ele tamanho + peso + espaço. Todo o resto é secundário.
- **Hierarquia por espaço, não por caixa.** Agrupe com whitespace + hairline `#ECEAE7`. **Proibido card-dentro-de-card.**
- **Cor = hierarquia.** Laranja marca **a** ação. Se tudo é colorido, nada destaca → estrutura em neutros, laranja só no CTA.
- **Escala tipográfica real** (ver `TYPOGRAPHY_SYSTEM.md`): título → corpo → label. Nunca tudo do mesmo tamanho.

```
OK   [ H1 22/700 ]           RUIM  [ texto 16 ]
     [ corpo 14 muted ]            [ texto 16 ]
     [ # CTA laranja ]             [ texto 16 azul ] [ texto 16 verde ]
     1 foco, neutros, 1 acao       tudo igual, 3 cores competindo
```

## 2. Escaneabilidade

- **Blocos previsíveis:** `eyebrow → título → conteúdo → 1 ação`.
- **Identificador à esquerda** (avatar + nome), **valor/ação à direita**.
- **Números tabulares** (`tabular-nums`) em todo KPI/coluna numérica — alinham na vírgula.
- **Ícone + rótulo juntos** para reconhecimento rápido (status, nav).
- **Texto curto:** frases diretas; bullets antes de parágrafos.

## 3. Redução de cliques

- Otimize o **caminho feliz**: a tarefa mais comum em menos passos.
- **Defaults inteligentes** — não pergunte o que dá para inferir.
- **Ações no hover** (admin) / **toque direto** (app); evite menus aninhados.
- App: nunca esconda continuar de onde parei atrás de 2+ toques.

## 4. Progressive disclosure

- Mostre o **essencial**; o avançado vem sob demanda (acordeão, mais opções, drawer, drill-down).
- **Editor (admin):** complexidade revelada por bloco, não tudo de uma vez.
- **Relatório:** do agregado (KPI) ao indivíduo por interação (drill-down), não tudo na 1a tela.

---

## 5. Os 3 estados (OBRIGATÓRIOS em todo bloco/lista/tela)

Nenhum bloco que carrega dados pode ter só o estado cheio. Sempre os três:

| Estado | O que mostrar | Regra |
|---|---|---|
| **Loading** | **skeleton** com a forma do conteúdo real | nunca spinner solto; sem layout-shift ao resolver |
| **Empty** | **ícone + título + 1 linha + CTA** | explica e oferece a 1a ação; nunca 0 parecendo quebrado |
| **Error** | **ícone + causa curta + botão Tentar de novo** | sempre uma saída; nunca dead-end |

**Copy PT-BR de referência:**

```
EMPTY (admin · colaboradores)
  (icone)  Nenhum colaborador ainda
           Convide a equipe para comecar a acompanhar a evolucao.
           [ + Adicionar colaborador ]

EMPTY (app · feed)
  (icone)  Sua trilha comeca aqui
           Toque no primeiro modulo e de o primeiro passo.
           [ Comecar ]

EMPTY (relatorio · sem dados)
  (icone)  Sem dados ainda
           Os numeros aparecem assim que houver conclusoes.

ERROR (generico)
  (icone)  Nao foi possivel carregar
           Verifique a conexao e tente novamente.
           [ Tentar de novo ]

LOADING
  [=====]  3-5 linhas skeleton, mesma altura do conteudo
```

**Do / Nao:**
- DO: Empty sempre com CTA da 1a ação.  NAO: Empty só com Nenhum resultado.
- DO: Skeleton com a forma final.  NAO: Spinner centralizado que esconde o layout.
- DO: Error com botão de retry.  NAO: Mensagem técnica (`500 / undefined`) sem saída.

---

## 6. Feedback — toda ação responde

- **Otimista:** a UI atualiza na hora; reconcilia com o servidor depois.
- **Toast** confirma e some (sucesso ~3s; erro fica até dispensar + oferece desfazer/retry).
- **Botão em ação:** vira `loading` (spinner + label Salvando…), fica **disabled**, sem duplo-envio.
- **Sem ação silenciosa:** salvar, excluir, mover, concluir — todos dão sinal.

| Tipo | Cor (token) | Ícone | Copy exemplo |
|---|---|---|---|
| Sucesso | `success` | check | Módulo publicado. |
| Erro | `danger` | alerta | Não foi possível salvar. Tente de novo. |
| Aviso | `warning` (admin) | alerta | 3 colaboradores sem acesso. |
| Desfazer | neutro + link | voltar | Colaborador removido. **Desfazer** |

- **Destrutivo** (excluir/reverter): confirmação explícita, verbo claro no botão (Excluir módulo), **sem dark pattern**. Ação irreversível → digite-para-confirmar ou desfazer por alguns segundos.

---

## 7. Status visual — cor + ícone + texto (NUNCA só cor)

**5 estados do módulo** (contrato de produto — não renomear a lógica):

| Estado | Cor (token) | Ícone | Texto | Affordance |
|---|---|---|---|---|
| **Disponível** | neutro / `action` | circulo | Disponível | clicável, normal |
| **Recomendado** | `action` laranja | estrela | Recomendado | destaque suave, próximo passo |
| **Em andamento** | `gold`/`action` | progresso | Em andamento · 40% | barra de progresso visível |
| **Concluído** | `success` | check | Concluído | selo, opção de revisar |
| **Bloqueado** | `textMuted` | cadeado | Conclua X para liberar | dimmed, explica o porquê |

- **Bloqueado sempre explica a condição** (Conclua o módulo anterior), nunca só apaga.
- DO: verde + check + Concluído.  NAO: só pintar de verde (falha em daltonismo + leitor de tela).

---

## 8. Formulários

- **1 coluna**, label **acima** do campo (não placeholder-como-label).
- **Validação no blur**, não a cada tecla; erro **abaixo** do campo, com ícone + texto.
- **Enter envia**, **Esc** fecha/cancela; foco vai ao 1o campo com erro.
- **Toque ≥44px**; input padding `10px 12px` (token); radius `8px` (admin).
- **Estado de envio** no botão; nunca permitir duplo-clique.
- **Campos opcionais marcados** (opcional), não os obrigatórios com asterisco solto sem legenda.

```
Nome do modulo
[ Pao de fermentacao natural          ]
Aparece na trilha do colaborador.            <- hint, text-muted

E-mail
[ joana@...                            ]
(!) E-mail invalido.                         <- erro: danger + icone + texto
```

---

## 9. Microcopy PT-BR

| Contexto | DO (use) | NAO (evite) |
|---|---|---|
| Botão de ação | Salvar alterações / Publicar módulo | Enviar / OK |
| Empty | Sua trilha começa aqui | Nenhum registro encontrado |
| Erro | Não foi possível salvar. Tente de novo. | Erro 500 / Falha inesperada |
| Confirmação destrutiva | Excluir módulo | Você tem certeza? (botão Sim) |
| Sucesso | Pronto, publicado! | Operação concluída com êxito |
| Bloqueado (app) | Conclua o módulo anterior para liberar | Acesso negado |
| Progresso (app) | Faltam 2 passos | 60% complete |
| Loading longo | Quase lá… | Aguarde… indefinido |

- **Tom:** app = acolhedor, 2a pessoa, leve (você, vamos); admin = direto, objetivo, sem floreio.
- **Verbo na ação**, não rótulo genérico. Sem jargão técnico exposto ao usuário.

---

## 10. Acessibilidade AA — checklist (WCAG 2.2)

- [ ] **Contraste** texto ≥ 4.5:1; ícone/large ≥ 3:1. Texto/link laranja **sobre branco = `#C9501A`** (`accentText`), nunca o laranja vivo.
- [ ] **Status** sempre cor + ícone + texto (item 7).
- [ ] **Foco visível** em todo elemento interativo (ring); nunca `outline:none` sem substituto.
- [ ] **Teclado:** Tab na ordem visual, **Esc** fecha overlay, **Enter** envia, setas no story; sem foco preso.
- [ ] **Toque ≥44px** no mobile; 36px controles desktop.
- [ ] **Labels** programáticos em todo input; botão só-ícone tem `aria-label`.
- [ ] **prefers-reduced-motion** respeitado (desliga transforms, mantém opacity).
- [ ] **App:** sem `repeat: Infinity`, sem `backdrop-filter: blur`.
- [ ] **Sem dark pattern:** opt-out claro, nada pré-marcado, sem urgência falsa.

> Falha de contraste / foco / teclado = **Blocker** no `design-review.md`. Não passa.
