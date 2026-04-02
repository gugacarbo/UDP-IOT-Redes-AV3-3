# Plano de Refatoração — Documentação Docusaurus

> **Data:** 2 de abril de 2026
> **Status:** Pendente
> **Escopo:** 25 arquivos `.md` em `docusaurus/docs/`

---

## 📊 Resumo do Audit

| Problema | Quantidade |
|---|---|
| Grupos de **duplicação** | 19+ |
| **Inconsistências** de terminologia | 8 |
| Áreas **fragmentadas** | 5+ |

**Causa raiz:** O conteúdo foi escrito em paralelo sem referências cruzadas — vários arquivos repetem as mesmas tabelas, definições e fluxos.

---

## 🏗️ Fase 1 — Designar Fontes Canônicas

Consolidar cada tema em **um único arquivo** e converter repetições em links.

| Tema | 📄 Arquivo Canônico | 🔄 Arquivos a Refatorar |
|---|---|---|
| **Arquitetura geral** | `architecture/overview.md` | `definicoes.md`, `fluxos.md` |
| **Protocolo UDP** (comandos, payloads) | `protocol/udp.md` | `requisitos.md` |
| **Protocolo WebSocket** | `protocol/websocket.md` | `matriz-gui.md` |
| **Config. WiFi** (`config_wifi.json`) | `infrastructure/config.md` | `config-build.md`, `firmware/matriz/overview.md`, `firmware/filial/overview.md` |
| **Config. Matriz** (`config_matriz.json`) | `infrastructure/config.md` | `matriz.md`, `firmware/matriz/overview.md` |
| **Config. Filial** (`config_filial.json`) | `infrastructure/config.md` | `filial.md`, `firmware/filial/overview.md` |
| **Formato de ID** (`<tipo>_<dispositivo>_<local>`) | `requisitos.md` §4.1 | `definicoes.md`, `infrastructure/config.md`, `firmware/filial/overview.md` |
| **REST API Matriz** | `firmware/matriz/rest-api.md` | `matriz-gui.md` |
| **REST API Filial** | `firmware/filial/rest-api.md` | — (falta referência) |
| **Tasks FreeRTOS Matriz** | `firmware/matriz/overview.md` | `matriz.md`, `architecture/matriz.md` |
| **Tasks FreeRTOS Filial** | `firmware/filial/overview.md` | `filial.md`, `architecture/filial.md` |
| **Polling / Detecção Offline** | `firmware/matriz/overview.md` | `matriz-gui.md`, `architecture/overview.md` |
| **GPIO Mapping** | `infrastructure/config.md` | `firmware/filial/overview.md`, `config-build.md` |
| **Build & Deploy** | `devops/build-deploy.md` | `config-build.md` |
| **Endereços IP / Portas** | `infrastructure/network.md` | `config-build.md`, `matriz.md` |
| **mDNS Hostname** | `infrastructure/network.md` | `infrastructure/wifi.md`, `matriz-gui.md` |

---

## 🔧 Fase 2 — Corrigir Inconsistências

| # | Inconsistência | Correção |
|---|---|---|
| 1 | **Nome das GUIs** — `definicoes.md` chama de "Interface local", `intro.md` foca só na GUI Matriz | Padronizar: **"GUI da Matriz"** (React app) e **"Portal Local da Filial"** (servido pelo ESP32) |
| 2 | **Autenticação UDP** — um arquivo diz "ignorado silenciosamente", outro "por segurança" | Unificar: sempre incluir a justificativa "(por segurança)" |
| 3 | **Porta UDP** — não fica claro se Matriz e Filial podem ter portas diferentes | Esclarecer: **ambas devem usar a mesma porta** (padrão 51000) |
| 4 | **Captive Portal SSID** — Matriz usa `Matriz-Setup`, Filial usa `ESP32-<ip>-Setup` | Documentar a diferença explicitamente em `infrastructure/wifi.md` |
| 5 | **Valores AC (0–1023)** — "PWM duty cycle" vs "intensidade de refrigeração" | Padronizar: **"duty cycle PWM (0–1023)"** |
| 6 | **Polling** — "em paralelo" vs "sequencial" | Esclarecer: **sequencial por filial, via task dedicada** |
| 7 | **Prioridades FreeRTOS** — com e sem números | Padronizar: sempre com valores numéricos (Alta=2, Média=1) |
| 8 | **Limite WebSocket** — `MAX_WS_CLIENTS = 4` só mencionado na GUI | Adicionar em `protocol/websocket.md` |

---

## 📝 Fase 3 — Criar Conteúdo Faltante

| Novo Arquivo | Conteúdo |
|---|---|
| `gui/filial-portal.md` | Documentação do Portal Local da Filial (endpoints, componentes, funcionalidades) |
| `protocol/authentication.md` | Especificação completa de autenticação (user/pass, injeção pela Matriz, fallback silencioso) |

---

## 🧹 Fase 4 — Refatorar Arquivos Top-Level

Os arquivos na raiz de `docs/` (`requisitos.md`, `definicoes.md`, `fluxos.md`, `matriz.md`, `filial.md`, `matriz-gui.md`, `config-build.md`) devem virar **páginas de visão geral com links** para os arquivos canônicos em subdiretórios, em vez de repetir conteúdo.

### Exemplo de transformação para `requisitos.md`

**Antes:**

```
## 5. Protocolo UDP

### list_req → list_resp
{ "cmd": "list_req" }
...
```

**Depois:**

```
## 5. Protocolo UDP

Para a especificação completa de comandos e payloads, veja [Protocolo UDP](./protocol/udp.md).
```

---

## 🔗 Fase 5 — Adicionar Referências Cruzadas

Em cada arquivo canônico, adicionar seção `## Veja Também` com links para páginas relacionadas.

