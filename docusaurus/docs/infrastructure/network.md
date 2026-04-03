---
title: Infraestrutura — Rede
description: Portas, mDNS, endereçamento e topologia de rede do sistema
---

# Infraestrutura — Rede

## Topologia

Todos os dispositivos operam na **mesma rede Wi-Fi local** (LAN).

```
┌──────────────────────────────────────────────────┐
│                Rede Wi-Fi Local                   │
│                                                   │
│  ┌──────────┐      ┌──────────┐      ┌─────────┐ │
│  │ Matriz   │      │ Filial 1 │      │ Filial 2│ │
│  │ ESP32    │◄────►│ ESP32    │      │ ESP32   │ │
│  │ + GUI    │ UDP  │ :51000   │      │ :51000  │ │
│  │ :80      │      └──────────┘      └─────────┘ │
│  │ :51000   │                                   │
│  └────▲─────┘                                   │
│       │ WS                                       │
│  ┌────┴─────┐                                   │
│  │ Browser  │                                   │
│  │ (GUI)    │                                   │
│  └──────────┘                                   │
└──────────────────────────────────────────────────┘
```

---

## Portas

| Porta | Protocolo | Origem    | Destino | Descrição               |
| ----- | --------- | --------- | ------- | ----------------------- |
| 80    | HTTP      | Navegador | Matriz  | GUI estática + REST API |
| 80    | WebSocket | Navegador | Matriz  | Atualizações real-time  |
| 80    | HTTP      | Navegador | Filial  | Portal local + REST API |
| 51000 | UDP       | Matriz    | Filial  | Comandos IoT            |
| 51000 | UDP       | Filial    | Matriz  | Respostas IoT           |

> **Nota**: A porta UDP (51000) deve ser a **mesma** em ambos os dispositivos, configurável em `config_matriz.json` e `config_filial.json`.

---

## mDNS

### Matriz

| Parâmetro     | Valor                  |
| ------------- | ---------------------- |
| Hostname      | `matriz.local`         |
| Serviço       | `_http._tcp`           |
| Porta         | `80`                   |
| WebSocket URL | `ws://matriz.local/ws` |

### Filial (opcional)

| Parâmetro | Valor               |
| --------- | ------------------- |
| Hostname  | `filial-<id>.local` |
| Serviço   | `_http._tcp`        |
| Porta     | `80`                |

---

## Endereçamento IP

| Componente | Modo | IP                             |
| ---------- | ---- | ------------------------------ |
| Matriz     | STA  | DHCP (ex: `192.168.1.100`)     |
| Filial     | STA  | DHCP (configurado por IP fixo) |
| Matriz     | AP   | `192.168.4.1`                  |
| Filial     | AP   | `192.168.4.1`                  |

> **Importante**: As filiais devem ter **IP fixo** na rede local para que a Matriz possa se comunicar via UDP unicast. O IP é configurado em `config_matriz.json`.

---

## Comunicação

### UDP (Matriz ↔ Filial)

:::important[Mesma porta em ambos os lados]
**Ambas devem usar a mesma porta UDP (padrão 51000).** A porta configurada na Matriz deve ser idêntica à porta configurada na Filial para que a comunicação funcione.
:::

| Aspecto        | Valor                                               |
| -------------- | --------------------------------------------------- |
| Tipo           | Unicast                                             |
| Porta origem   | Aleatória                                           |
| Porta destino  | 51000 (configurável) — **mesma em Matriz e Filial** |
| Protocolo      | UDP sobre IP                                        |
| Tamanho máximo | 1472 bytes (MTU safe)                               |
| Timeout        | 800ms (configurável)                                |

### WebSocket (Matriz ↔ GUI)

| Aspecto        | Valor                  |
| -------------- | ---------------------- |
| URL            | `ws://matriz.local/ws` |
| Protocolo      | WebSocket (RFC 6455)   |
| Direction      | Bidirecional           |
| Auto-reconnect | 5 segundos             |

### HTTP REST (Matriz/Filial ↔ Navegador)

| Aspecto      | Valor                 |
| ------------ | --------------------- |
| Porta        | 80                    |
| Content-Type | `application/json`    |
| CORS         | Aberto (mesma origem) |

---

## Configuração de Rede Recomendada

| Parâmetro        | Valor recomendado     |
| ---------------- | --------------------- |
| Reserva DHCP     | IP fixo por MAC       |
| Canal Wi-Fi      | 2.4 GHz (ESP32)       |
| Segmento de rede | `/24` (255.255.255.0) |
| DNS              | mDNS + gateway padrão |
