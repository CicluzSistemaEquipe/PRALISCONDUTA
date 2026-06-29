# FEATURE — Login do Colaborador + Social / Comunicados

> Branch: `feature/colaborador-login-social` (base `main`).
> **Modo:** localStorage (Opção A) · **Supabase OFF** · **sem migrations** · **sem
> deploy** · **sem mexer no visual geral/admin existente**. Tudo aditivo e gated.

---

## 1. O que foi criado

**Feature 1 — Login do colaborador (alternativo ao link):**
- Tela `/entrar` (nome + CPF + loja) + botão **"Já sou colaborador"** na tela de
  login sem token.
- Recupera o colaborador já cadastrado e o seu **progresso salvo**.

**Feature 2 — Social / Comunicados / Notificações:**
- App do colaborador: aba **Social** (3ª aba) + **feed** + **badge de novidade**.
- Admin: página **Social** (`/admin/social`) para criar/gerenciar comunicados
  (Dono + Gerentes).

---

## 2. Como funciona

### 2.1 Login do colaborador
- O colaborador abre o app **sem link** → tela de login → **"Já sou colaborador"** →
  `/entrar`.
- Informa **nome + CPF** (obrigatórios) e **loja** (opcional).
- `findEmployeeByCredentials` busca o cadastro: **CPF** (armazenado em `phone`,
  só dígitos) **+ nome**; a **loja** confere **apenas se o cadastro tiver loja**
  (não bloqueia quem não tem loja salva).
- Achou → entra no treinamento e **recupera o progresso** (`resumeByToken`).
- Não achou → **"Cadastro não encontrado. Fale com seu gerente."**
- **Privacidade:** CPF é só entrada, **nunca exibido** em tela pública nem logado.
- **`/admin` continua isolado**; este login **não** acessa admin. O **link/token
  antigo continua funcionando** igual.

### 2.2 Social — admin
- `/admin/social` (Dono + Gerentes). Campos: **título, mensagem, tipo** (aviso,
  gratidão, aniversariante, importante, treinamento, geral), **público** (todos /
  loja / cargo / colaborador), **fixar**, **status** (rascunho/publicado/arquivado).
- Ações: **editar, publicar, arquivar, excluir, fixar/desafixar**.
- Reusa os componentes oficiais do admin (`AdminPageHeader`, `ModalShell`,
  `EmptyState`) — **visual admin inalterado**; só **+1 item de sidebar** ("Comunicação").

### 2.3 Social — colaborador
- Aba **Social** no menu inferior (com **badge** quando há comunicados não lidos).
- `/social`: feed dos posts **publicados** que atingem aquele colaborador
  (audiência), **fixados primeiro**, com tipo, título, mensagem, autor e data.
- **Marcar como lido:** ao abrir o feed os comunicados são marcados como lidos
  (o badge zera); itens que estavam novos mostram a tag **NOVO** na sessão.

---

## 3. Arquivos

**Novos**
- `src/lib/normalize.ts` — `normalizeCPF`, `isValidCPF`, `normalizeName`, `normalizeStore`.
- `src/lib/social.ts` — domínio Social (posts/leituras, reativo, gated).
- `src/app/pages/EntrarColaborador.tsx` — tela de login por dados.
- `src/app/pages/Social.tsx` — feed do colaborador.
- `src/app/components/SocialPostCard.tsx` — card de post.
- `src/admin/pages/AdminSocial.tsx` — gestão de comunicados.
- `FEATURE-COLABORADOR-LOGIN-SOCIAL.md` (este), `docs/SOCIAL_SUPABASE_PROPOSAL.md`.

**Alterados (aditivos)**
- `src/lib/storage.ts` — `findEmployeeByCredentials()`.
- `src/lib/types.ts` — tipos do Social.
- `src/App.tsx` — rotas `/entrar`, `/social`, `/admin/social`.
- `src/app/pages/Login.tsx` — botão "Já sou colaborador".
- `src/app/components/BottomNav.tsx` — aba Social + badge.
- `src/admin/components/AdminSidebar.tsx` — grupo "Comunicação → Social".

---

## 4. Como testar (localhost)

```bash
npm run dev   # ou: npm run build && npm run preview
```

**Login do colaborador**
1. Admin (`/admin/login`, dono@pralis.com.br / sua senha) → **Colaboradores → Novo**:
   cadastre alguém com **nome, CPF e loja**.
2. Abra o app sem link (`/login`) → **"Já sou colaborador"** → preencha **nome + CPF
   (+ loja)** → entra no treinamento (recupera progresso).
