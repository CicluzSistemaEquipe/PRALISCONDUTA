# ONLINE-READINESS-REPORT — Pralís Conduta

> Relatório consolidado de prontidão para **deploy de teste online** (Vercel,
> **Opção A: sem Supabase / localStorage**, igual ao localhost).
> Consolida Fases 1–6. **Nenhum deploy feito. Supabase não ligado. Nada corrigido
> sem aprovação.** Branch: `deploy/prep-supabase-vercel`.
>
> Data do diagnóstico: 2026-06-29 · Stack: React 18 + Vite 5 + TS + Tailwind + PWA.

---

## 1. Veredito

**🟢 PRONTO para deploy de TESTE (Opção A)** — com **1 ajuste recomendado** antes
(vídeo faltante) e **3 variáveis de ambiente** a configurar na Vercel.

- App funcional, responsivo, **0 erros de console**, build verde.
- Deploy leve na Vercel (**~14MB**, não os 165MB do dist local).
- **Não está pronto para produção real** (RLS aberta, auth demo, drift Supabase) —
  ver §8.

---

## 2. Diagnóstico final (estado atual)

| Área | Estado | Observação |
|---|---|---|
| Build (`tsc -b && vite build`) | 🟢 | exit 0 em ~15s |
| SPA rewrites (Vercel + Netlify + `_redirects`) | 🟢 | recarregar `/admin/...` funciona |
| PWA / service worker | 🟢 | `autoUpdate`; precache 1.72MB (sem vídeos) |
| Code splitting / lazy loading | 🟢 | `lazyWithRetry` por rota + vendor chunks |
| `.gitignore` | 🟢 | mídia bruta (5GB) e `.env*` fora do repo |
| Persistência (Opção A) | 🟢 | 100% localStorage, igual ao localhost |
| Mídia referenciada | 🟡 | **1 vídeo referenciado não versionado** (§6) |
| Admin Auth | 🟡 | demo client-side; exige `VITE_ADMIN_PASSWORD` |
| Supabase / RLS | 🔴 (só p/ produção) | RLS aberta + drift — **não usado na Opção A** |

---

## 3. Revisão funcional (Fase 5) — 15/16 · 0 erros de console

| Item | Status |
|---|---|
| Login admin Dono / Gerente | 🟢 / 🟢 |
| Admin Dono (vê tudo) | 🟢 |
| Admin Gerente (escopo equipe) | 🟡 login ok; restrição não validada a fundo |
| Cadastro de colaborador | 🟢 |
| Geração de link/código (ex.: `PN9CJR` + WhatsApp) | 🟢 |
| Criação/edição de módulo (+ preview real) | 🟢 |
| Feed / Player / Progresso / Assinatura | 🟢 |
| Quiz | ⚪ não validado **automaticamente** (atrás do vídeo) — sem bug observado |
| Responsividade mobile (overflow 0px) | 🟢 |
| Console sem erros | 🟢 |
| Build | 🟢 |

> Evidências: `test-results/fase5/*.png` (12 prints, locais/gitignored).
> **Nenhum bug funcional confirmado** no modo localStorage.

---

## 4. Performance & bundle (Fase 6)

- **JS:** 46 chunks, code-split por rota. Total ~1,3MB raw / **~290KB gzip**.
  Maiores (gz): `vendor-rive` 49KB · `vendor-react` 44KB · `vendor-motion` 37KB.
- **CSS:** 52KB raw / **11KB gzip**.
- **Carga inicial estimada (colaborador):** ~130–180KB gzip → **boa para mobile**.
- **PWA precache:** 64 entradas / 1,72MB (JS/CSS/fontes/svg/png). **Vídeos não são
  precacheados** (corretamente — carregam via rede sob demanda).

---

## 5. `dist` & `public/` — esclarecimento importante

| | Tamanho | Vai para a Vercel? |
|---|---|---|
| `public/` local (fontes brutas `.mov/.gif/.jpeg`) | **~5 GB** | ❌ gitignored |
| `dist/` local (plugin copia toda mídia local) | **165 MB** | ❌ é artefato local |
| **Mídia git-tracked (o que a Vercel realmente serve)** | **11,7 MB** | ✅ |
| **dist real na Vercel (mídia + JS/CSS/fontes)** | **≈ 14 MB** | ✅ leve |

> O `dist` local de 165MB engana: a Vercel clona o **GitHub** (sem a mídia bruta).
> O deploy real é **~14MB**.

---

## 6. ⚠️ Único ajuste recomendado antes do deploy (vídeo faltante)

`lis-conduta1.mp4` é referenciado em **`src/lib/content.ts:1157`**
(`videoSrc: '/lis-conduta1.mp4'`) mas **não está versionado** (o `.gitignore`
whitelista só `videocirculo-dashboard.mp4`). → Esse vídeo daria **404 na Vercel**.

**Opções (aguardando sua aprovação — não apliquei nada):**
1. **Versionar** o arquivo: adicionar `!public/lis-conduta1.mp4` à whitelist do
   `.gitignore` (5,2MB — aceitável). ✅ mais simples para o teste.
2. **Trocar a referência** para um vídeo já versionado.
3. **Mover para Storage/CDN** (estratégia de produção, §9).

> Demais 21 mídias referenciadas: **OK** (15 versionadas + 6 bundladas de `src/assets`).

---

## 7. Configuração Vercel

