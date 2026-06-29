# CMS_PATTERNS — Pralís Admin ☀️

> Padrões acionáveis do **mundo admin/CMS** (claro, produtivo, Linear/Notion/Vercel +
> leveza Apple): tabela herói, CRUD em modal, busca/filtros/export e o **editor de
> conteúdo** (timeline + preview real + rascunho→publicar).
> Valores em `DESIGN_TOKENS.json`. Mundo/leis em `BRAND_RULES.md`.
> Telas-âncora: `admin-colaboradores.png`, `admin-modulos.png`, `admin-editor-modulo.png`,
> `admin-termos.png`.

**Regra-mãe:** claro sempre · **sem dourado na UI** · 1 laranja por tela
(`admin.accent #F26B2A`; texto laranja sobre branco = `accentText #C9501A`) · borda 1px
em vez de sombra · tipografia Montserrat (sem serifa).

---

## 1. Shell do admin

```
┌──────────┬───────────────────────────────────────────────────────────┐
│  LOGO     │  Título da tela                    [ buscar… ]  [+ Novo]  │ ← header sticky z-30
│           │  subtítulo / contagem                                     │
│ SIDEBAR   ├───────────────────────────────────────────────────────────┤
│  248px    │  [filtros ▾]  [status ▾]            12 de 48 · [Exportar] │ ← toolbar
│ (grupos)  ├───────────────────────────────────────────────────────────┤
│           │  TABELA HERÓI                                              │
│  rail 64  │  …                                                         │
└──────────┴───────────────────────────────────────────────────────────┘
```

- Sidebar **agrupada** por seção (CMS enterprise já entregue), fixa ≥1024, drawer < 1024,
  rail colapsado 64px. Item ativo: laranja sutil + barra de 2px, nunca preenchimento forte.
- Conteúdo `max-width 1200px`, padding 32/16. Ação primária da tela ("+ Novo") no header,
  laranja. Tudo mais é neutro.

---

## 2. Tabela é o HERÓI (Linear/Notion)

A tabela não é um anexo — é a tela. Densa, calma, legível.

```
┌────────────────────────────────────────────────────────────────────────┐
│ NOME            EQUIPE      PROGRESSO    STATUS        ÚLTIMO ACESSO     │ ← header eyebrow
├────────────────────────────────────────────────────────────────────────┤   (sutil, sem fundo forte)
│ Ana Souza       Produção    5/6 ●●●●●○   ● Em dia      ontem        ···  │ ← linha 48px, hover bgSubtle
│ Bruno Lima      Logística   2/6 ●●○○○○   ● Atrasado    há 9 dias    ···  │   ações (···) só no hover
│ Carla Dias      Produção    6/6 ●●●●●●   ● Concluído   há 2 h       ···  │
└────────────────────────────────────────────────────────────────────────┘
```

**Anatomia**
- **Header sutil:** `eyebrow` 11/600 uppercase, `textMuted`, **sem fundo pesado**, borda
  inferior 1px.
- **Linhas 48px**, **sem zebra**. Separação por borda 1px `admin.border`, não por cor de fundo.
- **Hover de linha** → `admin.bgSubtle #FAF9F8`; cursor pointer se a linha navega.
- **Ações no hover:** botões/ícones (`···`, editar, excluir) aparecem na borda direita só
  no hover da linha; em touch ficam sempre visíveis ou atrás de um kebab.
- **Status pills:** `radius.pill`, fundo tint do status, texto + ponto/ícone. Nunca só cor.
  Em dia (`success/successBg`) · Atrasado (`warning/warningBg`) · Pendente (`danger/dangerBg`).
- **Números tabulares** em progresso/datas/contagens.
- Coluna primária (nome) com peso `bodyStrong` 14/600; demais `body` 14/400 `textSecondary`.

**Responsivo < 768 → vira CARDS**
```
┌──────────────────────────────┐
│ Ana Souza            ● Em dia │
│ Produção · 5/6 módulos       │
│ último acesso: ontem    [···]│
└──────────────────────────────┘
```

**Do:** ordenação por coluna (seta no header), seleção em massa via checkbox na 1ª coluna
quando há ações em lote, sticky header ao rolar.
**Don't:** zebra striping, bordas verticais por célula, fundo de header colorido, linhas
< 44px no touch, ação destrutiva sem confirmação.

---

## 3. CRUD em modal

Criar/editar acontece em **modal** (foco na tarefa), não em página separada, exceto fluxos
longos (ver editor §5).

```
        ┌─────────────────────────────────────┐
        │ Novo colaborador               [ ✕ ] │ ← h2 17/600 · Esc fecha
        ├─────────────────────────────────────┤
        │ Nome        [____________________]   │ ← label 13/500 acima do input
        │ E-mail      [____________________]   │   input padding 10/12, radius 8
        │ Equipe      [ Produção         ▾ ]   │
        │ Gerente     [ Ana Souza        ▾ ]   │
        ├─────────────────────────────────────┤
        │                 [ Cancelar ] [Salvar]│ ← primário laranja à direita
        └─────────────────────────────────────┘
```

