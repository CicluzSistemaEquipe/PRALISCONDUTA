# FUTURE_ROADMAP — Pralis Conduta

> **Natureza deste documento:** roadmap de produto. **Esta etapa entrega APENAS
> documentação e análise — nenhum código é alterado.** Tudo aqui descrito (Avisos,
> Push, Analytics) é **proposta futura**, faseada e retrocompatível.
> A experiência do colaborador **não muda** nesta etapa (contrato `Module`/`Story`
> preservado).

---

## 0. Princípio do roadmap

**Fortalecer a base, não reinventar.** Cada item só entra no roadmap se trouxer um
ganho real e nomeável em pelo menos um eixo:

- **Organização** — admin encontra/edita conteúdo e mensagens sem fricção.
- **Produtividade** — Rodrigo (dono) e gerentes fazem mais com menos passos.
- **Escalabilidade** — suporta centenas de treinamentos e crescimento da equipe.
- **Experiência do admin** — o admin é o stakeholder que mais mexe no sistema.
- **Manutenção** — menos código frágil, costuras estáveis, sem grande refactor.

**O que este roadmap recusa:** transformar o app do colaborador em rede social;
empilhar features "porque é legal"; refatoração grande sem ganho; coletar dado
"por via das dúvidas". Cada fase é **retrocompatível** e mantém a experiência do
colaborador intacta.

---

## 1. Área "Avisos" (proposta futura — D8)

### 1.1 Objetivo
Dar ao Rodrigo um canal **simples e direto** para comunicar a equipe: comunicados,
lembretes, mensagens rápidas, um vídeo curto dele, campanhas internas. É também a
**base de conteúdo para o push** no futuro.

### 1.2 O que É
- Comunicados e lembretes curtos.
- Mensagens rápidas do dono/gerente para a equipe.
- Vídeos curtos do Rodrigo (mídia opcional).
- Campanhas internas pontuais.
- Fonte de conteúdo para notificações push (fase posterior).

### 1.3 O que NÃO É (limites rígidos)
- **Não** é rede social — sem feed infinito, sem curtidas, sem comentários, sem chat.
- **Não** substitui nem compete com o treinamento — é desacoplado do fluxo de módulos.
- **Não** compete com o trabalho do colaborador — superfície read-only, leve, sem loop
  de engajamento.
- **Não** tem moderação, threads ou interação social de qualquer tipo.

### 1.4 Modelo de dados (proposto)

Tabela `announcements`:

| Campo          | Tipo                              | Notas                                   |
|----------------|-----------------------------------|-----------------------------------------|
| `id`           | uuid (PK)                         |                                         |
| `title`        | text                              | obrigatório                             |
| `body`         | text                              | texto curto do comunicado               |
| `media_url`    | text · nullable                   | vídeo/imagem opcional (Storage)         |
| `audience`     | `'all' \| role \| employee`       | ver §1.6                                |
| `priority`     | text/int                          | ex.: normal / alta — ordena exibição    |
| `published_at` | timestamptz                       | quando passa a aparecer                 |
| `expires_at`   | timestamptz · nullable            | some após esta data (ver §1.7)          |
| `created_by`   | uuid/text                         | admin que criou (Rodrigo/gerente)       |

> Mínimo proposital: sem tabela de leitura/recibo, sem reações. Se um dia for preciso
> "lido por", entra como item separado — não agora.

### 1.5 Telas

**Admin — CRUD simples** (1 página):
- Lista de avisos (título, audiência, status publicado/expirado, data).
- Botão "Novo aviso" → formulário enxuto.
- Editar / despublicar / excluir.

**Colaborador — superfície read-only:**
- Uma **aba/seção "Avisos"** OU acesso **via o sino** já existente no topo.
- Lista simples dos avisos vigentes para aquele colaborador (respeitando audiência e
  expiração). Sem ações além de ler/assistir.

### 1.6 Regras de audiência
- `all` — todos os colaboradores.
- `role` — apenas um papel (ex.: gerentes, ou um cargo específico).
- `employee` — um colaborador específico (mensagem direcionada).

A superfície do colaborador só exibe avisos cuja audiência o inclui.

### 1.7 Expiração
- `expires_at` nulo → aviso permanece até ser despublicado/excluído.
- `expires_at` no passado → aviso **deixa de aparecer** ao colaborador (some
  automaticamente), mas pode continuar visível no histórico do admin.

### 1.8 Mockup textual (simples)

