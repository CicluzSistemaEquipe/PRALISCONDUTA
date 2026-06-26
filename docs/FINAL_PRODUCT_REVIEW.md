# Final Product Review — Dashboard do Admin Pralís

> Auditoria de "conselho" (lentes Stripe · Linear · Apple · Figma · Notion · Vercel) sobre a
> **experiência** do Dashboard action-first. Sem alterar funcionalidade, regra de negócio,
> integração ou arquitetura. Objetivo: torná-lo a **referência de qualidade** das demais telas.

## Notas por especialista (0–10)
| Lente | Nota | Resumo |
|---|---|---|
| **Stripe** (clareza de dados, confiança) | **8.5** | Status humano + outcomes claros; falta contexto temporal (limitação de dados) |
| **Linear** (velocidade, densidade, teclado) | **8.0** | Action-first e navegável por teclado; layout um pouco arejado para uso diário |
| **Apple** (clareza, contenção, hierarquia) | **9.0** | Hierarquia forte, contido, identidade discreta |
| **Figma** (craft, microinterações) | **8.0** | Motion com propósito; falta feedback tátil de clique e rótulo no hover da barra |
| **Notion** (arquitetura da informação) | **8.5** | IA decisão→visão→contexto sólida; lista de atenção poderia priorizar por alavancagem |
| **Vercel** (performance percebida, polish) | **7.5** | **Flash de "empty state" durante o carregamento** derruba a percepção de qualidade |
| **Média** | **8.25** | Muito bom; com 4 ajustes não-cosméticos chega a ~9+ |

## Pontos fortes
- **Decisão em 1 olhada:** frase de status humana responde "como estamos?" instantaneamente.
- **Action-first real:** "Precisam de atenção" como herói + **deep-link de 1 clique** até a pessoa.
- **Escaneabilidade:** barra empilhada lê o time inteiro de uma vez (melhor que donut).
- **Hierarquia e contenção:** outcomes em destaque, conteúdo demovido para "Saúde do treinamento".
- **Motion com propósito** + identidade Pralís consistente (claro, laranja = ação).

## Pontos fracos / críticas (técnicas)
1. **[Vercel — alto impacto] Flash de empty state no load.** Durante `loadEmployeeRows`, a tela
   mostra "Sem dados ainda" / "Nenhum colaborador" por um instante **antes** dos dados chegarem,
   porque `!hasPeople` é verdadeiro tanto no *carregando* quanto no *vazio*. Isso parece "quebrado"
   por uma fração de segundo — exatamente o oposto de premium. **Skeletons** resolvem.
2. **[Notion — médio/alto] Atenção não prioriza por alavancagem.** "Falta assinar" (pessoa que já
   concluiu tudo e precisa de **1 clique** para virar conforme) tem ROI muito maior que "Não
   começou", mas hoje aparecem misturados. Ordenar por alavancagem acelera a melhor decisão.
3. **[UX/Onboarding — médio] Primeiro uso (0 colaboradores) é "morto".** Sem ninguém cadastrado,
   o painel não convida à ação primária. Falta um **CTA de primeiro uso** ("Cadastrar colaborador").
4. **[Figma — baixo/médio] Falta feedback tátil de clique** nos KPIs/itens (press state) — pequeno,
   mas é o tipo de detalhe que separa "bom" de "premium".

## Oportunidades
- Transformar **estados** (loading/empty/first-run/positivo) num conjunto impecável — é o que mais
  pesa na sensação de qualidade no dia a dia.
- **Priorização inteligente** da ação (alavancagem) — o painel "pensa" pelo gestor.

## Melhorias rápidas (quick wins — vou implementar)
- **QW1.** Skeletons no carregamento (distribuição, atenção, saúde) — elimina o flash. *(Vercel)*
- **QW2.** Ordenar "Precisam de atenção" por alavancagem: **Falta assinar → Não começou**. *(Notion)*
- **QW3.** CTA de primeiro uso na atenção quando há 0 colaboradores ("Cadastrar colaborador"). *(UX)*
- **QW4.** Feedback tátil sutil (active/press) nos KPIs e itens de atenção. *(Figma)*

## Melhorias de alto impacto (vou implementar QW1–QW3; QW4 é polish)
QW1 e QW2 são as de maior impacto em **percepção de qualidade** e **qualidade de decisão**, e são
100% experiência (sem mexer em dados/regra). Implemento agora.

## Ideias inovadoras / diferenciadores de mercado (NÃO implementar agora — exigem nova função)
> Listadas para o roadmap; **fora do escopo** desta sprint (mudariam funcionalidade/dados):
- **Tendência temporal** ("+2 concluíram esta semana") — exige histórico/eventos (hoje não há).
- **Ações em massa** a partir da atenção ("enviar link para todos que não começaram").
- **Command palette (⌘K)** para navegar/agir sem mouse (princípio Linear/Raycast).
- **Saved views / filtros salvos** e **export** de relatório.
- **Metas e nudges automáticos** (lembrete via WhatsApp/n8n para quem está parado).
Cada uma é um diferencial real, mas é **feature**, não experiência — proponho para depois.

## O que Stripe / Linear / Apple / Figma fariam diferente
- **Stripe:** sempre um **delta/tendência** ao lado de cada número (exige histórico → roadmap).
- **Linear:** mais **denso e teclado-first** (atalhos, navegação por setas na lista de atenção).
- **Apple:** **menos é mais** — garantir que o herói (ação) seja inconfundivelmente o foco.
- **Figma:** **micro-feedback** em cada interação (press, hover, foco) impecável.
- **Notion:** **priorização/agrupamento inteligente** da informação acionável (alavancagem).

## Veredito
Estado atual: **referência quase pronta (8.25/10).** Com QW1–QW3 (estados impecáveis + priorização
inteligente) e o micro-feedback (QW4), o Dashboard atinge o **padrão máximo** e vira a base de
arquitetura/UX/Motion/Design System para Colaboradores, Gerentes, Módulos, Editor e Termos.

> Implemento **QW1–QW4** agora (todas experiência), valido (build/UX/a11y/responsividade/motion) e
> trago o resultado. As ideias inovadoras ficam para sua aprovação como features futuras.
