# COLOR_SYSTEM — Pralís

> Valores canônicos em `DESIGN_TOKENS.json` (`color.*`). Aqui ficam as **regras de
> aplicação**. Nunca invente hex — referencie os tokens.

---

## 1. Paleta de marca

| Cor | Hex | Papel |
|---|---|---|
| Preto / Preto quente | `#000000` / `#0d0800` | Base do app |
| Marrom | `#5e3731` | Surface (app) · detalhe (admin) |
| Dourado | `#b8860b` (+`#d4a017`) | Brilho premium · **não na UI do admin** |
| Laranja | `#f37435` | **Ação** |
| Creme | `#e8cfa0` | Calor · texto secundário (app) |
| Branco | `#ffffff` | Texto (app) · base (admin) |

> O SVG das espigas usa `#ee7436/#b2832c/#5e3832` (export). Ao recriar em código, use
> os tokens canônicos acima.

---

## 2. Regras universais

1. **Laranja = ação.** **Uma** ação primária (um laranja) por tela.
2. **Status nunca só por cor** — sempre cor + ícone + texto.
3. **Contraste AA:** ≥4.5:1 (texto). Texto/link sobre branco → **`#C9501A`**
   (`accentText`), nunca o laranja vivo.
4. **Cor é hierarquia:** se tudo é colorido, nada se destaca. Estrutura em neutros.
5. **Sem gradientes pesados.** App permite gradiente quente de marca (laranja→dourado
   no botão); admin é chapado (no máx. micro-gradiente raro em gráfico).

---

## 3. Mundo 🌙 App (escuro) — `color.appDark`

- **Fundo:** `#0d0800` (quente, nunca preto puro) — vem do `AnimatedBackground`.
- **Cards:** `#1c1008` / warm `#261508`, borda quente `rgba(184,134,11,.22)`.
- **Texto:** primário `#ffffff` · secundário (creme) `#e8cfa0` · muted `rgba(232,207,160,.65)`.
- **Ação:** `#f37435` (texto branco). **Dourado** `#b8860b` para brilho/progresso.
- **Status:** sucesso `#5dd87a` · erro `#ef4444`.
- **Proibido:** sombra pesada, `backdrop-filter: blur` (performance).

**Light opcional do app** (`color.appLight`): fundo creme `#fdf8f2`, texto `#1a0e00`,
secundário marrom `#5e3731`, sucesso `#1e7e4e` (o `#5dd87a` não passa AA sobre creme).

---

## 4. Mundo ☀️ Admin (claro) — `color.admin`

- **Canvas:** `#FFFFFF`; superfícies `#FAF9F8` / `#F5F4F2`; insets `#F2F0ED`.
- **Bordas (preferir a sombra):** `#ECEAE7` (hairline) · `#DAD6D1` (inputs/secundário).
- **Texto:** ink `#1A1714` · secundário `#57514B` · muted `#8A837C`.
- **Ação:** `#F26B2A` (hover `#E25E1F`, active `#C9501A`); tint `#FEF1EA`; foco `ring`.
- **Texto/link laranja sobre branco:** `#C9501A` (`accentText`).
- **Detalhe:** marrom `#5E3731` (wordmark, avatar fallback); tint `#F4EFEE`.
- **Status:** sucesso `#1E7E4E` · perigo `#C0392B` · aviso `#B7791F` (cada um com `*-bg`).
- **Proibido:** **dourado na UI** (suja no branco).

---

## 5. Gráficos (admin)
Ordem de cor (máx 4–5, dessaturadas): **laranja `#F26B2A` → marrom `#5E3731` →
slate-500 → teal-gray → âmbar-700**. Linha/área laranja a 8%, sem grid pesado.
"Sem dados ainda" elegante — nunca "0%" parecendo quebrado.

---

## 6. Checklist de cor
- [ ] Está no mundo certo (dark/app vs light/admin)?
- [ ] Uma única ação laranja?
- [ ] Sem dourado na UI do admin?
- [ ] Texto sobre branco usa `#C9501A`?
- [ ] Contraste AA conferido?
- [ ] Status com cor + ícone + texto?
