# 12 · AI Context — como o Claude Design deve usar esta base

> Manual de uso desta pasta para **qualquer IA** que vá criar material visual da
> Pralís: interfaces, telas, apresentações, landing pages, materiais institucionais,
> mockups, e-mails, qualquer artefato de design.
> **Esta pasta é a fonte oficial de Design, Produto e UX da Pralís.**

---

## 1. Sua missão como IA de design da Pralís

Produzir material visual que seja **inconfundivelmente Pralís**: quente, claro,
premium, com motion que comunica, acessível e **sem nenhuma cara de template ou IA**.
Você não inventa um estilo — você **expressa a identidade** documentada aqui.

---

## 2. Ordem de leitura (sempre)

Antes de produzir qualquer coisa, internalize, nesta ordem:

1. **`01_BRAND_FOUNDATION.md`** — quem é a Pralís, tom, Lis, valores.
2. **`02_DESIGN_PHILOSOPHY.md`** — como pensar; **os dois mundos**.
3. **`03_VISUAL_IDENTITY.md`** — cores, fontes, tokens reais (a fonte da verdade visual).
4. **`10_DESIGN_RULES.md`** — o que é inegociável.
5. Os específicos da tarefa (ver §4).

---

## 3. Fluxo de trabalho obrigatório

> Espelha a doutrina IADOMARCO: **pensar primeiro, implementar depois; revisar antes
> de chamar de pronto.**

**Passo 1 — Direção (antes de qualquer pixel/código):**
Defina explicitamente: **mundo** (🌙 app ou ☀️ admin), **objetivo** da peça, **público**,
**conceito/assinatura**, **paleta** (da oficial), **tipografia**, **elemento de marca**
e **direção de motion**. Não pule isso — é regra global do Marco.

**Passo 2 — Construir:**
Use os **tokens** (doc 03) e **componentes** (doc 04). Reuse antes de criar. Aplique
hierarquia, estados e UX (docs 05/06) e motion (doc 07).

**Passo 3 — Revisar (antes de entregar):**
Rode **`11_DESIGN_REVIEW_CHECKLIST.md`** inteiro. Qualquer gate 🔴 crítico bloqueia.
Corrija e revise de novo. Só então entregue.

---

## 4. Qual doc abrir para cada tipo de tarefa

| Tarefa | Leia além de 01/02/03/10 |
|---|---|
| **Tela do app (colaborador)** | 05 (produto), 06 (UX), 07 (motion), 04 (componentes) |
| **Tela do admin / dashboard / CMS** | 05, 06, 04, 03 (§5 tokens admin) |
| **Componente novo** | 04 (evolução), 03 (tokens), 07 (motion) |
| **Apresentação / keynote** | 08 (apresentações), 07 (motion) |
| **Landing page / institucional** | 08 + 09 (referências) + 01 (tom) |
| **Revisão de design existente** | 11 (checklist) + 10 (regras) |
| **Decisão de direção / "qual estilo?"** | 02 + 09 (princípios, não cópia) |

---

## 5. Regras de comportamento da IA

- **A identidade prevalece** sobre seu gosto ou tendências. Se a base diz X, faça X.
- **Não assuma cor.** Use a paleta oficial (doc 03). Precisa de cor nova? Derive da
  marca e justifique.
- **Saiba o mundo.** Nunca aplique a linguagem do admin no app, nem o inverso.
- **Tokens, não números mágicos.** Sempre as CSS vars/escala base 4.
- **Respeite o contrato congelado** do produto (doc 05/10): nunca toque em
  desbloqueio/progresso/conclusão/assinatura/`Module`/`Story` ao mexer no visual.
- **Motion com propósito**, leveza no app, reduced-motion sempre.
- **Acessibilidade AA** não é opcional.
- **Anti-genérico é lei.** Se o resultado tem cara de template/IA, **refaça** — não
  entregue.
- **Quando em dúvida**, prefira: clareza > esperteza; identidade > tendência;
  consistência > exceção bonita.

---

## 6. Como expressar a marca (resumo operacional)

- **Calor de forno:** fundos quentes (preto quente/creme), tons terrosos, dourado com
  parcimônia — nunca azul/cinza corporativo frio.
- **Assinatura:** trio de espigas + fio dourado + a **Lis** em momentos-chave.
- **Tipografia:** Montserrat na UI; MadeByDillan só no logo; serif editorial só em
  apresentação.
- **Laranja para ação**, um por tela.
- **Tom:** caloroso e claro com o colaborador; preciso com o TI.

---

## 7. Erros comuns a evitar (checklist mental)

- ❌ Começar por um estilo em vez da identidade.
- ❌ Usar branco/azul/cinza "SaaS genérico" e perder o calor da marca.
- ❌ Dourado na UI clara do admin.
- ❌ Misturar linguagem dos dois mundos.
- ❌ Animação decorativa / loop infinito / blur no app.
- ❌ Status só por cor; contraste fraco; foco invisível.
- ❌ Card dentro de card; números mágicos; mais de 1 ação primária.
- ❌ Entregar sem rodar o checklist (doc 11).
- ❌ Qualquer resultado com **cara de IA/template**.

---

## 8. Material de apoio fora desta pasta (contexto real do projeto)

Para ver a identidade **aplicada**:
- `docs/apresentacao/index.html` — apresentação oficial (keynote dark premium).
- `docs/ADMIN_DESIGN_SYSTEM.md` — design system detalhado do admin claro.
- `src/styles/pralis.css` / `src/admin/admin.css` / `tailwind.config.ts` — tokens reais.
- `src/assets/brand/` e `src/assets/lis/` — logos, espigas, Lis.
- `docs/FUTURE_ROADMAP.md`, `docs/TRAINING_PLATFORM_ARCHITECTURE.md` — produto/roadmap.

> Estes são **referência de verdade**. Se algo nesta base divergir do código real,
> o código/tokens vencem para valores; esta base vence para **princípios e direção**.

---

## 9. Definição de "entregue" (para a IA)

Você só entrega quando:
1. Definiu a **direção** antes de construir (passo 1).
2. Usou **tokens + componentes** oficiais (docs 03/04).
3. Aplicou **UX, estados e motion** corretos (docs 05/06/07).
4. Rodou o **checklist** (doc 11) e não há gate 🔴 crítico.
5. O resultado **parece Pralís** e **não tem cara de template/IA**.

---

### Esta pasta, em uma frase
> Leia tudo, defina a direção, construa com os tokens, revise com o checklist —
> e entregue algo **quente, claro, premium e inconfundivelmente Pralís**.
