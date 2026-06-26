# Media Architecture — Pralis Conduta

> Arquitetura de mídia (vídeo, áudio e a narração da Lis) do app de treinamento.
> Documento de **arquitetura/decisão**. Não descreve só o estado atual: fixa as
> decisões canônicas **D3, D4, D5** e o caminho de migração de `/public` →
> Supabase Storage.
>
> Stack detectada: React + Vite + TypeScript, `vite-plugin-pwa` (Workbox),
> Supabase opcional (`VITE_SUPABASE_*`). Refs no formato `arquivo:linha`.
>
> Status: Accepted · Data: 2026-06-26 · Dono: Solution Architect

---

## 0. TL;DR (decisões)

| ID | Decisão | Reversibilidade |
|----|---------|-----------------|
| **D3** | Mídia sai de `/public` e passa a viver no **Supabase Storage** (buckets `audio/`, `video/`, `lis/`, `poster/`). A URL pública/assinada é gravada em `audioSrc` / `videoSrc` / `src` da `Story`. Upload por drag&drop no admin substitui a cópia manual. | **ONE-WAY** (toca ownership/host dos assets) → tem ADR (`docs/adr/`). |
| **D4** | **Vídeo = MP4 (H.264 + AAC) como baseline universal**; `<source>` secundário opcional WebM/VP9. ~720p, 1–2 Mbps, clipes curtos, `poster`, `preload="metadata"`, byte-range. **Sem HLS agora.** | **TWO-WAY** (encode é re-derivável; trocar codec é re-encodar). |
| **D5** | **Lis = registro reutilizável/traduzível** (`text`, `audio_url`, `state`, **cues/captions OPCIONAIS** em WebVTT ou `[{tSec, charIndex|word}]`). O **char-sync em tempo real atual continua sendo o default**; cues entram só onde precisão/i18n/acessibilidade exigem. | **TWO-WAY** (cues são uma camada aditiva; não quebram o sync atual). |

O fio condutor: **um único ingress de mídia (Storage) + contratos finos na `Story`
(`audioSrc`/`videoSrc`/`src`/`cues`)**, para que o player não precise saber *de onde*
a mídia vem nem *como* ela está sincronizada.

---

## 1. Como a mídia funciona HOJE

Hoje a mídia é **estática em `/public`** e referenciada por caminho absoluto (`/arquivo.mp4`).
Não há Storage, CDN dedicada nem governança de upload — a cópia é manual para a pasta
`public/`. O contrato de dados já existe e é bom: a `Story` carrega as URLs.

Contrato de dados (`src/lib/types.ts:134-158`):

- `text` → `videoSrc?` (vídeo hero da Lis)
- `text` → `audioSrc?` (MP3 narrado), `audioIncludesTitle?`, `narratorVideoSrc?`
- `video` → `src?` (URL opcional; ausente → placeholder simulado)

### 1.1 Vídeo padrão (cards de conteúdo) — `VideoCard.tsx`

- Tag de vídeo nativo com atributos de "kiosk":
  `playsInline muted disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback"`
  e `object-cover` (`src/app/components/VideoCard.tsx:135-143`).
- **Progresso por evento `timeupdate`**: `fraction = currentTime / duration`
  (`VideoCard.tsx:77`, `:53-71`). Ao cruzar `WATCH_THRESHOLD = 1.0` dispara
  `onWatched()` + auto-advance (`:22`, `:58-70`).
- `ended` → `notify(false)` (`:78`).
- **Placeholder simulado** quando não há `src`: um clock por `requestAnimationFrame`
  avança a fração em `SIM_SECONDS = 14` (`:23`, `:88-100`). Útil para roteirizar
  módulos antes do vídeo existir.
- Pausa ao perder foco da aba (`visibilitychange`, `:103-113`).
- Sem `poster`, sem `preload`, sem `<source>` múltiplo hoje — o navegador decide o
  preload e não há fallback de codec.

Exemplos reais em uso: `/videocirculo-dashboard.mp4`, `/video-lis-questionario.webm`.

### 1.2 Áudio (narração da Lis no card `text`) — `TextCard.tsx`

