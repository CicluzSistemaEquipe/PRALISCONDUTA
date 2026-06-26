# Content Editor — Discovery (Roadmap C)

> **Discovery, não implementação.** Branch: `lab/admin-content-editor-discovery`.
> Objetivo: questionar completamente a experiência de **autoria de conteúdo** (a área
> mais usada da plataforma) e propor 3 conceitos para você aprovar **antes** de codar.
>
> **Invioláveis (não muda nada disto):** lógica dos treinamentos, estrutura dos módulos
> (contrato `Module`/`Story`), experiência do colaborador, regras de negócio,
> `prepareStories`/desbloqueio, runtime `content.ts`. A evolução é só da **experiência de
> criação** no admin.

---

## 1. A pergunta que guia tudo
> "Como um administrador cria um **treinamento completo** da forma **mais simples possível**?"

Hoje a resposta é: abrindo 4 abas diferentes, alternando entre Slides, Vídeo e Quiz, sem
ver o resultado real e sem conseguir criar enquete. Dá para fazer — mas não é simples nem
fluido para uso diário.

## 2. Como o editor funciona HOJE (estado verificado)

| Aspecto | Hoje | Arquivo |
|---|---|---|
| Estrutura | 4 abas: **Informações · Slides · Vídeo · Quiz** | `AdminModuloEditor.tsx:38-43` |
| Slides | `Reorder.Group` de stories; texto/Lis editáveis inline (`SlideEditor`), vídeo/quiz/resumo/conclusão como cards read-only | `:570-677`, `SlideEditor.tsx` |
| Adicionar | Texto · Destaque · Fala da Lis | `:45-49` |
| Vídeo | aba separada; posição antes/depois; "upload" só lê `file.name` | `:149-180`, `:818` |
| Quiz | aba separada (`QuizEditor`): perguntas, correta, explicações, sampleSize/randomize | `QuizEditor.tsx` |
| **Preview** | **celular ilustrativo** (`ModulePreview`) — re-desenha cada slide à mão; cobre lis/text/quiz/video/summary/completion | `ModulePreview.tsx` |
| Enquete (`poll`) | **não dá para criar** (o tipo existe, o editor não expõe) | — |
| Áudio da Lis | **sem upload, sem sincronização visual** — `audioSrc` por caminho manual | — |
| Publicação | salvar é **imediato** no `adminStore` (localStorage); sem rascunho/versão | `adminStore.ts` |
| Treinamento | módulos são **lista plana**; não há agrupamento "Treinamento → Módulos" | — |

### Os 7 atritos reais (o que questionar)
1. **O preview não é o produto.** É uma ilustração; não mostra motion, gestos, áudio, sync,
   nem a enquete. O autor edita "no escuro".
2. **A sequência está fragmentada.** Um módulo *é* uma sequência ordenada (Lis → texto →
   vídeo → quiz → enquete → conclusão), mas vídeo e quiz vivem em abas separadas — o autor
   perde o fio da meada.
3. **Enquete não é criável.** Gap direto de "criar tudo pelo dashboard".
4. **Lis/áudio dependem de código.** Sem cadastro visual de áudio + texto + sincronização.
5. **Sem rede de segurança.** Salvar publica na hora; sem rascunho/versão (os Termos já
   têm esse padrão — o conteúdo não).
6. **Sem camada de Treinamento.** Para "centenas de treinamentos", falta o nível acima do
   módulo.
7. **Criar um módulo completo = muitos passos** entre abas; não há fluxo guiado.

---

## 3. Princípios (de CMS modernos — sem copiar interface)
- **Notion:** edição em **blocos** inline; o conteúdo *é* a interface.
- **Webflow/Framer:** **preview fiel** lado a lado; manipulação direta.
- **Storyblok/Sanity/Payload:** **árvore de conteúdo** + schema; preview ao vivo; rascunho
  vs publicado; reuso.
- **Canva/Figma:** **canvas** visual, arrastar livre, ver tudo de uma vez.

