# 10 · Design Rules — Pralís

> Regras **permanentes** e inegociáveis. Se uma decisão de design contradiz qualquer
> regra aqui, a decisão está errada. São o contrato de qualidade da marca.

---

## A. Identidade

1. **A identidade vem primeiro.** Toda peça nasce da marca Pralís (doc 01/03), nunca
   de um estilo importado.
2. **Não assuma cor.** Sem branco/laranja/qualquer-cor padrão. Cores vêm da paleta
   oficial.
3. **Sempre parecer Pralís.** Se alguém não reconhece a marca olhando a tela, refaça.
4. **Nunca cara de template / IA / genérico.** Esse é o erro capital — bloqueia entrega.
5. **Respeite o logo:** MadeByDillan só dentro do logotipo; use as variações oficiais
   (branca no escuro, preta no claro); nunca distorça ou recolora.

## B. Cor

6. **Laranja = ação.** Uma ação primária (um laranja) por tela.
7. **Dourado = brilho premium**, com parcimônia. **Sem dourado na UI clara do admin.**
8. **Marrom = base/detalhe**, não protagonista de ação.
9. **Status nunca só por cor** — sempre cor + ícone + texto.
10. **Contraste AA sempre** (≥4.5:1 texto). Texto sobre branco usa laranja escuro
    `#c9501a`, não o laranja vivo.

## C. Os dois mundos

11. **App = escuro quente e emocional; Admin = claro e produtivo.** Nunca misture as
    linguagens.
12. **Admin é sempre claro** — blindado contra o tema do app.
13. **Componente não cruza de mundo** sem re-desenho.

## D. Clareza & hierarquia

14. **Uma mensagem principal por tela.**
15. **Hierarquia por espaço**, não por aninhar caixas. Nunca card dentro de card
    dentro de card.
16. **Tokens, não números mágicos.** Use as CSS vars/escala base 4 — nada de hex/px
    soltos.
17. **Números tabulares** em dados/dashboards.

## E. Motion

18. **Motion sempre com propósito** — comunica estado/continuidade/feedback, nunca
    decora. Se não dá pra nomear a função, remova.
19. **App do colaborador: sem `repeat: Infinity` e sem `backdrop-filter: blur`** —
    leveza em qualquer celular.
20. **Anime só `transform`/`opacity`** para 60fps.
21. **Sempre respeitar `prefers-reduced-motion`.**
22. **Wrapper de transição de página nunca começa em `opacity:0`** (evita tela preta
    se a animação travar).

## F. UX & estados

23. **Todo bloco tem loading, empty e error.** Nunca tela vazia, nunca erro sem saída.
24. **Toda ação dá feedback** (otimista + toast quando couber).
25. **Foco visível, Esc fecha, Enter envia, toque ≥44px.**
26. **Sem dark patterns.** Sem urgência falsa, sem pressão, sem enganar. Respeito é
    valor de marca.
27. **Microcopy PT-BR clara**, verbo de ação nos CTAs, tom Pralís com o colaborador.

## G. Produto

28. **Contrato congelado:** `Module`/`Story`, desbloqueio (`prevDone`), progresso,
    conclusão e assinatura **não mudam**. Features novas são **aditivas e
    desacopladas**.
29. **Gamifique a experiência, nunca a regra de negócio.**
30. **Engajamento é requisito no app do colaborador** (responder em <3s: onde parei /
    o que faço / quanto falta).
31. **Reusar componentes** (doc 04) antes de criar novos.
32. **Privacidade desde o desenho** — coletar só o que vira decisão (LGPD).

## H. Escala & consistência

33. **Pensar mobile sempre** (app é mobile-first; admin é responsivo até o celular do
    gestor).
34. **Pensar escalabilidade** — conteúdo como dado, identidade consistente em
    centenas de telas.
35. **Consistência de tokens e componentes** acima de criatividade pontual. Uma
    exceção bonita que quebra o sistema é uma regressão.
36. **Performance é design** — sem isso, não é premium.

---

## Hierarquia de decisão (quando regras parecem conflitar)

1. **Acessibilidade e honestidade** (nunca sacrificar — itens 9, 10, 26).
2. **Identidade da marca** (itens 1–5).
3. **Clareza/UX** (itens 14, 23).
4. **Estética/motion** (itens 18+).

> Ex.: se um efeito bonito reduz contraste ou trava o celular, **a acessibilidade/
> performance vence** — sempre.

---

## Frase-síntese (cole no topo de qualquer review)

> **Quente, claro, premium e inconfundivelmente Pralís — com motion que comunica,
> acessível, leve no celular e sem nenhuma cara de template.**

---

### Conexões
- Verificar na prática → `11_DESIGN_REVIEW_CHECKLIST.md`
- Porquês → `02_DESIGN_PHILOSOPHY.md`
