# Product Evolution Plan — Pralís Admin

> **Modo:** PRODUCT EVOLUTION MODE (IADOMARCO V2). Objetivo: levar o Admin de "bom dashboard"
> a **produto de classe mundial**, vendável para milhares de empresas.
> **Regra absoluta:** evoluir **EXPERIÊNCIA**, nunca **funcionamento**. Não altero regras de
> negócio, funcionalidades, permissões, integrações, estrutura de dados, arquitetura ou lógica.
> Identidade Pralís mantida (branco predominante, laranja = ação, marrom = apoio, alto contraste,
> flat moderno, hierarquia forte). **Este é um plano — aguarda aprovação antes de implementar.**

## Categoria do produto (Inspiration Engine)
É um **SaaS de gestão de treinamento (LMS admin / people-ops)**. Princípios (não cópias) de:
**Linear** (velocidade, calma, densidade, teclado), **Stripe** (clareza de dados, confiança),
**Notion** (estrutura flexível), **Vercel** (limpeza), **Raycast/Asana/ClickUp** (foco em ação e
acompanhamento de trabalho).

## Quem usa, e o que decide (Product Thinking)
- **Dono** — visão global, uso semanal. Decide: a adesão ao treinamento está saudável? Quem
  precisa de atenção? O conteúdo/termos estão certos?
- **Gerente** — acompanha **a própria equipe**, uso mais frequente. Decide: quem não começou,
  quem travou, quem falta assinar — e **reenvia o link**.
- **Pergunta-guia:** *"Se eu gerenciasse uma padaria e abrisse isto toda segunda, ele me diria
  na hora o que fazer?"* Hoje a resposta é **"mais ou menos"** — mostra números, não decisões.

---

## Problemas encontrados
1. **Dashboard = parede de métricas, não de decisões.** Responde "quais são os números?" mas não
   "o que eu faço agora?". Há **redundância** (donut de etapas + barras de progresso + curva de
   retenção comunicam quase a mesma coisa) e muitos zeros sem leitura acionável.
2. **Hierarquia de informação plana** em algumas telas — tudo com peso parecido; o dado mais
   importante (progresso/quem precisa de ação) não "salta".
3. **Colaboradores** é uma boa tabela, mas **pouco escaneável** em escala: sem ordenação, status
   pouco destacado, edição em modal central (tira o contexto da lista).
4. **Termos** — a ação mais crítica (publicar versão, valor jurídico) não comunica claramente
   "rascunho não publicado" vs "publicado"; risco de confusão.
5. **Módulos** — estado ativo/inativo e o "arrastar para reordenar" pouco evidentes; falta um
   sinal rápido de saúde por módulo (já existe o dado).
6. **Editor** — muitos controles ao mesmo tempo; falta indicação de "salvo/levou alteração".
7. **Motion** ainda subutilizado como ferramenta de UX (transição de página acabou de ser
   corrigida; falta linguagem consistente de feedback/estado).
8. **Consistência** — espaçamentos, foco e hover variam levemente entre telas.

## Oportunidades identificadas
- Transformar o Dashboard em **"o que importa hoje"**: decisão primeiro, detalhe depois —
  **reorganizando os mesmos dados** (sem novos dados/feature).
- Tornar números **clicáveis** para navegar ao recorte correspondente (navegação já existe).
- Elevar **escaneabilidade** das listas (densidade, ritmo, status, ordenação por coluna).
- Trocar **modal central → painel lateral (drawer)** na edição (mesma funcionalidade, mantém o
  contexto da lista) — flow mais "software diário".
- Consolidar **gráficos redundantes** numa leitura mais limpa e legível.
- Tornar **estados** (vazio/carregando/erro/sucesso) e **motion** uma linguagem única.
- Comunicar melhor o **fluxo de publicação** de Termos (rascunho vs publicado).

---

## Decisões de Product Design (experiência, sem mexer em função)
- **Dashboard → "Painel de decisão":** topo com KPIs (clicáveis → recorte na lista); em seguida o
  **funil de etapas** (a leitura mais clara, mantida) ao lado de um bloco **"Precisam de atenção"**
  — uma leitura derivada dos mesmos dados (não iniciaram / em andamento parado / falta assinar),
  cada item com atalho para o cadastro. Detalhes secundários (retenção, médias) recuam para baixo,
  agrupados e mais quietos. **Nada de dado novo — só priorização e arranjo.**
