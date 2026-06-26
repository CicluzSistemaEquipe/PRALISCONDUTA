# 08 · Presentation Guidelines — Pralís

> Como criar **apresentações** (keynotes, decks, materiais institucionais) da Pralís.
> Referência viva: `docs/apresentacao/index.html` — a apresentação oficial do sistema,
> que aplica tudo abaixo.

---

## 1. Princípio: keynote, não slide corporativo

Uma apresentação Pralís é um **keynote** — ritmo, hierarquia forte, pouco texto, um
conceito por slide, motion deliberado. Nunca um "PowerPoint de bullets".

- **Conta uma história**, não despeja informação.
- **Tela cheia, imersiva.** O slide é o palco.
- **Identidade Pralís** em cada tela (dark premium + espigas + Lis).

---

## 2. Direção visual padrão (deck)

**Conceito:** *"Do forno à jornada"* — dark premium com alma de padaria.

| Elemento | Definição |
|---|---|
| **Fundo** | Preto quente `#0c0a09`/`#0d0800` + **glow radial dourado** no topo |
| **Cor de ação/destaque** | Laranja `#f37435` |
| **Premium/fios** | Dourado `#b8860b → #d4a017` |
| **Texto serif/suave** | Creme `#e8cfa0` |
| **Títulos** | **Serif editorial** (Fraunces/Georgia) — itálico no realce |
| **Corpo/UI** | Montserrat |
| **Assinatura** | Trio de espigas + **fio dourado** recorrente + **Lis** em momentos-chave |
| **Numeração** | Número de bloco gigante em serifa (watermark dourado) nos divisores |

> Em apresentação é permitido o **serif editorial** (que na UI do produto evitamos) —
> ele dá o ar de keynote. Já a marca/logo continua MadeByDillan.

---

## 3. Storytelling — estrutura de um deck

1. **Capa** — marca + conceito + 1 frase. Lis presente.
2. **Sumário** — os blocos numerados (mapa mental).
3. **Divisores de bloco** — número gigante + título; dão respiro e ritmo.
4. **Slides de conteúdo** — 1 ideia cada (visão → arquitetura → detalhe → ação).
5. **Encerramento** — frase de marca ("é provar e ser feliz") + Lis + agradecimento.

**Arco narrativo:** o quê → por quê → como → o que falta → como seguir. Do panorama
ao detalhe ao próximo passo.

---

## 4. Hierarquia e ritmo

- **Um conceito por slide.** Se precisa de "e", provavelmente são dois slides.
- **Pouco texto.** Título forte + 3–5 itens no máximo. O apresentador fala o resto.
- **Hierarquia:** eyebrow (laranja, UPPER) → título serif grande → apoio curto →
  visual (card/diagrama/mockup).
- **Ritmo:** alterne densidade — divisor (respiro) → conteúdo (denso) → divisor. Não
  10 slides pesados seguidos.
- **Tela cheia para impacto:** capa, divisores e frases de efeito ocupam tudo.

---

## 5. Elementos visuais

| Elemento | Quando usar |
|---|---|
| **Cards** (grid 2–5) | Agrupar conceitos paralelos (públicos, pilares, blocos) |
| **Diagrama de fluxo** | Mostrar processo (edição → jornada → relatório) |
| **Timeline** | Jornada do colaborador, roadmap por fases |
| **Matriz/tabela** | Permissões, comparações (hoje vs futuro) |
| **Mockup de celular** | Mostrar a tela real do app sem screenshot pesado |
| **KPIs** | Números de impacto (grandes, tabulares) |
| **Nota da Lis** | Humanizar um ponto-chave (avatar + fala em serif itálico) |
| **Ícones** | 1 por card, consistentes (lucide ou emoji temático com parcimônia) |

> **Mockups > screenshots** quando possível: leves, on-brand, sem ruído de UI real.

---

## 6. Quando usar o quê

- **Tela cheia / pouco texto:** abertura, divisores, frases de marca, números de
  impacto, momentos emocionais.
- **Mais densidade (ainda enxuta):** arquitetura, permissões, checklist técnico —
  públicos de TI/gestão que querem substância. Mesmo aqui: tabelas/diagramas, não
  parágrafos.
- **Diagrama** sempre que houver processo/fluxo/hierarquia.
- **Lis** em boas-vindas, transições de bloco emocionais e encerramento.

---

## 7. Motion da apresentação

- **Transição entre slides:** fade + slide-y leve, ease enfático `(0.16,1,0.3,1)`.
- **Reveal escalonado** dos elementos do slide (stagger ~70ms via `[data-anim]`).
- **Barra de progresso** dourada no topo; numeração de slide.
- **Navegação:** teclado (←/→/Espaço/Home/End), dots, swipe, fullscreen (`F`).
- **Respeitar `prefers-reduced-motion`** e ter **modo impressão/PDF** (um slide por
  página).
- **Nada decorativo:** o motion conduz o olhar e dá ritmo, não enfeita.

---

## 8. Formato de entrega

- **Preferir HTML interativo self-contained** (abre em qualquer navegador, offline,
  zipável, apresentável em reunião, vira PDF) — como `docs/apresentacao/index.html`.
- **Assets portáteis:** copiar logos/Lis/espigas para uma pasta `assets/` ao lado do
  HTML (não depender de caminhos do projeto).
- **Acessível:** contraste AA mesmo no dark; texto real (não imagem de texto);
  navegação por teclado.

---

## 9. Checklist de apresentação

- [ ] Conceito autoral definido **antes** dos slides (não template genérico).
- [ ] Identidade Pralís em cada slide (paleta, espigas, Lis, serif+Montserrat).
- [ ] 1 ideia por slide; pouco texto; hierarquia forte.
- [ ] Divisores dando ritmo; arco narrativo claro.
- [ ] Diagramas/mockups no lugar de parágrafos.
- [ ] Motion com propósito + reduced-motion + modo PDF.
- [ ] Navegação por teclado/dots/swipe/fullscreen funcionando.
- [ ] Frase de marca no encerramento.
- [ ] **Não tem cara de template/IA.**

---

## 10. O que evitar em apresentações

- ❌ Slides de bullets densos · ❌ texto que o apresentador só lê · ❌ clip-art/ícones
  multicor genéricos · ❌ gráfico decorativo sem leitura · ❌ transições espalhafatosas
  (cube, spin) · ❌ cor fora da paleta · ❌ screenshots pesados e desalinhados ·
  ❌ "tema corporativo" azul/cinza sem alma.

---

### Conexões
- Paleta e tipografia → `03_VISUAL_IDENTITY.md`
- Motion → `07_MOTION_GUIDELINES.md`
- Exemplo real → `docs/apresentacao/` (index.html + manuais)