- `<audio preload="auto">` oculto, `src={audioSrc}` (`TextCard.tsx:265-311`).
- `playbackRate = 1.15` aplicado em vários pontos (`NARRATION_PLAYBACK_RATE`,
  `:6`, `:168`, `:272`, `:246`).
- **Autoplay pode falhar** → `audio.play().catch(() => setNeedsTap(true))`
  (`:170`, `:247`); o botão pulsa pedindo o toque (`needsTap`, `:350-359`).
- `onEnded` fecha a narração em `onProgress(1)` e dispara `onNarrationEnd` após 650ms
  (`:283-295`).

### 1.3 Sincronização da Lis (texto ↔ áudio) — `TextCard.tsx`

**Não há timestamps pré-gravados hoje.** O sync é derivado em tempo real:

- `syncReadingToProgress(progress)` mapeia `progress = currentTime/duration` →
  posição em **caracteres** sobre `title + paragraphs + highlight`
  (`TextCard.tsx:123-149`). O total é `totalNarrationChars` (`:117-120`).
- `onTimeUpdate` chama esse mapeamento e atualiza parágrafo ativo + caractere ativo
  (`:296-302`); `renderReadingText` destaca a palavra corrente derivada do `activeChar`
  (`:48-90`, `:548`).
- **Fallback TTS** via `window.speechSynthesis` (pt-BR) quando **não** há `audioSrc`:
  usa `utter.onboundary` para sincronizar palavra por offset de caractere
  (`:178-234`). Voz preferida pt-BR feminina (`:197-200`).
- Vídeo circular da Lis (`/videocirculo-dashboard.mp4`, `bubbleVideo` em `:121`)
  toca/pausa junto com a narração (`:236-241`, `:381-398`); é **opcional/decorativo**.

> Premissa do char-sync: a narração tem **ritmo aproximadamente uniforme** por
> caractere. Funciona bem para o tom calmo da Lis, mas drifta em pausas longas,
> ênfases ou trechos com números/siglas. É exatamente onde os **cues opcionais (D5)**
> entram.

### 1.4 Vídeo hero da Lis — `LisCard.tsx`

- Card `lis` com `videoSrc` renderiza vídeo grande (~62% da tela), `autoPlay`,
  `muted={false}`, `playsInline`, `object-contain` (`src/app/components/LisCard.tsx:38-54`).
- Progresso por `onTimeUpdate` (`:49-52`); `onEnded` → `onVideoEnd` (`:53`).
- `muted={false}` + `autoPlay`: no iOS/Safari o autoplay **com som** é bloqueado;
  hoje depende do gesto anterior do usuário (avançar story) ter "destravado" o áudio.

### 1.5 Build e PWA hoje

- `copyPublicAssetsPlugin()` copia **recursivamente toda** a pasta `public/` para
  `dist/` no `closeBundle`, pulando entradas quebradas
  (`vite.config.ts:9-32`, `BROKEN_PUBLIC_ENTRIES` `:7`). Combinado com
  `build.copyPublicDir: false` (`:70`), os assets pesados (mp4/webm/mp3) entram no
  bundle de deploy → **build longo e artefatos grandes**.
- PWA via `vite-plugin-pwa` (`:39-62`). **Importante:** o Workbox `globPatterns`
  hoje é `**/*.{js,css,html,woff2,svg,png}` (`:60`) — **mídia (mp4/webm/mp3) NÃO é
  precacheada nem tem runtime cache configurado**. Offline de mídia hoje é acidental
  (depende do HTTP cache do browser).

### 1.6 Problemas atuais (o que motiva D3/D4/D5)

1. **Cópia manual para `/public`** → sem governança, sem versionamento de asset, sem
   quem-subiu/quando. Editar conteúdo no admin não troca a mídia.
2. **Sem CDN dedicada / sem range explícito** → seek e início podem ser lentos em redes
   ruins; sem `poster`/`preload=metadata` o vídeo "pisca" preto até o primeiro frame.
