# 02 · Design Philosophy — Pralís

> Como **pensar** o design da Pralís. Não é sobre componentes (isso está no doc 04),
> é sobre o critério que decide cada tela. Leia antes de desenhar qualquer coisa.

---

## 1. Princípio raiz: a identidade vem primeiro

**Nunca comece por um estilo. Comece pela identidade da Pralís.**

A direção de qualquer peça nasce de: **marca + público + produto + objetivo de
negócio**. Estilo é consequência, não ponto de partida. Não existe "meu estilo
favorito" aplicado à Pralís — existe **o que a Pralís precisa ser** naquela
superfície.

- **Cores: não assuma nada.** Sem branco padrão, sem laranja padrão, sem cor padrão.
  As cores vêm da paleta oficial (doc 03). Quando precisar de uma cor nova, ela tem
  que ser **coerente com a marca**, não com gosto.
- **Quando a identidade existe, ela prevalece** sobre tendência ou gosto pessoal.
  A Pralís *tem* manual, paleta e fontes — use-os.

---

## 2. Os dois mundos (decisão arquitetural central)

O Sistema Pralís vive em **dois mundos visuais distintos e propositais**. Saber em
qual você está é a primeira decisão de qualquer tela.

| | 🌙 **Colaborador (app)** | ☀️ **Admin / CMS** |
|---|---|---|
| **Objetivo** | Engajar, acolher, fazer concluir | Produtividade, clareza, velocidade |
| **Sensação** | Emocional, jornada, calor de forno | Profissional, organizado, leve |
| **Tema base** | **Escuro quente** (`#0d0800`) | **Claro** (`#ffffff`, neutros quentes) |
| **Cor de ação** | Laranja `#f37435` | Laranja `#f26b2a` (1 por tela) |
| **Dourado** | Detalhe premium, fios, brilho | **Quase não usar** (suja no branco) |
| **Motion** | Expressivo com propósito (sem loops) | Snappy, discreto, funcional |
| **Tipografia título** | MadeByDillan (logo) + display serif | Montserrat (sem serifa decorativa) |
| **Densidade** | Tela cheia, 1 coisa por vez (story) | Confortável; tabelas compactas |
| **Referências** | Duolingo, Instagram Stories, Apple | Linear, Notion, Vercel, Stripe |

> **Há também um Light Mode opcional do app do colaborador** (fundo creme `#fdf8f2`),
> ativável no Perfil. Não confundir com o admin: é o mesmo mundo emocional, só mais
> claro. O admin é **sempre** claro e blindado contra o tema do app.

**Regra de ouro:** nunca misture as linguagens. Um card de admin não vai pro app; um
card emocional do app não vai pro admin.

---

## 3. Como a Pralís deve parecer

- **Quente e premium.** Luz de forno, tons terrosos, dourado com parcimônia.
  Acabamento de software caro: alinhamento perfeito, ritmo de espaço, microdetalhe.
- **Com identidade inconfundível.** O símbolo das espigas, a Lis, a serifa do logo,
  a paleta terrosa — alguém olha e sabe que é Pralís.
- **Clara acima de tudo.** Hierarquia forte, uma mensagem principal por tela,
  organização que se entende sem ler.
- **Viva.** Motion que comunica (entrada, progresso, feedback). Sensação de fluidez.

## 4. Como a Pralís **nunca** deve parecer

- ❌ **Genérica / template / cara de IA** — o pecado capital. Sem componentes de
  prateleira sem alma, sem layout "Bootstrap".
- ❌ **Fria/corporativa** — azul tech, cinza neutro, gradientes roxos de SaaS clichê.
- ❌ **Carregada** — excesso de sombras, gradientes, cores, bordas, informação.
- ❌ **Infantil** — apesar da Lis, o tom é de software premium, não de jogo de criança.
- ❌ **Decorativa sem função** — brilho, partícula ou animação que não comunica nada.

---

## 5. Referências — usar como **princípio**, nunca copiar

> Pergunta-guia: *"como uma empresa de classe mundial resolveria ESTE problema?"*
> Use líderes como **princípios** de UX/Produto/Motion/IA — **nunca** copie layout,
> identidade ou componentes. Detalhe em `09_REFERENCES.md`.

- **Usar:** Apple (clareza, hierarquia, espaço, keynote), Linear/Notion/Vercel
  (produtividade, tabelas, densidade — para o admin), Stripe (confiança, docs,
  precisão), Duolingo (engajamento, jornada, celebração — para o app), Framer/Arc
  (motion com propósito).
- **Evitar como referência:** dashboards "admin template" genéricos, landing pages
  de cripto/AI com glow neon, kits de UI sem identidade, tendências passageiras
  (glassmorphism exagerado, brutalism aleatório) que brigam com a marca.

---

## 6. Como pensar **hierarquia**

1. **Uma mensagem principal por tela.** O que a pessoa precisa ver/fazer primeiro?
   Esse elemento ganha tamanho, peso e espaço.
2. **Hierarquia por espaço, não por caixa.** Prefira agrupar com espaço em branco e
   um fio (hairline) a aninhar cards dentro de cards.
