# 03 · Visual Identity — Pralís

> A fonte da verdade visual: cores, tipografia, espaçamento, tokens, componentes
> base. Todos os valores aqui são **extraídos do código real** (`tailwind.config.ts`,
> `src/styles/pralis.css`, `src/admin/admin.css`, `docs/ADMIN_DESIGN_SYSTEM.md`).
> Quando um número aparecer numa tela, ele deve vir desta lista.

---

## 1. A marca

### Símbolo-assinatura: trio de espigas
Três **espigas/brotos de trigo** estilizados, nas três cores da marca (laranja,
dourado, marrom).

É o elemento gráfico mais reconhecível. Usado em capas, divisores, favicon, momentos
de marca. Arquivo: `src/assets/brand/simbolo-espiga.svg`.

> **Nota de valor:** o SVG exportado do Illustrator usa hex levemente diferentes
> (`#ee7436` laranja · `#b2832c` dourado · `#5e3832` marrom) — equivalentes visuais
> dos tokens canônicos. **A fonte da verdade de cor são os tokens da paleta oficial
> (§2):** `#f37435` · `#b8860b` · `#5e3731`. Ao recriar a marca em código/CSS, use os
> tokens; os valores do arquivo SVG ficam só dentro do próprio arquivo.

### Símbolo secundário: par de folhas (broto)
Um broto de duas folhas — `simbolo-par.svg` / `simbolo-pralis.svg`. Usado como marca
compacta e em celebrações (o `PralisSymbol` anima o par + um "X" triplo celebrativo).

### Logotipos disponíveis (`src/assets/brand/`)
| Arquivo | Uso |
|---|---|
| `logo-branca.svg` | Marca sobre fundos escuros (app, apresentação) |
| `logo-preta.svg` | Marca sobre fundos claros (admin, favicon) |
| `logo-primario-laranja/bege/fundo-bordo.png` | Variações primárias |
| `logo-secundario-bege/bordo.png` | Variações secundárias |
| `pattern-brand.svg`, `padrao-fundo.svg` | Texturas/padrões sutis de fundo |

**Regra de logo:** a fonte **MadeByDillan** só existe **dentro do logotipo**. Nunca
use MadeByDillan em texto corrido de UI.

---

## 2. Paleta oficial (marca)

```
PRETO      #000000  / #0d0800 (preto quente do app)
MARROM     #5e3731  (surface / detalhe)
DOURADO    #b8860b  (+ claro #d4a017, vívido #e6b020)
LARANJA    #f37435  (+ claro #f8936a)  ← cor de AÇÃO
BRANCO     #ffffff
CREME      #e8cfa0  (texto suave / superfícies claras quentes)
```
**Auxiliares (status/feedback):**
```
VERDE      #5dd87a (sucesso, app)  /  #1e7e4e (sucesso, admin claro)
VERMELHO   #ef4444 (app)  /  #c0392b (admin)
ROXO       #a855f7 (uso raro, categorização)
ÂMBAR      #b7791f (aviso, admin)
```

**Significado das cores:**
- **Laranja = ação.** O laranja marca o que se clica/o próximo passo. Um por contexto.
- **Dourado = premium/brilho.** Fios, realces, progresso, momentos especiais. No
  **admin claro, evite dourado** (fica sujo no branco) — reserve para um detalhe raro.
- **Marrom = base/detalhe.** Surface escura no app; detalhe (wordmark, avatar
  fallback, ênfase rara) no admin.
- **Creme = calor.** Texto secundário no escuro; superfícies quentes no claro.

---

## 3. Tema 🌙 Colaborador (DARK) — tokens reais

Fonte: `src/styles/pralis.css` (`:root`).

