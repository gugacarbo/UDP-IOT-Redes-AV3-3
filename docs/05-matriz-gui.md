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
- Gerenciamento de credenciais e intervalo de polling
- Histórico de comandos enviados

## 2. Arquitetura da interface

- **Framework:** React 19 + Vite + TypeScript
- **Estilização:** TailwindCSS + shadcn/ui + lucide-react
- **Estrutura de componentes:**
  ```
  matriz-gui/src/
  ├── components/     # Componentes reutilizáveis
  ├── contexts/       # React contexts (estado global)
  ├── hooks/          # Custom hooks
  ├── lib/            # Utilitários e helpers
  └── types/          # Definições TypeScript
  ```
- **Estado global** para filiais, seleção, histórico de comandos e feedback
- **Atualizações em tempo real** vindas do WebSocket da Matriz
- **Consumo das rotas REST** para CRUD de configuração e filiais
- **Tela única** com seções: Dashboard, Gerenciamento de Filiais, Configurações

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
| `actuator_ac_*`    | `value` inteiro `0–1023`                           |

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
  "code": "TIMEOUT"
}
```

```json
{
  "cmd": "set_resp",
  "id": "...",
  "value": true,
  "ok": false,
  "code": "UNKNOWN_FILIAL"
}
```

- `set_resp` confirmado vence temporariamente até o próximo `status_update`

> **⚠️ Distinção UDP vs WebSocket:** Os campos `ok` e `code` em `set_resp` são adicionados pela **bridge da Matriz** ao repassar para a GUI via WebSocket. O protocolo UDP base (Filial→Matriz) retorna apenas `cmd`, `id` e `value`.

### 3.4 Robustez

- `ping`/`pong` WebSocket a cada 15s (camada WS)
- Timeout de 30s sem `pong` → conexão encerrada
- Timeout UDP de 800ms (camada de rede) — independente do ping/pong WS
- Fila máxima de 20 mensagens por cliente; ao exceder, a conexão é encerrada
- **MAX_WS_CLIENTS = 4**: Limite de clientes WebSocket simultâneos (restrição de RAM do ESP32). Novas conexões após o limite são rejeitadas com HTTP 503.

## 4. Visualização de dispositivos

Cada filial é exibida como um **card** contendo:
- Nome e IP da filial
- Indicador de status online/offline
- Lista de dispositivos daquela filial

**Dispositivos dentro do card:**
| Tipo    | Representação visual         | Controle         |
| ------- | ---------------------------- | ---------------- |
| `light` | Ícone de luz + toggle on/off | Botão toggle     |
| `ac`    | Ícone de AC + slider 0–1023  | Slider com valor |

**Tratamento de offline:**
- Filial offline exibe badge "offline" (cor diferenciada)
- Último estado conhecido permanece visível
- Controles da filial offline ficam **desabilitados**
- Fila é **removida** da visualização **apenas** se o usuário escolher

## 5. Configurações

### 5.1 Parâmetros ajustáveis

| Parâmetro          | Tipo | Padrão | Descrição                                              |
| ------------------ | ---- | ------ | ------------------------------------------------------ |
| `polling_interval` | int  | 30000  | Intervalo de polling em milissegundos (≥5000, ≤120000) |

### 5.2 Armazenamento

- `polling_interval` é persistido pela Matriz via `PUT /api/config`
- Histórico de comandos é mantido em `sessionStorage` (por sessão do navegador)

## 6. Ações disponíveis na GUI

### 6.1 Monitoramento
- Visualizar estado atual dos dispositivos por filial
- Ver lista de dispositivos da filial

### 6.2 Controle
- Ligar/desligar luzes (toggle)
- Ajustar intensidade do ar-condicionado (slider 0–1023)
- Feedback visual após alteração (animação de confirmação)

### 6.3 Gerenciamento
- Adicionar/editar/remover filiais (nome, IP, porta)
- Alterar credenciais da Matriz (user/pass)
- Ver histórico de comandos enviados (timestamp, filial, device, ação, resultado)

## 7. Descoberta mDNS

- Serviço `_http._tcp` com nome `esp32-matriz`
- Domínio `local`
- A GUI tenta resolver o host antes de conectar
- Se a descoberta falhar, o usuário informa o IP manualmente (fallback)
- O WebSocket usa `ws://<ip_matriz>:80`

## 8. Histórico de comandos

A GUI mantém um log dos comandos enviados:

```typescript
interface CommandLog {
  timestamp: Date;
  filialName: string;
  filialIp: string;
  deviceId: string;
  action: 'set';
  value: boolean | number;
  result: 'ok' | 'TIMEOUT' | 'UNKNOWN_FILIAL';
}
```

- Exibido em seção ou modal acessível da interface
- Scrollável, com mensagens mais recentes no topo
- Persistido em `sessionStorage` (não é persistente entre sessões)

## 9. Estado da interface

- Filiais offline continuam visíveis com indicador visual
- O último estado conhecido permanece exibido até nova atualização
- Uma confirmação de comando pode sobrescrever temporariamente a visualização até o próximo `status_update`
- Histórico de comandos é mantido em memória (sessionStorage)

## 10. Integração com a API REST

A GUI consome as rotas da Matriz para configuração e manutenção:

- `GET /api/config`
- `PUT /api/config`
- `GET /api/filiais`
- `POST /api/filiais`
- `PUT /api/filiais/:id`
- `DELETE /api/filiais/:id`
- `PUT /api/wifi`

Os detalhes de validação, persistência e códigos de erro dessas rotas estão em [04-matriz.md](04-matriz.md).

## 11. Decisões tomadas

| Decisão      | Opção escolhida                                                      |
| ------------ | -------------------------------------------------------------------- |
| Framework UI | React 19 + Vite + TypeScript                                         |
| Estilização  | TailwindCSS + shadcn/ui + lucide-react                               |
| Estrutura    | `components/`, `contexts/`, `hooks/`, `lib/`, `types/`               |
| Layout       | Dashboard único com seções                                           |
| Visualização | Cards por filial com dispositivos dentro                             |
| Offline      | Exibir último estado + indicador offline + controles desabilitados   |
| mDNS         | Implementar com fallback manual de IP                                |
| Ações        | Toggle luz, slider AC, CRUD filiais, polling, credenciais, histórico |
| Histórico    | sessionStorage (por sessão do navegador)                             |
