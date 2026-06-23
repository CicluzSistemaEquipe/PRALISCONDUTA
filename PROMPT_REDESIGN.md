# PROMPT — Pralis Conduta: Revisão de Design e Conteúdo

> **Uso:** Abrir este arquivo em Claude Code / VS Code e pedir para executar as tarefas abaixo.  
> **Projeto:** `E:\Cicluz\Pralis-Conduta\Sistema\` — React 18 + Vite 5 + TypeScript + Framer Motion 11  
> **Entrada principal:** `src/styles/pralis.css` (tokens CSS) + `src/lib/content.ts` (conteúdo)

---

## 1. Paleta Pralis — referência absoluta

| Token / uso                  | Modo claro (`[data-theme='light']`) | Modo escuro (`:root`)     |
|------------------------------|--------------------------------------|---------------------------|
| Fundo base (`--bg-base`)     | `#fdf8f2` (creme quente)             | `#0d0800` (quase preto)   |
| Fundo card (`--bg-card`)     | `#ffffff`                            | `#1c1008`                 |
| Fundo surface 2              | `#fff4eb`                            | `#261508`                 |
| Texto primário               | `#1a0e00` (marrom escuro)            | `#ffffff`                 |
| Texto secundário             | `#5e3731`                            | `#e8cfa0` (creme)         |
| Texto muted                  | `#8a6058`                            | `rgba(232,207,160,0.65)`  |
| Borda / stroke               | `#e5d5c5`                            | `rgba(184,134,11,0.22)`   |
| Acento ouro (`--gold`)       | `#b8860b`                            | `#b8860b`                 |
| Acento laranja (`--orange`)  | `#f37435`                            | `#f37435`                 |
| Nav fundo (`--nav-bg`)       | `#ffffff`                            | `#150900`                 |
| Nav ativo bg                 | `#f37435`                            | `#f37435`                 |
| Nav ativo texto              | `#ffffff`                            | `#ffffff`                 |

**Regra geral:** nunca use `linear-gradient` nem `radial-gradient` em backgrounds de superfícies de conteúdo. Use cores sólidas via tokens CSS. Gradientes só são permitidos: (a) no StoryPlayer (fundo por módulo — já usa `module.gradient[0]`); (b) no `AnimatedBackground` (sutis radial hints de max 0.08 opacidade).

---

## 2. Sistema de tokens CSS — `src/styles/pralis.css`

O arquivo já foi refatorado. Confirmar que os valores abaixo estão exatamente assim:

```css
:root {
  --bg-base: #0d0800;
  --bg-deep: #050200;
  --glass-bg: #1c1008;
  --glass-bg-warm: #261508;
  --glass-border: rgba(184, 134, 11, 0.22);
  --stroke: rgba(184, 134, 11, 0.22);
  --stroke-soft: rgba(255, 255, 255, 0.08);
  --nav-bg: #150900;
  --nav-active-bg: #f37435;
  --nav-active-text: #ffffff;
  --bg-card: var(--glass-bg);
  --bg-surface: var(--glass-bg);
  --bg-surface-2: #261508;
  --bg-elevated: #261508;
  --gold-muted: rgba(184, 134, 11, 0.30);
  --text-primary: #ffffff;
  --text-secondary: #e8cfa0;
  --text-muted: rgba(232, 207, 160, 0.65);
  --text-locked: rgba(232, 207, 160, 0.35);
}

[data-theme='light'] {
  --bg-base: #fdf8f2;
  --bg-deep: #f5ede0;
  --glass-bg: #ffffff;
  --glass-bg-warm: #fff9f4;
  --glass-border: #e5d5c5;
  --stroke: #e5d5c5;
  --stroke-soft: #f0e5d8;
  --nav-bg: #ffffff;
  --nav-active-bg: #f37435;
  --nav-active-text: #ffffff;
  --bg-card: #ffffff;
  --bg-surface: #ffffff;
  --bg-surface-2: #fff4eb;
  --bg-elevated: #fff9f4;
  --gold-muted: rgba(184, 134, 11, 0.12);
  --text-primary: #1a0e00;
  --text-secondary: #5e3731;
  --text-muted: #8a6058;
  --text-locked: rgba(94, 55, 49, 0.40);
  --shadow-card: 0 1px 8px rgba(26, 14, 0, 0.06);
}
```

