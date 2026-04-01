---
title: Firmware Matriz — REST API
description: Endpoints REST da Matriz ESP32 para configuração e CRUD de filiais
---

# Firmware Matriz — REST API

## Visão Geral

A Matriz expõe uma API REST na porta **80** para configuração, CRUD de filiais e diagnóstico.

| Aspecto      | Valor              |
| ------------ | ------------------ |
| Porta        | 80                 |
| Content-Type | `application/json` |
| Biblioteca   | AsyncWebServer     |

---

## Configuração Wi-Fi

### `GET /api/wifi`

Retorna a configuração Wi-Fi atual.

**Response 200:**

```json
{
    "ssid": "MinhaRede",
    "pass": "senha123"
}
```

### `POST /api/wifi`

Atualiza a configuração Wi-Fi. Reinicia o ESP32 em modo STA.

**Request:**

```json
{
    "ssid": "NovaRede",
    "pass": "novaSenha"
}
```

**Response 200:**

```json
{
    "status": "ok",
    "message": "Wi-Fi atualizado. Reiniciando..."
}
```

---

## Gerenciamento de Filiais

### `GET /api/filiais`

Lista todas as filiais com seu estado atual.

**Response 200:**

```json
[
    {
        "filial_id": "FIL001",
        "label": "Filial Centro",
        "ip": "192.168.1.101",
        "port": 51000,
        "user": "admin",
        "pass": "1234",
        "online": true,
        "devices": [
            {
                "id": "luz_sala",
                "label": "Luz da Sala",
                "type": "light",
                "role": "sensor_actuator",
                "value": 1,
                "status": "ok"
            }
        ]
    }
]
```

### `POST /api/filiais`

Adiciona uma nova filial.

**Request:**

```json
{
    "filial_id": "FIL002",
    "label": "Filial Norte",
    "ip": "192.168.1.102",
    "port": 51000,
    "user": "admin",
    "pass": "5678"
}
```

**Response 201:**

```json
{
    "status": "ok",
    "message": "Filial adicionada"
}
```

**Response 400 (limite atingido):**

```json
{
    "status": "error",
    "message": "Limite de filiais atingido (max: 10)"
}
```

### `PUT /api/filiais/:id`

Atualiza os dados de uma filial existente.

**Request:**

```json
{
    "label": "Filial Centro - Atualizada",
    "ip": "192.168.1.201",
    "user": "admin",
    "pass": "novaSenha"
}
```

**Response 200:**

```json
{
    "status": "ok",
    "message": "Filial atualizada"
}
```

**Response 404:**

```json
{
    "status": "error",
    "message": "Filial não encontrada"
}
```

### `DELETE /api/filiais/:id`

Remove uma filial da configuração.

**Response 200:**

```json
{
    "status": "ok",
    "message": "Filial removida"
}
```

**Response 404:**

```json
{
    "status": "error",
    "message": "Filial não encontrada"
}
```

---

## Diagnóstico

### `GET /api/status`

Retorna o status geral do sistema.

**Response 200:**

```json
{
    "wifi_ssid": "MinhaRede",
    "wifi_rssi": -45,
    "ip": "192.168.1.100",
    "uptime_ms": 345678,
    "free_heap": 45000,
    "filiais_online": 2,
    "filiais_total": 3,
    "polling_interval": 30000
}
```

### `POST /api/discover`

Força uma nova descoberta de dispositivos em todas as filiais.

**Response 200:**

```json
{
    "status": "ok",
    "message": "Descoberta iniciada"
}
```

---

## Servir GUI

### `GET /` (e subpaths)

Serve os arquivos estáticos da GUI React a partir do LittleFS (`data/`).

| Rota        | Arquivo         |
| ----------- | --------------- |
| `/`         | `index.html`    |
| `/assets/*` | Arquivos JS/CSS |

> **Fallback**: Qualquer rota não encontrada retorna `index.html` (SPA routing).
