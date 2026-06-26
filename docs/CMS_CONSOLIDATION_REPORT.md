# CMS Consolidation Report

> Sprint de **consolidação** (encerramento da 1ª fase do CMS). Branch: `lab/cms-consolidation`.
> Sem novas funcionalidades, sem Supabase/Storage/mídia/Lis/push. Só polimento,
> padronização e limpeza seguros. **Nada de lógica de treinamento, regras de negócio ou
> experiência do colaborador foi alterado.**
>
> **Gate:** `tsc -b` ✅ + `vite build` ✅. Validado no build de produção (modal abre + ESC fecha).

---

## 1. Melhorias implementadas

| # | Melhoria | Por quê | Arquivos |
|---|----------|---------|----------|
| 1 | **Primitivos compartilhados** — `Avatar`, `initials`, `ModalShell`, `ModalHeader` extraídos para `ui.tsx` | Estavam **triplicados** em Colaboradores/Gerentes/Acompanhamento (cópias verbatim, com `size` default divergente 34/36). Fonte garantida de divergência. | `ui.tsx`, `AdminColaboradores`, `AdminGerentes`, `AdminAcompanhamento` |
| 2 | **A11y de modais — ESC fecha + foco entra no diálogo** ao abrir | Nenhum modal do admin fechava com teclado nem movia o foco (já tinham `role="dialog"`, mas comportamento não correspondia). Corrigido **em todos de uma vez** via o `ModalShell` único. | `ui.tsx` |
| 3 | **Badge "Rascunho" na lista de Módulos** | `Module.status` existia e o **editor** mostrava Rascunho/Publicado, mas a **lista** não — RH não distinguia o que está no ar do que é rascunho, justo na tela onde mais importa. | `AdminModulos` |
| 4 | **Nomenclatura unificada "slide" → "bloco"** (lista + editor + aria-labels) | O mesmo objeto era "Slide 3" no card e "3 blocos" no chip — inconsistência terminológica dentro da mesma tela. | `AdminModulos`, `AdminModuloEditor` |
| 5 | **Limpeza de resíduos de protótipo** no `AdminPageHeader` | Token legado `--cream-muted` (migração não concluída) → `--text-muted`; placeholder "em construção" trocou o emoji 🚧 por um ícone neutro (Lucide). | `AdminPageHeader` |

---

## 2. Problemas encontrados (auditoria 360°)

A auditoria (ux-ui-reviewer) confirmou: **o admin já está num patamar profissional sólido**
(tokens consistentes, tabelas premium, skeletons, empty states, reduced-motion, drill-down
360°). As imperfeições reais se agrupam em 3 classes:

- **A11y de modais/drawer:** nenhum fechava com ESC nem prendia foco (ModalShell ×2, modal
  de Termos inline, drawer mobile do sidebar).
- **Inconsistência de componente:** `ModalShell`/`Avatar`/`initials` duplicados; dois
  sistemas de "status pill" (`StatusBadge` oficial vs `StatusPill` local vs pills com hex
  cru); dois cartões de KPI (`StatCard` no Dashboard vs `SummaryCard` em Relatórios).
- **Telas com cara de protótipo:** `AdminInicio` (token legado + sombra/glow hardcoded
  única no admin + Salvar sem `dirty`), `AdminPlaceholder` (🚧), lista de Módulos sem
  status.
- **Detalhes:** `window.confirm()` cru na exclusão de módulo (resto usa modal elegante);
  ações só no hover (invisíveis em toque); lápis "decorativo" não-clicável em RowActions;
  senha de gerente coletada e descartada silenciosamente; "Online" sempre verdadeiro;
  ausência de estado de erro de carregamento.

---

## 3. Problemas corrigidos

✅ A11y de **todos os modais** (ESC + foco) — via o `ModalShell` compartilhado.
✅ **Triplicação** de Avatar/initials/ModalShell/ModalHeader — eliminada.
✅ **Status na lista de Módulos** (Rascunho) — adicionado.
✅ **Nomenclatura** slide→bloco — unificada nas telas visíveis.
✅ **Resíduos de protótipo** no header/placeholder — token legado e emoji removidos.

---

## 4. Melhorias futuras (encontradas, **não** implementadas nesta sprint)

Seguras, mas deixadas para não inflar a sprint de consolidação (todas sem Supabase):

- **Unificar status pills** (`StatusPill` cadastral + health badges de equipe) em
  `StatusBadge.tsx`, trocando hex literais (`#cdebd9`/`#1e7e4e`…) por tokens
  `--success`/`--warning`.
