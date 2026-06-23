# Roteiro de Conteúdo — Pralís Conduta
## Setor: Caixa (ponto de partida)
> Referência para produção de todos os vídeos, áudios e textos do app.
> Voz da Lis: Giselli · ElevenLabs · Eleven v3 · pt-BR
> Produção de imagens: FlowLabs (poses da Lis) + filmagem real na padaria

---

## ESTRUTURA GERAL DO APP (setor Caixa)

O colaborador do Caixa passa pelas seguintes telas em ordem:

```
Splash → Conheca → Login → Feed → [8 Módulos] → Conclusão/Assinatura
```

### Telas de navegação permanente (Bottom Nav)
- **Feed** — lista de módulos com progresso
- **Lis** — chat com a mascote
- **Perfil** — dados do colaborador + progresso

---

## FASE 1 — TELAS INICIAIS (antes do login)

### 1.1 SPLASH SCREEN
**Tela:** Logo + Lis animada + tagline
**Duração:** 2,8 segundos (auto-navega)
**Conteúdo necessário:**
- ✅ Logo SVG da Pralís (já existe)
- ✅ Imagem Lis pose neutra/sorrindo (já existe)
- 🎬 **VÍDEO HeyGen:** Não necessário (tela muito rápida)
- 🎵 **ÁUDIO:** Não necessário (tela silenciosa)

---

### 1.2 CONHECA A PRALIS (Onboarding — 5 slides)
**Tela:** Story de introdução sobre a Pralís antes do login
**Esta é a tela que você está produzindo agora**

#### Slide 1 — Apresentação da Lis
**Pose Lis:** Acenando, animada, braços abertos
**Background HeyGen:** Padaria quente, luz dourada
**Texto na tela:** "Oi! Eu sou a Lis 👋"

**Script ElevenLabs (Lis fala):**
```
[happy] Oi! Seja muito bem-vindo à Pralís. Eu sou a Lis, e vou te acompanhar em cada etapa dessa jornada. Topa vir comigo?
```
**Tag emoção:** `[happy]`

---

#### Slide 2 — Missão & Visão
**Pose Lis:** Mão no coração, expressão acolhedora
**Background:** Padaria, luz de manhã, tons quentes
**Texto na tela:** Missão e Visão em destaque

**Script ElevenLabs:**
```
[thoughtful] Nossa missão é levar qualidade, frescor e acolhimento em cada produto, do preparo até o cliente.

[happy] E nossa visão é crescer sendo referência em padaria, com pessoas felizes de trabalhar aqui.
```

---

#### Slide 3 — Os Valores
**Pose Lis:** Apontando para cima, sorrindo
**Background:** Padaria, produtos no balcão ao fundo
**Texto na tela:** Valores em lista (Compromisso · Respeito · Qualidade · Acolhimento)

**Script ElevenLabs:**
```
[thoughtful] A Pralís tem valores que guiam tudo o que fazemos: compromisso, respeito, qualidade e acolhimento. São eles que fazem a diferença no nosso dia a dia.
```

---

#### Slide 4 — O Código de Conduta
**Pose Lis:** Segurando algo (gesto de entrega), séria mas simpática
**Background:** Padaria interior
**Texto na tela:** "Código de Ética e Conduta"

**Script ElevenLabs:**
```
[thoughtful] Esse aplicativo é o nosso Código de Ética e Conduta. Ele existe pra que a gente mantenha a nossa cultura forte e os nossos valores vivos em cada detalhe.
```

---

#### Slide 5 — Chamada pra ação
**Pose Lis:** Comemorando, braços levantados
**Background:** Mais claro, esperançoso
**Texto na tela:** "Vamos começar?"

**Script ElevenLabs:**
```
[happy] Vai ser rápido, interativo, e você vai aprender tudo que precisa saber. Bora lá?
```

---

### 1.3 LOGIN
**Tela:** Campo matrícula + senha
**Conteúdo necessário:**
- ✅ Estrutura já existe
- 🎵 **ÁUDIO:** Não necessário
- 📝 **TEXTO:** Já implementado

