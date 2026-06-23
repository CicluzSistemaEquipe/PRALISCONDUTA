# Contexto Completo — Pralis Conduta App
## Handoff para Claude/Codex no VS Code

---

## 🏗️ Stack e Estrutura do Projeto

- **Framework**: React 18 + Vite 5.4 + TypeScript
- **Animações**: Framer Motion 11
- **Estilos**: Tailwind CSS (utility classes apenas)
- **Roteamento**: React Router DOM
- **Pasta raiz do código**: `E:\Cicluz\Pralis-Conduta\Sistema\`
- **Pasta de assets públicos**: `E:\Cicluz\Pralis-Conduta\Sistema\public\`
- **Conteúdo dos módulos**: `E:\Cicluz\Pralis-Conduta\Sistema\src\lib\content.ts`
- **Tipos**: `E:\Cicluz\Pralis-Conduta\Sistema\src\lib\types.ts`

---

## 🎯 O que é o App

Plataforma de onboarding/treinamento para colaboradores da Pralis (rede de fast food). Formato de "stories" estilo Instagram. A personagem **Lis** (modelo 3D) apresenta os módulos de conduta/RH.

Fluxo: Login → Feed de módulos → StoryPlayer (slides por módulo) → Conclusão.

---

## 📁 Arquivos Principais e Estado Atual

### `src/lib/types.ts`
```ts
export type Story =
  | { type: 'lis'; text: string; state?: LisState; videoSrc?: string }
  | { type: 'text'; title: string; tag: string; paragraphs: string[]; highlight?: string; highlights?: string[]; keywords?: string[] }
  | { type: 'video'; videoId: string; title: string; description?: string; duration?: string; src?: string }
  | { type: 'summary'; title: string; bullets: string[] }
  | ({ type: 'quiz' } & QuizConfig)
  | { type: 'completion'; badge: string; message: string }
```

O campo `videoSrc?: string` no tipo `lis` é fundamental — quando presente, o LisCard muda para layout de vídeo hero em vez do avatar animado.

### `src/app/components/StoryPlayer.tsx`
- Barra de progresso estilo Instagram em tempo real
- Auto-avança slides `lis` (sem videoSrc) por timer baseado em `text.length * 22 + 2000`
- Auto-avança slides `text` por contagem de palavras (`words / 3 * 1000`, mínimo 7s)
- Slides `video` e `lis` com `videoSrc`: progresso vem do `onTimeUpdate` do vídeo
- Quiz: sem auto-avançar, espera interação
- `--story-bg` e `--pralis-accent` expostos como CSS vars no container raiz

### `src/app/components/LisCard.tsx`
- Quando `videoSrc` presente: layout hero (vídeo ocupa 62% da tela, texto embaixo)
- Vídeo tem `onTimeUpdate → onProgress` e `onEnded → onVideoEnd`
- Gradiente de fade na base do vídeo usa `var(--story-bg)` para fundir com fundo do módulo
- Quando sem `videoSrc`: avatar animado (LisAvatar) + balão de texto com typewriter

### `src/app/components/QuizCard.tsx`
- Bolinha da Lis no quiz: vídeo `video-lis-questionario.webm` (96px, circular, fundo branco)
- Box da pergunta: cor diferenciada (`#3d2318` dark / `#fdf6e8` light), borda dourada
- Box das opções: cor diferente do box da pergunta

### `src/app/components/CompletionCard.tsx`
- **SEM troféu** — substituído pela Lis comemorando
- Estrutura da bolinha da Lis:
  - Container: `position: relative, width: 160, height: 210`
  - Círculo branco (`z-index: 1`): `bottom: 0`, 128px, `linear-gradient(#fff → #ffe6b8)`
  - Vídeo (`z-index: 2`): `bottom: 4`, full-width, `objectFit: cover, objectPosition: center 5%`
  - Fade circular (`z-index: 3`): mesmo tamanho do círculo, gradiente `transparent → #ffe0a0`
