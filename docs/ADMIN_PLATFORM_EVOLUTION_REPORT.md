# Admin Platform Evolution — Relatório

> Sprint de evolução do **Dashboard Administrativo** rumo a um CMS Enterprise.
> Branch: `lab/admin-platform-evolution`.
> **Preservado integralmente:** app do colaborador, lógica de treinamento, regras de
> negócio, desbloqueios, módulos. Tudo local (localStorage), aditivo e retrocompatível.

**Gate:** `tsc -b` ✅ + `vite build` ✅. Validado visualmente (sidebar agrupado + visão 360°).

---

## Sumário

A área de **Pessoas** (Colaboradores/Gerentes) era o ponto onde a plataforma mais
"parecia um painel de configuração" do que uma ferramenta de gestão. Esta sprint
elevou justamente essa área a um padrão **enterprise**, com **navegação organizada por
domínio**, **cadastro documental completo** e uma **visão 360° interligada** do
colaborador. As frentes maiores de **autoria de conteúdo** (editor de módulos com
preview ao vivo, Lis visual, biblioteca de mídia) foram **escopadas como fases
seguintes** — várias dependem da Fase 1 de Supabase/Storage já documentada em
`docs/IMPLEMENTATION_PLAN.md` e `docs/DASHBOARD_CONTENT_FLOW.md`.

---

## Melhorias implementadas

### 1. Navegação organizada por domínio (IA)
O menu deixou de ser uma lista plana e passou a ser **agrupado por área**, com rótulos
de seção:

```
Dashboard
PESSOAS      → Colaboradores · Gerentes
CONTEÚDO     → Módulos · Termos
ANÁLISE      → Relatórios
```

- Vale para desktop (sidebar fixa) e mobile (drawer).
- Dono e Gerente têm grupos coerentes com suas permissões (gerente vê "Minha equipe").
- Reduz carga cognitiva e escala para novos itens futuros (Avisos, Mídia) sem virar
  uma lista interminável.

### 2. Cadastro de colaborador completo (gestão documental)
O formulário (novo + edição) ganhou campos que **agregam valor real** para RH/gestão,
todos **aditivos e opcionais**:

| Campo | Por quê |
|-------|---------|
| WhatsApp (máscara) | canal real de envio do link/avisos |
| E-mail (validado) | contato e futura identidade |
| Nascimento | RH / aniversários |
| Admissão | tempo de casa, relatórios |
| Loja/Unidade | segmentação por unidade |
| Situação (ativo/afastado/inativo) | filtrar quem está em atividade |

> **Decisão:** mantivemos o CPF no campo `phone` (compatível com o token/link atual) e
> adicionamos os demais como campos novos. O **app do colaborador ignora** esses campos
> — zero impacto no fluxo aprovado. *(Não adicionamos RG: redundante com CPF para o
> propósito atual; evita coletar PII desnecessária — princípio LGPD de minimização.)*

### 3. Visão 360° do colaborador (interligado)
Clicar em um colaborador agora abre um **painel completo** (antes ia direto para
edição). Tudo em um lugar, "tudo interligado":

- **Treinamento:** barra de progresso, % de conclusão, % de acerto no quiz, módulos
  pendentes, status.
- **Assinatura:** assinou? em que data?
- **Pendências:** "Em dia" (verde) vs. "X módulo(s) + assinatura" (âmbar) — leitura
  imediata do que falta.
- **Identificação:** CPF, WhatsApp, e-mail, nascimento, admissão, loja, **gerente
  responsável**, código de acesso.
- **Ações rápidas:** copiar link · WhatsApp · **Editar** (abre o formulário).

Tudo computado dos dados que já existem (`loadEmployeeRows` + sessão) — **sem novas
regras nem novas queries**.

---

## Telas alteradas