- **Reduzir redundância:** unificar a comunicação de "progresso" (hoje em 3 gráficos) numa
  hierarquia: funil (visão) → atenção (ação) → médias (contexto).
- **Colaboradores:** edição em **drawer lateral** (mesmos campos/ações), com a lista visível atrás.
- **Termos:** estado explícito **Rascunho / Publicado** e a ação primária guiando o fluxo.

## Decisões de UX
- **Ordenação por coluna** nas tabelas (interação sobre dados existentes) + status mais
  destacado para escanear em segundos.
- **Drill-down por clique** (KPI/segmento → lista filtrada por aquele recorte; filtro é leitura,
  não novo dado).
- **Drawer** preserva contexto (menos "perda de lugar"); **bottom-sheet** no mobile.
- **Foco e teclado** consistentes em toda interação (navegável sem mouse).
- **Estados** padronizados (skeleton premium, vazio autoral, erro com retry, sucesso com toast +
  undo onde já existe).

## Decisões de Motion (motion como ferramenta, não decoração)
- **Transição de página** confiável (corrigida) — fade-in keyed sutil.
- **Entrada elegante** de listas/cards/gráficos com stagger curto; **count-up** nos números (feito).
- **Hover inteligente** (lift sutil), **foco** visível, **expansão suave** (drawer, linhas).
- **Feedback de estado**: salvar → toast; reordenar → transição suave; toggle → transição.
- **Skeleton shimmer** premium (feito). Tudo desligado sob `prefers-reduced-motion`.
- Nunca "apresentação": durações 120–280ms, easing calmo, 1 movimento por ação.

## Decisões de Interface
- **Hierarquia tipográfica** mais forte nos dados (números tabulares maiores onde decidem;
  rótulos quietos). Mais **espaço em branco**, menos elementos competindo por atenção.
- **Densidade calibrada** (Linear-like) nas listas; cards só onde agregam.
- Paleta mantida: **1 laranja de ação por tela**, marrom só detalhe, neutros elegantes, flat.

## Decisões de Arquitetura da Informação
- **Dashboard:** Decisão → Visão → Contexto (em vez de "todos os gráficos juntos").
- **Listas:** identidade (quem) → estado (progresso/status) → ação (link/editar), nessa ordem de leitura.
- **Termos/Editor:** separar claramente "o que está no ar" de "o que estou editando".

---

## Impacto esperado — para o usuário
- Abre o painel e **entende em segundos o que fazer** (não só "como estão os números").
- Menos esforço cognitivo: hierarquia forte, redundância removida, leitura guiada.
- Sensação de **software premium, confiável e fluido** — usado com prazer no dia a dia.

## Impacto esperado — para produtividade
- **Menos cliques** para agir (KPI/atenção → cadastro; edição em drawer sem perder a lista).
- **Escaneabilidade** (ordenar/destacar status) acelera encontrar quem precisa de ação.
- **Feedback claro** (estados/motion) reduz incerteza e retrabalho.

---

## Escopo e ordem de execução (após aprovação)
Tela a tela, com Gates (Design/UX/Motion/A11y/Build) e commits pequenos:
1. **Linguagem de base** — motion tokens + estados consistentes (reaproveita primitivos atuais).
2. **Dashboard → Painel de decisão** (a maior alavanca).
3. **Colaboradores** — escaneabilidade + drawer de edição.
4. **Gerentes / Módulos** — hierarquia, estado, atalhos.
5. **Termos / Editor** — clareza de publicação e edição.

## Validação final (antes de "concluído")
Build · performance · acessibilidade · responsividade · consistência visual · motion · Design
System — e o teste honesto: *"eu entregaria isto para Apple/Stripe/Linear/Notion?"* Se não,
continuo refinando. Ao fim, **relatório do que foi evoluído**.

> ⚠️ **Nada será implementado até sua aprovação deste plano.** Tudo aqui é evolução de
> **experiência** — nenhuma funcionalidade, permissão, integração, dado ou regra é alterada.