- O fade faz o corpo da Lis "dissolver" na base do círculo
- Botão **"Próximo módulo"** (laranja) + **"Voltar ao início"** (branco)
- Próximo módulo calculado em `Module.tsx` via `modulesForRole(employee.role)`

### `src/app/pages/Module.tsx`
- Calcula `nextModule` com `modulesForRole` e `findIndex`
- Passa `onNextModule={() => navigate('/module/${nextModule.id}')}` para StoryPlayer
- StoryPlayer repassa para CompletionCard

### `src/app/components/StoryProgressBar.tsx`
- Barras segmentadas (uma por story)
- Barra atual animada pela `fraction` (0→1)
- Barras anteriores: cheias; próximas: vazias

---

## 🎬 Workflow de Vídeos da Lis (FUNDAMENTAL)

### Problema
A Lis é gerada no **HeyGen** (avatar 3D). O HeyGen exporta `.mp4` sem canal alpha. Para ter fundo transparente (WebM VP9), precisamos remover o fundo.

### Solução Padrão Atual

**Passo 1 — Gerar a imagem no Flow Labs**
Usar o fundo exato da cor do módulo (ex: `#b8860b` dourado) para evitar problemas de chromakey com a pele dela.

**Passo 2 — Sincronizar áudio no HeyGen**
Upload da imagem como avatar background → sincroniza com áudio do ElevenLabs → exporta `.mp4`.

**Passo 3 — Remover fundo no CapCut**
Abrir o `.mp4` no CapCut → remover fundo (AI ou colorkey) → **exportar com codec RLE** (formato `.mov`) para preservar canal alpha.

**Passo 4 — Converter para WebM com alpha no terminal**
```bash
ffmpeg -i "video.mov" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 33 -auto-alt-ref 0 -c:a libopus "output.webm"
```

> ⚠️ O `-auto-alt-ref 0` é **obrigatório** para preservar o canal alpha no VP9.

**Verificar se o alpha foi preservado:**
```bash
ffprobe -v error -select_streams v:0 -show_entries stream=pix_fmt -of default=noprint_wrappers=1 "output.webm"
# deve retornar: pix_fmt=yuva420p
```

### Alternativa: colorkey (quando fundo é sólido)
```bash
ffmpeg -i "video.mp4" -vf "colorkey=0xb8860b:0.35:0.1" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 33 -auto-alt-ref 0 "output-alpha.webm"
```
- `0xb8860b` = cor hex do fundo a remover
- `0.35` = tolerância de cor (ajustar se sobrar fundo)
- `0.1` = suavidade das bordas

### Acelerar vídeo (1.2x)
```bash
ffmpeg -i "input.mp4" -vf "setpts=PTS/1.2" -af "atempo=1.2" "output-fast.mp4"
```

---

## 🎥 Vídeos Existentes em `public/`

| Arquivo | Uso | Observação |
|---------|-----|------------|
| `video-lis-questionario.webm` | Bolinha quiz (todos os módulos) | Lis pensativa, alpha ok |
| `video-final-lis-feliz-alpha.webm` | CompletionCard (todos os módulos) | Lis comemorando, alpha ok |
| `lis-conduta1-alpha.webm` | 1º slide do módulo boas-vindas | Lis com prancheta, fundo dourado removido |
| `lis-conduta1-fast.mp4` | Versão acelerada 1.2x (legado) | Sem alpha, substituído pelo webm |
| `lis-conduta1.mp4` | Original HeyGen (legado) | Sem alpha |

---

## 📦 Módulos e Conteúdo (`src/lib/content.ts`)