```css
/* Fundo — quente, nunca preto puro */
--bg-base:        #0d0800;   /* fundo do app */
--bg-deep:        #050200;   /* overlays, modais */

/* Superfícies (cards) */
--glass-bg:       #1c1008;   /* card base */
--glass-bg-warm:  #261508;   /* card warm/gold */
--color-surface-card-strong: #221308;
--color-surface-card-soft:   rgba(255,255,255,0.05);

/* Marca */
--gold:#b8860b;  --gold-light:#d4a017;  --gold-vivid:#e6b020;
--orange:#f37435; --orange-light:#f8936a;
--brown:#5e3731;  --cream:#e8cfa0;
--green:#5dd87a;  --red:#ef4444;  --purple:#a855f7;

/* Texto */
--text-primary:   #ffffff;
--text-secondary: #e8cfa0;                       /* creme */
--text-muted:     rgba(232,207,160,0.65);
--text-locked:    rgba(255,255,255,0.46);
--text-on-gold:   #1a0e00;                        /* texto sobre dourado */

/* Bordas / strokes (quentes, finas) */
--glass-border:   rgba(184,134,11,0.22);
--border-gold:    rgba(184,134,11,0.35);
--stroke:         rgba(184,134,11,0.22);
--stroke-soft:    rgba(255,255,255,0.08);

/* Navegação */
--nav-bg:#150900; --nav-active-bg:#f37435; --nav-active-text:#ffffff;

/* Safe area (PWA / notch) */
--safe-top:    env(safe-area-inset-top, 0px);
--safe-bottom: env(safe-area-inset-bottom, 0px);
```

**Notas de execução (dark):**
- **Sem `backdrop-filter: blur`** e **sem sombras pesadas** nas telas do colaborador
  (performance em celular fraco). `--glass-shadow: none`, `--shadow-card: none`.
- O fundo quente vem do `AnimatedBackground` (camada fixa, theme-aware), não de
  sombra/glow caro.

---

## 4. Tema ☀️ Colaborador (LIGHT opcional) — tokens reais

Ativado por `[data-theme='light']` (toggle no Perfil). **Tons quentes, não branco
puro.** É o mesmo mundo emocional, mais claro.

```css
--bg-base:    #fdf8f2;   /* creme quente */
--bg-deep:    #f5ece1;
--bg-surface: #ffffff;
--text-primary:   #1a0e00;
--text-secondary: #5e3731;   /* marrom */
--text-muted:     #8a6058;
--orange:#f37435; --gold:#b8860b; --green:#1e7e4e;
--stroke:#e5d5c5; --glass-border:#e5d5c5;
--shadow-card: 0 1px 8px rgba(26,14,0,0.06);
```

> **Por que o verde muda no light:** no dark o sucesso é `#5dd87a` (vibra sobre
> preto); no light vira `#1e7e4e` porque `#5dd87a` **não passa AA** sobre o fundo
> creme. É ajuste de contraste do **mesmo mundo** (app), não "vazamento" da linguagem
> do admin. A regra "componente/cor não cruza de mundo" continua valendo — aqui é a
> mesma cor semântica (sucesso) reespecificada para legibilidade.

> **Decisão-chave:** `--bg-base` **não** é simplesmente invertido — o fundo claro vem
> da camada `AnimatedBackground` theme-aware, para proteger telas ainda não adaptadas
> (Login, Onboarding, Conclusão, Progresso seguem dark). Telas adaptadas ao light:
> Feed, LisChat, Profile, ModuleCard, BottomNav, QuizCard, TextCard, StoryPlayer,
> LisCard, SummaryCard, CompletionCard. **VideoCard permanece dark** de propósito.

---

## 5. Tema 🗂️ Admin / CMS (LIGHT) — tokens reais

Fonte: `src/admin/admin.css` (`.adm-root`) + `docs/ADMIN_DESIGN_SYSTEM.md`.
SaaS premium estilo Linear+Notion+Vercel, com a leveza/espaço da Apple.

