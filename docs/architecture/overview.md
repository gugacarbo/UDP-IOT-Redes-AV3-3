---
title: Arquitetura do Sistema — Visão Geral
description: Visão geral da arquitetura do sistema de monitoramento IoT por UDP e WebSocket
---

# Arquitetura do Sistema

## Visão Geral

O sistema é composto por três camadas principais: **GUI React** (navegador), **Matriz ESP32** (hub centralizador) e **Filiais ESP32** (dispositivos locais).

```mermaid
flowchart TB
    subgraph GUI["GUI React"]
        WS[WebSocket Client]
    end

    subgraph MATRIZ["Matriz ESP32"]
        WS_SRV[AsyncWebSocket<br/>:80]
        UDP_SENDER[UDP Command<br/>Sender]
        UDP_RECV[UDP Response<br/>Receiver]
        BRIDGE[WebSocket<br/>Bridge]
        LFS_MATRIZ[LittleFS<br/>config_matriz.json]
    end

    subgraph FILIAL["Filial ESP32"]
        UDP_SRV[UDPServer<br/>:51000]
        HANDLER[Command<br/>Handler]
        DEV_MGR[DeviceManager]
        LFS_FILIAL[LittleFS<br/>config_filial.json]

        subgraph DEVICES["Dispositivos"]
            SENS[Sensor]
            ACT[Actuator]
        end
    end

    WS <--> WS_SRV
    WS_SRV <--> BRIDGE
    BRIDGE <--> UDP_SENDER
    BRIDGE <--> UDP_RECV
    UDP_SENDER <-->|unicast| UDP_SRV
    UDP_RECV <--|unicast| UDP_SRV
    UDP_SRV --> HANDLER
    HANDLER --> DEV_MGR
    DEV_MGR --> DEVICES
    LFS_FILIAL -.-> DEV_MGR
    LFS_MATRIZ -.-> BRIDGE
```

## Fluxo de Dados

O diagrama abaixo mostra a interação completa entre usuário, GUI, WebSocket, Matriz e Filiais:

```mermaid
sequenceDiagram
    participant U as Usuário
    participant G as GUI
    participant WS as WebSocket
    participant M as Matriz
    participant F as Filial

    Note over M: Polling automático 30s (paralelo)

    M->>F: get_status (unicast)
    F->>M: get_resp (unicast :51000)
    M->>WS: status_update (per-filial)
    WS->>G: status_update

    U->>G: Toggle dispositivo
    G->>WS: set_req
    WS->>M: set_req
    M->>F: set_req (unicast)
    F->>M: set_resp (unicast :51000)
    M->>WS: set_resp (per-filial)
    WS->>G: set_resp

    Note over M,F: Timeout 800ms → set_resp com code: TIMEOUT
```

## Entidades do Sistema

| Entidade   | Papel     | Responsabilidade                                    |
| ---------- | --------- | --------------------------------------------------- |
| **Matriz** | Cliente   | Gerencia e controla filiais, serve GUI via HTTP/WS  |
| **Filial** | Servidor  | Expõe dispositivos via UDP, serve portal local HTTP |
| **GUI**    | Dashboard | Interface React para monitoramento e controle       |

## Protocolos

| Protocolo | Uso                        | Porta | Direção             |
| --------- | -------------------------- | ----- | ------------------- |
| UDP       | Comandos e respostas IoT   | 51000 | Matriz ↔ Filial     |
| WebSocket | Atualizações em tempo real | 80    | Matriz ↔ Navegador  |
| HTTP REST | Configuração e CRUD        | 80    | Matriz/Filial ↔ Nav |

> Veja detalhes em:
> - [Arquitetura da Matriz](matriz.md)
> - [Arquitetura da Filial](filial.md)
> - [Protocolo UDP](../protocol/udp.md)
> - [Protocolo WebSocket](../protocol/websocket.md)
