---
title: Documentação — UDP IoT Monitoramento
description: Índice geral da documentação do sistema de monitoramento IoT por UDP e WebSocket
---

# Documentação — UDP IoT Monitoramento

Sistema de monitoramento e controle remoto de dispositivos IoT (luzes e ar-condicionado) em múltiplas filiais, utilizando ESP32, UDP, WebSocket e uma GUI React.

## Estrutura da Documentação

### Projeto e Requisitos

| Documento                                   | Descrição                                         |
| ------------------------------------------- | ------------------------------------------------- |
| [Solicitação do Cliente](00-solicitação.md) | Problema relatado e escopo original do projeto    |
| [Especificação Técnica](01-requisitos.md)   | Requisitos funcionais e não-funcionais detalhados |
| [Definições Técnicas](02-definições.md)     | Glossário, acrônimos e definições de domínio      |

### Arquitetura

| Documento                                          | Descrição                                                                    |
| -------------------------------------------------- | ---------------------------------------------------------------------------- |
| [Visão Geral do Sistema](architecture/overview.md) | Diagrama geral GUI ↔ Matriz ↔ Filial, fluxo de dados e resumo dos protocolos |
| [Arquitetura da Matriz](architecture/matriz.md)    | Componentes internos: polling, bridge WebSocket, persistência e API REST     |
| [Arquitetura da Filial](architecture/filial.md)    | Componentes internos: servidor UDP, processamento de comandos e GPIO         |

### Protocolos

| Documento                                    | Descrição                                                                          |
| -------------------------------------------- | ---------------------------------------------------------------------------------- |
| [Protocolo UDP](protocol/udp.md)             | Especificação completa da comunicação Matriz ↔ Filial (JSON sobre UDP porta 51000) |
| [Protocolo WebSocket](protocol/websocket.md) | Especificação da comunicação Matriz ↔ GUI (WebSocket porta 80)                     |

### Firmware — Matriz

| Documento                                                 | Descrição                                                                |
| --------------------------------------------------------- | ------------------------------------------------------------------------ |
| [Firmware Matriz — Overview](firmware/matriz/overview.md) | Modelo de dados, polling, descoberta automática e detecção offline       |
| [Firmware Matriz — REST API](firmware/matriz/rest-api.md) | Endpoints REST: Wi-Fi, filiais (CRUD), status, descoberta e GUI estática |

### Firmware — Filial

| Documento                                                 | Descrição                                                                  |
| --------------------------------------------------------- | -------------------------------------------------------------------------- |
| [Firmware Filial — Overview](firmware/filial/overview.md) | Hierarquia de dispositivos, GPIO, processamento de comandos e autenticação |
| [Firmware Filial — REST API](firmware/filial/rest-api.md) | Endpoints REST locais: Wi-Fi, configuração, dispositivos e captive portal  |

### GUI

| Documento                                             | Descrição                                                              |
| ----------------------------------------------------- | ---------------------------------------------------------------------- |
| [GUI — Matriz Dashboard](gui/matriz-gui.md)           | Arquitetura React, WebSocket, visualização de dispositivos e histórico |
| [GUI — Componentes e Dependências](gui/components.md) | shadcn/ui, Tailwind, ícones e estrutura visual da interface            |

### Infraestrutura

| Documento                                         | Descrição                                                                  |
| ------------------------------------------------- | -------------------------------------------------------------------------- |
| [Wi-Fi e Provisionamento](infrastructure/wifi.md) | Modos STA/AP, captive portal, mDNS e fluxo de provisionamento              |
| [Configuração](infrastructure/config.md)          | Arquivos JSON em LittleFS: `config_wifi`, `config_matriz`, `config_filial` |
| [Rede](infrastructure/network.md)                 | Topologia, portas, mDNS e endereçamento IP                                 |

### DevOps

| Documento                                 | Descrição                                                                  |
| ----------------------------------------- | -------------------------------------------------------------------------- |
| [Build e Deploy](devops/build-deploy.md)  | Makefile, PlatformIO, pnpm/Vite, upload LittleFS e procedimentos de deploy |
| [Debug e Testes](devops/debug-testing.md) | Serial monitor, logging, testes e ferramentas de troubleshooting           |

---

## Diagrama de Navegação Rápida

```
                    ┌─────────────────────────┐
                    │     docs/README.md       │
                    │   (este arquivo)         │
                    └────────────┬─────────────┘
                                 │
          ┌──────────┬───────────┼───────────┬──────────────┐
          ▼          ▼           ▼           ▼              ▼
   ┌──────────┐ ┌─────────┐ ┌────────┐ ┌──────────┐ ┌───────────┐
   │ Projeto  │ │Arquite- │ │Proto-  │ │ Firmware │ │   GUI     │
   │ 00-02    │ │  tura   │ │ colos  │ │ Mat/Fil  │ │ Dashboard │
   └──────────┘ └─────────┘ └────────┘ └──────────┘ └───────────┘
          │                                        │
          ▼                                        ▼
   ┌──────────────┐                     ┌──────────────────┐
   │Infraestrutura│                     │     DevOps       │
   │WiFi/Config/  │                     │ Build / Debug    │
   │Rede          │                     │                  │
   └──────────────┘                     └──────────────────┘
```

## Como Começar

1. **Entenda o problema**: leia a [Solicitação do Cliente](00-solicitação.md) e a [Especificação Técnica](01-requisitos.md)
2. **Visão geral**: leia [Arquitetura — Visão Geral](architecture/overview.md)
3. **Protocolos**: consulte [UDP](protocol/udp.md) e [WebSocket](protocol/websocket.md)
4. **Firmware**: veja os overviews de [Matriz](firmware/matriz/overview.md) e [Filial](firmware/filial/overview.md)
5. **Deploy**: siga o guia de [Build e Deploy](devops/build-deploy.md)
