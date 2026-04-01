---
title: Arquitetura da Filial ESP32
description: Arquitetura interna da Filial — servidor UDP, processamento de comandos e GPIO
---

# Arquitetura da Filial

## Diagrama de Componentes

```mermaid
flowchart TB
    UDP[UDPServer<br/>porta 51000] --> PARSE[Parse JSON]
    PARSE --> AUTH[Valida<br/>user/pass]
    AUTH --> DISPATCH[Command<br/>Dispatcher]

    DISPATCH -->|list_req| LIST[handleList]
    DISPATCH -->|get_status| STATUS[handleGetStatus]
    DISPATCH -->|set_req| SET[handleSet]

    LIST --> DM[DeviceManager]
    STATUS --> DM
    SET --> DM

    DM --> SENS[Sensor]
    DM --> ACT[Actuator]

    SENS -->|light| GPIO_D[GPIO digital<br/>HIGH/LOW]
    SENS -->|ac| GPIO_A[GPIO ADC<br/>0-1023]
    ACT -->|light| GPIO_D
    ACT -->|ac| GPIO_PWM[GPIO PWM<br/>0-1023]

    DM -.->|config| LFS[LittleFS<br/>config_filial.json]
```

## Visão Geral

A Filial é o **servidor UDP** do sistema. Cada filial executa um ESP32 independente que:

1. **Escuta** comandos UDP na porta configurada (padrão 51000)
2. **Valida** autenticação (`user`/`pass`) em cada comando
3. **Despacha** para o handler adequado (`list_req`, `get_status`, `set_req`)
4. **Responde** para o IP:porta de origem do comando
5. **Serve** portal HTTP local na porta 80 para configuração e diagnóstico

## Tasks FreeRTOS

| Task        | Prioridade | Stack | Função                         |
| ----------- | ---------- | ----- | ------------------------------ |
| UDP Server  | Alta (2)   | 4096  | Recebe e processa comandos UDP |
| HTTP Server | Média (1)  | 4096  | Serve REST API na porta 80     |

## Fluxo de Processamento

```mermaid
flowchart LR
    A[UDP Datagram] --> B[Parse JSON]
    B --> C{JSON válido?}
    C -->|Não| D[Ignora silenciosamente]
    C -->|Sim| E[Valida user/pass]
    E -->|Falha| D
    E -->|OK| F[Dispatch por cmd]
    F -->|list_req| G[handleList]
    F -->|get_status| H[handleGetStatus]
    F -->|set_req| I[handleSet]
    G --> J[Envia resposta<br/>para IP:porta de origem]
    H --> J
    I --> J
```

## Módulos

| Módulo           | Biblioteca     | Descrição                           |
| ---------------- | -------------- | ----------------------------------- |
| `UDPServer`      | WiFiUDP        | Servidor UDP na porta configurada   |
| `CommandHandler` | ArduinoJson    | Parse e dispatch de comandos        |
| `DeviceManager`  | —              | Gerencia sensores e atuadores       |
| `Device`         | —              | Classe base para sensores/atuadores |
| `ConfigManager`  | LittleFS       | Persistência de configuração        |
| `WiFiManager`    | WiFi           | Conexão STA + AP                    |
| `CaptivePortal`  | AsyncWebServer | Provisionamento Wi-Fi               |

> Especificação completa da Filial: [Firmware → Filial → Overview](../firmware/filial/overview.md)
