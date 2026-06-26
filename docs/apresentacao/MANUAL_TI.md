# Manual Técnico (resumido) · Sistema Pralís
### Para TI / desenvolvedores

> Resumo objetivo para quem vai **manter, ligar o backend e colocar no ar**.
> Detalhes profundos: `docs/PHASE2_SUPABASE_DISCOVERY.md`,
> `docs/PHASE2_SNAPSHOT_AND_ROLLBACK.md`, `docs/TRAINING_PLATFORM_ARCHITECTURE.md`.

---

## 1. Stack

| Camada | Tecnologia |
|---|---|
| UI | React 18 + Vite 5 + TypeScript (strict) |
| Estilo | Tailwind CSS 3 + Framer Motion 11 |
| Rotas | React Router 6 |
| PWA | `vite-plugin-pwa` (service worker ativo) |
| Dados (hoje) | `localStorage` |
| Dados (planejado) | Supabase (Postgres + Storage), **opcional/gated** |

**Comandos:**
```bash
npm install
npm run dev       # desenvolvimento
npm run build     # produção (tsc -b + vite build)
npm run preview   # serve o build
```

---

## 2. Princípio central: `hasSupabase` (gate)

O cliente Supabase só é instanciado se existirem as variáveis:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

- **Sem elas:** `hasSupabase = false` → o app roda **100% em localStorage**
  (modo local/demo). Todo o código de nuvem é **no-op**.
- **Com elas:** o app passa a hidratar/escrever na nuvem — **sem reescrever** a UI.

> Isso é progressive enhancement: a nuvem é aditiva, nunca obrigatória.
> Nada quebra ao ligar ou desligar.

---

## 3. Contrato congelado: `Module` / `Story`

A experiência do colaborador é construída sobre o contrato `Module`/`Story`
(`src/lib/types.ts`). **Ele não muda entre fases.** Regras invioláveis:

- Lógica de **desbloqueio** (`prevDone`), **progresso**, **conclusão** e
  **assinatura** são estáveis.
- `prepareStories()` roda em runtime (injeta vídeo-antes-do-quiz, defaults).
- Novas features (Avisos, push, analytics) são **aditivas e desacopladas**.

---

## 4. Estratégia de dados na nuvem (JSONB)

- Tabela **`training_modules`**: uma linha = um `Module`, com o objeto completo
  em uma coluna `content jsonb` (inclui `stories[]`). Preserva o contrato exatamente.
- **Cache offline-first:** o app lê de `localStorage['pralis:content-cache']`,
  hidratado do Supabase no boot. A leitura em `content.ts` continua **síncrona**.
- Edições do admin fazem **upsert** + atualizam o cache.

**Costuras estáveis** (pontos únicos de integração que evoluem local → nuvem):
- `enviarNotificacao()` — notificações (hoje localStorage; futuro: Supabase + Web Push)
- `registrarEvento()` — tracking (hoje localStorage; futuro: Supabase + dashboards)

---

## 5. Migrations (já escritas, idempotentes)

Em `supabase/migrations/`:

| Arquivo | Conteúdo |
|---|---|
| `0001–0003` | Base existente (employees, signatures, etc.) |
| `0004_content` | `training_modules` (JSONB), `lis_lines`, `poll_answers` |
| `0005_schema_drift` | Alinha colunas de `employees`/`signatures` ao código |
| `0006_storage` | Buckets (video/audio/image/poster/lis públicos; attachment privado) + leitura pública |
| `0007` (a fazer) | **Hardening:** RLS + policies de escrita/upload |

**Aplicar:** `supabase db push` (CLI) **ou** colar os `.sql` no SQL Editor, na ordem
`0004 → 0005 → 0006`.

> ⚠️ Enquanto não houver `0007`, o projeto Supabase deve ficar **fora de dados reais**
> (sem RLS ainda). Ver rollback em `PHASE2_SNAPSHOT_AND_ROLLBACK.md`.

---

## 6. Tabelas planejadas

| Tabela | Guarda |
|---|---|
| `training_modules` | Módulos (conteúdo JSONB) |
| `employees` | Colaboradores |
| `signatures` | Assinaturas (data, versão, hash, identificação) |
| `lis_lines` | Falas/áudio da Lis + cues |
| `poll_answers` | Respostas de enquete |
| `push_subscriptions` | Inscrições Web Push (futuro) |

---

## 7. Segurança / produção (antes de dados reais)

- **RLS** em todas as tabelas (migration `0007`).
- **Policies de Storage** — quem faz upload/leitura de mídia.
- **Supabase Auth** — substitui o admin auth atual (hoje: sessão local).
- **LGPD** — minimizar dado coletado; GPS no tracking é **opcional, best-effort e
  consentido**; definir retenção de eventos.
- Segredos **nunca** no client além da `ANON_KEY` (pública por design + RLS).

---

## 8. Deploy

1. **Build estático:** `npm run build` → pasta `dist/`.
2. **Hospedar** em Vercel/Netlify (SPA + PWA). Configurar fallback de rotas para `index.html`.
3. **Variáveis de ambiente** (`VITE_SUPABASE_*`) no painel do host.
4. **PWA:** o service worker já é gerado; validar instalação no celular.
5. **Android/iOS:** o mesmo PWA cobre as plataformas (instalável). App nativo é opcional/futuro.

---

## 9. Checklist técnico para ir ao ar

- [ ] Criar projeto Supabase (DB + Storage)
- [ ] Aplicar migrations `0004 → 0005 → 0006`
- [ ] Escrever e aplicar `0007` (RLS + policies + Auth)
- [ ] Definir `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` no deploy
- [ ] Semear o conteúdo atual (`seedModulesToSupabase`) uma vez
- [ ] Validar leitura de módulos da nuvem + fallback local sem env vars
- [ ] `tsc -b` + `vite build` verdes nos dois modos
- [ ] Deploy Vercel/Netlify + teste de PWA no celular
- [ ] Validar Home/treinamento sem regressão (contrato `Module`/`Story`)

---

*Resumo técnico — versão inicial. Para o roadmap completo, ver `ROADMAP.md`.*
