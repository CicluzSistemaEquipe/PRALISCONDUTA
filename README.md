# 🌾 Pralis Conduta

Plataforma web mobile-first que transforma o **Código de Ética e Conduta da Padaria Pralís**
em uma experiência interativa estilo rede social: feed de módulos, stories com swipe,
vídeos narrados pela Lis, quizzes gamificados e assinatura digital ao final.

> *Pralís — a prova é ser feliz.*

---

## Stack

- **React 18 + Vite + TypeScript**
- **Tailwind CSS** + CSS custom properties (paleta Pralís)
- **Framer Motion** (stories, texto animado, transições, gestos)
- **React Router v6** (code splitting por rota)
- **Supabase** (auth, banco, storage) — **opcional**
- **PWA** (vite-plugin-pwa, instalável)
- **Lucide React** (ícones)

## Rodando localmente

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de produção (dist/)
npm run preview    # serve o build
```

O app **funciona sem backend**: progresso, quizzes e assinatura ficam no `localStorage`.

## Conectando o Supabase (opcional)

1. Crie um projeto no Supabase.
2. Rode as migrations em `supabase/migrations/` (SQL Editor ou `supabase db push`).
3. Copie `.env.example` para `.env` e preencha:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
4. Reinicie o dev server. A camada de dados (`src/lib/storage.ts`) passa a usar o
   Supabase automaticamente — nenhum componente muda.

## Fluxo do colaborador

`/` Splash → `/conheca` Missão, Visão e Valores → `/login` cadastro (sem senha,
via token do link) → `/feed` módulos → `/modulo/:id` stories → `/conclusao`
assinatura + certificado.

- Link único por colaborador: `…/login?t=TOKEN` (gerado no dashboard).
- Módulos obrigatórios são sequenciais; os de cargo aparecem conforme o cargo;
  Penalidades e Assinatura por último.
- A assinatura libera após concluir todos os módulos obrigatórios + de cargo.

## Painel do RH

`/dashboard/login` → visão geral, colaboradores, adicionar (gera link + WhatsApp),
relatórios (export CSV).

- **Modo demo** (sem Supabase): qualquer e-mail + senha `pralis`.
- **Com Supabase**: usa o Supabase Auth (e-mail/senha de um usuário do projeto).

## Estrutura

```
src/
├── app/            # app do colaborador (pages, components, context)
├── dashboard/      # painel do RH (pages, auth, data)
├── lib/            # types, storage, content (módulos), animations, effects
├── styles/         # pralis.css (@font-face + variáveis) + globals.css
└── assets/fonts/   # MadeByDillan, Montserrat, TR Freehand
supabase/migrations # schema + RLS
```

## Conteúdo

Todo o conteúdo dos módulos está em [`src/lib/content.ts`](src/lib/content.ts),
fiel ao Código de Ética e Conduta (Comercial Lisboa Alimentos Eireli — Juiz de
Fora/MG, 09/03/2024).

## Pendências de assets (quando chegarem)

- **Vídeos**: hoje há placeholders simulados. Coloque a URL real em
  `content.ts` no campo `src` de cada card `video` (Supabase Storage ou externa).
- **Lis**: o avatar é um placeholder geométrico com estados
  (`neutral | talking | celebrating | thinking | alert`). Substituir a
  ilustração final em `src/app/components/LisAvatar.tsx`.

## Identidade

| Cor | Hex |
|---|---|
| Marrom | `#5e3731` |
| Marrom escuro | `#3d1f1c` |
| Ouro | `#b8860b` |
| Laranja (ação) | `#f37435` |
| Creme | `#e8cfa0` |
| Verde (sucesso) | `#5dd87a` |

Tipografia: **MadeByDillan** (títulos), **Montserrat** (corpo), **TR Freehand**
(momentos emocionais / fala da Lis).