Princípios que vou adotar (independentemente do conceito): **um lugar para a sequência**,
**preview real ao vivo**, **drag & drop natural em tudo**, **rascunho → publicar**,
**zero programação**.

---

## 4. Decisão-chave de arquitetura: **Preview = StoryPlayer REAL**
Você pediu o player real, não um celular ilustrativo. É possível **sem tocar no app do
colaborador**:

- O `StoryPlayer` (`src/app/components/StoryPlayer.tsx`) é `position: fixed; inset: 0`.
  Ao colocá-lo dentro de uma **moldura de celular com `transform: scale(...)`**, o `fixed`
  passa a se posicionar **relativo à moldura** (regra do CSS: um ancestral com `transform`
  vira o "contêiner" do `fixed`). Resultado: o player real renderiza **dentro do celular**,
  em escala, e não na tela inteira.
- Alimentamos com o **módulo-rascunho** (estado do editor) + callbacks **no-op** + uma flag
  `preview` (prop **aditiva**, sem mudar o comportamento do colaborador). Como a persistência
  de progresso vive no `Module.tsx` (pai), e **não** no `StoryPlayer`, passar callbacks
  vazios é seguro.
- **Toda** edição (texto, ordem, quiz, enquete, vídeo, cores, bloqueios) reflete **na hora**,
  porque é o **mesmo** componente que o colaborador vê — fidelidade 100%, uma só fonte de
  verdade. O `ModulePreview` ilustrativo é aposentado.

> Esta é a fundação dos 3 conceitos — muda só **como** o autor edita ao lado do preview.

---

## 5. Os 3 conceitos

### Conceito A — CMS Tradicional (Storyblok/Sanity/Payload)
**Organização:** 3 painéis — **árvore** à esquerda (Treinamento → Módulo → Stories),
**formulário** estruturado no centro (campos do nó selecionado), **preview real** à direita.
Drag & drop na árvore.

- ✅ **Vantagens:** familiar para quem já usa CMS; escala para árvores profundas (centenas de
  treinamentos/módulos); separação clara; fácil adicionar novos tipos de campo; muito
  manutenível (formulários dirigidos por schema).
- ⚠️ **Desvantagens:** pesado em formulário e cliques; menos "WYSIWYG"; a **sequência** do
  módulo fica menos tangível (é uma árvore, não um fluxo); mais lento para edições rápidas.
- **Produtividade:** média · **Escalabilidade:** alta · **Manutenção:** alta.

### Conceito B — Editor de Blocos + Timeline + Preview Real *(candidato principal)*
**Organização:** split-view. À esquerda/centro, **uma única timeline vertical de blocos** com
**toda** a sequência do módulo num lugar só — Lis, texto, áudio, vídeo, quiz, enquete,
conclusão — cada bloco **editável inline** (estilo Notion) e **arrastável** para reordenar.
À direita, o **StoryPlayer real** no celular, ao vivo, focando o bloco em edição. Uma barra
no topo cuida do **Treinamento/Módulo (Info)** e do **Publicar**.

As abas Vídeo e Quiz **deixam de existir como abas** — viram **blocos** na mesma timeline
(o autor vê o fluxo inteiro). `prepareStories` continua igual no runtime.

- ✅ **Vantagens:** bate com o modelo mental (módulo = sequência ordenada); **menos cliques**
  para montar um módulo inteiro; preview real elimina o "será que ficou bom?"; drag & drop
  natural; um lugar só; escala bem (blocos compõem); reuso do StoryPlayer = manutenção baixa
  (um registry de blocos + o player real).
- ⚠️ **Desvantagens:** é o que exige **mais engenharia inicial** (unificar editor de blocos +
  embed do player + estado/perf do preview ao vivo).
- **Produtividade:** alta · **Escalabilidade:** alta · **Manutenção:** alta.

### Conceito C — Visual Moderno (Canvas/Filmstrip — Figma/Framer/Canva)
**Organização:** uma **régua horizontal de cards** (cada story um mini-celular que renderiza
o player real); clicar abre um **inspetor flutuante**; o board **é** o preview; zoom/pan,
manipulação direta.