---

## FASE 2 — FEED (lista de módulos)

### 2.1 FEED PRINCIPAL
**Tela:** Lista dos módulos com progresso do colaborador
**Conteúdo necessário:**
- ✅ Dados dos módulos já existem em `content.ts`
- 🎵 **ÁUDIO Lis (tooltip de boas-vindas):** Reproduzir quando entra pela primeira vez

**Script ElevenLabs (primeira entrada no Feed):**
```
[happy] Esses são os seus módulos, [Nome]! Complete todos para liberar a sua assinatura digital. Pode começar pelo primeiro!
```

---

## FASE 3 — MÓDULOS (setor Caixa)

O colaborador do Caixa vê 8 módulos nesta ordem:

---

### MÓDULO 01 — Boas-vindas à Pralís
**Tag:** FUNDAMENTOS · **Tempo:** 2 min
**Cargo:** Todos

#### Story 1 — Lis de boas-vindas
**Pose Lis:** Celebrando, braços para cima
**Background HeyGen:** Padaria, energia boa, luz dourada
**Script ElevenLabs:**
```
[happy] Seja muito bem-vindo à família Pralís! Eu sou a Lis e vou te acompanhar nessa jornada. Aqui a gente acredita numa coisa simples: a prova é ser feliz!
```

#### Story 2 — Vídeo "Bem-vindo à Pralís"
**Tipo:** 🎬 VÍDEO REAL (filmagem na padaria)
**Duração sugerida:** ~2 min
**Roteiro de filmagem:**
- Porta da Pralís sendo aberta por dentro
- Balcão de atendimento, produtos expostos
- Equipe trabalhando, sorrindo
- Voz em off (Lis/ElevenLabs) ou entrevista com gerente
- Encerrar com logo e "Seja bem-vindo(a)!"

**Script narração (voz Lis, ElevenLabs):**
```
[happy] Essa é a Pralís. Uma padaria que nasceu do amor pelo pão e pelo cuidado com as pessoas. Aqui, cada produto é feito com capricho, cada atendimento é feito com carinho. E você agora faz parte disso.
```

#### Story 3 — Texto "Por que existe este Código?"
**Tipo:** 📝 TEXTO (já existe no app)
**Áudio Lis (narração do texto):**
```
[thoughtful] O Código de Conduta existe pra que todos a gente saiba as regras do jogo. Não é um documento de punição — é o nosso combinado coletivo. Todos os colaboradores têm a obrigação de conhecer e cumprir com ele.
```

#### Quiz (1 pergunta — já implementado)
#### Conclusão — badge "Primeiros Passos"

---

### MÓDULO 02 — A Jornada do Colaborador
**Tag:** CARREIRA · **Tempo:** 3 min
**Cargo:** Todos

#### Story 1 — Lis introdução
**Pose Lis:** Andando/postura de movimento, sorrindo
**Script ElevenLabs:**
```
[thoughtful] Deixa eu te contar como funciona a sua jornada aqui — desde o primeiro dia até virar guardião da nossa cultura.
```

#### Story 2 — Vídeo "Seu começo na Pralís"
**Tipo:** 🎬 VÍDEO REAL + Lis (HeyGen)
**Sugestão:** Lis explica em vídeo com backdrop de padaria
**Script ElevenLabs:**
```
[thoughtful] Você foi contratado com base na sua capacidade e experiência. Agora começa o período de experiência — onde a qualidade do seu serviço e a sua conduta definem se você será efetivado.
```

#### Stories 3, 4, 5 — Textos (já implementados)
**Áudios Lis para narração dos textos:**

Texto "Guardião da cultura":
```
[thoughtful] Ao ser efetivado, você se torna guardião da cultura Pralís. As promoções aqui são baseadas em mérito, habilidade e antiguidade. Sem favorecimentos, sem discriminação.
```

