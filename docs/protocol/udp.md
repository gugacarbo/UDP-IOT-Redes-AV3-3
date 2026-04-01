---
title: Protocolo UDP
description: Especificação do protocolo UDP para comunicação Matriz ↔ Filial
---

# Protocolo UDP

## Visão Geral

A comunicação entre Matriz e Filial usa **UDP unicast** na porta **51000** (padrão). Todos os payloads são JSON codificados em UTF-8.

| Aspecto   | Valor                   |
| --------- | ----------------------- |
| Protocolo | UDP unicast             |
| Porta     | 51000 (configurável)    |
| Encoding  | JSON UTF-8              |
| Timeout   | 800ms (configurável)    |
| Auth      | `user` + `pass` por cmd |

> **Regra**: A resposta é sempre enviada para o **IP:porta de origem** do datagrama recebido.

---

## Comandos

### `list_req` — Descoberta de Dispositivos

Solicita a lista de dispositivos disponíveis na filial.

**Requisição (Matriz → Filial)**

```json
{
  "cmd": "list_req",
  "user": "admin",
  "pass": "1234"
}
```

**Resposta (Filial → Matriz)**

```json
{
  "cmd": "list_resp",
  "filial_id": "FIL001",
  "code": "OK",
  "devices": [
    {
      "id": "luz_sala",
      "label": "Luz da Sala",
      "type": "light",
      "role": "sensor_actuator"
    },
    {
      "id": "ar_sala",
      "label": "Ar-condicionado da Sala",
      "type": "ac",
      "role": "sensor_actuator"
    }
  ]
}
```

---

### `get_status` — Leitura de Estado

Solicita o estado atual de todos os dispositivos da filial.

**Requisição (Matriz → Filial)**

```json
{
  "cmd": "get_status",
  "user": "admin",
  "pass": "1234"
}
```

**Resposta (Filial → Matriz)**

```json
{
  "cmd": "get_resp",
  "filial_id": "FIL001",
  "code": "OK",
  "devices": [
    {
      "id": "luz_sala",
      "label": "Luz da Sala",
      "type": "light",
      "role": "sensor_actuator",
      "value": 1,
      "status": "ok"
    },
    {
      "id": "ar_sala",
      "label": "Ar-condicionado da Sala",
      "type": "ac",
      "role": "sensor_actuator",
      "value": 720,
      "status": "ok"
    }
  ]
}
```

#### Códigos de Erro

| Code         | Descrição             |
| ------------ | --------------------- |
| `OK`         | Sucesso               |
| `AUTH_ERROR` | Falha na autenticação |
| `ERROR`      | Erro genérico         |

**Resposta de erro:**

```json
{
  "cmd": "get_resp",
  "filial_id": "FIL001",
  "code": "AUTH_ERROR"
}
```

---

### `set_req` — Controle de Dispositivo

Define o valor de um atuador na filial.

**Requisição (Matriz → Filial)**

```json
{
  "cmd": "set_req",
  "user": "admin",
  "pass": "1234",
  "filial_id": "FIL001",
  "device_id": "luz_sala",
  "value": 0
}
```

**Resposta (Filial → Matriz)**

```json
{
  "cmd": "set_resp",
  "filial_id": "FIL001",
  "device_id": "luz_sala",
  "code": "OK",
  "value": 0
}
```

#### Códigos de Erro

| Code         | Descrição                     |
| ------------ | ----------------------------- |
| `OK`         | Comando executado com sucesso |
| `AUTH_ERROR` | Falha na autenticação         |
| `NOT_FOUND`  | Dispositivo não encontrado    |
| `ERROR`      | Erro genérico                 |
| `TIMEOUT`    | Matriz: filial não respondeu  |

**Resposta de erro:**

```json
{
  "cmd": "set_resp",
  "filial_id": "FIL001",
  "device_id": "luz_sala",
  "code": "NOT_FOUND"
}
```

> **Nota**: O `TIMEOUT` é gerado pela **Matriz** quando a filial não responde em 800ms.

---

## Formato dos Valores

| Tipo     | `type`  | Range      | Unidade         |
| -------- | ------- | ---------- | --------------- |
| Luz      | `light` | `0` ou `1` | ON/OFF          |
| Ar-cond. | `ac`    | `0–1023`   | Intensidade PWM |

---

## Comportamento de Erro

| Condição                | Comportamento                          |
| ----------------------- | -------------------------------------- |
| JSON malformado         | Ignorado silenciosamente               |
| `user`/`pass` inválidos | Resposta com `code: AUTH_ERROR`        |
| `cmd` desconhecido      | Ignorado silenciosamente               |
| Filial sem resposta     | Matriz gera `code: TIMEOUT` após 800ms |
| 3 ciclos sem resposta   | Filial marcada como `online: false`    |