### 7.1 Checklist de deploy
- [ ] (Fase 8) `git push -u origin deploy/prep-supabase-vercel`
- [ ] Vercel → Import repo `CicluzSistemaEquipe/PRALISCONDUTA`
- [ ] Framework: **Vite** (auto; `vercel.json` já define build/output/rewrite)
- [ ] Branch de deploy: `deploy/prep-supabase-vercel` (**Preview**, não `main`)
- [ ] Configurar Environment Variables (§7.2)
- [ ] (Recomendado) resolver o vídeo faltante (§6)
- [ ] Deploy → abrir URL de Preview

### 7.2 Variáveis de ambiente
| Variável | Valor | Obrigatória? |
|---|---|---|
| `VITE_ADMIN_PASSWORD` | senha de admin do teste | **SIM** (senão login admin quebra em prod) |
| `VITE_ADMIN_LEGACY_PASSWORD` | senha única "dono" | Opcional |
| `VITE_DASH_PASSWORD` | senha de dashboard | Opcional |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | **não definir** | Não (Opção A) |

> Já configurado no repo: `vercel.json` (build `npm run build`, output `dist`,
> rewrite SPA), `netlify.toml`, `public/_redirects`.

---

## 8. Riscos restantes

| # | Risco | Severidade (teste / produção) | Mitigação |
|---|---|---|---|
| R1 | Vídeo `lis-conduta1.mp4` não versionado | 🟡 / 🟡 | §6 |
| R2 | Admin Auth demo (senha pública no bundle) | 🟢 / 🔴 | Supabase Auth (produção) |
| R3 | Escopo do Gerente não validado a fundo | 🟡 / 🟡 | teste dedicado dono×gerente |
| R4 | RLS aberta (`0002`) ao `anon` | — / 🔴 | `RLS_SECURITY_PROPOSAL.md` (RPC + `0007`) |
| R5 | Drift camelCase↔snake_case no `storage.ts` | — / 🟡 | adaptador antes de escrita Supabase |
| R6 | Quiz/assinatura ponta-a-ponta não testados | 🟡 / 🟡 | 1 passada manual em celular |

> R2/R4/R5 **não afetam a Opção A** (não há Supabase). São de produção.

---

## 9. O que testar online (após deploy de teste)
1. App abre igual ao localhost; **sem erros no console**.
2. Login admin (com `VITE_ADMIN_PASSWORD`) — Dono e Gerente.
3. Cadastro de colaborador + geração de link/código + WhatsApp.
4. Editor de módulo + preview real + rascunho→publicar.
5. `/acesso?id=...` → Feed → Player → **Quiz** → Progresso → **Assinatura** (ponta-a-ponta).
6. Recarregar rotas profundas (`/admin/dashboard`, `/modulo/...`) — SPA.
7. Instalar como **PWA** no celular; testar offline (conteúdo já visto).
8. Conferir o vídeo do §6 (se não resolvido, ele falha — esperado).

---

## 10. O que fica para Supabase / produção (Opção B)
- Criar projeto Supabase; aplicar `0001→0006`; **escrever/aplicar `0007`** (RLS por
  RPC `security definer` + RLS de conteúdo + policies de Storage) — ver
  `docs/RLS_SECURITY_PROPOSAL.md`.
- Migrar Admin Auth → **Supabase Auth** (dono/gerente com `role`).
- Corrigir **drift camelCase** no `storage.ts` (employees/signature) + caminho
  Supabase para **enquetes (poll)**.
- Testar com **dados falsos** antes de qualquer PII real.

---

## 11. Recomendações — vídeos, uploads e app mobile

### Vídeos / mídia
- **Teste (agora):** manter os vídeos leves versionados (11,7MB) — OK na Vercel.
- **Produção:** mover vídeos pesados para **Supabase Storage** ou **CDN de vídeo**;
  não manter vídeo grande no GitHub/`public`.
- **Formatos:** **MP4 (H.264/AAC)** como base (compatibilidade); **WebM (VP9)** opcional
  p/ otimização; **WebM com alpha** só para Lis/personagem transparente; **HLS** para
  vídeos longos (streaming adaptativo).
- **Imagens:** thumbnails/pôster em **WebP** (fallback JPG); imagens em **WebP/AVIF**.

### Uploads (futuro — não implementado)
- Implementar upload no admin → **Supabase Storage** (buckets já criados no `0006`).
- Policies de **escrita** só para admin autenticado (no `0007`).
- `attachment` (PDFs) **privado**, servido por **signed URL**.

### App mobile (futuro)
- **Agora:** o **PWA** já é instalável (Android/iOS via "Adicionar à tela inicial").
- **Nativo (opcional):** empacotar o mesmo PWA com **Capacitor** (iOS+Android) ou
  **TWA** (Android/Play Store) — **mesmo código**, sem reescrever.
- Push real exige a fase de notificações (Supabase + Web Push) — fora deste escopo.

---

## 12. Conclusão
O projeto está **apto a um deploy de teste na Vercel (Opção A)**, com paridade ao
localhost, performance adequada a mobile e sem erros de console. Recomendo **resolver o
vídeo do §6** e **configurar `VITE_ADMIN_PASSWORD`** antes de publicar. O caminho de
produção (Supabase, RLS, Auth, drift) está **documentado e proposto**, aguardando a
fase apropriada.

**Aguardando sua aprovação para push/deploy (Fase 8).** Nada será empurrado, ligado ou
corrigido sem ela.
