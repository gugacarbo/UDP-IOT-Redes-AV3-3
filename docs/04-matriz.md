---
title: Matriz ESP32
description: Especificação executável da Matriz ESP32 — inicialização, polling UDP, persistência e API REST
---

<!-- markdownlint-disable-file MD013 MD022 MD031 MD032 MD047 -->

## 1. Visão geral

**Objetivo:** Especificação executável para Matriz ESP32 — polling UDP, persistência e API REST.

**Escopo:**
- Controlar/monitorar filiais via UDP unicast
- Servir GUI via HTTP porta 80
- Persistir configuração no LittleFS
- Detectar filial offline por ciclos perdidos

### 1.3 Estrutura do projeto

```text
matriz-esp32/
├── platformio.ini
├── data/
│   ├── config_matriz.json         # Criado no primeiro salvamento
│   └── config_wifi.json           # Persistido após provisionamento
├── include/
│   └── README
├── src/
│   └── main.cpp
├── lib/
│   ├── ConfigManager/
│   ├── UDPClient/
│   ├── UDPResponseHandler/
│   ├── FilialManager/
│   ├── WebSocketBridge/
│   ├── CaptivePortal/
│   └── WiFiManager/
└── test/
    └── README
```

## 2. Modelo de dados

### 2.1 Estruturas de dados

```cpp
struct FilialConfig {
    String ip;
    uint16_t port;
    String name;
};

struct FilialState {
    uint32_t lastSeen;
    bool online;
    uint32_t missedCycles;              // uint32_t evita overflow em longos períodos offline
    std::map<String, JsonVariant> devices; // último get_resp (id → valor); bool ou int
    std::vector<String> id;              // último list_resp
};
```

**Estratégia de atualização:** `list_resp` e `get_resp` substituem completamente o estado anterior. Filiais offline mantêm o último estado conhecido.

### 2.2 Configuração persistida (`config_matriz.json`)

```json
{
  "user": "admin",
  "pass": "admin",
  "polling_interval": 30,
  "discovery_every_cycles": 10,
  "filiais": [
    { "name": "Filial BH", "ip": "10.0.0.1", "port": 51000 },
    { "name": "Filial SP", "ip": "10.0.0.2", "port": 51000 }
  ]
}
```

**Validações obrigatórias ao carregar:**
- `user` e `pass`: string não vazia
- `polling_interval`: inteiro `>= 5` e `<= 120` (valores fora do range são automaticamente ajustados para o limite mais próximo, com log de warning)
- `discovery_every_cycles`: inteiro `>= 1`
- `filiais`: array de objetos com `name`, `ip`, `port` válidos
- `filiais`: chave composta `ip:port` deve ser única

### 2.3 Fallback de configuração

Quando `config_matriz.json` não existir ou estiver inválido:
1. `user="admin"`, `pass="admin"`
2. `filiais` como array vazio
3. `polling_interval=30`, `discovery_every_cycles=10`
4. Expor API REST para provisioning
5. Persistir após primeiro `PUT /api/config` válido

## 3. Runtime e rede

**Modo de rede:** `STA` (conecta à rede) + `AP` (interface local). HTTP/WebSocket ativos mesmo sem STA.

### 3.2 Fallback WiFi e Modo AP

Quando `config_wifi.json` não existir ou estiver inválido:
1. Ativa **AP** com SSID `ESP32-MATRIZ` + **Captive Portal** na porta 80
2. Serve formulário HTML de provisionamento Wi-Fi
3. Após `PUT /api/wifi` válido, persiste `config_wifi.json` e reinicia
4. Boot seguinte: se `config_wifi.json` válido → modo **STA+AP**

### 3.3 Tasks FreeRTOS

| Task               | Prioridade | Stack | Função                          |
| ------------------ | ---------- | ----- | ------------------------------- |
| UDP Command Sender | Alta       | 4096  | Envia polling e comandos UDP    |
| UDP Response Rx    | Alta       | 4096  | Recebe e processa respostas     |
| HTTP Server        | Média      | 4096  | Serve REST + WebSocket porta 80 |

