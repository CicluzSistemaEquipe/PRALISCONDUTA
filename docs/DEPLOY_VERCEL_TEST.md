# Deploy de Teste — Vercel (Opção A, sem Supabase)

> **Objetivo:** subir o Pralís Conduta na Vercel rodando **igual ao localhost**
> (100% localStorage), **sem** Supabase. Ambiente de **teste**.
> **Status:** preparação concluída no código. O deploy em si **aguarda aprovação**
> (Fase 8). Este guia descreve exatamente o que fazer.

---

## 0. O que "Opção A" significa
- **Sem backend.** Sem `VITE_SUPABASE_*` → o app usa `localStorage` (igual ao localhost).
- **Dados por navegador:** cada dispositivo tem os seus dados (não compartilhados).
  É o esperado para um teste de UI/fluxo. Para dados compartilhados, é a Opção B (Supabase).
- **Zero risco de RLS/banco** nesta fase (não há banco).

---

## 1. Pré-requisitos (já prontos no repo)
| Item | Estado |
|---|---|
| `vercel.json` (framework vite, build, output, **rewrite SPA**) | ✅ |
| `netlify.toml` + `public/_redirects` (alternativa Netlify) | ✅ |
| `.gitignore` (ignora `node_modules`, `dist`, `.env*`, mídia bruta) | ✅ |
| PWA (`vite-plugin-pwa`, service worker) | ✅ |
| GitHub remote: `github.com/CicluzSistemaEquipe/PRALISCONDUTA` | ✅ existe |
| Branch de preparação: `deploy/prep-supabase-vercel` | ✅ criada |

> **Build command:** `npm run build` · **Output:** `dist` (definidos no `vercel.json`).

---

## 2. Variáveis de ambiente na Vercel
Em **Project → Settings → Environment Variables**:

| Variável | Valor | Obrigatória? |
|---|---|---|
| `VITE_ADMIN_PASSWORD` | a senha de admin do teste | **SIM** (sem ela o login admin não funciona em prod) |
| `VITE_ADMIN_LEGACY_PASSWORD` | (opcional) senha única "dono" | Não |
| `VITE_DASH_PASSWORD` | (opcional) senha de dashboard | Não |
| `VITE_SUPABASE_URL` | **deixar em branco / não criar** | Não (Opção A) |
| `VITE_SUPABASE_ANON_KEY` | **deixar em branco / não criar** | Não (Opção A) |

> ⚠️ Sem `VITE_SUPABASE_*`, o app cai automaticamente no modo localStorage. Não
> precisa de mais nada.

---

## 3. Passo a passo do deploy (quando aprovado)
1. **Push da branch** (Fase 8 — requer sua aprovação):
   `git push -u origin deploy/prep-supabase-vercel`
2. Na Vercel: **Add New → Project → Import** o repo `PRALISCONDUTA`.
3. **Framework Preset:** Vite (auto-detectado; o `vercel.json` já define tudo).
4. **Branch de deploy:** `deploy/prep-supabase-vercel` (Preview) — não usar `main` ainda.
5. **Environment Variables:** adicionar `VITE_ADMIN_PASSWORD` (item 2).
6. **Deploy.** A Vercel roda `npm run build` e publica `dist/`.
7. Abrir a URL de Preview gerada.

> Pode-se também fazer só **Preview deploy** da branch sem promover a produção.

---

## 4. Notas técnicas
- **SPA reload:** o `rewrite /(.*) → /index.html` garante que recarregar
  `/admin/login`, `/admin/dashboard`, `/feed`, `/modulo/...` funcione.
- **PWA:** o service worker exige HTTPS (a Vercel fornece). `autoUpdate` atualiza
  sozinho. O precache cobre `js/css/html/woff2/svg/png` — **vídeos não são
  precacheados** (corretamente).
- **Tamanho do `dist` (~165MB):** inclui os vídeos `.webm/.mp4` da whitelist. Funciona
  no teste, mas para **produção** a recomendação é mover vídeos pesados para Supabase
  Storage/CDN (ver Fase 6 do plano). **Não fazer agora.**
- **Mídia bruta (5GB em `public/`):** está no `.gitignore` → **não** vai para o GitHub
  nem para a Vercel. Só a whitelist de vídeos leves é versionada/servida.

---

## 5. O que testar online (resumo — detalhe na Fase 5)
- App abre igual ao localhost; sem erros no console.
- Login admin (com `VITE_ADMIN_PASSWORD`); Dono e Gerente.
- Cadastro de colaborador; geração de link/código `/acesso?mat=...`.
- Criação/edição de módulo; preview real; rascunho→publicar.
- Feed do colaborador; player (story); quiz; enquete; progresso; assinatura.
- Responsividade mobile; recarregar rotas profundas (SPA).
- Instalar como PWA no celular.

---

## 6. Limites conhecidos do teste (Opção A)
- Dados **não** compartilhados entre dispositivos (localStorage por navegador).
- Admin Auth é **demo client-side** (senha pública no bundle) — adequado a teste,
  **não** a produção. Migração para Supabase Auth fica para a etapa de produção.
- Enquetes (poll) e parte dos campos de colaborador/assinatura só persistem 100%
  quando o Supabase entrar (Opção B) + correção de drift — ver
  `RLS_SECURITY_PROPOSAL.md` e o relatório de prontidão.

---

*Preparado na Fase 2. Deploy aguarda aprovação (Fase 8). Não liga Supabase, não
aplica migrations, não altera RLS.*
