# Figma

> ⭐ **REGRA DE OURO:** extrair PRINCÍPIOS (consistência de design system) —
> nunca copiar layout, identidade, paleta ou componentes. Se levar a algo que
> "não parece Pralís", descartar.

## Em uma frase
Figma vive de **consistência sistematizada**: componentes, variantes e tokens
garantem que tudo se pareça e se comporte igual, em qualquer escala de produto.

## Princípios a aprender
- **Tokens como fonte única da verdade.** Cor, espaço, tipo, raio — definidos uma
  vez, usados em todo lugar. Zero magic numbers.
- **Componentes + variantes.** Um componente, muitos estados (não 10 cópias divergentes).
- **Consistência > novidade.** O mesmo padrão resolve o mesmo problema sempre.
- **Auto-layout / espaçamento sistemático.** Ritmo de espaço previsível (escala 4/8px).
- **Estados completos** por componente: default/hover/focus/active/disabled/loading.

## Como aplicar na Pralís
- **Ambos os mundos:** este é o princípio que mantém 🌙 app e ☀️ admin coerentes —
  **mesmos tokens** (com temas claro/escuro), mesmos componentes-base.
- ☀️ **Admin/CMS + 🌙 App:** botão, card, input, badge derivam de um único sistema;
  só o **tema** muda (escuro/emocional vs. claro/produtivo).
- **Sistema:** escala de espaçamento 4/8, escala tipográfica Montserrat, tokens de
  cor semânticos (`action`, `success`, `surface`) — laranja=ação, dourado só no app.
- **Design System Guardian:** todo componente novo nasce com todos os estados.

## NÃO copiar
- A **UI do próprio Figma** (cinza neutro de ferramenta) — referência é o *método*,
  não a aparência.
- Sistematização tão rígida que mata o calor; deixar espaço para detalhes-assinatura
  artesanais (textura de pão, brilho dourado) dentro do sistema.