## 4. Protocolo UDP

### 4.1 Envelope obrigatório

Todos os comandos enviados pela Matriz para a Filial devem conter:

```json
{
  "cmd": "<comando>",
  "user": "<usuario>",
  "pass": "<senha>"
}
```

### 4.2 Tabela de comandos

| Comando      | Direção | Obrigatório              | Resposta esperada |
| ------------ | ------- | ------------------------ | ----------------- |
| `list_req`   | M→F     | `cmd,user,pass`          | `list_resp`       |
| `get_status` | M→F     | `cmd,user,pass`          | `get_resp`        |
| `set_req`    | M→F     | `cmd,id,value,user,pass` | `set_resp`        |
| `list_resp`  | F→M     | `cmd,id`                 | -                 |
| `get_resp`   | F→M     | `cmd,<campos dinâmicos>` | -                 |
| `set_resp`   | F→M     | `cmd,id,value`           | -                 |

### 4.3 Payloads de referência

**`get_status`** (M→F):

```json
{
  "cmd": "get_status",
  "user": "admin",
  "pass": "admin"
}
```

**`get_resp`** (F→M):

```json
{
  "cmd": "get_resp",
  "actuator_light_sala": true,
  "sensor_light_sala": false,
  "actuator_ac_escritorio": 72,
  "sensor_ac_escritorio": 45
}
```

**`list_req`** (M→F):

```json
{
  "cmd": "list_req",
  "user": "admin",
  "pass": "admin"
}
```

**`list_resp`** (F→M):

```json
{
  "cmd": "list_resp",
  "id": [
    "actuator_light_sala",
    "sensor_light_sala",
    "actuator_ac_escritorio",
    "sensor_ac_escritorio"
  ]
}
```

**`set_req`** (M→F):

```json
{
  "cmd": "set_req",
  "id": "actuator_light_sala",
  "value": true,
  "user": "admin",
  "pass": "admin"
}
```

**`set_resp`** (F→M):

```json
{
  "cmd": "set_resp",
  "id": "actuator_light_sala",
  "value": true
}
```

> **⚠️ Importante:** O protocolo UDP base (Filial↔Matriz) retorna apenas `cmd`, `id` e `value`. Os campos `ok` e `code` são adicionados pela **Matriz** ao repassar a mensagem para a GUI via WebSocket (ver doc 05-matriz-gui.md).

### 4.4 Timeout, retry e porta local

- **Timeout** por comando: **800 ms** (list_req, get_status, set_req)
- **Retry**: não realizar reenvio automático
- **Porta local**: **51000** (fixa) — a Matriz **escuta** respostas UDP nesta porta
- **Correlação**: IP:porta de origem da resposta → chave `ip:port` do FilialConfig
- **Envio**: A Matriz **envia** comandos de qualquer porta efêmera para o `ip:port` da Filial

> **Resumo UDP:**
> - Matriz envia comandos para `filial_ip:filial_port`
> - Matriz escuta respostas em `matriz_ip:51000` (fixa)
> - Filial escuta comandos na porta configurada (padrão 51000)
> - Filial responde para o IP:porta de **origem** do comando recebido

**Contagem de ciclos perdidos (missedCycles):**
- Apenas timeout de `get_status` incrementa `missedCycles`
- Timeout de `list_req` e `set_req` **não** incrementa
- Respostas após timeout são **ignoradas** no ciclo atual
- UDP malformado (JSON inválido) é **ignorado silenciosamente**

## 5. Polling e descoberta

### 5.1 Polling (`get_status`)

- **Intervalo:** `polling_interval` (padrão 30s, mín 5s)
- **Estratégia:** paralelo — todas filiais simultaneamente
- **Timeout individual:** 800ms por filial
- **Runtime:** `PUT /api/config` aplica novo intervalo no próximo ciclo (timer reiniciado)

### 5.2 Descoberta (`list_req`)

- **Frequência:** a cada `discovery_every_cycles` ciclos de polling (padrão 10, mín 1)
- **Disparador adicional:** imediatamente após qualquer alteração de filiais via REST (`POST`, `PUT`, `DELETE /api/filiais`) **e** após `PUT /api/config` com mudanças em `filiais`
- **Reset:** `PUT /api/config` com novo `discovery_every_cycles` reseta contador para 0