3. **Build pesado** pelo `copyPublicAssetsPlugin` empacotando todos os binários.
4. **PWA não cacheia mídia** (Workbox §1.5) → experiência offline frágil para vídeo/áudio.
5. **Sem fallback de codec** no `<video>` → `.webm` solto quebra em Safari/iOS antigos.
6. **Char-sync sem âncoras** → drift em narrações com ritmo irregular; sem legendas
   (acessibilidade) e sem caminho de i18n.

---

## 2. Estratégia de vídeo (D4)

### 2.1 Análise comparativa

Eixos avaliados para **este** projeto: clipes curtos (segundos a ~2 min), público
majoritariamente mobile (Android + iPhone), PWA, time de uma pessoa, host Supabase.

| Critério | **MP4 (H.264/AAC)** | WebM (VP9/Opus) | HLS (.m3u8 + TS/fMP4) | Progressive download (genérico) |
|---|---|---|---|---|
| Android (Chrome/WebView) | ✅ universal | ✅ nativo | ✅ (via hls.js) | ✅ |
| iPhone/Safari + PWA | ✅ **universal** | ⚠️ parcial (VP9 só recente) | ✅ nativo no Safari | ✅ |
| Chrome/Edge/Firefox desktop | ✅ | ✅ | ⚠️ precisa hls.js | ✅ |
| Início (latência) | ✅ baixo c/ faststart | ✅ baixo | ⚠️ overhead de manifest+segmentos | ✅ baixo |
| Seek / byte-range | ✅ (Range requests) | ✅ | ✅ (por segmento) | ✅ (se servidor suporta Range) |
| Adequação a **clipes curtos** | ✅ **ideal** | ✅ bom | ❌ overkill | ✅ |
| Bitrate adaptativo (ABR) | ❌ (single rate) | ❌ | ✅ (vantagem real só p/ long-form) | ❌ |
| Infra / packaging | ✅ um arquivo | ✅ um arquivo | ❌ packaging + N segmentos + manifest | ✅ |
| Encaixe no Supabase Storage | ✅ (CDN-backed, Range) | ✅ | ⚠️ servível, mas serve N arquivos por vídeo | ✅ |
| Custo de manutenção (solo) | ✅ baixo | ⚠️ duplica encode | ❌ alto (pipeline) | ✅ |

### 2.2 Recomendação (D4) — decidida

**MP4 (H.264 High/Main + AAC-LC) é o baseline universal e único formato obrigatório.**
WebM/VP9 entra apenas como `<source>` secundário **opcional**, para economia de banda
em navegadores que o suportam. **Não adotar HLS agora.**

Justificativa técnica para *este* projeto:

- **Compatibilidade primeiro.** H.264/AAC roda em 100% do alvo (Android, iOS/Safari,
  PWA standalone, desktop) sem polyfill. É a aposta de menor cognitive load para um
  time de uma pessoa.
- **HLS é overkill para clipes curtos.** ABR só compensa em long-form/live. Para clipes
  de segundos, o overhead de manifest + segmentação + (no Chrome) `hls.js` adiciona
  latência de início, mais arquivos por vídeo e um pipeline de packaging que ninguém
  vai manter sozinho. Supabase Storage **suporta HTTP Range requests**, então seek e
  start já funcionam bem com um único MP4 `faststart`.
- **WebM é ganho marginal e opcional.** VP9 corta ~20-30% de banda, mas duplica o
  encode e tem cauda de compatibilidade em iOS. Fica como `<source>` extra, nunca como
  único formato (o `/video-lis-questionario.webm` solto de hoje é exatamente o anti-caso).
- **Reavaliar HLS só para long-form.** Se algum dia houver vídeos longos (>10 min) ou
  necessidade real de ABR/legendas embarcadas, abrir ADR novo. Supabase é CDN-backed e
  permite prefixar uma CDN externa no futuro sem mudar o app.

### 2.3 Parâmetros de encode (preset canônico)