### Módulo atual implementado: `boas-vindas`
```ts
{
  id: 'boas-vindas',
  title: 'Código de Conduta',
  number: '01',
  gradient: ['#b8860b', '#8B6914'],
  accent: '#b8860b',
  stories: [
    {
      type: 'lis',
      state: 'celebrating',
      videoSrc: '/lis-conduta1-alpha.webm',  // ← hero video com Lis
      text: 'Oi! Eu sou a Lis. Antes de tudo, quero te apresentar algo muito importante: o nosso Código de Ética e Conduta...',
    },
    { type: 'text', tag: 'O QUE É', title: 'Por que este Código existe?', paragraphs: [...] },
    { type: 'text', tag: 'DOCUMENTOS', title: 'Quatro documentos ao final', paragraphs: [...] },
    { type: 'quiz', questions: [bv-q1, bv-q2], sampleSize: 2 },
    { type: 'completion', badge: 'Base Sólida', message: '...' },
  ]
}
```

### Próximos módulos a criar (MVP setor Caixa)
A prioridade é o **setor Caixa**. Os módulos devem cobrir:
1. Código de conduta (feito ✅)
2. Atendimento ao cliente
3. Operação do caixa
4. Higiene e apresentação pessoal
5. Procedimentos de segurança

Para cada módulo novo de `lis` com vídeo:
1. Gravar no HeyGen com o fundo da cor do módulo
2. Exportar do CapCut como `.mov` com RLE alpha
3. Converter: `ffmpeg -i "capcut.mov" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 33 -auto-alt-ref 0 -c:a libopus "public/lis-modulo-X-alpha.webm"`
4. Adicionar `videoSrc: '/lis-modulo-X-alpha.webm'` no story `lis` do módulo

---

## 🎨 Design System

### Cores CSS (`src/index.css` ou `src/app/global.css`)
```css
--orange: #f37435
--green: var(--color-success)
--red: var(--color-danger)
--pralis-accent: [injetado dinamicamente pelo módulo]
--story-bg: [injetado dinamicamente pelo módulo]
```

### Fontes
- **MadeByDillan** (serif) — títulos principais
- **Montserrat** (sans-serif) — corpo, botões, labels

### Classes globais usadas
- `btn-next-white` — botão branco com seta laranja
- `no-scrollbar` — remove scrollbar visual
- `rounded-pill` — border-radius 999px

---

## 🔧 Patterns de Fundo (StoryPlayer)

Os ícones de fundo (`brand.simboloEspiga`, `brand.simboloPar`) usam:
```js
filter: 'brightness(0) invert(1)',
mixBlendMode: 'screen',
WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, black 55%, transparent 100%)',
maskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, black 55%, transparent 100%)',
```
O `maskImage` evita que apareça borda branca retangular ao redor dos PNGs.

---

## 🚧 Pendências / Próximos Passos

### Imediato
1. **Criar conteúdo dos demais módulos** em `content.ts` (setor Caixa MVP)
2. **Para cada módulo com vídeo da Lis**:
   - Gerar no HeyGen com fundo da cor do módulo
   - Processar no CapCut (RLE alpha) → ffmpeg (webm alpha)
   - Adicionar `videoSrc` no content.ts

### Fluxo para novos vídeos (resumido)
```
HeyGen (mp4 sem alpha)
  → CapCut (remove fundo, exporta .mov RLE com alpha)
  → ffmpeg (converte .mov → .webm yuva420p)
  → public/ (disponível pelo vite)
  → content.ts (videoSrc: '/nome.webm')
```

### Comandos ffmpeg prontos para copiar

**MOV CapCut com alpha → WebM:**
```bash
ffmpeg -i "E:\Cicluz\Pralis-Conduta\Sistema\public\NOME.mov" ^
  -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 33 -auto-alt-ref 0 ^
  -c:a libopus ^
  "E:\Cicluz\Pralis-Conduta\Sistema\public\NOME-alpha.webm"
```