| Arquivo | Mudança |
|---------|---------|
| `src/admin/components/AdminSidebar.tsx` | Navegação agrupada por domínio + rótulos de seção |
| `src/admin/pages/AdminColaboradores.tsx` | Cadastro completo (novo/editar) + **visão 360°** + reanexação do clique (abre detalhe) |
| `src/lib/types.ts` | `Employee` ganhou campos opcionais + tipo `EmployeeStatus` |
| `src/lib/storage.ts` | `createEmployee`/`updateEmployee` persistem os campos novos (local) |

---

## Decisões de UX
- **Ver antes de editar:** clicar abre a **visão 360°** (consulta), e a edição é uma
  ação explícita dentro dela. Menos edições acidentais, mais contexto antes de agir.
- **Pendências com semântica de cor** (verde "em dia" / âmbar "faltam"): o gestor
  identifica em < 2s quem precisa de atenção, sem ler números.
- **Máscaras + validação** (CPF, telefone, e-mail) reduzem erro de digitação no cadastro.
- **Status como pílula** (ativo/afastado/inativo) com cores consistentes com os badges
  existentes — "feito pela mesma equipe".

## Decisões de Product Design
- **Cadastro só com o que agrega** (sem virar ERP): rejeitamos RG, endereço completo,
  foto (upload depende de Storage — Fase 1) por ora. Cada campo resolve um problema real.
- **Interligação como valor central:** a relação Colaborador ↔ Gerente ↔ Treinamento ↔
  Assinatura é o que diferencia "painel" de "plataforma de gestão".
- **Nada depende de código** para a gestão de pessoas — o objetivo do prompt — já vale
  para Colaboradores. Para *conteúdo*, ver "Melhorias futuras".

## Melhorias de arquitetura/organização
- `Employee` agora modela o cadastro real (campos opcionais), sem quebrar o contrato do
  app nem o token/link.
- Sidebar passou de `NavEntry[]` para `NavGroup[]` — estrutura que escala para novas
  áreas sem reescrever o componente.
- Visão 360° reusa `EmployeeRow` (camada `dashboard/data`) — **uma fonte de verdade** dos
  números, igual ao Dashboard/Relatórios.

---

## Melhorias futuras (roadmap — próximas sprints)

> Escopadas, com plano. Várias dependem da **Fase 1 (Supabase/Storage)** dos docs da
> plataforma. **Nada disso muda o app do colaborador.**