## 6. Detecção de offline

- **Janela**: 3 ciclos consecutivos sem resposta UDP
- **Reset**: qualquer resposta válida no ciclo atual
- **Ação em 3 ciclos**: marcar `online=false` + emitir `status_update` via WebSocket para GUI
- **Ciclo**: definido como 1 iteração do timer de polling (`polling_interval`)
- **Notificação GUI**: via WebSocket broadcast (`status_update` com `online=false`)

```cpp
if (receivedResponseInCurrentCycle(filial)) {
    filial.missedCycles = 0;
    filial.online = true;
    filial.lastSeen = now;
} else {
    filial.missedCycles++;
}
if (filial.missedCycles >= 3) {
    filial.online = false;
    broadcastStatusUpdate(filial); // WebSocket
}
```

### 6.1 Comportamento de `set_req` para filial offline

- Matriz **tenta enviar** `set_req` normalmente mesmo com filial offline
- Timeout de **800 ms** sem resposta → GUI recebe `set_resp` com `ok=false` e `code="TIMEOUT"`
- `missedCycles` **não** é incrementado por timeout de `set_req`
- Falhas silenciosas na Filial (auth inválida, `id` inexistente, `value` inválido) também resultam em timeout de `set_req`

## 7. Integração com a GUI

A bridge WebSocket da Matriz é especificada em [05-matriz-gui.md](05-matriz-gui.md). Resumo das responsabilidades:

**Matriz → GUI (envia):**
- `status_update` por filial a cada ciclo de polling (inclusive offline — último estado conhecido)
- `set_resp` após tentativa de `set_req` (sucesso ou timeout com `code="TIMEOUT"`)
- Notificação automática quando filial fica offline (3 ciclos sem resposta)

**GUI → Matriz (recebe):**
- `set_req` via WebSocket → a bridge injeta `user`/`pass` e repassa para UDP

Este documento (04) concentra-se nos dados, polling UDP, detecção de offline, persistência e API REST. A bridge WS é detalhada no [05-matriz-gui.md](05-matriz-gui.md).

**mDNS:** serviço `_http._tcp` / `esp32-matriz.local` — detalhes no [05-matriz-gui.md](05-matriz-gui.md).

## 8. API REST

**Segurança:** ambiente local sem autenticação; `user`/`pass` UDP são independentes da REST.

**CORS:** todas as respostas REST incluem `Access-Control-Allow-Origin: *` para permitir requisições de qualquer origem — adequado ao ambiente local.

### 8.1 Endpoints

| Método   | Rota               | Descrição                    |
| -------- | ------------------ | ---------------------------- |
| `PUT`    | `/api/wifi`        | Atualiza configuração Wi-Fi  |
| `GET`    | `/api/config`      | Retorna `config_matriz.json` |
| `PUT`    | `/api/config`      | Salva `config_matriz.json`   |
| `GET`    | `/api/filiais`     | Lista filiais com estado     |
| `POST`   | `/api/filiais`     | Cria filial                  |
| `PUT`    | `/api/filiais/:id` | Atualiza filial              |
| `DELETE` | `/api/filiais/:id` | Remove filial                |

**`:id` de filial:** formato `ip:porta` (ex: `192.168.1.100:51000`), deve ser URL-encoded na rota (ex: `192.168.1.100%3A51000`)

### 8.2 Detalhamento

#### `PUT /api/wifi`
Persiste `config_wifi.json` e reinicia. Erros → `400`.

**Validações:**
- `ssid`: string não vazia, máximo 32 caracteres
- `password`: string não vazia (para AP) ou pode ser vazia (para open networks)
- `mode`: deve ser `"station"`

**Erros:**
- `400` — `ssid` ou `password` inválido
- `400` — `mode` diferente de `"station"`

#### `GET /api/config`
Retorna `config_matriz.json` efetivo.

