# Apresentação Oficial · Sistema Pralís

Esta pasta é o **kit de apresentação e manual inicial** do projeto Pralís.
Tudo aqui é **documentação** — não altera o sistema, não implementa nada.

---

## 📁 O que tem nesta pasta

| Arquivo | O que é | Para quem |
|---|---|---|
| **`index.html`** | A apresentação principal (slides interativos) | Reuniões — todos os públicos |
| **`MANUAL_TI.md`** | Manual técnico resumido | TI / desenvolvedores |
| **`MANUAL_EQUIPE.md`** | Manual de uso passo a passo | Gestão / RH / equipe Pralís |
| **`ROADMAP.md`** | Roadmap visual das fases | Gestão / TI |
| **`CHECKLIST_PROXIMA_FASE.md`** | O que falta para ir ao ar | TI / Rodrigo |
| **`assets/`** | Logos, símbolo das espigas e a Lis | (usado pela apresentação) |

---

## ▶️ Como **abrir** a apresentação

1. Abra a pasta `docs/apresentacao/`.
2. Dê **duplo clique em `index.html`** — abre no navegador (Chrome, Edge, etc.).
3. Pronto. Funciona **offline**, sem instalar nada.

> Dica para reunião: aperte **`F`** para tela cheia.

### Navegação
- **`→`** / **`Espaço`** / clicar na direita → próximo slide
- **`←`** → slide anterior
- **`F`** → tela cheia · **`Home`/`End`** → primeiro/último slide
- No celular/tablet: **deslize** para os lados
- Os **pontinhos** embaixo pulam direto para qualquer slide

---

## ✏️ Como **editar** a apresentação

A apresentação é um único arquivo `index.html`. Cada slide é um bloco assim:

```html
<section class="slide" data-blk="Nome do bloco">
  <div class="inner">
    <div class="eyebrow">Rótulo pequeno</div>
    <h2 class="title">Título do slide</h2>
    <p class="lead">Texto de apoio.</p>
  </div>
</section>
```

- **Trocar um texto:** ache a frase no arquivo e edite — é texto puro.
- **Duplicar um slide:** copie um bloco `<section class="slide">…</section>` inteiro e cole onde quiser. A numeração e os pontinhos se ajustam sozinhos.
- **Trocar uma imagem:** substitua o arquivo dentro de `assets/` mantendo o mesmo nome, ou aponte para outro em `src="assets/…"`.
- **Cores e fontes:** ficam no topo do arquivo, no bloco `:root{ … }` (ex.: `--orange`, `--gold`, `--cream`).

> Toda a paleta é a oficial da Pralís. Mantenha o **laranja como cor de ação** e o **dourado para detalhes premium**.

---

## 📤 Como **apresentar** / compartilhar

- **Em reunião:** abra no navegador e use tela cheia (`F`).
- **Enviar para alguém:** compacte a pasta `apresentacao/` inteira (com a `assets/`) e mande o `.zip`. A pessoa descompacta e abre o `index.html`.
- **Gerar PDF:** no navegador, `Ctrl/Cmd + P` → "Salvar como PDF". O layout tem um modo de impressão que quebra um slide por página.
- **Publicar online (futuro):** a pasta pode ser hospedada como site estático (Vercel/Netlify/GitHub Pages) sem nenhuma mudança.

---

## 🎨 Identidade usada

- **Cores:** preto `#0c0a09` · marrom `#5e3731` · laranja `#f37435` · dourado `#b8860b` · creme `#e8cfa0`.
- **Tipografia:** Fraunces (títulos, serifa editorial) + Montserrat (texto). Carregadas do Google Fonts, com fallback elegante se estiver offline.
- **Assinatura visual:** trio de espigas + fio dourado + a **Lis** como guia.

---

*Gerado como parte da Fase de produto local. Não inclui implementação de Supabase/Storage.*