**MP4 com fundo sólido → WebM com alpha (colorkey):**
```bash
ffmpeg -i "E:\Cicluz\Pralis-Conduta\Sistema\public\NOME.mp4" ^
  -vf "colorkey=0xCOR_HEX:0.35:0.1" ^
  -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 33 -auto-alt-ref 0 ^
  "E:\Cicluz\Pralis-Conduta\Sistema\public\NOME-alpha.webm"
```
*(Substituir `^` por `\` no Linux/Mac)*

**Verificar alpha:**
```bash
ffprobe -v error -select_streams v:0 -show_entries stream=pix_fmt -of default=noprint_wrappers=1 "arquivo.webm"
# Esperado: pix_fmt=yuva420p
```

---

## 🧩 Como Adicionar um Novo Módulo com Vídeo da Lis

No `content.ts`, dentro do array `stories` do módulo:

```ts
{
  type: 'lis',
  state: 'talking',
  videoSrc: '/lis-MODULO-alpha.webm',  // ← webm com alpha
  text: 'Texto que aparece no balão enquanto o vídeo toca...',
},
```

O StoryPlayer automaticamente:
- Usa o vídeo como hero (62% da tela)
- Barra de progresso sincronizada com `onTimeUpdate`
- Auto-avança quando o vídeo termina (`onEnded`)
- Gradiente de fade na base do vídeo usando a cor do módulo

---

## 💡 Dicas Importantes

1. **CapCut deve exportar com codec RLE** (não H.264/H.265) para ter canal alpha no `.mov`
2. **Nunca usar chromakey na Lis** — a cor da pele dela é parecida com verde, destrói a imagem. Usar fundo da cor do módulo + colorkey
3. **O `-auto-alt-ref 0` é obrigatório** no ffmpeg para VP9 com alpha funcionar no browser
4. **O vídeo `video-lis-questionario.webm`** é usado em TODOS os quizzes automaticamente — já está implementado no QuizCard
5. **O vídeo `video-final-lis-feliz-alpha.webm`** é usado em TODAS as telas de conclusão — já está implementado no CompletionCard
6. **Próximo módulo** é calculado automaticamente por cargo em Module.tsx — não precisa hardcodar

---

## 📂 Estrutura de Pastas Relevante

```
E:\Cicluz\Pralis-Conduta\
├── Sistema\
│   ├── src\
│   │   ├── lib\
│   │   │   ├── content.ts     ← TODO o conteúdo dos módulos
│   │   │   ├── types.ts       ← Tipos TypeScript
│   │   │   ├── brand.ts       ← Assets da marca (logos, símbolos)
│   │   │   └── storage.ts     ← Persistência (progresso, quiz, etc.)
│   │   └── app\
│   │       ├── components\
│   │       │   ├── StoryPlayer.tsx     ← Player principal
│   │       │   ├── LisCard.tsx         ← Slide da Lis (avatar ou vídeo hero)
│   │       │   ├── QuizCard.tsx        ← Card de perguntas
│   │       │   ├── CompletionCard.tsx  ← Tela de conclusão
│   │       │   ├── TextCard.tsx        ← Slide de texto
│   │       │   ├── VideoCard.tsx       ← Slide de vídeo externo
│   │       │   └── StoryProgressBar.tsx← Barras de progresso
│   │       └── pages\
│   │           ├── Module.tsx          ← Página que monta o StoryPlayer
│   │           └── Feed.tsx            ← Feed de módulos
│   └── public\
│       ├── video-lis-questionario.webm
│       ├── video-final-lis-feliz-alpha.webm
│       └── lis-conduta1-alpha.webm
└── Design\                             ← Assets de design
```

---

## ✅ Estado Atual (o que está funcionando)

- [x] Login e onboarding
- [x] Feed de módulos por cargo
- [x] StoryPlayer com barra de progresso Instagram-style
- [x] Auto-avançar (lis sem vídeo, text slides)
- [x] Vídeo hero na Lis com sincronização de progresso
- [x] QuizCard com bolinha da Lis em vídeo
- [x] CompletionCard com Lis comemorando (círculo + fade)
- [x] Botão "Próximo módulo" na conclusão
- [x] Patterns de fundo sem borda branca (maskImage fix)
- [x] Fade na base do vídeo hero (fundir com fundo do módulo)
- [x] Dark/light mode
- [x] Módulo boas-vindas completo com conteúdo do Código de Conduta

---

*Continue pelo VS Code com Claude ou Codex. O projeto roda com `npm run dev` na pasta `Sistema\`.*