3. Dados errados → mensagem "Cadastro não encontrado…".
4. O **link antigo** (`/acesso?id=…` ou `/login?t=…`) continua funcionando.

**Social**
1. Admin → **Social → Novo comunicado** → título/mensagem/tipo/público → **Publicar**.
2. No app do colaborador, a aba **Social** mostra um **badge**; abra para ver o feed.
3. Ao abrir, o badge **zera** (marcado como lido).

---

## 5. Validação (Fase 3) — 12/12 PASS · 0 erros de console

| Item | Status |
|---|---|
| `npx tsc -b` | 🟢 |
| `npm run build` | 🟢 (PWA precache 1,72MB) |
| Login por link antigo | 🟢 |
| Login do colaborador (nome/CPF/loja) | 🟢 |
| Login inválido → mensagem clara | 🟢 |
| Admin Dono / Admin Gerente (+ acesso Social) | 🟢 / 🟢 |
| Cadastro de colaborador | 🟢 |
| Criação de post social (admin) | 🟢 |
| Sino/badge de notificação | 🟢 |
| Visualização do feed social | 🟢 |
| Marcar como lido (badge limpa) | 🟢 |
| Responsividade mobile (overflow 0px) | 🟢 |
| Console sem erros | 🟢 |

Evidências: `test-results/fase3-social/*.png` (locais/gitignored).

---

## 6. Limitações atuais (assumidas)
- **localStorage por dispositivo:** posts/leituras/colaboradores não são
  compartilhados entre aparelhos até o Supabase entrar (Opção B).
- **Audiência por loja/cargo** depende de `store`/`role` consistentes no cadastro.
- **Permissão de postar:** Dono + **todos** os Gerentes (refino por loja/equipe fica
  para depois, conforme combinado).
- **Marcar como lido** acontece **ao abrir** o feed (não há "lido" por post individual
  ainda).
- **Indicador de novidade** = **badge na aba Social** (o colaborador não tinha sino; o
  sino do admin existe mas segue com popover vazio — fora do escopo agora).
- **Login:** a **loja não bloqueia** quando o cadastro não tem loja (decisão de produto).

---

## 7. Preparação para Supabase (sem aplicar nada)
- `social.ts` e `findEmployeeByCredentials` já têm o **caminho gated** (`hasSupabase`)
  — dormente sem env vars.
- Proposta de tabelas em **`docs/SOCIAL_SUPABASE_PROPOSAL.md`**: `social_posts`,
  `social_post_reads`, `notification_events` + targeting de audiência. **Nenhuma
  migration criada/aplicada.**

## 8. Preparação para push notification (sem implementar)
- Modelo `notification_events` proposto como fonte do push (futuro).
- A costura `enviarNotificacao()` já existe; o **badge/indicador** está pronto para
  refletir novidades. **Push real não foi implementado.**

## 9. Riscos
- `BottomNav` com 3 abas (mudança leve de menu; mobile ok, sem overflow).
- CPF tratado só como dígitos, não exibido — matching local; com Supabase, mover a
  busca para **RPC** (ver proposta de segurança RLS).
- Concorrência multi-admin (último a salvar vence) — refinar com Supabase.

## 10. Próximos passos sugeridos
1. Refinar **permissões** de postagem por loja/equipe.
2. **Marcar como lido por post** + (opcional) sino no header do Feed.
3. Ligar **Supabase** (Opção B) + aplicar a proposta de tabelas + **push**.

---

---

# Evolução v2 — Social moderno + UX (mesma branch)

> 11 blocos adicionais, em commits pequenos, **sem push/merge/deploy/Supabase**.
> Uma queda de conexão interrompeu o último bloco; ver "Recuperação" abaixo.

## Mudanças feitas (por bloco)
1. **Bug de digitação corrigido** — `ModalShell` (admin) roubava o foco a cada
   tecla (efeito dependia de `onClose`, recriado a cada render). Agora foca **só na
   montagem** + ESC em efeito separado. Conserta todos os modais do admin.
2. **Modelo + presets** — `SocialPost` ganhou `image`, `cardColor`, `textColor`,
   `created_by_role`; novo tipo **Motivação**. `socialPresets.ts` com presets seguros
   por tipo e **validação de contraste (WCAG)**.
3. **Upload de imagem + personalização** — `lib/image.ts` (valida JPG/PNG/WebP,
   redimensiona ≤1280px e comprime ~700KB → data URL). No admin: cor do card (preset
   ou cor segura, **texto auto-legível**) + imagem (upload, preview, remover).