- ✅ **Vantagens:** o mais visual e encantador; ótimo para ver o fluxo inteiro de relance;
  forte para autores com olhar de design; impressiona.
- ⚠️ **Desvantagens:** o **mais complexo** de construir e manter; canvas horizontal é
  desconfortável para módulos longos e texto extenso; edição precisa de texto/quiz em
  painéis flutuantes é trabalhosa; mais custo de performance (vários players vivos);
  **overkill** para uma ferramenta de treinamento usada todo dia por RH (velocidade de
  formulário importa mais que o deleite do canvas).
- **Produtividade:** média (ótimo overview, mais lento no detalhe) · **Escalabilidade:** média
  · **Manutenção:** menor (motor de canvas).

### Comparação
| Critério | A — CMS | **B — Blocos+Timeline** | C — Canvas |
|---|---|---|---|
| "Criar treinamento completo simples" | médio | **melhor** | médio |
| Fidelidade do preview | alta (real) | **alta (real)** | alta (real) |
| Velocidade de edição diária | média | **alta** | média |
| Ver a sequência inteira | baixa (árvore) | **alta** | alta |
| Escalabilidade (centenas) | alta | **alta** | média |
| Manutenção | alta | **alta** | menor |
| Esforço de implementação | médio | **médio-alto** | alto |
| Risco | baixo | médio | alto |

---

## 6. Recomendação: **Conceito B**
É o que melhor responde à pergunta-guia. Unifica a sequência num lugar, usa o **player real**
ao vivo, torna drag & drop natural e reusa o que já existe (Reorder, SlideEditor, QuizEditor)
em vez de jogar fora. C é lindo, mas é deleite de canvas onde o que importa é **velocidade de
autoria diária**; A é sólido, mas fragmenta o fluxo em formulário. B pega o melhor dos dois:
o **fluxo tangível** do canvas com a **velocidade** do formulário inline.

---

## 7. Como cada peça é criada no Conceito B (sem programação)

- **Treinamento / Módulo:** barra superior (Info): título, cargo/segmento, seção, cor,
  símbolo, obrigatório, minutos. (Camada "Treinamento" acima de módulos fica para depois.)
- **Story (qualquer tipo):** botão "+" entre blocos abre um menu (Fala da Lis · Texto ·
  Destaque · Vídeo · Quiz · **Enquete** · Resumo). Insere um bloco editável na posição.
- **Fala da Lis (visual):** bloco com texto + estado da Lis + (futuro) áudio; preview real
  mostra a Lis falando.
- **Texto + Áudio sincronizado:** bloco de texto com parágrafos + destaque; um sub-painel de
  **áudio** com player + uma **mini-timeline** opcional para marcar **cues** (tempo →
  trecho), quando precisão for necessária. **Default permanece o char-sync atual** (sem
  timestamps); cues são camada aditiva (ver `MEDIA_ARCHITECTURE.md`).
- **Vídeo:** anexar (hoje referência por caminho; **upload real depende de Storage — Fase
  1**), e ver **exatamente** como fica no preview real.
- **Quiz:** reaproveita `QuizEditor` como bloco; perguntas arrastáveis.
- **Enquete:** novo editor de bloco (pergunta + opções + múltipla escolha) — torna o tipo
  `poll` criável; preview real renderiza o `PollCard`.
- **Conclusão / Assinatura:** blocos finais (badge/mensagem; assinatura segue a lógica
  aprovada).

## 8. Áudio — arquitetura proposta (a analisar na implementação)
`MP3 → texto sincronizado → legenda → preview → player → Lis`. Proposta: **timeline com
marcadores (cues)** opcionais por trecho, geráveis depois por alinhamento; **default = sync
em tempo real atual**. Legendas (WebVTT) entram junto (acessibilidade/i18n). Detalhe técnico
já em `docs/MEDIA_ARCHITECTURE.md` §5. **Upload de áudio depende de Storage (Fase 1).**

