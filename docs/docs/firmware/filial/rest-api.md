---
title: Firmware Filial — REST API
description: Endpoints REST locais da Filial ESP32 para configuração e diagnóstico
---

# Firmware Filial — REST API

## Visão Geral

A Filial expõe uma API REST local na porta **80** para configuração, diagnóstico e gerenciamento de dispositivos.

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
    "mode": "sta",
    "ssid": "MinhaRede",
    "password": "senha123",
    "ap_ssid": "ESP32-192.168.1.101-Setup",
    "ap_password": "12345678"
}
```

### `POST /api/wifi`

Atualiza a configuração Wi-Fi. Reinicia o ESP32 em modo STA.

**Request:**

```json
{
    "ssid": "NovaRede",
    "password": "novaSenha"
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

## Configuração da Filial

### `GET /api/config`

Retorna a configuração completa da filial.

**Response 200:**

```json
{
    "port": 51000,
    "admin_user": "admin",
    "admin_pass": "admin",
    "devices": [
        { "id": "actuator_light_sala", "pin": 22 },
        { "id": "sensor_light_sala", "pin": 23 }
    ]
}
```

### `PUT /api/config`

Atualiza a configuração da filial (sem alterar dispositivos).

**Request:**

```json
{
    "admin_user": "novoUser",
    "admin_pass": "novaSenha"
}
```

**Response 200:**

```json
{
    "status": "ok",
    "message": "Configuração atualizada"
}
```

---

## Gerenciamento de Dispositivos

### `GET /api/devices`

Lista todos os dispositivos com seus estados atuais.

**Response 200:**

```json
[
    { "id": "actuator_light_sala", "pin": 22, "value": 1 },
    { "id": "sensor_light_sala", "pin": 23, "value": 1 }
]
```

### `POST /api/devices`

Adiciona um novo dispositivo à filial.

**Request:**

```json
{
    "id": "actuator_light_quarto",
    "pin": 18
}
```

**Response 201:**

```json
{
    "status": "ok",
    "message": "Dispositivo adicionado"
}
```

### `PUT /api/devices/:id`

Atualiza a configuração de um dispositivo.

**Request:**

```json
{
    "pin": 21
}
```

**Response 200:**

```json
{
    "status": "ok",
    "message": "Dispositivo atualizado"
}
```

### `DELETE /api/devices/:id`

Remove um dispositivo da filial.

**Response 200:**

```json
{
    "status": "ok",
    "message": "Dispositivo removido"
}
```

---

## Diagnóstico

### `GET /api/status`

Retorna o status da filial.

**Response 200:**

```json
{
    "wifi_ssid": "MinhaRede",
    "wifi_rssi": -52,
    "ip": "192.168.1.101",
    "uptime_ms": 123456,
    "free_heap": 52000,
    "devices_count": 2,
    "udp_port": 51000
}
```
