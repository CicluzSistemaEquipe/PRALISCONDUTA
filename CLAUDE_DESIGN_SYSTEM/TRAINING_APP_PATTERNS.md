# TRAINING_APP_PATTERNS — Pralís App do Colaborador 🌙

> Padrões acionáveis do **mundo app** (escuro, quente, emocional, mobile): Trilha Viva,
> story format, a Lis, ModuleCard e estados, progresso vivo, conclusão + assinatura, e as
> **regras de leveza** (sem loop/blur). Valores em `DESIGN_TOKENS.json`. Mundo/leis em
> `BRAND_RULES.md`.
> Telas-âncora: `colaborador-home-feed.png`, `colaborador-storyplayer-modulo.png`,
> `colaborador-progresso.png`, `colaborador-perfil.png`.

**Regra-mãe:** fundo quente `appDark.bgBase #0d0800` (**nunca preto puro**) · ação laranja
`#f37435` · **dourado = brilho premium** (conquista/destaque, não decoração) · Montserrat +
display expressivo · **sem `repeat:Infinity`, sem `backdrop-filter:blur`** · só `transform`/
`opacity` · reduced-motion sempre. **Engajamento é requisito** — mas **gamifica-se a
experiência, nunca a regra** (contrato congelado).

---

## 1. Home = "Trilha Viva" (anatomia)

A home não é um menu — é uma trilha que respira. Tela-âncora: `colaborador-home-feed.png`.

```
┌──────────────────────────────┐
│  Bom dia, {nome} ☀          │ ← saudação + display expressivo
│  você está na jornada do pão │
│                              │
│ ┌──────────────────────────┐ │
│ │  Lis (bust)              │ │ ← guia humana: 1 fala curta, contextual
│ │  "Falta pouco pro próx-  │ │   (lis-bust.png)
│ │   imo módulo. Bora?"     │ │
│ └──────────────────────────┘ │
│                              │
│ ┌── HERÓI: CONTINUAR ──────┐ │ ← ModuleCard em highlight (dourado/brilho)
│ │  Módulo 3 · Conduta      │ │   o "continuar de onde parou"
│ │  ●●●○○  3/5 stories      │ │
│ │            [ Continuar ▸ ]│ │ ← CTA laranja, 1 por tela
│ └──────────────────────────┘ │
│                              │
│  Sua trilha                  │
│  ✓ Módulo 1   ✓ Módulo 2     │ ← concluídos (compactos)
│  ▸ Módulo 3   🔒 Módulo 4    │ ← atual destacado · bloqueado discreto
│  🔒 Módulo 5                  │
├──────────────────────────────┤
│   ⌂ Início   ▦ Trilha   ◔ Perfil │ ← BottomNav z-40, max 480px
└──────────────────────────────┘
```

**Os 3 heróis da Home**
1. **"Continuar"** — o módulo atual em destaque, retoma de onde parou em < 3s.
2. **A Lis** — guia humana com 1 microcopy contextual (anima, nunca infantiliza).
3. **ModuleCard highlight** — o card do módulo atual usa o brilho dourado; os demais são calmos.

**Engajamento < 3s:** ao abrir o app, a próxima ação tem que estar óbvia e a um toque.
Nada de tela de boas-vindas que atrasa o "Continuar".

**Do:** trilha como **dado** (escalável); saudação por horário; Lis muda a fala conforme o
progresso. **Don't:** grid genérico de cards iguais; mais de um CTA laranja; loop de
animação no fundo; bloquear o início com modal.

---

## 2. Story format (StoryPlayer)

Tela-âncora: `colaborador-storyplayer-modulo.png`. Conteúdo fullscreen, vertical, mobile.
**Contrato `Story` congelado.**

```
┌──────────────────────────────┐
│ ▰▰▰▱▱  (progresso de stories) │ ← barras no topo, z-30/40, draw 600ms
│ ✕                            │
│                              │
│        [conteúdo do          │ ← 1 ideia por story
│         story: texto /       │   storyTitle 20–26/700
│         imagem / quiz]       │   body 15–17/400
│                              │
│                              │
│  ‹ toque esq.   toque dir. › │ ← navegação por toque/tap (sem swipe-loop)
│              [ Avançar ▸ ]   │ ← CTA laranja quando precisa de ação
└──────────────────────────────┘
```

- **Progresso de stories** no topo (barras), preenche com `progressDraw` 600ms.
- **1 ideia por story.** Texto curto, imagem com propósito, quiz com feedback imediato.
- Navegação: tap nas laterais / botão Avançar. Teclado/setas no preview. Esc/✕ sai.
- Transição entre stories: `motion.durations.ui` 220ms, `transform`+`opacity`, easing
  `standard`. **Sem blur, sem loop.**

**Don't:** auto-advance agressivo; texto longo rolável dentro do story; animação infinita.

---

## 3. A Lis (guia humana)