---

## 3. ThemeContext — `src/app/context/ThemeContext.tsx`

Já corrigido. Verificar que:
- `THEME_KEY = 'pralis_theme'` (underscore, não hífen)
- `getStoredTheme()` retorna `'dark'` por padrão
- `applyTheme()` usa `document.documentElement.setAttribute('data-theme', 'light')` para claro e `removeAttribute('data-theme')` para escuro
- `toggleTheme` e `setTheme` funcionam independentemente

---

## 4. AnimatedBackground — `src/app/components/AnimatedBackground.tsx`

Já corrigido. Verificar:
- Background base: `background: 'var(--bg-base)'` (não hardcoded)
- Imagens decorativas: opacidade ≤ 0.065 no escuro, ≤ 0.05 no claro
- Radial hints (linha 47-48): opacidade máxima `0.08` no claro, `0.18` no escuro

---

## 5. BottomNav — `src/app/components/BottomNav.tsx`

**Status: intencionalmente branded** — o nav usa `brand.padraoFundo` (textura Pralis) com overlay de gradiente warm. Isso é um elemento de identidade visual. Manter como está.

Verificar apenas que:
- Ícone ativo: `color: '#f37435'` (laranja visível sobre bg escuro) ✓
- Ícone inativo: `color: '#ffe6b8'` (creme visível sobre bg escuro) ✓
- Label ativo: `color: '#ffffff'` ✓
- Label inativo: `color: '#ffe6b8'` ✓

---

## 6. StoryPlayer — `src/app/components/StoryPlayer.tsx`

**Status: parcialmente corrigido.**

### 6a. Header do player (linhas 177–196)
✅ Já corrigido:
```jsx
background: 'rgba(0,0,0,0.32)',
borderBottom: '1px solid rgba(255,255,255,0.14)',
```

### 6b. Botão "Anterior" (linha ~250)
✅ Já corrigido:
```jsx
background: 'rgba(0,0,0,0.32)', border: '1.5px solid rgba(255,255,255,0.40)'
```

### 6c. Fundo do player
O fundo usa `background: g0` onde `g0 = module.gradient[0]` — cor sólida do módulo. Isso é correto e intencional (cada módulo tem sua cor).

---

## 7. Feed.tsx — `src/app/pages/Feed.tsx`

### Verificar / corrigir:

**Header:**
```jsx
background: isLight ? '#ffffff' : '#150900'
border: `1px solid ${isLight ? '#e5d5c5' : 'rgba(184,134,11,0.18)'}`
// data/hora label:
color: isLight ? '#1a0e00' : 'rgba(255,255,255,0.90)'
```

**Hero card:**
```jsx
background: isLight ? '#ffffff' : 'var(--bg-card)'
border: `1px solid ${isLight ? '#e5d5c5' : 'rgba(184,134,11,0.18)'}`
```

**SectionDivider / cards pendentes:**
```jsx
background: 'var(--bg-card)'
```

**Sem gradientes** em backgrounds de card ou header.

---

## 8. Login.tsx — `src/app/pages/Login.tsx`

### Verificar:
- Inputs: `background: 'var(--glass-bg)'` (sem backdrop-filter)
- Lis bubble: `background: 'var(--glass-bg)'` + `color: 'var(--text-secondary)'`
- Separador: `background: '#b8860b'` (linha sólida, não gradiente)

---

## 9. LisChat.tsx — `src/app/pages/LisChat.tsx`

### Verificar (todos corrigidos):
- Bubble da Lis: `background: 'var(--bg-card)'`, texto `color: 'var(--text-primary)'`
- Tabs (Começo/Missão/etc): ativo `background: '#f37435'`, inativo `background: 'var(--bg-card)'`
- Card de introdução: `isLight ? '#fff9f4' : 'var(--bg-card)'`
- Card de termos: `isLight ? 'rgba(30,126,78,0.08)' : 'rgba(93,216,122,0.12)'`
- Nenhum texto com `#ffffff` ou `#ffe6b8` hardcoded — usar `var(--text-primary)` / `var(--text-secondary)`