3. **Contraste deliberado:** título grande (serifa/display) → corpo legível
   (Montserrat) → labels pequenos (uppercase, tracking). Ver escala no doc 03.
4. **Cor é hierarquia:** o laranja marca **a** ação. Se tudo é laranja, nada é.
5. **Números são protagonistas** em dashboards — grandes, tabulares, com contexto.

## 7. Como pensar **UX**

- **Reduza cliques e decisões.** O caminho feliz é curto e óbvio.
- **Progressive disclosure:** mostre o essencial; o avançado aparece sob demanda.
- **Estado sempre visível:** disponível / em andamento / concluído / bloqueado /
  recomendado — comunicados **visualmente**, sem depender de ler texto.
- **Todo bloco tem 3 estados:** loading (skeleton), vazio (ícone + texto + ação),
  erro (retry). Nunca um "0%" que parece quebrado.
- **Feedback imediato:** toda ação responde (toast, microanimação, estado otimista).
- Detalhe em `06_UX_GUIDELINES.md`.

## 8. Como pensar **motion**

- **Motion tem propósito** — entrada de conteúdo, desenho de progresso, transição de
  contexto, feedback de toque. **Nunca decoração.**
- **App do colaborador:** expressivo, mas **leve em qualquer celular** — sem
  `repeat: Infinity`, sem `backdrop-filter: blur` (custo de performance). Respeite
  `prefers-reduced-motion`.
- **Admin:** snappy e discreto (estilo Linear). Movimento = continuidade e feedback.
- Curvas, durações e padrões completos em `07_MOTION_GUIDELINES.md`.

## 9. Como pensar **acessibilidade**

- **Contraste WCAG AA**: ≥4.5:1 texto normal, ≥3:1 texto grande/ícones. Texto branco
  sobre laranja/dourado precisa ser verificado (use o laranja escuro `#c9501a` para
  texto sobre branco).
- **Toque ≥44px** no mobile; foco sempre visível; navegação por teclado (Esc fecha,
  Enter envia, setas no story).
- **`prefers-reduced-motion`** desliga transforms, mantém opacidade.
- **Não comunicar só por cor** — combine cor + ícone + texto para status.
- Acessibilidade é o valor "Cuidado com as pessoas" virando interface.

## 10. Como pensar **produtividade** (admin)

- O admin é onde a gestão **trabalha**. Otimize para **velocidade e clareza**, não
  para engajamento. Menos é mais: branco, hairlines, tabela herói, 1 ação primária.
- Tabelas são o componente herói (estilo Linear/Notion). Densidade confortável.
- Atalhos, busca, filtros, exportação — fricção zero para tarefas repetidas.

## 11. Como pensar **dashboards**

- **KPIs primeiro:** número grande (tabular) + label + delta + sparkline opcional.
- **Gráficos sóbrios:** linha/área laranja a 8%, sem grid pesado, sem gradiente
  carregado. Máx 4–5 cores dessaturadas (laranja → marrom → slate → teal-gray → âmbar).
- **Conte uma história:** do panorama (KPIs) ao detalhe (drill-down gerente → equipe
  → colaborador). Sempre com estado "sem dados ainda" elegante.

## 12. Como pensar **telas de treinamento** (o app)

- **Formato story:** uma ideia por tela, fullscreen, barra de progresso de segmentos,
  avanço por toque/seta. Natural para quem usa celular.
- **A Lis conduz** as transições e momentos-chave.
- **Engajamento é requisito**, não enfeite: responda em <3s "onde parei / o que faço
  agora / quanto falta". O próximo passo é sempre óbvio. Ver memória de engajamento
  e doc 05.
- **Sem criar regra de negócio nova** ao gamificar — gamifique a *experiência*
  (progresso vivo, celebração), nunca a lógica de desbloqueio/conclusão.

## 13. Como pensar **apresentações**

- **Keynote, não slide corporativo.** Pouco texto, hierarquia forte, um conceito por
  slide, ritmo. Tela cheia, motion deliberado.
- Use a identidade dark premium (calor de forno) + espigas + Lis. Ver
  `08_PRESENTATION_GUIDELINES.md` e o exemplo real em `docs/apresentacao/index.html`.

---

## 14. Heurística final (o "cheiro" de uma boa tela Pralís)

Antes de fechar qualquer tela, pergunte:
1. Dá pra saber que é **Pralís** só de olhar? (identidade)
2. A **mensagem principal** salta em <3 segundos? (hierarquia)
3. Parece **software premium** — fluido, organizado, confiável? (acabamento)
4. Tem **motion com propósito** ou movimento gratuito? (motion)
5. Funciona pra quem tem **baixa visão, daltonismo, celular fraco**? (acessibilidade)
6. Tem **cara de template/IA**? Se sim, **reprove e refaça**. (anti-genérico)

> Qualquer "não" nos itens 1–5, ou "sim" no 6, **bloqueia a entrega**.
> Checklist operacional completo em `11_DESIGN_REVIEW_CHECKLIST.md`.