#### `PUT /api/config`
Aplica imediatamente: `polling_interval` no próximo ciclo; `discovery_every_cycles` reseta contador para 0; mudanças em `filiais` disparam `list_req`; `user`/`pass` aplicam no próximo UDP.

**Validações:**
- `user`: string não vazia
- `pass`: string não vazia
- `polling_interval`: inteiro >= 5 e <= 120
- `discovery_every_cycles`: inteiro >= 1
- `filiais`: array onde cada item tem `name` (não vazia), `ip` (IPv4 válido), `port` (1–65535)
- `filiais`: chave composta `ip:port` deve ser única no array

**Erros:**
- `400` — qualquer campo de validação falha
- `409` — conflito de `ip:port` entre filiais

#### `GET /api/filiais`
```json
{
  "filiais": [
    {
      "id": "10.0.0.1:51000", "name": "Filial BH",
      "ip": "10.0.0.1", "port": 51000,
      "online": true, "lastSeen": 1711861200, "missedCycles": 0,
      "devices": { "actuator_light_sala": true, "sensor_light_sala": false }
    }
  ]
}
```

**`lastSeen`:** Unix timestamp em **segundos** UTC (tempo da última resposta UDP recebida)

#### `POST /api/filiais`
Cria uma nova filial.

**Request:** `{ "name": "...", "ip": "...", "port": 51000 }`

**Validações:**
- `name`: string não vazia, máximo 32 caracteres
- `ip`: IPv4 válido
- `port`: inteiro 1–65535
- `ip:port` não pode existir em outra filial

**Erros:**
- `400` — qualquer campo de validação falha
- `409` — `ip:port` já existe

**Sucesso:** `201` com `{ "id": "ip:port", "name": "...", "ip": "...", "port": ... }`

#### `PUT /api/filiais/:id`
Atualiza uma filial existente. `:id` é o formato `ip:porta`.

**Request:** `{ "name": "...", "ip": "...", "port": 51000 }`

**Validações:**
- `id` deve existir
- `name`: string não vazia
- `ip`: IPv4 válido
- `port`: inteiro 1–65535
- se `ip:port` mudar, novo par não pode conflitar com filial existente

**Erros:**
- `400` — qualquer campo de validação falha
- `404` — filial não encontrada
- `409` — novo `ip:port` conflita com filial existente

**Sucesso:** `200`

#### `DELETE /api/filiais/:id`
Remove uma filial. `:id` é o formato `ip:porta`.

**Erros:**
- `404` — filial não encontrada

**Sucesso:** `200` com `{ "ok": true, "deleted": "ip:porta" }`

### 8.3 Erros

```json
{ "error": "VALIDATION_ERROR", "code": "...", "message": "...", "details": {} }
```

| Situação          | Status |
| ----------------- | ------ |
| Sucesso           | `2xx`  |
| Validação         | `400`  |
| Não encontrado    | `404`  |
| Conflito ip:porta | `409`  |
| Interno           | `500`  |

Todas respostas: `application/json`.

## 9. Fluxo operacional

1. **Boot**: inicializa LittleFS e módulos
2. **WiFi**: sem `config_wifi.json` → AP `ESP32-MATRIZ` + captive portal; caso contrário → STA+AP
3. **Config**: carrega `config_matriz.json` com fallback
4. **Descoberta**: `list_req` para todas filiais
5. **Polling**: `get_status` em paralelo a cada `polling_interval` (800ms timeout individual)
6. **Controle**: `set_req` via WebSocket → injeta credenciais → UDP
7. **Broadcast**: `status_update` por filial por ciclo (inclusive offline)
8. **Offline**: 3 ciclos sem resposta → `online=false`

## 10. Definition of Done

- Build PlatformIO sem erro
- Teste com 1 Matriz + 2 Filiais
- REST JSON válido, WebSocket funcional
- Polling automático, offline após 3 ciclos, fallback validado

### 10.1 Cobertura de testes

- Mínimo **95%** em lógica non-frontend (parser, validações, bridge WS↔UDP, gerenciamento, fallback)
- Unitários + integração com mocks UDP/WebSocket
- Evidência publicada no relatório do pipeline
