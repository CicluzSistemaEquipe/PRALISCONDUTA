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

*Implementado em 6 commits pequenos na branch `feature/colaborador-login-social`.
Sem merge na main, sem deploy, sem Supabase — aguardando sua decisão.*