```css
/* Canvas & superfícies (neutros quentes) */
--bg-app:     #FFFFFF;
--bg-subtle:  #FAF9F8;   /* seções, header de tabela, hover de linha */
--bg-muted:   #F5F4F2;
--bg-inset:   #F2F0ED;

/* Bordas (preferir borda 1px a sombra) */
--border:        #ECEAE7;   /* hairline padrão */
--border-strong: #DAD6D1;   /* inputs, botões secundários */

/* Texto (near-black quente, nunca #000) */
--ink:            #1A1714;
--text-secondary: #57514B;
--text-muted:     #8A837C;
--text-disabled:  #B8B2AB;

/* Marca — AÇÃO (laranja) */
--accent:       #F26B2A;  --accent-hover:#E25E1F;  --accent-active:#C9501A;
--accent-text:  #C9501A;  /* laranja escuro p/ link/texto sobre branco (AA) */
--accent-tint:  #FEF1EA;  /* realce suave */
/* Nota: --accent-active e --accent-text compartilham #C9501A de propósito (o
   laranja escuro AA). Para TEXTO/LINK sobre branco, referencie o TOKEN
   --accent-text (não o hex solto), para deixar a intenção semântica clara. */

/* Marca — DETALHE (marrom) */
--brand-brown:  #5E3731;  --brown-tint:#F4EFEE;

/* Status */
--success:#1E7E4E; --success-bg:#ECF7F0;
--danger: #C0392B; --danger-bg: #FCEEEC;
--warning:#B7791F; --warning-bg:#FBF3E5;

/* Foco */
--ring: 0 0 0 3px rgba(242,107,42,0.25);
```

**Regras de cor do admin:** branco predomina · **1 laranja por tela** (a ação) ·
marrom só em detalhe · **sem dourado na UI** · status só para feedback · cinzas
quentes para estrutura · **sem gradientes** (exceto micro-gradiente raro em gráfico).

---

## 6. Tipografia

**Famílias** (`src/styles/pralis.css`):
| Fonte | Papel | Regra |
|---|---|---|
| **MadeByDillan** | Display / logo | **Só dentro do logotipo.** Nunca em texto de UI. |
| **Montserrat** (400/600/700) | UI / corpo | A fonte de trabalho de tudo. |
| **TR Freehand** | Manuscrita / acento | Uso raro: toque humano, assinatura, fala da Lis. |
| *(mono)* | Códigos / IDs | `JetBrains Mono`/`IBM Plex Mono`/`ui-monospace`. |

> Em **apresentações** e capas, é permitido um **serif editorial** (ex.: Fraunces/
> Georgia) para o ar de keynote — ver doc 08. Na **UI do produto**, mantenha
> Montserrat.

**Escala tipográfica do admin** (referência de produto):
| Estilo | Tam/Linha | Peso | Uso |
|---|---|---|---|
| Page title (H1) | 22/28 | 700 | título da tela |
| Section (H2) | 17/24 | 600 | bloco |
| Subsection (H3) | 15/22 | 600 | cards |
| Body | 14/22 | 400 | texto padrão |
| Body-strong | 14/22 | 600 | nome/valor |
| Label | 13/18 | 500 | labels de input |
| Eyebrow/Caption | 11/16 | 600 · 0.06em UPPER | overline, header de tabela |
| KPI number | 28–32 | 700 | métricas (tabular) |

- **Números:** sempre `font-variant-numeric: tabular-nums`.
- No **app**, títulos podem ser maiores e mais expressivos (story fullscreen); o
  corpo continua Montserrat com ótima legibilidade.

---

## 7. Espaçamento, grid e responsividade

- **Escala base 4:** `4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64`.
- **Hierarquia por espaço**, não por caixa. Ritmo vertical entre seções: 32–40.
- **Admin:** sidebar 248px (colapsa para rail 64px) + conteúdo `max-width 1200px`,
  padding 32 desktop / 16 mobile, grid 12 col / gutter 24. Drawer < 1024px.
- **App:** mobile-first, `app-shell` fullscreen, `safe-area` (notch), bottom nav.
- **Breakpoints:** sm 640 · md 768 · lg 1024 · xl 1280.
- **Toque ≥44px** no mobile; controles 36px no desktop.

---

## 8. Raio, elevação e bordas

- **Raio:** sm 6 · **md 8** (inputs/botões admin) · **lg 12** (cards admin) ·
  **card 20** (cards do app, `borderRadius.card`) · **pill 999**.
