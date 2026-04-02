---
title: Documentação — UDP IoT Monitoramento
description: Índice geral da documentação do sistema de monitoramento IoT por UDP e WebSocket
---

## Sobre o Projeto

Sistema de **monitoramento e controle remoto** de dispositivos IoT (luzes e ar-condicionado)
em múltiplas filiais, utilizando **ESP32**, **UDP**, **WebSocket** e uma **GUI React**.

## 🗺️ Arquitetura do Sistema

```mermaid
flowchart LR
    subgraph USU["👤 Usuário"]
        GUI["GUI React"]
    end

    subgraph MAT["🏢 Matriz ESP32"]
        WS["WebSocket :80"]
        UDP_TX["UDP Sender"]
        UDP_RX["UDP Receiver"]
    end

    subgraph FIL_A["🏬 Filial A"]
        UDP_SVR_A["UDP :51000"]
        DEV_A["💡 Dispositivos"]
    end

    subgraph FIL_B["🏬 Filial B"]
        UDP_SVR_B["UDP :51000"]
        DEV_B["💡 Dispositivos"]
    end

    subgraph FIL_C["🏬 Filial C"]
        UDP_SVR_C["UDP :51000"]
        DEV_C["💡 Dispositivos"]
    end

    GUI <-->|"ws://"| WS
    WS <--> UDP_TX
    WS <--> UDP_RX
    UDP_TX -->|"unicast"| UDP_SVR_A
    UDP_TX -->|"unicast"| UDP_SVR_B
    UDP_TX -->|"unicast"| UDP_SVR_C
    UDP_SVR_A --> DEV_A
    UDP_SVR_B --> DEV_B
    UDP_SVR_C --> DEV_C
    UDP_SVR_A -->|"response"| UDP_RX
    UDP_SVR_B -->|"response"| UDP_RX
    UDP_SVR_C -->|"response"| UDP_RX
```

---

## 📚 Índice da Documentação


### 🏗️ Arquitetura

| Documento                                                            | Descrição                                                                    |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [Visão Geral do Sistema](website/docs/architecture/overview.md)      | Diagrama geral GUI ↔ Matriz ↔ Filial, fluxo de dados e resumo dos protocolos |
| [Arquitetura da Matriz](website/website/docs/architecture/matriz.md) | Componentes internos: polling, bridge WebSocket, persistência e API REST     |
| [Arquitetura da Filial](website/website/docs/architecture/filial.md) | Componentes internos: servidor UDP, processamento de comandos e GPIO         |

### 📡 Protocolos

| Documento                                                 | Descrição                                                                          |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [Protocolo UDP](website/docs/protocol/udp.md)             | Especificação completa da comunicação Matriz ↔ Filial (JSON sobre UDP porta 51000) |
| [Protocolo WebSocket](website/docs/protocol/websocket.md) | Especificação da comunicação Matriz ↔ GUI (WebSocket porta 80)                     |

### 🔧 Firmware — Matriz

| Documento                                                                      | Descrição                                                                |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| [Firmware Matriz — Overview](website/docs/firmware/matriz/overview.md)         | Modelo de dados, polling, descoberta automática e detecção offline       |
| [Firmware Matriz — REST API](website/website/docs/firmware/matriz/rest-api.md) | Endpoints REST: Wi-Fi, filiais (CRUD), status, descoberta e GUI estática |

### 🔧 Firmware — Filial

| Documento                                                                      | Descrição                                                                  |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| [Firmware Filial — Overview](website/docs/firmware/filial/overview.md)         | Hierarquia de dispositivos, GPIO, processamento de comandos e autenticação |
| [Firmware Filial — REST API](website/website/docs/firmware/filial/rest-api.md) | Endpoints REST locais: Wi-Fi, configuração, dispositivos e captive portal  |

### 🖥️ GUI

| Documento                                                                  | Descrição                                                              |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [GUI — Matriz Dashboard](website/website/docs/gui/matriz-gui.md)           | Arquitetura React, WebSocket, visualização de dispositivos e histórico |
| [GUI — Componentes e Dependências](website/website/docs/gui/components.md) | shadcn/ui, Tailwind, ícones e estrutura visual da interface            |

### 🌐 Infraestrutura