```bash
# MP4 baseline universal — H.264 High + AAC, faststart (moov atom no início)
ffmpeg -i input.mov \
  -c:v libx264 -profile:v high -level 4.0 -pix_fmt yuv420p \
  -vf "scale=-2:720" \
  -b:v 1500k -maxrate 2000k -bufsize 3000k \
  -g 48 -keyint_min 48 -sc_threshold 0 \
  -c:a aac -b:a 128k -ar 44100 -ac 2 \
  -movflags +faststart \
  output.mp4

# WebM secundário OPCIONAL (VP9 + Opus)
ffmpeg -i input.mov \
  -c:v libvpx-vp9 -b:v 1000k -vf "scale=-2:720" -g 48 \
  -c:a libopus -b:a 96k \
  output.webm

# Poster (primeiro frame representativo, JPG/WebP leve)
ffmpeg -ss 00:00:01 -i output.mp4 -frames:v 1 -q:v 3 poster.jpg
```

Regras do preset:
- **Codec/perfil:** H.264 High, `yuv420p` (obrigatório p/ Safari/iOS).
- **Resolução:** ~720p (`scale=-2:720` mantém aspect e largura par). Vertical/quadrado
  também a ~720 no lado maior.
- **Bitrate:** alvo **1.5 Mbps**, teto 2 Mbps (`maxrate`/`bufsize`) → 1–2 Mbps.
- **GOP:** `-g 48` (~2s a 24fps) → seek fino e bom start; chave fechada
  (`sc_threshold 0`) para previsibilidade.
- **`+faststart`:** move o `moov atom` para o início → o vídeo começa a tocar antes do
  download completo (essencial em mobile/Range).
- **Áudio:** AAC-LC 128k 44.1kHz estéreo.
- **Poster** sempre gerado e gravado em `poster/` (D3).

### 2.4 Como o `<video>` deve ficar (alvo)

```tsx
<video
  poster={posterSrc}            // novo: evita frame preto inicial
  playsInline
  muted={muted}
  preload="metadata"            // novo: baixa só metadados até o play
  disablePictureInPicture
  controlsList="nodownload nofullscreen noremoteplayback"
  className="absolute inset-0 h-full w-full object-cover"
>
  {webmSrc && <source src={webmSrc} type="video/webm" />}
  <source src={src} type="video/mp4" />   {/* MP4 por último = fallback universal */}
</video>
```

> Ordem dos `<source>` importa: o browser usa o **primeiro** que sabe tocar. WebM antes,
> MP4 por último como garantia. Mantém os atributos de "kiosk" já existentes em
> `VideoCard.tsx:135-143`. `preload="metadata"` substitui o preload implícito de hoje e
> o `preload="auto"` do áudio (`TextCard.tsx:269`) pode ficar `auto` por serem arquivos
> menores — decisão por tipo.

Implementação fica para `frontend-expert` (este doc só define o alvo).

---

## 3. Compressão, cache e CDN

### 3.1 Presets de compressão

| Tipo | Codec | Alvo | Observação |
|---|---|---|---|
| Vídeo conteúdo | H.264/AAC mp4 | 720p, 1–2 Mbps, faststart | preset §2.3 |
| Vídeo Lis (hero/bubble) | H.264/AAC mp4 | 720p ou menor; bubble pode ser ≤480p | `bubble` é circular e pequeno → bitrate baixo |
| Áudio narração | AAC-M4A (preferir) ou MP3 | mono ou estéreo, 96–128 kbps | hoje é MP3; manter MP3 funciona, mas M4A/AAC é menor p/ mesma qualidade |
| Poster | JPG ou WebP | qualidade 70-80, ~720p | 1 por vídeo |

> Narração é fala (não música): **mono 96 kbps** já é transparente e corta ~metade do
> peso vs estéreo 128. `playbackRate=1.15` é client-side e não afeta o encode.

### 3.2 Cache headers (Supabase Storage)

Mídia é **imutável por path** (ver convenção de nomes §4.2 — versionar no nome, nunca
sobrescrever). Logo:

```
Cache-Control: public, max-age=31536000, immutable
```

- `immutable` + `max-age` de 1 ano → browser/CDN nunca revalida; troca de conteúdo =
  novo path, não novo header.
- Definir o `cacheControl` no upload (`supabase.storage.from(bucket).upload(path, file,
  { cacheControl: '31536000', upsert: false })`).
- HTML/JS/CSS continuam com o cache do deploy normal (curto + revalidação).