- **Admin:** cards usam **borda 1px (`--border`), não sombra**. Sombra só em camadas
  flutuantes (dropdown/popover/modal/toast): `--shadow-md 0 8px 24px rgba(26,23,20,.10)`.
- **App:** superfícies por **borda quente fina** (`--stroke`), sem sombra pesada.
  Sombras de marca existem no Tailwind (`pralis-glow`, `pralis-card`, `play`) — use
  com parcimônia e nunca nas telas críticas de performance do colaborador.

---

## 9. Componentes base (tokens visuais)

### Botões
- **App — `btn-laranja`:** gradiente laranja→dourado→laranja animado (shimmer), texto
  branco, `active: scale(0.97)`. **`btn-ghost`:** transparente, borda `--stroke`.
- **Admin:** altura 36 (sm 32 · lg 40), raio 8, peso 600, 14px. **Primary:** bg
  `--accent`, texto branco. **Secondary:** branco, borda `--border-strong`.
  **Ghost:** transparente. **Danger:** `--danger`. **1 primary por tela.**

### Inputs (admin)
- Altura 36, raio 8, borda `--border-strong`, bg branco, texto 14 `--ink`.
- Foco: borda `--accent` + `--ring`. Erro: borda `--danger` + helper text.
- Variantes: text, textarea, select, search (ícone à esquerda), **switch** (laranja
  on), checkbox/radio (laranja), **segmented control** (estilo Linear).

### Tabelas (admin — componente herói)
- Borda 1px `--border`, raio 12, branco. Header `--bg-subtle`, eyebrow 11 UPPER,
  sticky. Linhas 48px, hover `--bg-subtle`, **sem zebra**. Selecionada: faixa
  esquerda `--accent` + `--accent-tint`. Números tabulares; status como pills; ações
  aparecem no hover. < 768px → vira cards (label:valor).

### Cards
- **App:** `glass` / `glass-gold` (warm), borda quente, raio 20. Card de módulo tem
  estados locked/active/in-progress/done.
- **Admin:** branco, borda 1px, raio 12, padding 20–24, **sem sombra**. KPI: eyebrow
  + número grande tabular + delta + sparkline opcional. **Nunca card dentro de card
  dentro de card.**

### Badges / pills (status)
- **`tag-chip`:** 11px UPPER, fundo laranja sólido + texto branco (contraste AA).
- **`StatusBadge`:** verde (ativo/concluído), laranja/âmbar (pendente), cinza
  (arquivado). Sempre **cor + texto** (nunca só cor).

### Ícones
- **lucide-react** (stroke 1.5; 18px na nav, 16px inline). Cor `--text-secondary`;
  **laranja quando ativo**; nunca multicor.
- **Ícones de marca/conteúdo:** `ModuleIcon` (flower, sprout, grain, wheat, bread,
  croissant, cake, star, heart, chef) — SVG temáticos de padaria.

### Gráficos (admin)
- Linha/área: stroke 2px `--accent`, área `--accent` @8%, sem grid vertical, dot só
  no hover. Donut: trilho `--border`, valor `--accent`, número tabular no centro.
  Barras: `--accent`, topo arredondado 4. Máx 4–5 cores dessaturadas. "Sem dados
  ainda" elegante — nunca "0%" quebrado.

---

## 10. Uso da marca (do's & don'ts rápidos)

✅ Logo branca no escuro, preta no claro · espigas como assinatura · laranja para
ação · dourado para brilho premium (escuro) · Lis em momentos-chave · MadeByDillan
só no logo · texto sempre legível (AA).

❌ Dourado na UI clara do admin · MadeByDillan em texto · mais de uma ação primária
por tela · `backdrop-blur`/loops infinitos no app do colaborador · cor sem ícone para
status · branco/azul/cinza "corporativo" sem calor · logo distorcido/recolorido fora
das variações oficiais.

---

### Conexões
- Catálogo de componentes reais → `04_COMPONENT_LIBRARY.md`
- Tokens de movimento → `07_MOTION_GUIDELINES.md`
- Regras invioláveis → `10_DESIGN_RULES.md`