### A. Gerentes ↔ Equipe (drill-down) — ✅ **ENTREGUE** (ver Atualização abaixo)
Clicar no gerente → ver a equipe, status agregado, pendências por colaborador e ações
rápidas. Reusa a mesma visão 360° do colaborador. *(Ação em massa "reenviar a todos os
pendentes" fica como evolução futura.)*

### B. Relatórios profissional — *próxima, local*
Filtros combináveis (loja, gerente, cargo, status, período), busca, agrupamentos e
exportação CSV (já existe base em `AdminAcompanhamento`). Sem mudar a lógica de cálculo.

### C. Editor de Módulos + **Preview ao vivo** — *Fase 1/2*
Reorganizar o editor (Informações · Conteúdo · Lis · Mídia · Quiz · Enquete · Publicar)
e um **celular lateral** que renderiza o `StoryPlayer` real refletindo cada alteração
(texto, ordem, cores, quiz, enquete). É o maior salto de produtividade — detalhado em
`docs/DASHBOARD_CONTENT_FLOW.md`.

### D. Lis visual + Mídia (upload) — *Fase 1 (Storage)*
Cadastro visual da Lis (áudio + texto + sincronização/cues) e **biblioteca de mídia**
(upload drag&drop → Storage, grava URL na Story). Hoje a mídia é `/public` manual —
detalhado em `docs/MEDIA_ARCHITECTURE.md`. Requer Supabase Storage (fora desta etapa).

### E. Versionamento/publicação de módulos — *Fase 2*
Rascunho vs publicado, `version`/`published_at` (espelhando o precedente dos Termos).

---

## Oportunidades encontradas (registradas)
- **Foto do colaborador**: alto valor para reconhecimento visual, mas depende de upload
  (Storage). Deixado para a Fase 1.
- **CPF no campo `phone`**: funciona, mas semanticamente confuso e exposto pela RLS quando
  o Supabase ligar (ver `docs/NIGHTLY_QUALITY_REPORT.md`, segurança). Recomendado migrar
  para coluna `cpf` dedicada na Fase 1.
- **Modais sem ESC/focus-trap** (admin): melhoria de a11y já listada no Nightly Report.
- **Ações da tabela só no hover**: cobrir touch/tablet (também no Nightly Report).

---

## Nota geral da plataforma administrativa

### **7,5 / 10** (estado atual)

- **Pessoas (Colaboradores/Gerentes): ~9** — com a navegação organizada, o cadastro
  completo e a visão 360°, esta área agora **transmite organização, controle e
  produtividade** de verdade. É enterprise.
- **Análise (Relatórios/Dashboard): ~7** — sólida, mas falta a camada profissional de
  filtros/agrupamentos/export (roadmap B).
- **Conteúdo (Módulos/Lis/Mídia): ~6** — funciona e edita muita coisa, mas **ainda não
  cumpre "criar tudo pelo Dashboard sem código"**: falta upload de mídia, editor de Lis
  visual, enquete no editor e o **preview ao vivo**. É o maior caminho restante (roadmap
  C/D), e parte depende de Supabase/Storage.

**Veredito de CTO:** a evolução desta sprint entregou o **núcleo de gestão de pessoas**
no padrão pedido — uma plataforma, não um painel. Para fechar a visão "Enterprise CMS"
completa (criar/publicar todo o conteúdo sem tocar código, com preview fiel), o próximo
passo de maior impacto é o **roadmap C (editor de módulos + preview ao vivo)**, seguido
de **D (mídia/Lis via Storage)**. Recomendo encadear: **B (Relatórios) + A (Gerentes
drill-down)** ainda localmente, e então abrir a **Fase 1 de Supabase/Storage** para
destravar C/D. Com C/D entregues, a plataforma chega a **9**.

---

## Atualização — Roadmap A (Gerentes drill-down) ENTREGUE

Fechado o ciclo **Gerentes → Equipe → Colaboradores → Status de treinamento**, local e
retrocompatível (sem Supabase, sem tocar app/lógica do colaborador).

**Implementado (`src/admin/pages/AdminGerentes.tsx` + export reutilizado de
`AdminColaboradores.tsx`):**
- **Visão 360° do gerente** ao clicar: cabeçalho + **status geral da equipe** (total, em
  dia, pendentes, progresso médio) e quantos já assinaram o termo.
- **Equipe vinculada** listada com avatar, progresso (X/Y), status e **pendências por
  colaborador** (badge de status + filtro).
- **Filtros simples** dentro da equipe: Todos · Pendentes · Em dia · Assinaram.
- **Ações rápidas** por colaborador: copiar link · WhatsApp · **ver colaborador** (abre a
  mesma visão 360° do colaborador — uma fonte de verdade, "tudo interligado").
- **Coluna "Equipe"** na tabela de gerentes (em dia / N pendentes); linhas e cards
  clicáveis com affordance "Ver equipe".
- **Empty state** claro quando o gerente não tem equipe; **responsivo** (tabela no desktop,
  cards + bottom-sheet no mobile); design system preservado.

**Gate:** `tsc -b` ✅ + `vite build` ✅. Validado visualmente (lista + drill-down).

**Próximo:** **Relatórios Pro** (filtros combináveis por loja/gerente/cargo/status/período,
agrupamentos e exportação CSV) — roadmap B, também local.

### Nota da plataforma administrativa (revisada): **8,0 / 10**
A área de **Pessoas agora está completa e interligada** (Colaboradores 360° + Gerentes
360° + cadastro completo + navegação organizada) — sobe de ~9 e puxa a média. O caminho
restante para 9+ segue sendo **Conteúdo** (editor de módulos + preview ao vivo, mídia, Lis
visual) e **Relatórios Pro**.