### 3.3 Supabase Storage como CDN

- Storage do Supabase é **CDN-backed** e responde a **HTTP Range requests** → seek e
  start parcial de MP4 `faststart` funcionam sem servidor de streaming.
- URL pública estável: `https://<proj>.supabase.co/storage/v1/object/public/<bucket>/<path>`.
- **Futuro sem refazer o app:** como a URL fica gravada na `Story`, prefixar uma CDN
  externa (ex.: Cloudflare na frente do Storage) é trocar o host base na geração da URL,
  não tocar o player. Esse é o seam que D3 protege.

### 3.4 Service Worker / PWA cache de mídia

**Estado atual:** Workbox `globPatterns` **não** inclui mídia (`vite.config.ts:60`) →
nada de mp4/webm/mp3 é precacheado.

**Alvo recomendado — runtime cache, NÃO precache:**

- **Não precachear vídeo/áudio.** Precache infla o install do SW e força baixar tudo no
  primeiro load. Mídia é grande e nem todo módulo é acessado.
- **Runtime caching por rota do Storage**, estratégia `CacheFirst` (mídia é imutável):

```ts
// alvo em vite.config.ts → VitePWA workbox.runtimeCaching
runtimeCaching: [
  {
    urlPattern: ({ url }) =>
      url.href.includes('/storage/v1/object/public/') &&
      /\.(mp4|webm|m4a|mp3)$/.test(url.pathname),
    handler: 'CacheFirst',
    options: {
      cacheName: 'pralis-media',
      expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
      rangeRequests: true,            // essencial p/ seek de vídeo a partir do cache
      cacheableResponse: { statuses: [200] }, // 206 NÃO é cacheável diretamente
    },
  },
]
```

> `rangeRequests: true` faz o Workbox servir Range a partir de uma resposta `200`
> completa em cache. **Importante:** respostas `206 Partial Content` não devem ser
> gravadas — por isso `cacheableResponse: { statuses: [200] }`.

**Estratégia offline:**
- O **shell** (app) já é precacheado (js/css/html) → o app abre offline.
- Mídia é **best-effort**: o que já foi assistido fica em `pralis-media` e replaya
  offline; o que nunca foi tocado mostra o estado de erro já existente
  (`TextCard.tsx:303-310` para áudio; vídeo pode cair no placeholder).
- (Opcional, fase 2) "Baixar módulo para offline": pré-buscar as URLs de mídia de um
  módulo via `cache.addAll()` sob ação explícita do usuário. Não fazer automático.

---

## 4. Arquitetura de Storage no Supabase (D3)

### 4.1 Buckets

| Bucket | Conteúdo | Acesso |
|---|---|---|
| `video` | MP4 (+ WebM opcional) de conteúdo e hero da Lis | público (read) |
| `audio` | Narrações (AAC-M4A/MP3) da Lis | público (read) |
| `lis` | Assets específicos da Lis (bubble video, futuros) e **cues/WebVTT** (D5) | público (read) |
| `poster` | Posters/thumbnails de vídeo | público (read) |

> **Público vs signed URL.** O conteúdo é treinamento corporativo não sensível e o app
> já é protegido por acesso (token/código). Buckets **públicos com Cache-Control
> imutável** maximizam cacheabilidade de CDN e simplicidade. Se algum dia houver mídia
> sensível, criar bucket **privado** e gerar **signed URL** com TTL no momento de montar
> a `Story` — o contrato (`src`/`audioSrc` = string URL) **não muda**, só passa a
> receber URL assinada. Esse é o seam de reversibilidade.

### 4.2 Convenção de nomes / paths

Versionar no path (imutabilidade → cache eterno, §3.2). Nunca sobrescrever; subir nova
versão e atualizar a URL na `Story`.

```
video/<moduleId>/<storyKey>--v<n>.mp4
video/<moduleId>/<storyKey>--v<n>.webm        # opcional
poster/<moduleId>/<storyKey>--v<n>.jpg
audio/<moduleId>/<storyKey>--v<n>.m4a
lis/<lisLineId>--v<n>.vtt                      # cues opcionais (D5)
lis/bubble--v<n>.mp4                           # vídeo circular da Lis
```