- **`window.confirm()` → modal de confirmação** na exclusão de módulo (consistência com
  Colaboradores/Gerentes/Termos).
- **Ações de linha visíveis em toque** (RowActions, "Ver equipe", remover gerente) em vez
  de `opacity-0 group-hover`.
- **RowActions:** transformar o lápis decorativo em botão real (ou removê-lo).
- **`AdminInicio`:** remover a sombra/glow hardcoded, adicionar `dirty` ao Salvar e alinhar
  ao padrão `AdminPageHeader + action`.
- **ESC/foco no drawer mobile** do sidebar e no modal inline de Termos (trocar pelo
  `ModalShell` compartilhado).
- **Estado de erro de carregamento** (`.catch` → EmptyState "tentar novamente") nas telas
  que hoje só têm loading/vazio.
- **Senha de gerente:** ou remover o campo, ou helper text honesto (hoje é descartada).
- **`SummaryCard` (Relatórios) → `StatCard`** para um único dialeto de KPI.
- **Sanitizar** título/corpo na serialização de Termos (defesa do `dangerouslySetInnerHTML`).
- **Confirmação leve ao "Publicar" módulo** (alinhar gravidade com Termos).

---

## 5. Nota do CMS

### **8,5 / 10**

- **Pessoas + Gerentes + Relatórios + Editor + Preview real + Rascunho/Publicar:** maduros,
  coesos, com a11y de modais agora corrigida e componentes unificados.
- **Tira pontos:** os itens do item 4 (pequenos, mas visíveis a um olho atento) e — o
  estrutural — **a persistência ainda é localStorage** (um navegador por vez), o que é
  exatamente o escopo da **próxima fase** (Supabase/Storage), não desta.

---

## 6. O que ainda falta para um CMS "nível mercado"

1. **Persistência real (Supabase) + multiusuário:** hoje o conteúdo vive no `localStorage`
   de um navegador. Para uma equipe de RH produzir junto, o conteúdo precisa ser
   compartilhado/versionado no servidor. *(Próxima fase.)*
2. **Mídia de verdade (Storage):** upload de áudio/vídeo + biblioteca de mídia (hoje é
   caminho manual em `/public`). *(Próxima fase.)*
3. **Lis visual + áudio sincronizado** (timeline de cues). *(Próxima fase.)*
4. **Versionamento/publicação completos** (histórico, rollback, preview de rascunho).
5. **Permissões granulares** (quem edita o quê) e auditoria de quem-mudou-o-quê.
6. **Os polimentos do item 4** (consistência total de pills/cards, ações em toque, etc.).

Itens 1–3 são **explicitamente a próxima fase**. 4–6 são incrementos.

---

## VEREDITO FINAL

**"Este CMS já está maduro o suficiente para começarmos a cadastrar treinamentos reais?"**

### **SIM — para iniciar a produção de conteúdo agora**, com uma ressalva honesta de escopo.

**Por que SIM:** um administrador já consegue, **sem tocar em código**, fazer o ciclo
completo — criar/editar um módulo numa **timeline única de blocos** (Lis, texto, vídeo,
quiz, enquete, conclusão), **ver exatamente como fica** no preview com o StoryPlayer real,
reordenar por **drag & drop**, salvar como **rascunho** e **publicar**; e gerir
**colaboradores, gerentes e relatórios** com visões 360° interligadas. A base é estável
(build/tsc verdes), consistente e com a a11y de modais corrigida. **Não há blocker
funcional** para começar a montar treinamentos.

**A ressalva (não é blocker, é escopo da próxima fase):** o conteúdo produzido agora vive
no **localStorage de um navegador** e a **mídia** ainda é referenciada por caminho manual.
Então a recomendação prática é: **comece a produzir e validar conteúdo já** (a experiência
de autoria está pronta), sabendo que **persistência multiusuário e upload de mídia chegam
na próxima fase (Supabase/Storage)** — quando esse conteúdo passa a ser compartilhado entre
a equipe e a mídia ganha upload de verdade. Para um **único administrador montando e
revisando treinamentos**, está pronto hoje.

> Esta sprint encerra a **1ª fase** do CMS. A próxima fase é dedicada a **mídia, Lis,
> Storage, Supabase e publicação** — o que transforma "pronto para um admin produzir" em
> "pronto para uma equipe operar em produção".