Texto "Mesmo depois, a parceria continua":
```
[thoughtful] Mesmo depois de sair da empresa, alguns deveres continuam. O sigilo das informações e o não aliciamento de clientes e colegas permanecem valendo. É um compromisso de respeito mútuo.
```

#### Quiz (2 perguntas — já implementado)

---

### MÓDULO 03 — O que é Dever?
**Tag:** OBRIGAÇÕES · **Tempo:** 4 min
**Cargo:** Todos

#### Story 1 — Lis introdução
**Pose Lis:** Séria mas simpática, dedo levantado (atenção)
**Script ElevenLabs:**
```
[thoughtful] Agora os deveres que valem para todo mundo aqui na Pralís. São o nosso combinado do dia a dia.
```

#### Story 2 — Vídeo "Pontualidade e uniforme"
**Tipo:** 🎬 VÍDEO REAL (filmagem)
**Roteiro de filmagem:**
- Colaborador chegando pontualmente, batendo o ponto
- Colocando o uniforme corretamente
- Cabelo preso, unhas, apresentação completa
**Script narração Lis:**
```
[thoughtful] Pontualidade e uniforme são os primeiros sinais de respeito — com a equipe, com o cliente e com a empresa. O uniforme fica restrito às dependências da Pralís, por normas sanitárias.
```

#### Stories 3, 4, 5, 6 — Textos (já implementados)
**Áudios para cada texto:**

"Segurança e cuidado":
```
[thoughtful] Segurança é responsabilidade de todos. Se você ver um colega agindo de maneira insegura, comunique ao supervisor. Cuide dos utensílios da empresa como se fossem seus.
```

"Cliente em primeiro lugar":
```
[happy] O cliente é a razão de tudo aqui. Trate sempre com respeito, cordialidade e agilidade. Se não tiver o produto que ele busca, ofereça alternativas. O contato com o cliente é sempre pelos meios oficiais da empresa.
```

"Um ambiente sem fofocas":
```
[thoughtful] Problemas com colegas? Leve direto ao superior hierárquico. Fofoca envenena o ambiente. Aqui a gente resolve as coisas de frente, com respeito.
```

#### Quiz (3 perguntas — já implementado)

---

### MÓDULO 04 — O que é Proibido?
**Tag:** LIMITES · **Tempo:** 4 min
**Cargo:** Todos

#### Story 1 — Lis introdução (tom de atenção)
**Pose Lis:** Expressão séria, postura firme
**Script ElevenLabs:**
```
[serious] Agora preciso da sua atenção total. Estas são as condutas terminantemente proibidas na Pralís. Algumas têm multa pesada. Vem comigo.
```

#### Story 2 — Vídeo "Zero tolerância"
**Tipo:** 🎬 VÍDEO Lis (HeyGen) — tema sensível, melhor sem filmagem real
**Script ElevenLabs:**
```
[serious] Discriminação, assédio, preconceito de qualquer natureza — zero tolerância. Não importa raça, religião, sexo, orientação sexual ou qualquer outra característica. Respeito não é negociável aqui.
```

#### Story "Bens, sigilo e multa"
**Áudio especial — destaque para a multa:**
```
[serious] Atenção aqui: divulgar informação confidencial ou aliciar clientes e colegas dá multa de DEZ salários mínimos por cada documento ou informação. Não é brincadeira.
```

#### Story "Se suspeitar que um cliente saiu sem pagar"
**Áudio — regra específica do Caixa (reforço):**
```
[serious] Se você suspeitar que um cliente saiu sem pagar, NÃO o aborde. NÃO impeça a saída. Informe imediatamente ao gestor. Quem conduz a situação é ele.
```

#### Quiz (3 perguntas — já implementado)

---

### MÓDULO 07 — Colaboradores do Caixa ⭐ (módulo específico do cargo)
**Tag:** FINANCEIRO · **Tempo:** 2 min
**Cargo:** Caixa apenas