## 9. Drag & Drop — onde fica natural
Módulos (já existe) · **stories/blocos** (unificar na timeline) · **perguntas de quiz**
(estender) · **opções de enquete** · vídeos/falas (são blocos). Mesmo padrão `Reorder` do
Framer que já usamos.

## 10. Faseamento proposto (após aprovação)
- **C1 (local, agora):** editor de blocos unificado (timeline única) + **preview com
  StoryPlayer real** + **enquete criável** + drag & drop em tudo + rascunho→publicar básico.
  Sem Supabase/Storage.
- **C2 (local):** Lis/áudio com cues/sincronização visual + versionamento/publicação
  completos (espelhando Termos).
- **C3 (Fase 1 — Storage):** upload real de áudio/vídeo + **biblioteca de mídia**.

## 11. O que NÃO muda (linha vermelha)
Contrato `Module`/`Story`, `prepareStories`/desbloqueio, runtime `content.ts`,
**comportamento do `StoryPlayer` para o colaborador** (só ganha uma prop `preview` aditiva e
callbacks no-op no admin), regras de negócio, experiência do colaborador.

---

## Decisão pendente (sua)
1. Aprova o **Conceito B** (Blocos + Timeline + Preview com StoryPlayer real)?
2. Confirma o escopo da **Fase C1** (local) como primeiro passo, deixando upload de
   mídia/Lis-cues para C2/C3?
3. Topa **aposentar as abas Vídeo/Quiz** em favor de blocos na timeline única (sem mudar o
   conteúdo/saída, só a autoria)?

**Só implemento após sua aprovação.**

---

## Implementação — Fase C1 (parcial entregue)

> Conceito **B** aprovado. Primeiro incremento de C1, **local e sem tocar o app**.
> `tsc -b` ✅ + `vite build` ✅. Validado visualmente.

### Entregue agora
1. **Preview = StoryPlayer REAL ao vivo.** O `ModulePreview` deixou de ser ilustrativo e
   passou a renderizar o **próprio `StoryPlayer`** do app dentro de uma moldura de celular
   escalada — o `transform: scale` faz o `fixed inset-0` do player se conter na moldura.
   Reflete o módulo-rascunho **instantaneamente** (texto, ordem, quiz, enquete, vídeo),
   com fidelidade 100% (é o mesmo componente do colaborador). Trocar de bloco pula para o
   slide (via `key`); editar o bloco reflete sem remontar.
   - `StoryPlayer` ganhou a prop **aditiva** `preview` (desliga auto-advance, conclusão
     automática e atalhos de teclado globais; mantém a navegação manual). **Default
     `false` → o colaborador não muda em nada.**
2. **Enquete criável pelo Dashboard.** Botão **"+ Enquete"** na timeline de slides +
   `PollSlideEditor` inline (pergunta, opções add/remover, múltipla escolha). A enquete
   aparece no preview real (renderiza o `PollCard`). Fecha o gap "criar tudo sem código"
   para o tipo `poll`.

Arquivos: `src/app/components/StoryPlayer.tsx` (prop `preview`),
`src/admin/components/ModulePreview.tsx` (player real), `PollSlideEditor.tsx` (novo),
`src/admin/lib/modules.ts` (`isEditableSlide`+`newPollStory`), `AdminModuloEditor.tsx`.

### Restante da C1 (próximo incremento — local)
- **Timeline única de blocos:** hoje Vídeo e Quiz ainda são **abas separadas** + cards
  read-only na timeline. Próximo passo: editá-los **inline como blocos** na própria
  sequência (vídeo: anexar/posição; quiz: `QuizEditor` dentro do bloco), aposentando as
  abas — sem mudar a saída/`prepareStories`.
- **Drag & drop estendido:** perguntas de quiz e opções de enquete arrastáveis.
- **Rascunho → publicar** básico (status/versão), espelhando os Termos.

### C2 / C3 (depois)
- **C2 (local):** Lis/áudio com cues/sincronização visual (timeline de marcadores) +
  versionamento/publicação completos.
- **C3 (Fase 1 — Storage):** upload real de áudio/vídeo + biblioteca de mídia
  (ver `MEDIA_ARCHITECTURE.md`).

