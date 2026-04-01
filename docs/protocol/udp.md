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
  "pass": "admin"
}
```

**Resposta (Filial → Matriz)**

```json
{
  "cmd": "list_resp",
  "id": ["actuator_light_sala", "sensor_light_sala", "actuator_ac_escritorio"]
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
  "pass": "admin"
}
```

**Resposta (Filial → Matriz)**

```json
{
  "cmd": "get_resp",
  "actuator_light_sala": true,
  "sensor_light_sala": false,
  "actuator_ac_escritorio": 720
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
  "pass": "admin",
  "id": "actuator_light_sala",
  "value": true
}
```

**Resposta (Filial → Matriz)**

```json
{
  "cmd": "set_resp",
  "id": "actuator_light_sala",
  "value": true
}
```

**Exemplo com Ar-condicionado (0–1023):**

```json
{
  "cmd": "set_req",
  "user": "admin",
  "pass": "admin",
  "id": "actuator_ac_escritorio",
  "value": 70
}
```

**Resposta:**

```json
{
  "cmd": "set_resp",
  "id": "actuator_ac_escritorio",
  "value": 70
}
```

---

## Formato dos Valores

| Tipo     | `type`  | Range          | Unidade         |
| -------- | ------- | -------------- | --------------- |
| Luz      | `light` | `true`/`false` | ON/OFF          |
| Ar-cond. | `ac`    | `0–1023`       | Intensidade PWM |

---

## Comportamento de Erro

| Condição                | Comportamento                          |
| ----------------------- | -------------------------------------- |
| JSON malformado         | Ignorado silenciosamente               |
| `user`/`pass` inválidos | Ignorado silenciosamente               |
| `cmd` desconhecido      | Ignorado silenciosamente               |
| Filial sem resposta     | Matriz gera `code: TIMEOUT` após 800ms |
| 3 ciclos sem resposta   | Filial marcada como `online: false`    |