#### Story 1 — Lis introdução
**Pose Lis:** Postura de atenção/alerta, expressão séria mas acolhedora
**Background HeyGen:** Ambiente de caixa/balcão (ou padaria genérica)
**Script ElevenLabs:**
```
[serious] O caixa é um ponto sensível da loja. Atenção redobrada com segurança e com o procedimento financeiro. Esse módulo é especialmente pra você.
```

#### Story 2 — Vídeo "Segurança do caixa"
**Tipo:** 🎬 VÍDEO REAL (filmagem prioritária)
**Roteiro de filmagem:**
- Mostrar o caixa físico fechado quando não está em uso
- Colaborador organizando a fila de clientes
- Atendimento ágil no pagamento
- Demonstrar as formas de pagamento (cartão, dinheiro, PIX)
**Script narração Lis:**
```
[thoughtful] Mantenha-se atento às formas de pagamento e à segurança do caixa. Caixa sempre fechado quando não estiver em uso. Quando formar fila, organize-a para não atrapalhar a entrada de clientes.
```

#### Story 3 — "Nunca retire valores sem autorização"
**Tipo:** 🎬 VÍDEO Lis (HeyGen) — regra crítica
**Script ElevenLabs:**
```
[serious] Essa é a regra de ouro do caixa: é terminantemente proibido retirar valores sem autorização dos gestores. Nem que um colega peça. Nem que pareça urgente. Siga estritamente o procedimento financeiro estabelecido pelos gestores.
```

#### Quiz (1 pergunta — já implementado)
#### Conclusão — badge "Caixa Seguro"

---

### MÓDULO 10 — Fornecedores & Sociedade
**Tag:** PARCERIAS · **Tempo:** 3 min
**Cargo:** Todos

#### Story 1 — Lis introdução
**Pose Lis:** Sorrindo, postura aberta
**Script ElevenLabs:**
```
[happy] A Pralís também tem compromissos para fora: com fornecedores e com a sociedade. A gente se importa com quem fornece pra gente e com o impacto que geramos no mundo.
```

#### Story 2 — Vídeo (Lis HeyGen)
**Script ElevenLabs:**
```
[thoughtful] A empresa seleciona fornecedores que garantem qualidade, com histórico sólido no mercado. Boa-fé e livre concorrência são valores que guiam todas as parcerias da Pralís.

[thoughtful] E além disso, a Pralís cuida do meio ambiente, evita desperdícios e respeita a legislação trabalhista e o Direito do Consumidor em tudo o que faz.
```

#### Quiz + Conclusão — badge "Visão Ampla"

---

### MÓDULO 11 — Das Penalidades
**Tag:** DISCIPLINA · **Tempo:** 2 min
**Cargo:** Todos

#### Story 1 — Lis introdução
**Pose Lis:** Séria, postura de encerramento
**Script ElevenLabs:**
```
[serious] Pra fechar, é importante saber: o que acontece se o Código for descumprido? Faz parte do combinado conhecer as consequências.
```

#### Story 2 — Vídeo (Lis HeyGen)
**Script ElevenLabs:**
```
[thoughtful] As medidas disciplinares variam conforme a gravidade: advertência verbal ou por escrito, suspensão, e em casos mais graves, demissão por justa causa. Além das multas já previstas no Código.

[thoughtful] Tudo é analisado caso a caso. A Pralís quer colaboradores comprometidos — não quer punir. Mas é importante que você saiba onde estão os limites.
```

#### Quiz + Conclusão — badge "Ciente das Regras"

---

### MÓDULO 12 — Compromisso & Assinatura
**Tag:** CONCLUSÃO · **Tempo:** 3 min
**Cargo:** Todos

#### Story 1 — Lis celebração
**Pose Lis:** Comemorando, braços abertos, sorriso grande
**Background HeyGen:** Mais vibrante/feliz
**Script ElevenLabs:**
```
[happy] Chegamos ao fim! Você completou todos os módulos. Agora é só formalizar o seu compromisso com a família Pralís. Você está pronto!
```

