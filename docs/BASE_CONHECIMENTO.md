# Base de Conhecimento — Pralis App
> Ideias, decisões e visão estratégica do projeto

---

## Visão do Produto — Super App Interno Pralis

**Data:** Junho 2026

O app Pralis vai além de um código de conduta digital. A visão é um **super app interno de RH gamificado**, com quatro pilares:

1. **Treinamento** — módulos por setor com a Lis como instrutora
2. **Engajamento** — feed social interno da padaria
3. **Gamificação** — XP, moeda interna, premiações mensais
4. **Métricas** — dashboard para gestores acompanharem tudo

---

## Gamificação — Sistema de Pontos e Recompensas

### XP (Experiência — acumula para sempre)
- Cada módulo concluído → XP
- Acertar quiz → XP bônus
- Assinar termos → XP
- Reagir/comentar no feed → XP pequeno
- Check-in diário → XP de presença

### Níveis sugeridos
- Aprendiz Pralís
- Padeiro
- Padeiro Sênior
- Mestre da Loja
- Embaixador Pralís

### Espiguinhas (moeda interna — reseta todo mês)
- Acumulam durante o mês por ações no app
- No final do mês, quem tem mais resgata prêmios reais:
  - Folga extra
  - Vale-lanche
  - Produto da padaria
  - Reconhecimento público no feed

---

## Feed — Rede Social Interna

Funciona como uma timeline com:
- Comunicados da gestão
- Destaques de colaboradores ("João completou todos os módulos!")
- Fotos do dia a dia postadas pelos gerentes
- Enquetes rápidas ("Qual sabor de pão no lanche de sexta?")
- Reações com emojis e comentários

Objetivo: manter o app aberto mesmo quando não há módulo novo.

---

## Identidade do Colaborador

- Perfil com avatar, nível, unidade/setor
- Histórico visual de conquistas (badges)
- Certificado digital gerado ao concluir treinamento (para salvar/compartilhar)
- Login por CPF ou código de convite gerado pelo RH

---

## Inovações Específicas

- **Notificação push semanal da Lis** — "Oi [Nome], tem módulo novo esperando por você 🌾"
- **Desafio por loja** — "A loja da Vila tem 80% de conclusão, vocês chegam lá?"
- **Check-in diário gamificado** — toca em "Cheguei", ganha XP de presença, cria hábito de abrir o app
- **Certificado digital** automático ao concluir treinamento

---

## Métricas para o Gestor (Dashboard)

- Taxa de conclusão por módulo
- Tempo médio por tela/slide
- Onde cada colaborador travou no quiz
- Ranking por setor/loja
- Colaboradores inativos há X dias
- Exportação de relatório mensal

---

## Backend — Arquitetura Recomendada

**Stack:** Supabase (banco + auth + API + realtime) + OneSignal (push) + PWA

### Por que Supabase
- PostgreSQL gerenciado
- Auth com WhatsApp (código SMS) ou código de convite
- API REST automática
- Realtime para feed e conquistas ao vivo
- Supabase Functions para lógica de negócio (calcular XP, gerar certificado)

### Tabelas principais
```
employees       — perfil, cargo, loja, nível, xp total
progress        — módulo concluído, data, score quiz
quiz_answers    — respostas individuais por pergunta
xp_events       — log de cada XP ganho (tipo, valor, data)
espiguinhas     — saldo mensal por colaborador
feed_posts      — posts do feed (texto, imagem, tipo)
reactions       — reações por post/colaborador
rewards         — prêmios disponíveis e resgates
```

### Distribuição
- App: PWA instalável no celular (sem App Store)
- Admin: painel web separado (já existe o início)
- Push: OneSignal integrado via Supabase Edge Functions

---

## Roadmap de Desenvolvimento Sugerido

1. ✅ Conteúdo dos módulos (em andamento)
2. 🔜 Supabase como backend real (substituir localStorage)
3. 🔜 Sistema de XP + Espiguinhas
4. 🔜 Certificados digitais
5. 🔜 Feed social interno
6. 🔜 Dashboard de métricas avançado
7. 🔜 Notificações push
8. 🔜 Desafios por loja

---

## Stack Atual do App

- React 18 + Vite 5.4 + TypeScript
- Framer Motion 11 (animações)
- Tailwind CSS (estilos)
- localStorage (temporário — migrar para Supabase)
- WebM VP9 com alpha (vídeos da Lis)
- PWA instalável

## Ferramentas de Produção de Vídeo

- **Higgsfield Plus** ($39/mês) — geração de vídeo + lipsync com imagem própria
- **ElevenLabs Starter** ($6/mês) — voz da Lis (30k créditos ≈ 30-60min de áudio/mês)
- **Total:** $45/mês substitui Flow Labs + HeyGen + CapCut

## Decisão sobre vídeos alpha

- MP4 com cor de fundo baked in é mais confiável que WebM alpha
- Para cada contexto, gerar o vídeo com a cor exata do fundo da tela
- Splash/Onboarding/Profile → `#1f1102`
- Módulos → cor do `--story-bg` de cada módulo
- Círculos → fundo branco (já funciona com overflow: hidden)
