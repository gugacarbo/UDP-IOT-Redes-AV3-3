---
title: GUI da Matriz
description: Especificação da interface web da Matriz — dashboard React, WebSocket, mDNS e sincronização de estado
---

<!-- markdownlint-disable-file MD013 MD022 MD031 MD032 MD047 -->

## 1. Visão geral

**Objetivo:** especificar o comportamento da GUI da Matriz, incluindo descoberta do dispositivo, bridge WebSocket,
broadcast de estado e confirmação de comandos.

**Escopo:**
- Dashboard React servido pela Matriz
- Controle e monitoramento em tempo real via WebSocket
- Descoberta mDNS e fallback manual de IP
- Consumo da API REST para configuração e manutenção

## 2. Arquitetura da interface

- Frontend em React + Vite
- Estado global para filiais, seleção e feedback de comando
- Atualizações em tempo real vindas do WebSocket da Matriz
- Consumo das rotas REST para CRUD de configuração e filiais

## 3. WebSocket bridge

### 3.1 Entrada: GUI → Matriz

A GUI envia `set_req` via WebSocket. Validações obrigatórias:

| Regra              | Descrição                                          |
| ------------------ | -------------------------------------------------- |
| `cmd`              | Deve ser `set_req`                                 |
| `filial_ip`        | IPv4 válido                                        |
| `filial_port`      | `1`–`65535`                                        |
| `filial_ip:port`   | Deve corresponder a filial cadastrada              |
| `id`               | Não vazio, prefixo `actuator_` (sensor_ rejeitado) |
| `actuator_light_*` | `value` booleano                                   |
| `actuator_ac_*`    | `value` inteiro `0–100`                            |

**Injeção de credenciais:** a bridge injeta `user` e `pass` do `config_matriz.json` automaticamente.

**Erro `UNKNOWN_FILIAL`:** retornado quando `filial_ip:port` não estiver cadastrada.

### 3.2 Saída: Matriz → GUI

A Matriz envia uma mensagem `status_update` por filial a cada ciclo de polling.

```json
{
  "cmd": "status_update",
  "name": "Filial Centro",
  "ip": "192.168.1.100",
  "port": 51000,
  "online": true,
  "devices": {
    "actuator_light_sala": true,
    "sensor_light_sala": false,
    "actuator_ac_escritorio": 72,
    "sensor_ac_escritorio": 45
  }
}
```

- Todas as filiais são incluídas, inclusive offline
- Quando offline, `online` vira `false` e a GUI mantém o último estado conhecido

### 3.3 Confirmação de comando

Sucesso:

```json
{
  "cmd": "set_resp",
  "name": "...",
  "ip": "...",
  "port": 51000,
  "id": "actuator_light_sala",
  "value": true,
  "ok": true
}
```

Falha:

```json
{
  "cmd": "set_resp",
  "id": "...",
  "value": true,
  "ok": false,
  "error": "TIMEOUT"
}
```

```json
{
  "cmd": "set_resp",
  "id": "...",
  "value": true,
  "ok": false,
  "error": "UNKNOWN_FILIAL"
}
```

- `set_resp` confirmado vence temporariamente até o próximo `status_update`

### 3.4 Robustez

- `ping`/`pong` a cada 15s
- Timeout de 30s sem `pong`
- Fila máxima de 20 mensagens por cliente; ao exceder, a conexão é encerrada

## 4. Descoberta mDNS

- Serviço `_http._tcp` com nome `esp32-matriz`
- Domínio `local`
- A GUI tenta resolver o host antes de conectar
- Se a descoberta falhar, o usuário informa o IP manualmente
- O WebSocket usa `ws://<ip_matriz>:80`

## 5. Estado da interface

- Filiais offline continuam visíveis
- O último estado conhecido permanece exibido até nova atualização
- Uma confirmação de comando pode sobrescrever temporariamente a visualização até o próximo ciclo

## 6. Integração com a API REST

A GUI consome as rotas da Matriz para configuração e manutenção:

- `GET /api/config`
- `PUT /api/config`
- `GET /api/filiais`
- `POST /api/filiais`
- `PUT /api/filiais/:id`
- `DELETE /api/filiais/:id`
- `PUT /api/wifi`

Os detalhes de validação, persistência e códigos de erro dessas rotas estão em [04-matriz.md](04-matriz.md).