---

## 10. Onboarding.tsx — `src/app/pages/Onboarding.tsx`

### Verificar:
```js
const STORY_BACKGROUNDS = ['#1a0e00', '#0d0800', '#150900', '#0d0800', '#1a0e00', '#150900', '#0d0800']
```
Sem gradientes nos slides de onboarding.

---

## 11. Profile.tsx — `src/app/pages/Profile.tsx`

### Verificar:
- Row danger (modo escuro): `background: 'rgba(243,116,53,0.15)'` (não `'#6a4038'`)
- Stat cards: `background: 'var(--bg-card)'`, sem backdropFilter
- Textos: todos via `var(--text-primary)` / `var(--text-secondary)`

---

## 12. Adicionar toggle de tema — DevToolbar ou UI

### Opção A — DevToolbar (recomendado para dev)
Em `src/app/components/DevToolbar.tsx`, adicionar botão:
```tsx
import { useTheme } from '../context/ThemeContext'
// dentro do componente:
const { theme, toggleTheme } = useTheme()
// botão:
<button onClick={toggleTheme} title="Toggle theme">
  {theme === 'dark' ? '☀️' : '🌙'}
</button>
```

### Opção B — Botão flutuante permanente (para demo)
Adicionar em `App.tsx` ou `Layout.tsx` um botão fixo canto superior direito que chama `toggleTheme`.

---

## 13. Conteúdo — `src/lib/content.ts`

### Estrutura dos módulos (12 no total):

| # | id | title | roles | section |
|---|----|----|---|---|
| 01 | `boas-vindas` | Boas-vindas à Pralis | all | geral |
| 02 | `jornada-colaborador` | A Jornada do Colaborador | all | geral |
| 03 | `deveres` | O que é Dever? | all | geral |
| 04 | `proibido` | O que é Proibido? | all | geral |
| 05 | `preparo-alimentos` | Preparo dos Alimentos | Preparo de alimentos | cargo |
| 06 | `atendimento-cliente` | Atendimento ao Cliente | Atendimento ao cliente | cargo |
| 07 | `caixa` | Colaboradores do Caixa | Caixa | cargo |
| 08 | `limpeza` | Colaboradores da Limpeza | Limpeza | cargo |
| 09 | `funcao-externa` | Função Externa | Função externa | cargo |
| 10 | `fornecedores-sociedade` | Fornecedores & Sociedade | all | final |
| 11 | `penalidades` | Das Penalidades | all | final |
| 12 | `assinatura` | Compromisso & Assinatura | all | final |

### Tipos de story:
- `lis` — fala da Lis (avatar): campos `state` (`talking`/`celebrating`/`alert`) + `text`
- `video` — vídeo: campos `videoId`, `title`, `description`, `duration`, opcionalmente `src`
- `text` — conteúdo: campos `tag`, `title`, `paragraphs[]`, `highlights[]`, `highlight` (citação)
- `quiz` — quiz: campo `questions[]` com `{id, prompt, options[], correctIndex, explain}`
- `summary` — resumo em bullets: campos `title`, `bullets[]`
- `completion` — conclusão: campos `badge`, `message`

### Para editar conteúdo:
1. Editar diretamente os campos `text` (Lis), `paragraphs`, `highlight`, `prompt`, `options`, `explain`, `badge`, `message`, `bullets` dentro de `RAW_MODULES`
2. Para mudar título/descrição de módulo: editar `title` e `description` da entrada do módulo
3. Para mudar metadados visuais (cor, gradiente, tag): editar `MODULE_META` no final do arquivo
4. Para adicionar/remover módulo: adicionar/remover entrada em `RAW_MODULES` **e** `MODULE_META`

### Cargos disponíveis (valores exatos para `roles`):
```ts
'Preparo de alimentos' | 'Atendimento ao cliente' | 'Caixa' | 'Limpeza' | 'Função externa' | 'all'
```