Exemplo em `protocol/udp.md`:

```markdown
## Veja Também

- [Protocolo WebSocket](./websocket.md) — comunicação Matriz ↔ GUI
- [Configuração de Rede](../infrastructure/network.md) — endereços e portas
- [Firmware da Matriz — Visão Geral](../firmware/matriz/overview.md) — implementação do polling
```

---

## ✅ Ordem de Execução Sugerida

| Ordem | Fase | Impacto | Risco |
|---|---|---|---|
| 1 | **Fase 2** — Corrigir inconsistências | Imediato | Baixo |
| 2 | **Fase 1** — Designar canônicos e remover duplicatas | Principal | Médio |
| 3 | **Fase 3** — Criar conteúdo faltante | Preencher lacunas | Baixo |
| 4 | **Fase 4** — Refatorar top-level | Limpeza final | Médio |
| 5 | **Fase 5** — Referências cruzadas | Navegação | Baixo |

---

## 📎 Duplicações Detalhadas

### Dup #1 — Visão Geral da Arquitetura

- `definicoes.md` §2.2 — flowchart completo
- `fluxos.md` §2.2 — flowchart idêntico
- `architecture/overview.md` — mesmos diagramas

**Ação:** Manter `architecture/overview.md` como canônico. Substituir os outros por links.

### Dup #2 — Especificação de Polling da Matriz

- `matriz.md` — seção polling
- `firmware/matriz/overview.md` — "Polling (Ciclo Automático)"
- `matriz-gui.md` — "Robustez"

**Ação:** Manter `firmware/matriz/overview.md`. Substituir os outros por links.

### Dup #3 — Formato de ID de Dispositivo

- `requisitos.md` §4.1
- `definicoes.md`
- `infrastructure/config.md`
- `firmware/filial/overview.md`
- `protocol/udp.md` (em exemplos)

**Ação:** Manter `requisitos.md` §4.1. Substituir os outros por links.

### Dup #4 — Protocolo UDP — Comandos e Payloads

- `requisitos.md` §5
- `protocol/udp.md`

**Ação:** Manter `protocol/udp.md`. Em `requisitos.md`, substituir por link.

### Dup #5 — Protocolo WebSocket — Mensagens

- `matriz-gui.md` §3
- `protocol/websocket.md`

**Ação:** Manter `protocol/websocket.md`. Em `matriz-gui.md`, substituir por link.

### Dup #6 — Configuração WiFi (`config_wifi.json`)

- `infrastructure/config.md` ✅ melhor versão
- `config-build.md`
- `firmware/matriz/overview.md`
- `firmware/filial/overview.md`

**Ação:** Manter `infrastructure/config.md`. Remover repetições dos demais.

### Dup #7 — Configuração da Matriz (`config_matriz.json`)

- `matriz.md`
- `firmware/matriz/overview.md`
- `infrastructure/config.md` ✅ melhor versão

**Ação:** Manter `infrastructure/config.md`. Substituir os outros por links.

### Dup #8 — Configuração da Filial (`config_filial.json`)

- `filial.md`
- `firmware/filial/overview.md`
- `infrastructure/config.md` ✅ melhor versão

**Ação:** Manter `infrastructure/config.md`. Substituir os outros por links.

### Dup #9 — REST API da Matriz

- `matriz-gui.md` §4
- `firmware/matriz/rest-api.md`

**Ação:** Manter `firmware/matriz/rest-api.md`. Em `matriz-gui.md`, substituir por link.

### Dup #10 — Tasks FreeRTOS da Matriz

- `matriz.md`
- `firmware/matriz/overview.md`
- `architecture/matriz.md`

**Ação:** Manter `firmware/matriz/overview.md`. Substituir os outros por links.

### Dup #11 — Tasks FreeRTOS da Filial

- `filial.md`
- `firmware/filial/overview.md`
- `architecture/filial.md`

**Ação:** Manter `firmware/filial/overview.md`. Substituir os outros por links.

### Dup #12 — Mapeamento GPIO da Filial

- `config-build.md`
- `infrastructure/config.md` ✅ completo
- `firmware/filial/overview.md`

**Ação:** Manter `infrastructure/config.md`. Remover dos demais.

### Dup #13 — Conceito "Sensores vs Atuadores"

- `definicoes.md`
- `requisitos.md` §4.2
- `firmware/filial/overview.md`
- `protocol/udp.md`

**Ação:** Manter `definicoes.md`. Substituir os outros por links.

### Dup #14 — Detecção de Filial Offline

- `firmware/matriz/overview.md`
- `matriz-gui.md`
- `architecture/overview.md`

**Ação:** Manter `firmware/matriz/overview.md`. Substituir os outros por links.

### Dup #15 — Build Process (GUI React)

- `config-build.md`
- `devops/build-deploy.md`

**Ação:** Manter `devops/build-deploy.md`. Em `config-build.md`, substituir por link.

### Dup #16 — Timeout de 800ms

- `firmware/matriz/overview.md`
- `matriz-gui.md`
- `protocol/websocket.md`
- `architecture/overview.md`

**Ação:** Centralizar em `protocol/udp.md`. Substituir os outros por links.

### Dup #17 — mDNS Hostname

- `infrastructure/network.md` ✅ centralizado
- `infrastructure/wifi.md`
- `matriz-gui.md`

**Ação:** Manter `infrastructure/network.md`. Substituir os outros por links.

### Dup #18 — Endereços IP e Portas

- `infrastructure/network.md` ✅
- `config-build.md`
- `matriz.md`

**Ação:** Manter `infrastructure/network.md`. Substituir os outros por links.

### Dup #19 — Componentes do Sistema

- `intro.md`
- `definicoes.md`
- `fluxos.md`

**Ação:** Manter `definicoes.md` como referência. `intro.md` como resumo breve.