- `storyKey`: id estável da story (ex.: `videoId` para `type:'video'`; um slug para
  cards `text`).
- `--v<n>`: incrementa a cada re-upload do mesmo asset lógico.

### 4.3 Fluxo de upload do admin

```
Admin (drag&drop)
  → valida (tipo MIME, tamanho, dimensões) no cliente
  → [opcional] Edge Function: transcode/normaliza para o preset §2.3 + gera poster
  → supabase.storage.from(bucket).upload(path, file, { cacheControl: '31536000', upsert: false })
  → getPublicUrl(path)
  → grava a URL em audioSrc / videoSrc / src / posterSrc da Story (conteúdo)
```

- A `Story` permanece a **fonte da verdade** das URLs (já é assim em `types.ts:134-158`).
- **Validação no boundary:** o upload é input externo → validar MIME/tamanho/duração no
  admin e idealmente normalizar via Edge Function (não confiar no arquivo do usuário).
  Detalhe de policies/RLS de Storage → `supabase-specialist`.
- **Onde fica o "conteúdo" (a `Story`):** hoje é estático em código (`content.ts`). A
  migração para editável-no-admin é outra decisão (D-conteúdo); aqui só garantimos que
  o campo de URL é o ponto de gravação.

### 4.4 Migração dos assets atuais de `/public`

Sem big-bang. O player aceita qualquer URL absoluta, então `/arquivo.mp4` (local) e
`https://...storage.../arquivo.mp4` coexistem.

1. **Inventariar** os assets de `/public` realmente referenciados (mp4/webm/mp3) — o
   repo já fez auditoria de assets usados (ver histórico de commits).
2. **Re-encodar** cada vídeo pelo preset §2.3 (resolve o `.webm` solto sem MP4) e gerar
   poster.
3. **Subir** para os buckets seguindo §4.2 com `cacheControl` imutável.
4. **Trocar as referências** na `Story`/`content.ts` de `/arquivo` → URL do Storage,
   um módulo por vez (reversível: é só reverter a string).
5. Quando tudo migrar, **remover** os binários de `/public` e **aposentar o
   `copyPublicAssetsPlugin`** (`vite.config.ts:9-32`) → build mais leve. `BROKEN_PUBLIC_ENTRIES`
   (`:7`) deixa de ser necessário.

**Undo plan (D3):** se o Storage falhar, reverter as strings de URL para os caminhos
`/public` (manter os binários em `/public` até a migração estar validada em produção).

---

## 5. Arquitetura de áudio + texto da Lis (D5)

Princípio: **não quebrar o sync atual.** O char-sync em tempo real
(`syncReadingToProgress`, `TextCard.tsx:123-149`) continua sendo o **default** e o
fallback. Cues são uma **camada aditiva e opcional**.

### 5.1 Modelo reutilizável: `lis_lines`

A narração da Lis deixa de ser um campo solto na `Story` e passa a poder referenciar um
**registro reutilizável e traduzível**:

```ts
// Conceito de domínio (modelagem; schema/RLS → database-architect/supabase-specialist)
interface LisLine {
  id: string
  locale: string            // 'pt-BR' (default), 'es', 'en'... → i18n
  text: string              // texto canônico narrado (title/paragraphs/highlight)
  audio_url: string | null  // M4A/MP3 no bucket audio/ (D3). null → cai em TTS
  state?: LisState          // reusa o enum existente (types.ts:93-101)
  cues?: LisCue[] | null    // OPCIONAL — âncoras de sincronização precisa
  caption_vtt_url?: string | null  // OPCIONAL — WebVTT p/ legendas (acessibilidade)
  updated_at: string
}

// cue: âncora tempo → posição no texto. Dois formatos aceitos (escolher um por linha).
type LisCue =
  | { tSec: number; charIndex: number }   // tempo → índice de caractere
  | { tSec: number; word: string; n?: number } // tempo → n-ésima ocorrência da palavra
```

A `Story type:'text'` passa a aceitar **ou** os campos inline de hoje (`audioSrc`,
`paragraphs`, `highlights` — `types.ts:140-147`) **ou** um `lisLineId` que resolve um
`LisLine`. Compatibilidade total para trás.