```
ADMIN · Avisos
┌─────────────────────────────────────────────┐
│ Avisos                          [+ Novo aviso]│
├─────────────────────────────────────────────┤
│ • Reunião de segurança 6ª   all   publicado   │
│ • Vídeo do Rodrigo: boas-vindas  all  publ.   │
│ • Lembrete EPI               role:operação    │
└─────────────────────────────────────────────┘

COLABORADOR · Avisos (read-only, via aba ou sino)
┌─────────────────────────────────┐
│ Avisos                          │
├─────────────────────────────────┤
│ ▶ Vídeo do Rodrigo: boas-vindas │
│ • Reunião de segurança na 6ª    │
└─────────────────────────────────┘
```

> **Status:** proposta futura (fase P3). Não implementar nesta etapa.

---

## 2. Notificações / Push (arquitetura preparada — D9)

### 2.1 Onde estamos hoje (ground truth)
- `notifications.ts` → `enviarNotificacao(payload)` **persiste em localStorage**
  (`pralis:notifications`, últimas 200) + `console.log` em DEV.
- 3 tipos hoje: `assinatura_concluida`, `treinamento_concluido`, `colaborador_novo`.
  O payload **já carrega** `gerenteEmail` / `gerenteNome`.
- **Sem push real, sem e-mail, sem webhook.**
- O PWA (`vite-plugin-pwa`) **já tem service worker**.
- O sino no `AdminTopbar` existe, mas o popover está **vazio** ("Nenhuma notificação
  ainda").

### 2.2 Princípio: `enviarNotificacao()` é a costura estável
Não reescrever a integração espalhada pelo app. Hoje a função grava local; no futuro
**a mesma função** passa a também inserir no Supabase e disparar Web Push. Todos os
pontos que já chamam `enviarNotificacao()` ganham push **sem mudar quem chama**.

### 2.3 Fluxo proposto (diagrama)

```
Evento de negócio
(assinatura / treinamento concluído / novo colaborador /
 novo módulo / novo aviso / mensagem do Rodrigo / lembrete)
        │
        ▼
 enviarNotificacao(payload)   ← costura estável (já existe)
        │
        ├─► localStorage (hoje, mantido p/ retrocompat)
        │
        └─► [futuro] INSERT em Supabase (notifications)
                 │
                 └─► Edge Function / worker
                          │
                          ▼
                 Web Push p/ push_subscriptions
                          │
                          ▼
                 Service Worker (PWA já existe)
                          │
                          ▼
                 Notificação no dispositivo
```

### 2.4 Tabela `push_subscriptions` (proposta)

| Campo         | Tipo        | Notas                                  |
|---------------|-------------|----------------------------------------|
| `employee_id` | uuid/text   | a quem pertence a inscrição            |
| `endpoint`    | text        | endpoint Web Push do navegador         |
| `p256dh`      | text        | chave pública (Web Push)               |
| `auth`        | text        | segredo de auth (Web Push)             |
| `created_at`  | timestamptz |                                        |

> Mais a fazer no futuro: persistir `notifications` e `announcements` no Supabase para
> que sirvam de fonte do push.

### 2.5 Opt-in de permissão (PWA)
- Pedir permissão de notificação **no momento certo** (após login/engajamento, não de
  cara), respeitando o usuário.
- Ao conceder, registrar a inscrição em `push_subscriptions`.
- Ausência de permissão **nunca quebra** nada — push é aditivo.

### 2.6 Eventos → Push

| Evento                         | Hoje                         | Futuro (push)        |
|--------------------------------|------------------------------|----------------------|
| `assinatura_concluida`         | local + console              | push p/ gerente/dono |
| `treinamento_concluido`        | local + console              | push p/ gerente/dono |
| `colaborador_novo`             | local + console              | push p/ gerente/dono |
| Novo módulo/treinamento        | —                            | push p/ colaboradores|
| Novo aviso (D8)                | —                            | push conforme audiência |
| Mensagem do Rodrigo            | —                            | push direcionado     |
| Lembrete de pendência          | —                            | push p/ colaborador  |

> **Reforço:** nesta etapa **apenas preparar a arquitetura** (tabela + costura).
> Nada de Web Push implementado agora.

---

## 3. Analytics / Tracking (proposta futura — P4)

### 3.1 O que já é capturado (ground truth)
`tracking.ts` → `registrarEvento` grava em localStorage (`pralis:tracking:{id}`,
cap 500). **5 eventos:** `login`, `modulo_inicio`, `modulo_conclusao`,
`quiz_resposta`, `assinatura`. GPS é **opcional e best-effort** (negar não quebra o
evento). O próprio arquivo já aponta Fase 2 = Supabase/analytics.

### 3.2 Evolução proposta
- **Mesmo payload → Supabase:** `registrarEvento` passa a também inserir numa tabela
  de eventos (sem mudar quem chama, mesma lógica da costura de notificações).
- **Dashboards no admin** a partir desses eventos:
  - **Engajamento** — quem entrou, frequência de acesso.
  - **Conclusão** — % de módulos concluídos, funil início→conclusão.
  - **Ritmo** — tempo entre início e conclusão; gargalos por módulo.
  - **GPS opcional** — só onde fizer sentido e com consentimento; nunca obrigatório.

### 3.3 Privacidade / LGPD
- **Minimização:** só coletar o que alimenta uma decisão real do admin.
- **GPS** permanece **opcional, best-effort e consentido** — jamais bloquear o uso.
- Definir **retenção** (não guardar eventos para sempre) e finalidade clara.
- Dado pessoal/sensível (localização, identificação do colaborador) deve passar por
  consentimento + RLS no Supabase — a desenhar com `solution-architect` e
  `security-reviewer` quando a fase entrar.

---

## 4. Roadmap faseado (P1 → P4)

> **"Agora" nesta etapa = somente docs/análise.** As fases abaixo são o caminho
> **futuro**, cada uma retrocompatível e sem grande refactor.

| Fase | Objetivo | Entregáveis | Dependências | Risco | Fica de fora |
|------|----------|-------------|--------------|-------|--------------|
| **P1** | Conteúdo no Supabase | Conteúdo dos módulos → Supabase **JSONB**; mídia → **Storage**; **upload no admin** | Projeto Supabase ativo; bucket de Storage | Baixo–médio (migração de conteúdo) | Avisos, push, analytics, drag&drop completo |
| **P2** | Edição rica de módulos | Records + cues do "Lis"; **enquete (poll)**; **versionamento/publish**; **drag&drop** completo no editor | P1 (conteúdo no Supabase) | Médio (editor mais complexo) | Avisos, push, analytics |
| **P3** | Avisos + base de push | Área **Avisos** (CRUD admin + read-only colaborador, D8); `notifications`/`announcements` no Supabase; tabela **`push_subscriptions`** + opt-in (D9 — preparar Web Push) | P1; service worker (já existe) | Médio (nova superfície + permissões) | Web Push ligado em produção em escala; analytics |
| **P4** | Analytics | `tracking` → Supabase; **dashboards** de engajamento/conclusão/ritmo; GPS opcional c/ LGPD | P1; eventos já capturados hoje | Médio (privacidade/LGPD) | — |

**Regra transversal:** cada fase é **retrocompatível**, **sem grande refactor**, e a
**experiência do colaborador permanece intacta** (D1). localStorage continua como
fallback durante a transição.

---

## 5. Princípios de escala

**Preparar para centenas de treinamentos e para Android/iOS/PWA sem grandes
refatorações:**

- **Conteúdo orientado a dados** — módulos como dados (JSONB + Storage), não hard-coded;
  centenas de treinamentos viram registros, não código novo.
- **Costuras estáveis** — `enviarNotificacao()` e `registrarEvento()` são os únicos
  pontos de integração que evoluem (local → Supabase → push/analytics). Quem chama
  nunca muda.
- **PWA como base multiplataforma** — service worker já presente; o mesmo PWA cobre
  Android, iOS e web. Push entra sobre ele sem app nativo.
- **Retrocompatibilidade por fase** — localStorage como fallback; nenhuma fase força
  big-bang.
- **Contrato do colaborador congelado** — `Module`/`Story` preservados; novas features
  (Avisos, push) são **aditivas e desacopladas**, nunca reescrevem o fluxo de
  treinamento.
- **Privacidade desde o desenho** — minimizar dado coletado mantém o sistema leve,
  barato e conforme à medida que a base cresce.

---

### Handoff
- **`solution-architect`** — viabilidade/como de cada fase (modelagem Supabase, RLS,
  Edge Function de Web Push, Storage, ADRs).
- **`project-manager`** — sequenciar P1→P4 em tarefas.
- **`security-reviewer`** — consentimento, RLS e retenção quando P3 (push) e P4
  (analytics/GPS) entrarem.