#### Tela de assinatura digital
**Conteúdo:** 4 termos para assinar (já implementado)
**Áudio de instrução:**
```
[thoughtful] Leia cada termo com atenção antes de assinar. Eles formalizam o seu compromisso com as normas da Pralís. Após assinar, você receberá uma confirmação.
```

---

## FASE 4 — LIS CHAT

### Chat com a Lis
**Tela:** Lis mascote + balão de conversa
**Conteúdo:**
- ✅ Frases já implementadas por módulo
- 🎵 **ÁUDIO:** Gerar narração para cada mensagem da Lis no chat

**Frases para gerar áudio (ElevenLabs):**

Entrada no chat:
```
[happy] Oi! Eu sou a Lis. Posso te ajudar com qualquer dúvida sobre os módulos. O que você quer saber?
```

Próximo módulo desbloqueado:
```
[happy] Ótimo trabalho! Você desbloqueou o próximo módulo. Quer continuar agora?
```

Módulo concluído:
```
[happy] Parabéns! Você completou esse módulo. Cada passo te aproxima da sua assinatura digital!
```

---

## FASE 5 — PERFIL

### Tela de Perfil
**Conteúdo:**
- ✅ Dados do colaborador (já implementado)
- ✅ Estatísticas de progresso (já implementado)
- 🆕 Toggle dark/light mode (a implementar)
- 🎵 **ÁUDIO:** Não necessário nesta tela

---

## RESUMO DE PRODUÇÃO (setor Caixa)

| # | Tipo | Quantidade | Ferramenta | Prioridade |
|---|------|-----------|------------|------------|
| 1 | Vídeos HeyGen (Lis falando) | 12 cenas | HeyGen + ElevenLabs | 🔴 Alta |
| 2 | Áudios narração (textos) | 18 textos | ElevenLabs | 🔴 Alta |
| 3 | Imagens poses Lis | 8 poses | FlowLabs | 🟡 Média |
| 4 | Vídeos reais (padaria) | 3 filmagens | Câmera/celular | 🟡 Média |
| 5 | Áudios chat Lis | 5 frases | ElevenLabs | 🟢 Baixa |

### Filmagens reais prioritárias:
1. **"Bem-vindo à Pralís"** — tour pela padaria (Módulo 01)
2. **"Pontualidade e uniforme"** — chegada, ponto, uniforme (Módulo 03)
3. **"Segurança do Caixa"** — caixa em uso, fila, pagamento (Módulo 07 ⭐)

### Poses FlowLabs a gerar:
1. Acenando/boas-vindas (Módulo 01 + Slide Conheca)
2. Andando/movimento (Módulo 02)
3. Dedo de atenção, séria (Módulo 03)
4. Expressão de alerta/firme (Módulo 04)
5. Mão no coração/acolhedora (Slide Missão)
6. Apontando/explicando (Slide Valores)
7. Comemorando/braços levantados (Módulo 12)
8. Séria/postura de encerramento (Módulo 11)

---

## ORDEM DE PRODUÇÃO RECOMENDADA

### Semana 1 — Essencial
- [ ] Slides Conheca (5 vídeos HeyGen + 5 áudios ElevenLabs)
- [ ] Módulo 07 Caixa (vídeo real + 2 vídeos HeyGen)
- [ ] Módulo 01 Boas-vindas (vídeo real tour padaria)

### Semana 2 — Completar módulos gerais
- [ ] Módulos 02, 03, 04 (vídeos HeyGen + áudios)
- [ ] Módulos 10, 11 (vídeos HeyGen + áudios)
- [ ] Módulo 12 — Assinatura (vídeo celebração HeyGen)

### Semana 3 — Polimento
- [ ] Áudios de narração para todos os textos
- [ ] Frases do chat da Lis
- [ ] Integrar tudo no app via VS Code

---

*Documento gerado em 2026-06-16 · Pralís Conduta v1.0*
