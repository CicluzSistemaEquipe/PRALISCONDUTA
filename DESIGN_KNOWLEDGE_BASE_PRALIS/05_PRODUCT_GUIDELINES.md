# 05 · Product Guidelines — Pralís

> Como **construir cada superfície** do produto. Filosofia de produto + padrões por
> tipo de tela. Complementa o doc 02 (filosofia) e o doc 06 (UX).

---

## 1. Filosofia de produto

- **Fortalecer a base, não reinventar.** Cada feature só entra se traz ganho
  nomeável em **organização, produtividade, escalabilidade, experiência ou
  manutenção**.
- **Retrocompatível por padrão.** O contrato `Module`/`Story` e as regras
  (desbloqueio `prevDone`, progresso, conclusão, assinatura) são **congelados**.
  Novas features são aditivas e desacopladas.
- **Orientado a dados.** Conteúdo é dado (módulos como JSONB + mídia em Storage), não
  código. Centenas de treinamentos = registros, não telas novas.
- **Costuras estáveis.** Pontos únicos de integração que evoluem sem mudar quem
  chama: `enviarNotificacao()` e `registrarEvento()`.
- **Privacidade desde o desenho.** Coletar só o que alimenta uma decisão real (LGPD).

**O produto recusa:** virar rede social; empilhar features "porque é legal";
refatoração grande sem ganho; coletar dado "por via das dúvidas".

---

## 2. Os dois públicos, os dois objetivos

| | 🌙 Colaborador | ☀️ Gestão (dono/gerente/RH) |
|---|---|---|
| **Objetivo de produto** | **Concluir** o treinamento (engajamento) | **Acompanhar e criar** sem fricção |
| **Métrica de sucesso** | Taxa de conclusão + assinatura | Tempo p/ publicar / encontrar pendência |
| **Princípio** | "Quero voltar amanhã" | "Faço mais com menos passos" |

---

## 3. Dashboard (admin)

**Objetivo:** dar o panorama em 5 segundos e o caminho para o detalhe.

- **Topo:** KPIs (colaboradores, conclusão, pendências, assinaturas) — número grande
  tabular + delta + sparkline. Count-up no 1º load.
- **Meio:** 1 gráfico-síntese (ex.: barra empilhada de progresso) — sóbrio, laranja.
- **Sempre:** estado "sem dados ainda" elegante; nada de "0%" quebrado.
- **Caminho ao detalhe:** clique leva ao drill-down (gerente → equipe → colaborador).
- **Não:** encher de widgets; mais de 4–5 KPIs; gráfico decorativo sem leitura.

## 4. CMS / gestão de pessoas (admin)

- **Tabela é herói** (estilo Linear/Notion): header sutil, linhas 48px, hover, ações
  no hover, status como pills, números tabulares. < 768px vira cards.
- **CRUD em modal** (`ModalShell`): foco preso, ESC fecha, 1 ação primária, validação
  com helper text. UI otimista + toast.
- **Busca + filtros** sempre acessíveis (por gerente, cargo, status, período).
- **Visão 360º do colaborador:** dados + progresso + pendências + assinatura num só
  lugar.
- **Hierarquia gerente → equipe → colaborador**: cada papel vê só o seu escopo.

## 5. Editor de conteúdo (admin)

- **Timeline única de blocos** (não abas confusas): texto, vídeo, quiz, enquete, fala
  da Lis — tudo arrastável.
- **Preview real ao lado:** o `ModulePreview` roda o `StoryPlayer` de verdade num
  frame de celular. "O que você vê é o que o colaborador recebe."
- **Rascunho → publicar:** `status: draft|published`. Draft é invisível ao
  colaborador. Publicar é uma ação deliberada.
- **Reordenação** da trilha (módulos) e dos blocos/perguntas/opções via drag&drop.
- **Não:** quebrar o contrato `Story`; permitir publicar com bloco inválido sem aviso.

## 6. Treinamentos / experiência do colaborador (app)

> Esta é a superfície onde **engajamento é requisito**, não enfeite (memória de
> engajamento, princípio V2.2).

- **Home = "Trilha Viva"** (`Feed`): herói "Continuar" (próximo módulo acionável) +
  Lis como guia contextual + `ModuleCard` com `highlight` no recomendado.
- **Responder em <3s:** onde parei · o que faço agora · quanto falta.
- **Progresso "vivo":** sensação de jornada, não de lista. Ring de progresso, barra de
  segmentos, celebração ao concluir.
- **Estado visual sem texto:** disponível / em andamento / concluído / bloqueado /
  recomendado — reconhecíveis pela cor+ícone.
- **Formato story:** uma ideia por tela, fullscreen, avanço por toque/seta.
- **Leveza obrigatória:** funciona em qualquer celular — **sem** `repeat: Infinity`,
  **sem** `backdrop-filter: blur`, respeitando `prefers-reduced-motion`.
- **Gamificar a experiência, nunca a regra.** Progresso e celebração são da
  experiência; desbloqueio/conclusão/assinatura são lógica congelada.

## 7. Onboarding (app)

- **Acolher primeiro.** A Lis recebe; o tom é de hospitalidade.
- **Mostrar o caminho:** o que é a trilha, quanto leva, qual o primeiro passo.
- **Pouca fricção:** acesso por link/matrícula; nada de formulário longo de cara.
- **Valores e cultura** entram cedo (`ValuesCard`), mas leves.

## 8. Relatórios (admin)

- **Pergunta primeiro:** cada relatório responde a uma pergunta de gestão (quem
  falta? quem assinou? qual módulo trava a equipe?).
- **Filtros + exportação** como cidadãos de primeira classe.
- **Drill-down** do agregado ao indivíduo. Datas relativas + absolutas no hover.
- **Privacidade:** GPS/eventos só com finalidade clara, consentimento e retenção
  definida (futuro analytics, P4).

## 9. Gamificação (com limites)

- ✅ **Pode:** progresso vivo, ring, barra de segmentos, badge de conclusão,
  celebração (confetti pontual), "falta pouco".
- ❌ **Não pode:** criar pontos/ranking que virem **regra de negócio**; pressão
  competitiva entre colegas; loops de engajamento manipulativos. Respeito é valor.

## 10. Experiências por papel (resumo)

| Papel | Foco da experiência | Telas-chave |
|---|---|---|
| **Colaborador** | Concluir com prazer; saber o próximo passo | Feed, Module/Story, Progress, Completion |
| **Gerente** | Ver a própria equipe e agir nas pendências | Dashboard (escopo), Relatórios, 360º |
| **Dono (Rodrigo)** | Criar conteúdo e ver tudo | Editor, Módulos, Dashboard, Relatórios |
| **RH / Admin** | Cadastrar pessoas e acompanhar | Colaboradores, Gerentes, Relatórios |
| **TI** | Ligar backend e publicar | (doc técnico — fora do escopo visual) |

---

## 11. Definição de "pronto" (produto)

Uma tela/feature está pronta quando:
1. Resolve a tarefa do público certo com **mínimo de passos**.
2. Tem os 3 estados (loading/empty/error) e feedback de ação.
3. Respeita o contrato congelado (app) ou os primitivos do DS (admin).
4. Passa nos gates de design, UX, motion, acessibilidade e performance (doc 11).
5. **Não tem cara de template/IA** e **parece Pralís**.

---

### Conexões
- Detalhes de UX e estados → `06_UX_GUIDELINES.md`
- Movimento das telas → `07_MOTION_GUIDELINES.md`
- Regras invioláveis → `10_DESIGN_RULES.md`