| Documento                                                              | Descrição                                                                  |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [Wi-Fi e Provisionamento](website/website/docs/infrastructure/wifi.md) | Modos STA/AP, captive portal, mDNS e fluxo de provisionamento              |
| [Configuração](website/website/docs/infrastructure/config.md)          | Arquivos JSON em LittleFS: `config_wifi`, `config_matriz`, `config_filial` |
| [Rede](website/website/docs/infrastructure/network.md)                 | Topologia, portas, mDNS e endereçamento IP                                 |

### ⚙️ DevOps

| Documento                                                      | Descrição                                                                  |
| -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [Build e Deploy](website/docs/devops/build-deploy.md)          | Makefile, PlatformIO, pnpm/Vite, upload LittleFS e procedimentos de deploy |
| [Debug e Testes](website/website/docs/devops/debug-testing.md) | Serial monitor, logging, testes e ferramentas de troubleshooting           |

---

## 📂 Especificações Detalhadas

Estes documentos contêm especificações executáveis com maior profundidade técnica.

| Documento                                                  | Descrição                                      |
| ---------------------------------------------------------- | ---------------------------------------------- |
| [Matriz ESP32](website/docs/matriz.md)                     | Especificação completa do firmware da Matriz   |
| [GUI da Matriz](website/docs/matriz-gui.md)                | Especificação completa da interface web        |
| [Filial ESP32](website/docs/filial.md)                     | Especificação completa do firmware da Filial   |
| [Configuração, Rede e Build](website/docs/config-build.md) | Configuração de ambiente, rede, build e deploy |

---

## 🗂️ Mapa de Navegação

```mermaid
flowchart TD
    START["📖 README.md<br/><i>você está aqui</i>"] --> STEP1["1️⃣ Entenda o Problema"]
    START --> STEP2["2️⃣ Arquitetura"]
    START --> STEP3["3️⃣ Protocolos"]
    START --> STEP4["4️⃣ Firmware"]
    START --> STEP5["5️⃣ Deploy"]

    STEP1 --> DOC1["Solicitação do Cliente"]
    STEP1 --> DOC2["Especificação Técnica"]

    STEP2 --> DOC3["Visão Geral"]
    STEP2 --> DOC4["Arq. Matriz"]
    STEP2 --> DOC5["Arq. Filial"]

    STEP3 --> DOC6["Protocolo UDP"]
    STEP3 --> DOC7["Protocolo WebSocket"]

    STEP4 --> DOC8["Firmware Matriz"]
    STEP4 --> DOC9["Firmware Filial"]

    STEP5 --> DOC10["Build e Deploy"]
    STEP5 --> DOC11["Debug e Testes"]

    style START fill:#4f46e5,color:#fff,stroke:#3730a3
    style STEP1 fill:#0ea5e9,color:#fff,stroke:#0284c7
    style STEP2 fill:#0ea5e9,color:#fff,stroke:#0284c7
    style STEP3 fill:#0ea5e9,color:#fff,stroke:#0284c7
    style STEP4 fill:#0ea5e9,color:#fff,stroke:#0284c7
    style STEP5 fill:#0ea5e9,color:#fff,stroke:#0284c7
```
### 📋 Projeto e Requisitos

---


| Documento                                             | Descrição                                         |
| ----------------------------------------------------- | ------------------------------------------------- |
| [Solicitação do Cliente](website/docs/solicitacao.md) | Problema relatado e escopo original do projeto    |
| [Especificação Técnica](website/docs/requisitos.md)   | Requisitos funcionais e não-funcionais detalhados |
| [Definições Técnicas](website/docs/definicoes.md)     | Glossário, acrônimos e definições de domínio      |
| [Fluxos](website/docs/fluxos.md)                      | Fluxos de dados e comunicação do sistema          |

---


## 🚀 Como Começar

1. **Entenda o problema** —
   [Solicitação do Cliente](website/docs/solicitacao.md) ·
   [Especificação Técnica](website/docs/requisitos.md)
2. **Visão geral** —
   [Arquitetura — Visão Geral](website/docs/architecture/overview.md)
3. **Protocolos** —
   [UDP](website/docs/protocol/udp.md) ·
   [WebSocket](website/docs/protocol/websocket.md)
4. **Firmware** —
   [Matriz](website/docs/firmware/matriz/overview.md) ·
   [Filial](website/docs/firmware/filial/overview.md)
5. **Deploy** —
   [Build e Deploy](website/docs/devops/build-deploy.md)