### Nota do Editor de Conteúdo: **6,5 → 7,5 / 10**
O **preview real ao vivo** (o pedido marcante) e a **enquete criável** elevam muito a
confiança e a completude. Para 9+ falta a **timeline única de blocos** (C1 restante) e a
**autoria de Lis/áudio + mídia** (C2/C3).

---

## Implementação — Fase C1 COMPLETA

> `tsc -b` ✅ + `vite build` ✅. Validado visualmente (timeline + quiz inline + preview real).

### Entregue (fecha a C1)
- **Timeline única de blocos.** Vídeo e Quiz **deixaram de ser abas** e viraram **blocos
  editáveis inline** na própria sequência (`VideoBlockEditor`, `QuizBlockEditor`, cada um
  com cabeçalho de mover/excluir). As abas ficaram só **Informações + Conteúdo**. Adicionar
  qualquer tipo pelo menu único (`+ Texto/Destaque/Fala da Lis/Enquete`, e `+ Vídeo`/`+ Quiz`
  só aparecem se ainda não existirem). **Ordem no editor === ordem no app** —
  `prepareStories` segue intacto no runtime.
- **Drag & drop natural:** blocos da timeline (já existia), **perguntas do quiz** (Reorder +
  alça via `useDragControls`) e **opções da enquete** (Reorder + alça).
- **Rascunho → Publicar:** `Module.status` (`'draft' | 'published'`); botões **Salvar
  rascunho** e **Publicar** + **badge** de status; módulo novo nasce rascunho;
  `content.ts` **esconde `status === 'draft'`** do colaborador (aditivo/retrocompatível —
  módulos sem status seguem visíveis). Não toca desbloqueio/progresso.
- **Preview real ao vivo** mantido.

### Arquivos
`src/lib/types.ts` (`Module.status`), `src/lib/content.ts` (filtro de rascunho),
`src/admin/lib/modules.ts` (`newPollStory` + módulo novo = rascunho),
`src/admin/pages/AdminModuloEditor.tsx` (timeline unificada, blocos inline, publicar),
`src/admin/components/QuizEditor.tsx` (DnD de perguntas),
`src/admin/components/PollSlideEditor.tsx` (DnD de opções),
`src/app/components/StoryPlayer.tsx` (prop `preview`, no commit anterior).

### Riscos / observações
- **DnD de opções da enquete** usa a string como identidade do `Reorder`. Em opções
  **duplicadas** (texto idêntico) o arrasto pode ficar ambíguo. Mitigação futura: dar `id`
  estável às opções (mudança de modelo — fica para depois). Reordenar por arrasto funciona
  bem no caso comum (opções distintas).
- **Lista de Módulos** ainda não mostra badge "Rascunho" — o autor vê o status no editor,
  mas não na listagem. Quick-win do próximo incremento.
- `prepareStories` ainda injeta um vídeo-placeholder antes do quiz **se não houver vídeo** —
  comportamento de runtime **inalterado**; como agora dá pra adicionar o vídeo como bloco,
  o autor controla a posição.

### Nota do Editor de Conteúdo: **7,5 → 8,5 / 10**
Timeline única + preview real + DnD + rascunho/publicar entregam o núcleo do Conceito B.
Falta para 9+: autoria visual de **Lis/áudio com sincronização (cues)** e **mídia/upload**.

## Próximos passos — C2 / C3
- **C2 (local):** Lis/áudio com **timeline de cues** (sincronização visual) + legendas
  (WebVTT) opcionais; **versionamento** completo (histórico de versões publicadas, badge
  "Rascunho" na lista de módulos, preview de rascunho). Detalhe técnico em
  `MEDIA_ARCHITECTURE.md` §5.
- **C3 (Fase 1 — Storage):** **upload real** de áudio/vídeo (drag&drop → bucket, URL na
  Story) + **biblioteca de mídia** (imagens/vídeos/áudios/anexos/miniaturas). Requer
  Supabase Storage — fora do escopo local.