- Assets: `ASSETS/lis-bust.png` (apartes na home/feedback), `lis-full.png` (momentos
  grandes: boas-vindas, conclusão).
- **Papel:** acolher, orientar, celebrar. 1 frase por aparição, PT-BR caloroso.
  **Humaniza, nunca infantiliza.** Sem pressão/urgência falsa.
- **Entrada:** fade+slide curto (`ui` 220ms, stagger narrativo 40–140ms), **sem** ficar
  pulando em loop. Em reduced-motion: aparece sem transform.

**Don't:** Lis como mascote barulhento; balão cobrindo o CTA; fala que culpa o colaborador
("você está atrasado!") — tom é respeito.

---

## 4. ModuleCard e estados

```
ATUAL (highlight)          CONCLUÍDO               BLOQUEADO
┌────────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ ✦ Módulo 3   brilho│    │ ✓ Módulo 2       │    │ 🔒 Módulo 4      │
│ Conduta            │    │ Higiene          │    │ Segurança        │
│ ●●●○○  3/5         │    │ ●●●●●  concluído │    │ conclua o ant-   │
│      [ Continuar ▸]│    │ assinado · ✓     │    │ erior p/ abrir   │
└────────────────────┘    └──────────────────┘    └──────────────────┘
borda dourada/brilho       textSecondary calmo      textLocked, opaco
```

- **Atual:** brilho dourado sutil (`borderGold`), CTA laranja, progresso vivo.
- **Concluído:** check + selo de assinatura, tom calmo (`textSecondary`), sem CTA forte.
- **Bloqueado:** `textLocked` rgba(255,255,255,.46), cadeado + microcopy do **porquê**
  ("conclua o anterior para abrir"). **Desbloqueio = `prevDone` do contrato congelado** —
  o card só reflete a regra, não a altera.

**ModuleIcon:** ícones temáticos de padaria (flower → sprout → grain → wheat → bread →
croissant → cake → star), reforçam a metáfora "do forno à jornada".

---

## 5. Progresso vivo

- **Por módulo:** barras de stories (topo do player) + dots/anel no card.
- **Da trilha:** tela `colaborador-progresso.png` — quanto da jornada já foi.
- **Animação:** `progressDraw` 600ms ao entrar; count/draw com `transform`/`opacity`.
  Reduced-motion → estado final direto.
- **Honestidade:** progresso reflete o dado real do contrato (stories concluídos), nunca
  infla para "engajar".

---

## 6. Conclusão + assinatura

Momento grande. **Parte do contrato congelado** — fluxo intocável, só a apresentação é nossa.

```
┌──────────────────────────────┐
│        Lis (full) 🎉          │ ← celebração pontual (confetti ~3s, NÃO loop)
│   Você concluiu o Módulo 3!  │
│                              │
│  Para registrar, confirme    │
│  sua assinatura:             │
│  [ assinatura / aceite ]     │
│         [ Assinar ▸ ]        │ ← laranja
└──────────────────────────────┘
```

- Celebração **pontual** (`celebration ~3000ms`), única vez, **sem repeat**. Brilho dourado
  permitido aqui (é conquista real).
- **Assinatura/aceite** registra a conclusão (dado sensível → LGPD: minimizar, propósito
  claro, sem expor). Sucesso vira selo no ModuleCard concluído.
- Após assinar: próximo módulo desbloqueia (regra do contrato), Lis aponta o caminho.

**Don't:** confetti em loop; celebrar conclusão falsa; pedir dado além do necessário.

---

## 7. Regras de leveza (performance é design)

- **Proibido no app:** `repeat: Infinity`, `backdrop-filter: blur`. (`motion.rules.appForbidden`)
- **Só anima** `transform` e `opacity`. Sombras de marca (`pralis-glow/card/play`) **fora**
  do caminho crítico de performance.
- **Wrapper de transição de página NUNCA começa em `opacity:0`** (evita tela preta se travar).
- `prefers-reduced-motion` sempre: desliga transforms, mantém opacity.
- Toque ≥44px · foco visível · status cor+ícone+texto · 3 estados (loading/empty/error).

---

## 8. Checklist do app
- [ ] Mundo escuro quente (não preto puro) · 1 laranja por tela · dourado só como brilho/conquista.
- [ ] Home = Trilha Viva: herói "Continuar" + Lis + ModuleCard highlight · engajamento < 3s.
- [ ] Story: 1 ideia/story · progresso 600ms · navegação tap/teclado · sem blur/loop.
- [ ] ModuleCard: estados atual/concluído/bloqueado · bloqueio reflete `prevDone` (contrato).
- [ ] Conclusão + assinatura intocados (contrato) · celebração pontual ~3s sem loop.
- [ ] Leveza: só transform/opacity · sem repeat:Infinity/blur · wrapper nunca opacity:0 ·
      reduced-motion · ≥44px · AA · LGPD em assinatura.