---

## 14. Checklist de verificação — aba por aba

Para cada página abaixo, verificar em modo **claro** e **escuro**:

### `/feed` — Home
- [ ] Header: fundo branco (claro) / `#150900` (escuro), sem gradiente
- [ ] Cards de módulo: `var(--bg-card)`, borda sutil
- [ ] Textos legíveis em ambos os modos
- [ ] Botão "Ver todos os módulos" (`btn-ghost`): borda visível, texto `var(--text-primary)`

### `/lis` — Chat Lis
- [ ] Bubble da Lis: `var(--bg-card)`, texto `var(--text-primary)`
- [ ] Tabs Começo/Missão/Visão/Valores: laranja ativo, card inativo
- [ ] Card de intro: sem gradiente
- [ ] Card de termos: verde claro (desbloqueado) / cinza (bloqueado)

### `/progresso` — Progresso
- [ ] Cards de módulo: `var(--bg-card)`, sem gradiente
- [ ] Status concluído: verde `#5dd87a` (escuro) / verde escuro `#12341e` (claro)
- [ ] Status bloqueado: opacidade 0.58

### `/perfil` — Perfil
- [ ] Cards de stat: `var(--bg-card)`, sem backdrop-filter
- [ ] Row "Sair": fundo laranja sutil, borda laranja
- [ ] Textos: `var(--text-primary)` / `var(--text-secondary)`

### `StoryPlayer` (abrir qualquer módulo)
- [ ] Header: `rgba(0,0,0,0.32)` semi-transparente sobre a cor do módulo
- [ ] Fundo: cor sólida do módulo (campo `gradient[0]` em `MODULE_META`)
- [ ] Botão "Anterior": `rgba(0,0,0,0.32)` com borda branca semi-transparente
- [ ] Botão "Próximo": branco sólido, ícone laranja

### `/login` — Login
- [ ] Inputs: `var(--glass-bg)`, sem blur
- [ ] Bubble da Lis: `var(--glass-bg)`, texto `var(--text-secondary)`

### `/conheca` — Onboarding
- [ ] Slides: cores sólidas escuras (`#0d0800` a `#1a0e00`), sem gradiente

---

## 15. Arquivos que NÃO devem ser alterados

- `src/lib/brand.ts` — URLs de imagens e assets Pralis
- `src/lib/types.ts` — tipagem do sistema
- `src/lib/animations.ts` — configurações de spring/easing
- `src/app/context/SessionContext.tsx` — lógica de sessão/login
- `src/app/context/AdminContext.tsx` — dados do admin
- Qualquer arquivo em `src/lib/storage*` ou `src/lib/db*`

---

## 16. Como testar tema claro/escuro

```js
// No DevTools do browser (F12 > Console):
// Ativar modo claro:
localStorage.setItem('pralis_theme', 'light'); location.reload()

// Ativar modo escuro (padrão):
localStorage.setItem('pralis_theme', 'dark'); location.reload()
```

O toggle via `ThemeContext.toggleTheme()` funciona sem reload quando chamado pelo botão de UI.

---

## 17. Problemas conhecidos / pendentes

| Problema | Arquivo | Status |
|---|---|---|
| Fundo brownish no modo escuro | `AnimatedBackground.tsx` + `pralis.css` | ✅ Corrigido |
| ThemeContext sempre dark | `ThemeContext.tsx` | ✅ Corrigido |
| Gradientes removidos dos backgrounds | Múltiplos arquivos | ✅ Corrigido |
| Header StoryPlayer brownish | `StoryPlayer.tsx` | ✅ Corrigido |
| Botão `btn-ghost` ilegível no claro | `pralis.css` | ✅ Corrigido |
| Toggle de tema na UI | `DevToolbar.tsx` | ⏳ Pendente |
| Vídeos: `src` das stories de vídeo | `content.ts` | ⏳ Pendente (URLs a definir) |
| Admin CMS: sincronizar com `content.ts` | `src/app/pages/Admin.tsx` | ⏳ Verificar |