- Overlay `z-70`, sombra `elevation.adminMd`, largura ~480–560px. Entrada `panel` 240ms.
- **Teclado:** Esc fecha, Enter salva, foco inicial no 1º campo, focus-trap, ring visível.
- **Feedback em toda ação:** salvar mostra estado de carregando no botão → toast de sucesso.
- **Excluir:** modal de confirmação separado, ação destrutiva em `danger`, exige reconhecer
  o que será apagado ("Excluir Ana Souza? Os dados de conclusão serão mantidos.").
- **Validação inline** (sob o campo, `danger`), nunca só um alerta no topo.

**Don't:** modal-dentro-de-modal; formulário gigante sem agrupar; botão primário à esquerda;
fechar ao clicar fora se há rascunho não salvo (avisar).

**Privacidade (LGPD):** coletar só o necessário. Dados pessoais/sensíveis (nome, e-mail,
assinaturas de termos) são minimizados e nunca expostos em logs/export sem propósito.

---

## 4. Busca · filtros · export

- **Busca:** campo no header, ícone lucide à esquerda, placeholder com exemplo
  ("Buscar por nome ou e-mail"), debounce, limpa com ✕. Filtra a tabela em tempo real.
- **Filtros:** chips/dropdowns na toolbar (`status ▾`, `equipe ▾`). Filtro ativo vira chip
  removível. Mostrar **contagem de resultado** ("12 de 48").
- **Empty de busca:** "Nenhum resultado para '{termo}'" + botão "Limpar filtros" — distinto
  do empty de "sem dados ainda".
- **Export:** botão secundário na toolbar (`Exportar` → CSV/PDF). Exporta **o recorte atual**
  (filtros aplicados), avisa o que está incluído. Sem PII desnecessária no arquivo.

---

## 5. Editor de conteúdo (Módulo) — timeline + preview real + rascunho→publicar

Tela-âncora: `admin-editor-modulo.png`. É o coração do CMS. **Contrato `Module`/`Story`
congelado** — o editor monta o dado, **não** muda as regras de desbloqueio/progresso/
conclusão/assinatura.

```
┌──────────────┬────────────────────────────────┬──────────────────────┐
│  TIMELINE     │  EDITOR DO BLOCO SELECIONADO   │   PREVIEW REAL       │
│  de blocos    │                                │  (ModulePreview)     │
│              │  Tipo: [ Texto ▾ ]             │   ┌──────────────┐    │
│ ⠿ Capa       │  Título [________________]     │   │  ▓▓ frame    │    │
│ ⠿ Texto   ◀  │  Corpo  [________________]     │   │  de celular  │    │
│ ⠿ Imagem     │         [________________]     │   │  rodando o   │    │
│ ⠿ Quiz       │  [imagem/upload]               │   │  StoryPlayer │    │
│ ⠿ Assinatura │                                │   │  de verdade  │    │
│ [+ bloco]    │  [ Excluir bloco ]             │   └──────────────┘    │
│              │                                │   ‹ • • • ›  (nav)    │
├──────────────┴────────────────────────────────┴──────────────────────┤
│  status: ● Rascunho            [ Pré-visualizar ]  [ Salvar ] [Publicar]│
└───────────────────────────────────────────────────────────────────────┘
```

**Princípios**
- **Timeline única de blocos** (esquerda): lista vertical reordenável (drag handle `⠿`),
  cada bloco mostra tipo + título. Selecionado realça em laranja sutil. `+ bloco` ao final.
- **Editor do bloco** (centro): só os campos do tipo selecionado. Um bloco por vez —
  hierarquia por foco, não por densidade.
- **PREVIEW REAL** (direita): o `ModulePreview` roda o **StoryPlayer de produção** dentro de
  um **frame de celular** — não é mock, é a experiência do colaborador (mundo escuro,
  Montserrat, sem blur/loop). Edição reflete ao salvar o bloco. Permite navegar os stories.
- **Rascunho → Publicar:** estado **`draft` / `published`** explícito (pill no rodapé).
  `Salvar` persiste como rascunho; `Publicar` torna visível ao colaborador. Despublicar
  volta a `draft`. Mudanças em módulo já publicado avisam o impacto.

**Do:** autosave/indicador "salvo há X"; validar que blocos obrigatórios existem antes de
publicar (ex.: assinatura ao final); preview reflete o tema do app (escuro), não o tema admin.
**Don't:** editar regras do contrato congelado; preview "fake" estilizado pelo admin;
publicar sem confirmação; perder reordenação ao trocar de bloco.

---

## 6. Checklist do CMS
- [ ] Claro · 1 laranja · sem dourado · borda > sombra · Montserrat.
- [ ] Tabela herói: header sutil · linhas 48px · sem zebra · hover · ações no hover · pills
      cor+ícone+texto · tabular · < 768 vira cards.
- [ ] CRUD em modal: label-acima, Esc/Enter, focus-trap, validação inline, confirmação de
      exclusão, feedback+toast.
- [ ] Busca + filtros (chips removíveis + contagem) + export do recorte atual · empties
      distintos.
- [ ] Editor: timeline reordenável + editor de 1 bloco + **preview real (StoryPlayer em
      frame de celular)** + status draft/published.
- [ ] Contrato `Module`/`Story` intocado · LGPD/minimização · reduced-motion · AA.
