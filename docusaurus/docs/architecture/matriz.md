---
title: Arquitetura da Matriz ESP32
description: Arquitetura interna da Matriz — polling UDP, bridge WebSocket, persistência e API REST
---

# Arquitetura da Matriz

## Diagrama de Componentes

```mermaid
flowchart TB
    subgraph Scheduler["UDP Polling Scheduler"]
        TIMER[Timer (polling_interval)]
        TIMER --> CMD[Envia get_status]
    end

    subgraph Receiver["UDP Response Receiver"]
        UDP_R[porta 51000] --> NORM[Normaliza<br/>payload]
        NORM --> BRIDGE[WebSocket<br/>Bridge]
    end

    subgraph WS_SRV["WebSocket Server"]
        WS[AsyncWebSocket<br/>:80]
    end

    subgraph Storage["LittleFS"]
        CONFIG[config_matriz.json]
    end

    CMD -->|unicast| FILIAL[Filial]
    FILIAL -->|get_resp| UDP_R
    BRIDGE --> WS
    WS -->|broadcast| GUI[GUI Clients]
    CONFIG -.->|credenciais| CMD
```

## Visão Geral

A Matriz é o **hub centralizador** do sistema. Executa em um ESP32 e:

1. **Polling** periódico de todas as filiais via UDP (`get_status`)
2. **Descoberta** periódica de dispositivos via `list_req`
3. **Bridge** entre UDP (filiais) e WebSocket (GUI)
4. **Injeção** automática de credenciais (`user`/`pass`) nos comandos
5. **Detecção** de filiais offline (3 ciclos sem resposta)
6. **API REST** para configuração e CRUD de filiais
7. **Serve** GUI React via LittleFS

## Tasks FreeRTOS

| Task               | Prioridade | Stack | Função                          |
| ------------------ | ---------- | ----- | ------------------------------- |
| UDP Command Sender | Alta       | 4096  | Envia polling e comandos UDP    |
| UDP Response Rx    | Alta       | 4096  | Recebe e processa respostas     |
| HTTP Server        | Média      | 4096  | Serve REST + WebSocket porta 80 |

## Fluxo Operacional

1. **Boot** → inicializa LittleFS e módulos
2. **WiFi** → STA+AP (ou captive portal se sem config)
3. **Config** → carrega `config_matriz.json` com fallback
4. **Descoberta** → `list_req` para todas filiais
5. **Polling** → `get_status` em paralelo a cada `polling_interval`
6. **Controle** → `set_req` via WebSocket → injeta credenciais → UDP
7. **Broadcast** → `status_update` por filial por ciclo
8. **Offline** → 3 ciclos sem resposta → `online=false`

## Módulos

| Módulo               | Biblioteca     | Descrição                             |
| -------------------- | -------------- | ------------------------------------- |
| `UDPClient`          | WiFiUDP        | Envio de comandos UDP para filiais    |
| `UDPResponseHandler` | WiFiUDP        | Recepção e processamento de respostas |
| `FilialManager`      | —              | Gerencia estado das filiais           |
| `WebSocketBridge`    | AsyncWebSocket | Bridge UDP ↔ WebSocket                |
| `ConfigManager`      | LittleFS       | Persistência de configuração          |
| `WiFiManager`        | WiFi           | Conexão STA + AP                      |
| `CaptivePortal`      | AsyncWebServer | Provisionamento Wi-Fi                 |

> Especificação completa da Matriz: [Firmware → Matriz → Overview](../firmware/matriz/overview.md)
