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

## Configuração da Filial

### `GET /api/config`

Retorna a configuração completa da filial.

**Response 200:**

```json
{
    "filial_id": "FIL001",
    "label": "Filial Centro",
    "port": 51000,
    "user": "admin",
    "pass": "1234",
    "devices": [
        {
            "id": "luz_sala",
            "label": "Luz da Sala",
            "type": "light",
            "role": "sensor_actuator",
            "gpio_read": 23,
            "gpio_write": 22
        }
    ]
}
```

### `PUT /api/config`

Atualiza a configuração da filial (sem alterar dispositivos).

**Request:**

```json
{
    "label": "Filial Centro - Atualizada",
    "user": "novoUser",
    "pass": "novaSenha"
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
    {
        "id": "luz_sala",
        "label": "Luz da Sala",
        "type": "light",
        "role": "sensor_actuator",
        "value": 1,
        "status": "ok",
        "gpio_read": 23,
        "gpio_write": 22
    }
]
```

### `POST /api/devices`

Adiciona um novo dispositivo à filial.

**Request:**

```json
{
    "id": "luz_quarto",
    "label": "Luz do Quarto",
    "type": "light",
    "role": "sensor_actuator",
    "gpio_read": 5,
    "gpio_write": 18
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
    "label": "Luz do Quarto - Renomeada",
    "gpio_read": 19,
    "gpio_write": 21
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
    "filial_id": "FIL001",
    "wifi_ssid": "MinhaRede",
    "wifi_rssi": -52,
    "ip": "192.168.1.101",
    "uptime_ms": 123456,
    "free_heap": 52000,
    "devices_count": 2,
    "udp_port": 51000
}
```

---

## Portal de Provisionamento

### `GET /` (modo AP)

Quando o ESP32 está em modo AP (sem configuração Wi-Fi), serve um **captive portal** para configuração inicial.

| Rota      | Descrição                          |
| --------- | ---------------------------------- |
| `/`       | Portal de configuração Wi-Fi       |
| `/save`   | Salva credenciais Wi-Fi e reinicia |
| `/status` | Status da conexão                  |

> **Detecção**: Ao bootar sem `config_wifi.json` válido, entra automaticamente em modo AP.
