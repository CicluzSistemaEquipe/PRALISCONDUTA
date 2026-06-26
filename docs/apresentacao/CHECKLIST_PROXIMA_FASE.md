# Checklist · Próxima Fase (ir para a nuvem)

> Use como lista de tarefas para sair do **modo local** e ligar **Supabase + Storage**.
> Ordem pensada para ser segura e reversível. Nada aqui altera a experiência do
> colaborador.

---

## 🎯 Pré-requisitos (uma vez)

- [ ] Decidir provedor de deploy (Vercel ou Netlify)
- [ ] Criar conta/projeto **Supabase** (DB + Storage)
- [ ] Definir quem é o **dono técnico** do projeto Supabase
- [ ] Garantir backup do conteúdo atual (exportar `pralis_admin_data`)

---

## 🗄️ Banco de dados

- [ ] Aplicar migration `0004_content` (training_modules, lis_lines, poll_answers)
- [ ] Aplicar migration `0005_schema_drift` (colunas de employees/signatures)
- [ ] Aplicar migration `0006_storage` (buckets de mídia + leitura pública)
- [ ] **Escrever e aplicar `0007_hardening`** — RLS + policies de escrita/upload
- [ ] Conferir índices (`sort_order`, `status`)

> ⚠️ **Não colocar dados reais** antes do `0007` (sem RLS, as tabelas ficam abertas).

---

## 🔌 Ligar o app na nuvem

- [ ] Definir `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no deploy
- [ ] Rebuild (`npm run build`)
- [ ] Semear conteúdo atual uma vez (`seedModulesToSupabase`)
- [ ] Confirmar: app lê módulos da nuvem
- [ ] Confirmar: **sem** as env vars, volta ao local sem erro (fallback)
- [ ] `tsc -b` + `vite build` verdes nos **dois** modos

---

## 🖼️ Mídia & Storage (P1)

- [ ] Adaptar editor para **upload** de vídeo/áudio/imagem
- [ ] Salvar URLs de Storage nos blocos do módulo
- [ ] Definir limites de tamanho/formato (vídeo curto, H.264, ~720p)
- [ ] Gerar/usar **pôster** (thumb) para carregamento rápido
- [ ] Validar reprodução no celular (Wi-Fi e 4G)

---

## 🔐 Segurança & produção

- [ ] RLS testado (cada papel só vê o que pode)
- [ ] Policies de Storage (quem sobe/lê mídia)
- [ ] Migrar admin para **Supabase Auth**
- [ ] Revisão de segurança (segredos, inputs, IDOR)
- [ ] LGPD: minimização, consentimento de GPS, retenção de eventos

---

## 🚀 Deploy & validação final

- [ ] Deploy em Vercel/Netlify com fallback de rota para `index.html`
- [ ] Testar **PWA**: instalar no celular, abrir offline
- [ ] Smoke test da jornada completa (boas-vindas → assinatura)
- [ ] Conferir relatórios da gestão com dados reais
- [ ] **Regressão zero** na Home/treinamento (contrato `Module`/`Story` intacto)

---

## 🧯 Plano de rollback (se algo der errado)

| Nível | Ação | Efeito |
|---|---|---|
| **A** | Remover as env vars `VITE_SUPABASE_*` | App volta **na hora** para o modo local |
| **B** | `git revert` da fase | Código volta ao estado anterior |
| **C** | Drop das tabelas novas | Banco volta ao estado anterior |
| **D** | Reverter URLs de mídia | Conteúdo volta para mídia local |

> Detalhe completo em `docs/PHASE2_SNAPSHOT_AND_ROLLBACK.md`.

---

*Checklist inicial — acompanha a apresentação e o `MANUAL_TI.md`.*
