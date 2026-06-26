# Product Discovery Report — Dashboard do Admin Pralís

> **Modo:** IADOMARCO V2.1 — Product Discovery (sem implementação). Pensado como time de Product
> Design de classe mundial, **esquecendo a implementação atual**. Princípios (não cópias) de
> Stripe, Linear, Notion, Figma, Vercel, Asana, Raycast, Apple.
> **Restrição:** posso reconstruir 100% da experiência; **não altero** regra de negócio,
> dados, permissões, integrações ou funcionalidades. **Identidade Pralís mantida** (SaaS claro,
> laranja = ação — identidade já definida deste projeto).

---

## 0. Desafio à premissa ("8h/dia, milhares de gestores")
Um PM de referência **questiona o brief antes de aceitá-lo**. Este painel **não** é usado 8h/dia
como um terminal de operação — um gestor de padaria o abre em **momentos de check-and-act**:
ao **contratar** (gerar acesso), ao **cobrar conclusão** (quem está atrasado), e ao **auditar
conformidade** (quem assinou o código de conduta — valor jurídico). 
**Conclusão de produto:** otimizar para **tempo-até-decisão** e **tempo-até-ação**, não para
"ficar olhando". O painel deve, em **1 olhada**, dizer *como estamos* e *o que fazer agora* — e
sumir do caminho. Isso muda tudo na arquitetura.

## 1. Diagnóstico da tela atual
Hoje o Dashboard mostra (de cima pra baixo): header → 4 KPIs (Colaboradores, Concluíram %,
Assinaram %, Módulos ativos) → donut "Etapas da jornada" → "Precisam de atenção" → "Curva de
retenção" → "Quizzes" (anel) → "Média geral". É **competente e bonito**, mas é um **mural de
métricas**: comunica *números*, não *decisões*. A informação mais acionável (quem precisa de
empurrão) divide espaço igual com métricas de vaidade e de conteúdo.

## 2. Problemas encontrados
1. **Redundância de "progresso".** Donut (distribuição) + Curva de retenção (funil %) + Média
   geral (média %) dizem **a mesma coisa** de 3 formas. Três cards para uma ideia.
2. **Métrica de conteúdo no painel de pessoas.** "Módulos ativos" e "Quizzes (acertos)" são
   **saúde do conteúdo**, não a tarefa do gestor (conclusão das pessoas). Competem por atenção
   com o que importa.
3. **Ação não é protagonista.** "Precisam de atenção" — a única coisa **acionável** — está como
   card lateral, com o mesmo peso de gráficos passivos.
4. **Sem leitura de status em linguagem humana.** Tudo é %/gráfico; falta a frase que um gestor
   leria em 1 segundo ("3 de 4 ainda não começaram").
5. **Curva de retenção é abstrata** para uma equipe pequena de padaria (é um conceito de funil de
   produto, não de RH de loja) — alto custo cognitivo, baixo valor.
6. **Hierarquia plana:** 7 blocos de peso parecido → o olho não sabe onde pousar primeiro.

## 3. Oportunidades
- Transformar **números em decisões** e **decisões em ação** (a lista de atenção como herói).
- **Status em uma frase** (humano) no topo.
- **Consolidar** as 3 visões de progresso em **uma** clara e escaneável.
- **Separar** "saúde das pessoas" (foco) de "saúde do conteúdo" (secundário/quieto) — ou empurrar
  conteúdo para as telas que já existem (Módulos, Relatórios).
- **Reforço positivo** (gamificação com propósito): quando o time está em dia, um micro-momento
  de "tudo certo" — recompensa o comportamento desejado.

## 4. Arquitetura da informação proposta (ignorando o layout atual)
Prioridade por **a pergunta que o gestor faz**:
1. **"Como estamos?"** → 1 frase de status + 2 métricas-norte (Concluíram, Assinaram).
2. **"O que faço agora?"** → **Precisam de atenção** (herói), segmentado por motivo.
3. **"Onde cada um está?"** → **uma** visão de distribuição da jornada (escaneável).
4. **"O conteúdo está ok?"** (secundário) → quizzes/módulos/média, agrupados e quietos — ou link
   para Relatórios/Módulos.

## 5. Nova jornada do usuário
Abre o painel → **lê a frase de status** (1s) → o olho é levado (motion) ao bloco **Precisam de
atenção** → clica numa pessoa → cai no recorte em Colaboradores → age (copia/envia link que já
existe) → volta. Se está tudo em dia → vê o estado **"Tudo certo ✓"** e segue a vida.
**Menos cliques, menos leitura, decisão imediata.**

## 6. Componentes que permanecem
- **Concluíram %** e **Assinaram %** (as duas métricas-norte) — agora protagonistas.
- **Colaboradores (contagem)** — como contexto/escopo (mais discreto).
- **Distribuição da jornada** (a ideia do donut) — como a **única** visão de progresso.
- **Precisam de atenção** — promovido a herói.

## 7. Componentes que serão reorganizados
- **KPIs:** de 4 iguais → **outcomes primeiro** (Concluíram, Assinaram em destaque) + contexto
  (Colaboradores) discreto. Todos continuam clicáveis (drill-down — navegação já existe).
- **Distribuição:** donut **ou** barra empilhada horizontal (mais escaneável); decidir no design.
- **Precisam de atenção:** vira o bloco principal, **segmentado por motivo** (Não começou ·
  Travado/Em andamento parado · Falta assinar), cada item → colaborador.

## 8. Componentes novos sugeridos (experiência, não novas funções)
- **Faixa de status em linguagem humana** no topo ("3 de 4 ainda não concluíram · 1 assinou") —
  derivada 100% dos dados atuais.