### 5.2 Resolução de sincronização (precedência)

O `TextCard` escolhe a melhor fonte disponível, degradando com graça:

```
1. cues presentes        → sync ANCORADO: interpola charIndex entre cues por tSec.
                           (precisão alta; imune a drift de ritmo)
2. audio_url, sem cues   → char-sync ATUAL (currentTime/duration → char). [default hoje]
3. sem audio_url         → fallback TTS (speechSynthesis + onboundary). [já existe]
```

- Caminhos 2 e 3 **já estão implementados** (`TextCard.tsx:123-149`, `:178-234`). D5 só
  **adiciona** o caminho 1 por cima, sem remover nada.
- Com cues, `onTimeUpdate` deixa de assumir ritmo uniforme: encontra o par de cues que
  cerca o `currentTime` e interpola o `charIndex` → alimenta o mesmo
  `setActiveParagraph/setActiveChar/renderReadingText` de hoje. **Zero mudança no
  render.**

### 5.3 Captions / WebVTT (acessibilidade + i18n)

- `caption_vtt_url` aponta para um WebVTT no bucket `lis/` (§4.2). Permite:
  - **Legendas reais** (`<track kind="captions">`) para o vídeo hero da Lis e para a
    narração → acessibilidade (surdez, ambiente sem som, WCAG).
  - **Tradução**: um `LisLine` por `locale`; o WebVTT e o `audio_url` variam por idioma,
    o `text` também. O player só pede a `LisLine` do locale ativo.
- WebVTT é gerável a partir dos `cues` (e vice-versa) → uma fonte, dois usos
  (sync + legenda).

### 5.4 Por que isso facilita o futuro

- **Reaproveitamento:** a mesma fala da Lis ("bem-vindo", "vamos revisar") vira um
  `LisLine` citado por vários módulos — não se duplica texto+áudio.
- **Tradução:** trocar de idioma = trocar o `locale` do `LisLine`; nada no player muda.
- **Precisão sob demanda:** módulos críticos ganham cues (gravados ou gerados por
  alinhamento forçado, ex. faster-whisper/aeneas) sem reescrever os demais.
- **Acessibilidade:** legendas passam a existir sem refazer o áudio.
- **Reversível:** remover `cues`/`caption_vtt_url` de uma linha → volta ao char-sync.
  É um campo opcional, não um acoplamento.

**Undo plan (D5):** cues e captions são colunas/arquivos opcionais; ignorá-los faz o app
voltar exatamente ao comportamento atual (caminhos 2/3 da §5.2).

---

## 6. Recomendações por plataforma + checklist

### 6.1 Android (Chrome / WebView)
- H.264/AAC e VP9/Opus rodam nativamente. Autoplay **com som** bloqueado sem gesto —
  `muted` autoplay OK. O fluxo de stories (toque para avançar) já fornece o gesto.
- `playsInline` é irrelevante (Android já é inline) mas inofensivo — manter.

### 6.2 iPhone / Safari (quirks — atenção especial)
- **`playsInline` obrigatório** senão o vídeo abre em fullscreen nativo — já presente
  em `VideoCard.tsx:138` e `LisCard.tsx:47`. Garantir no `LisCard` hero (já está).
- **Autoplay com som é bloqueado.** `LisCard` usa `autoPlay muted={false}`
  (`LisCard.tsx:44-45`): só funciona porque um gesto anterior destravou o áudio. Plano
  robusto: ou começar `muted` e mostrar um toggle, ou só dar `play()` dentro do handler
  de toque. O padrão de áudio já trata isso via `needsTap` (`TextCard.tsx:170`,
  `:350-359`) — replicar a mesma ideia no vídeo hero.
- **`yuv420p` no encode** (§2.3) é obrigatório; Safari não toca H.264 com chroma
  diferente.
- **PWA standalone iOS**: SW e Range funcionam, mas o storage de cache é mais volátil
  (pode ser limpo sob pressão) — não prometer offline garantido de mídia (§3.4).
