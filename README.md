# Dinâmica do Casal

Aplicação web para dinâmicas interativas em eventos de casais. O apresentador controla o fluxo; os casais participam pelo celular escaneando um QR Code.

---

## Como rodar

```bash
npm install
npm run dev
```

| Página | URL |
|---|---|
| Apresentador | `http://localhost:5173/host` |
| Casais | `http://localhost:5173/casais` |

---

## Regras da dinâmica

A dinâmica apresenta **4 situações** do cotidiano conjugal. Para cada situação, cada casal escolhe qual das três reações mais representa como agiria:

| Reação | Símbolo | Descrição |
|---|---|---|
| **Da Carne** (Moisés) | 🔥 | Resposta impulsiva, dominada pela emoção |
| **Guardei pra Mim** (Neemias) | 😶 | Silêncio, recolhimento ou reflexão |
| **Madura** (José) | ❤️ | Resposta guiada por graça e maturidade |

Após encerrar a votação, o apresentador revela os resultados e um comentário reflexivo sobre a situação.

---

## Fluxo do apresentador (`/host`)

```
1. Abrir /host no computador/telão
2. Compartilhar o QR Code com os casais
3. Para cada situação:
   a. Ler a situação em voz alta
   b. Clicar em "Iniciar Votação"  → casais votam nos celulares
   c. Clicar em "Encerrar e Ver Resultados" → gráfico aparece
   d. Ler o comentário reflexivo que aparece na tela
   e. Clicar em "Nova rodada" ou avançar para a próxima situação
```

**Abas disponíveis:**
- **Situações** — controle do fluxo, situação atual, botões de ação e resultados
- **Votações** — lista individual de cada casal com a resposta escolhida

---

## Fluxo dos casais (`/casais`)

```
1. Escanear o QR Code exibido no telão
2. Digitar o nome do casal e clicar em "Entrar na Dinâmica"
3. Aguardar o apresentador iniciar a votação
4. Escolher uma das 3 opções e confirmar
5. Aguardar o apresentador encerrar → ver resultados
6. Repetir para as próximas situações
```

---

## As 4 situações

1. **Situação 1** — Seu cônjuge esqueceu uma data importante.
2. **Situação 2** — Seu cônjuge respondeu de forma atravessada depois de um dia difícil.
3. **Situação 3** — Uma discussão antiga voltou à tona… mais uma vez.
4. **Situação 4 (A mais temida)** — Seu cônjuge olha para você e fala: *"Precisamos conversar…"*

---

## Comunicação entre abas

O estado é sincronizado via **localStorage** + **BroadcastChannel API**. Presenter e casais precisam estar **no mesmo dispositivo ou na mesma rede local** acessando o mesmo servidor.

---

## Stack

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS 3** (estilização)
- **React Router v6** (roteamento)
- **qrcode.react** (geração do QR Code)