- **Estado "Tudo certo ✓"** com micro-celebração discreta quando não há ninguém pendente.
- *(Tudo isso é leitura/arranjo dos mesmos dados — nenhuma regra/integração nova.)*

## 9. Componentes que deixarão de existir (como card próprio)
- **Curva de retenção** (abstrata, redundante) → removida.
- **Média geral** como card → vira **caption** (um número pequeno ao lado da distribuição).
- **Quizzes (anel)** e **Módulos ativos** como cards de destaque → **demovidos** para uma faixa
  secundária "Saúde do treinamento" **ou** realocados para Relatórios/Módulos (telas que já
  existem). Nenhum dado é perdido — só reposicionado por prioridade.
> Justificativa: o painel é do **gestor de pessoas**; conteúdo/quiz é análise secundária.

## 10. Estratégia de Motion Design (motion = UX, com propósito)
- **Entrada hierárquica:** status → KPIs → bloco de atenção, com stagger curto que **guia o olho
  para a ação**.
- **KPIs:** count-up (já temos) + hover/foco inteligentes (drill-down).
- **Atenção:** itens entram em lista; hover revela a seta; foco por teclado visível.
- **Distribuição:** barra/donut "desenha" suavemente (já temos).
- **Estado positivo:** "Tudo certo ✓" com um micro-pop sutil (reforço, não festa).
- **Skeleton premium** no load (já temos). Tudo desligado sob `prefers-reduced-motion`.
- Nada decorativo: cada animação tem função (foco, continuidade, feedback).

## 11. Estratégia de UX
- **1 frase de status** (reduz carga cognitiva ao mínimo).
- **Ação em destaque** + drill-down por clique (menos cliques até agir).
- **Hierarquia forte:** 1 herói (atenção), 1 visão (distribuição), resto quieto.
- **Estados** completos (loading/empty/positivo/erro). **Teclado** e foco em tudo.

## 12. Estratégia de Product Design
- **Action-first dashboard** (princípio Linear/Asana): a tela existe para *fazer*, não *olhar*.
- **Progressive disclosure** (princípio Notion/Stripe): essencial em primeiro plano; conteúdo/
  detalhe recuado, acessível sem poluir.
- **Métrica-norte clara** (princípio Stripe): Conclusão + Assinatura como o que importa.
- **Identidade Pralís** preserva confiança da marca (claro, laranja = ação).

## 13. Justificativa de cada decisão (resumo)
| Decisão | Por quê |
|---|---|
| Promover "Precisam de atenção" a herói | É a única coisa **acionável**; é o trabalho do gestor. |
| Frase de status no topo | Resposta "como estamos?" em 1 segundo, sem decodificar gráfico. |
| Consolidar 3 visões de progresso em 1 | Remove redundância; reduz carga cognitiva. |
| Remover curva de retenção | Abstrata p/ o contexto; alto custo, baixo valor. |
| Demover quizzes/módulos | São saúde de **conteúdo**, não a tarefa de **pessoas**. |
| Outcomes (Concluíram/Assinaram) em destaque | São a métrica-norte do treinamento. |
| Motion guiando o olho p/ a ação | Motion como UX, encurta tempo-até-decisão. |

## 14. Mockup conceitual (wireframe em texto)
```
┌ Visão geral ───────────────────────────────────────────── 🔔 ─┐
│ Olá, Administrador.                                            │
│ ◆ 3 de 4 ainda não concluíram o treinamento · 1 assinou       │  ← STATUS humano (1s)
├───────────────────────────────────────────────────────────────┤
│ [ Concluíram 0% ]   [ Assinaram 25% ]        [ Colaboradores 4]│  ← outcomes 1º, contexto discreto (clicáveis)
├──────────────────────────┬────────────────────────────────────┤
│  ⚠ PRECISAM DE ATENÇÃO 3 │  Distribuição da jornada           │  ← HERÓI (esq, maior) + VISÃO (dir)
│  ● Diego  Não começou  → │   ▮▮▮▯ Pendente 3                   │
│  ● Carla  Não começou  → │   ▮ Em andamento 0                  │
│  ● Bruno  Não começou  → │   ▮ Concluído 0                     │
│  [ Ver todos os 3 ]      │   ▮ Assinado 1   · média 0%         │
├──────────────────────────┴────────────────────────────────────┤
│ Saúde do treinamento (secundário, quieto)                      │
│  Quizzes 0% acertos   ·   12 módulos ativos   ·   ⟶ Relatórios │  ← demovido, compacto
└────────────────────────────────────────────────────────────────┘
```
*(Quando ninguém está pendente, o herói vira: "✓ Tudo certo — toda a equipe está em dia.")*
**Responsivo:** no mobile, empilha — Status → Outcomes → **Atenção** (primeiro) → Distribuição →
Saúde do treinamento.

## 15. Ordem de implementação (após aprovação)
1. **IA + layout** do novo painel (status + outcomes + herói + distribuição + faixa secundária).
2. **Bloco "Precisam de atenção"** segmentado por motivo + estado positivo.
3. **Consolidação** da distribuição (uma visão) + caption de média.
4. **Faixa "Saúde do treinamento"** (quizzes/módulos compactos, link p/ Relatórios).
5. **Motion** (entrada hierárquica, hover/foco, estado positivo) + **Gates** (UX/Motion/A11y/
   Responsividade/Build/Consistência).
6. Validação final + relatório do que evoluiu.

---

> ⚠️ **Nada implementado.** Tudo aqui é descoberta + proposta de experiência. Aguardo sua
> aprovação (total ou com ajustes — ex.: manter quizzes no painel, ou preferir donut vs barra)
> para então reconstruir, preservando 100% das regras, dados, permissões e integrações.