- `preload="metadata"`: Safari frequentemente ignora `preload="auto"` em mobile de
  qualquer forma; `metadata` é o pedido honesto.

### 6.3 Web (desktop)
- Todos os codecs OK. `controlsList`/`disablePictureInPicture` (`VideoCard.tsx:140-141`)
  são best-effort (Chrome respeita, Firefox parcialmente). Não confiar neles para
  segurança, só para UX de "kiosk".

### 6.4 PWA
- Precache só do shell; **runtime `CacheFirst` para mídia** com `rangeRequests: true`
  (§3.4). Hoje **ausente** — é o gap a fechar (`vite.config.ts:60`).
- `autoUpdate` (`vite.config.ts:40`) está ok; ao adicionar runtime cache de mídia,
  versionar `cacheName` se a convenção de path mudar.

### 6.5 Checklist de performance / qualidade

**Encode**
- [ ] MP4 H.264 High + AAC, `yuv420p`, `+faststart` (moov no início).
- [ ] ~720p, 1–2 Mbps, `-g 48`.
- [ ] Poster gerado por vídeo.
- [ ] WebM/VP9 só como `<source>` extra (nunca único).
- [ ] Áudio de narração mono 96 kbps (preferir M4A).

**Player**
- [ ] `<video>` com `poster`, `preload="metadata"`, `playsInline`, dupla `<source>`
      (webm→mp4).
- [ ] Vídeo hero da Lis trata autoplay-com-som no iOS (gesto/`needsTap`).
- [ ] Mantidos os atributos kiosk (`controlsList`, `disablePictureInPicture`).

**Storage / CDN**
- [ ] Buckets `video/audio/lis/poster` criados; paths versionados (`--v<n>`).
- [ ] Upload com `Cache-Control: public, max-age=31536000, immutable`.
- [ ] URLs gravadas na `Story`; público vs signed decidido por sensibilidade.
- [ ] Range requests validados (seek funciona em arquivo grande).

**PWA / offline**
- [ ] Runtime `CacheFirst` para `/storage/.../*.{mp4,webm,m4a,mp3}` com
      `rangeRequests: true` e `cacheableResponse.statuses: [200]`.
- [ ] Shell offline OK; mídia best-effort + estados de erro existentes.

**Lis (D5)**
- [ ] Char-sync atual intacto como default.
- [ ] Modelo `lis_lines` (text/audio_url/state/cues/captions) com cues OPCIONAIS.
- [ ] Precedência cues → char-sync → TTS implementada sem mudar o render.
- [ ] WebVTT opcional para legendas/i18n.

**Build**
- [ ] Após migração, `/public` sem binários pesados e `copyPublicAssetsPlugin`
      aposentado (`vite.config.ts:9-32`).

---

## 7. Seams (onde isto muda barato no futuro)

| Mudança futura | Custo | Por quê |
|---|---|---|
| Trocar host de mídia (Storage → CDN externa) | baixo | URL vive na `Story`; muda a base, não o player |
| Público → privado (signed URL) | baixo | contrato é "string URL"; troca quem gera a URL |
| Adicionar precisão/i18n na Lis | baixo | cues/captions são campos opcionais (D5) |
| Re-encodar todo o catálogo | médio | derivável do master; paths versionados absorvem |
| Adotar HLS p/ long-form | médio/alto | decisão nova (ADR); só se surgir long-form/ABR real |

---

## 8. Handoff

- **`supabase-specialist`** — criar buckets, policies/RLS de Storage, signed URLs.
- **`database-architect`** — schema de `lis_lines` (+ locale, cues, captions) se/quando
  o conteúdo virar editável.
- **`frontend-expert` / `react-tailwind-expert`** — `<video>` alvo (§2.4), precedência
  de sync (§5.2), autoplay iOS (§6.2).
- **`node-api-expert`** — Edge Function de transcode/poster no upload (§4.3), se adotada.
- **`performance-reviewer`** — validar Core Web Vitals e o runtime cache de mídia.
- **`security-reviewer`** — confirmar boundary de upload (MIME/tamanho) e decisão
  público vs signed.

> Decisões one-way (D3) devem ter ADR dedicado em `docs/adr/` antes de mexer em código.