4. **Feed moderno** — `SocialPostCard` estilo rede social: avatar do autor, nome,
   cargo/perfil, **data e hora**, chip de tipo, título, mensagem, **imagem
   `object-contain`** (sem cortar/distorcer, fundo neutro), tag **NOVO** e botão
   **"Li e estou ciente"**.
5. **Confirmação + relatório** — engajamento global (visualizações + confirmações,
   idempotente). No admin, por post: contadores + **quem visualizou e quem confirmou**
   com data/hora.
6. **Badge tipo e-mail + Atualizar** — aba Social mostra nº de não lidos; botão
   **"Atualizar feed"**; tag NOVO destaca o que é novo.
7. **"Início" → "Treinamento"** — ícone de formatura + **pulso 1x ao ativar** (sem
   loop), respeitando `prefers-reduced-motion`.
8. **Mostrar senha** — olho (mostrar/ocultar) no AdminLogin, acessível.
9. **Avatar do Dono/Gerente** — `AdminUser.avatarUrl` + upload na sidebar; aparece na
   sidebar, no **autor dos posts** (feed) e na **lista de posts** (admin); fallback de
   iniciais.
10. **Permissões do Social** — Dono gerencia tudo; Gerente cria e só edita/arquiva/
    exclui **os próprios**; vê os dos outros como **"somente leitura"**.
11. **Mensagens Gerente → Admin** — `lib/inbox.ts` + página **/admin/mensagens**:
    Gerente compõe e vê enviadas (Enviado/Lido); Dono recebe (caixa de entrada),
    marca como lida e arquiva; **badge de não lidas** no item "Mensagens" da sidebar.

## Como testar (resumo)
Admin → **Social**: criar comunicado (digitação ok), escolher tipo/cor, **anexar
imagem**, publicar. App → aba **Social**: ver o feed, **"Li e estou ciente"** (badge
some). Admin → **Leituras** no post: ver quem confirmou. Entrar como **Gerente**:
posts de outros = "somente leitura"; **/admin/mensagens** envia ao Dono. Voltar como
**Dono**: caixa de entrada + badge. Perfil: trocar **foto** na sidebar.

## Validação (Fase 3)
`tsc -b` ✅ · `npm run build` ✅ (PWA precache ~1,77MB) · **E2E 16 itens funcionando,
0 erros de console** (1 falha do *script* foi falso negativo por acento, recurso
confirmado por print + relatório).

## Limites do localStorage
- Imagens viram **base64** → consomem quota (~5MB). Mitigado com downscale + teto
  ~700KB/imagem; ainda assim, **muitas imagens podem encher** (documentado).
- Engajamento, mensagens, avatares e posts são **por dispositivo** (não compartilhados
  entre aparelhos até o Supabase).

## Preparação para Supabase Storage
- Imagens de post e **avatares** devem ir para **Storage/CDN** (hoje data URL).
  Ver `docs/SOCIAL_SUPABASE_PROPOSAL.md` (tabelas + engajamento + mensagens).

## Preparação para push notification
- O badge/indicador e o registro de engajamento já existem; `notification_events`
  (proposto) vira a fonte do push. **Sem push real agora.**

## Riscos restantes
- Quota do localStorage com imagens (acima).
- Resolução de avatar do autor lê `pralis:admin-users` no app do colaborador
  (mesmo dispositivo) — em produção virá do backend.
- Concorrência multi-admin (último a salvar vence).

## Próximos passos
- Ligar Supabase (Opção B): mover imagens/avatares p/ Storage; tabelas de social +
  engajamento + mensagens; RLS por RPC.
- Refino de permissões por loja/equipe; push real.

## Recuperação da queda de conexão
- **Já estava pronto/commitado:** blocos **1–10** (10 commits).
- **Retomado:** o bloco **11** estava parcial e **não commitado** — `types.AdminMessage`,
  `lib/inbox.ts` e `AdminInbox.tsx` já existiam e **íntegros**; faltava só a integração
  (item na sidebar + badge + rota). `tsc -b` estava **verde** no estado pós-queda
  (sem corrupção).
- **Implementado agora:** integração do bloco 11 (sidebar/badge/rota) → commit
  `feat(admin): mensagens privadas Gerente -> Admin`.
- **Correções por causa da queda:** **nenhuma** — nada precisou ser corrigido;
  apenas continuei do último ponto consistente, sem duplicar nem recriar arquivos.

---

*Implementado em commits pequenos na branch `feature/colaborador-login-social`.
Sem merge na main, sem deploy, sem Supabase — aguardando sua decisão.*
