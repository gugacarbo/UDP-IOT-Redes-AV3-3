
## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         MATRIZ (HQ)                         │
│                                                             │
│    ┌───────────────────────────────────────────────────┐    │
│    │  Navegador/App (GUI)                              │    │
│    └─────────────────────┬─────────────────────────────┘    │
│                          │ WebSocket                        │
│    ┌─────────────────────▼─────────────────────────────┐    │
│    │  Servidor WebSocket (porta 80)                    │    │
│    │  - Recebe comandos do browser                     │    │
│    │  - Envia respostas ao browser                     │    │
│    └─────────────────────┬─────────────────────────────┘    │
│                          │                                  │
│    ┌─────────────────────▼─────────────────────────────┐    │
│    │  Cliente UDP (envia comandos)                     │    │
│    │  Servidor UDP (recebe respostas) - porta 51000    │    │
│    └───────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                    UDP Broadcast (comandos)
                    UDP Unicast (respostas)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  FILIAL 1                              FILIAL 2             │
│  ┌─────────────────────────────────┐  ┌─────────────────┐   │
│  │ Servidor UDP (porta 51000)      │  │ Servidor UDP    │   │
│  │ - Recebe comandos               │  │ (porta 51000)   │   │
│  │ - Envia respostas               │  │ - Recebe cmds   │   │
│  └───────────────┬─────────────────┘  │ - Envia resp    │   │
│                  │                    └────────┬────────┘   │
│  ┌───────────────▼─────────────────┐           │            │
│  │ Device Manager                  │           │            │
│  │ - Sensores (leitura)            │           │            │
│  │ - Atuadores (escrita)           │           │            │
│  └─────────────────────────────────┘           │            │
└────────────────────────────────────────────────┴────────────┘
```

### Entidades do Sistema

| Entidade   | Componente         | Função                                     |
| ---------- | ------------------ | ------------------------------------------ |
| **Matriz** | Cliente UDP        | Envia comandos para filial (broadcast)     |
| **Matriz** | Servidor UDP       | Recebe respostas das filiais               |
| **Matriz** | Servidor WebSocket | Interface com usuário (GUI no browser)     |
| **Filial** | Servidor UDP       | Recebe comandos da matriz, envia respostas |
| **Filial** | Device Manager     | Gerencia sensores e atuadores locais       |

### Fluxo de Comunicação

1. Usuário interage com GUI no navegador
2. GUI envia comando via WebSocket para servidor WebSocket na Matriz
3. Matriz (Cliente UDP) envia comando para filial via broadcast UDP
4. Filial processa comando e envia resposta via unicast UDP
5. Matriz (Servidor UDP) recebe resposta
6. Matriz (Servidor WebSocket) transmite resposta para GUI
7. GUI atualiza interface para usuário

### Filial (Server) Components

- UDP Server: Receives commands from matriz, sends responses
- Device Manager: Controls sensors and actuators
- Configuration: Loaded from JSON file (config_filial.json)

### Communication Flow

1. Browser → WebSocket → Matriz WebSocket Server
2. Matriz WebSocket → UDP Broadcast → All Filials
3. Filial processes command → UDP Unicast response
4. Matriz UDP Server receives → WebSocket → Browser

---

## Protocolo UDP

### Visão Geral

- **Transporte**: UDP
- **Formato**: JSON (UTF-8)
- **Autenticação**: TODAS as requests devem incluir `user` e `pass`
- **Fluxo**: Best-effort (filial não valida origem - responde a qualquer broadcast)
- **Identificação**: Filial identificada por IP:porta de origem, opcionalmente por `filial_id` nas respostas

### Comandos (Matriz → Filial)

Todas as requisições incluem autenticação:

```json
{
  "cmd": "<comando>",
  "user": "<usuario>",
  "pass": "<senha>"
}
```

| Comando      | Descrição                   | Campos adicionais |
| ------------ | --------------------------- | ----------------- |
| `list_req`   | Lista todos os dispositivos | -                 |
| `get_status` | Obtém valores atuais        | -                 |
| `set_req`    | Altera valor                | `id`, `value`     |

### Respostas (Filial → Matriz)

> **Nota**: `set_req` para sensores (`sensor_*`) é ignorado.

| Resposta    | Descrição                     | Campos opcionais |
| ----------- | ----------------------------- | ---------------- |
| `list_resp` | Array de IDs dos dispositivos | `filial_id`      |
| `get_resp`  | Valores atuais                | `filial_id`      |
| `set_resp`  | Confirmação da alteração      | `filial_id`      |

### Tipos de Dispositivos

| Tipo         | Descrição           | Acesso          |
| ------------ | ------------------- | --------------- |
| `sensor_*`   | Sensores (leitura)  | Somente leitura |
| `actuator_*` | Atuadores (escrita) | Somente escrita |

### Formato do ID

`<type>_<device>_<place>` → ex: `actuator_light_sala`

> **Conflito de IDs**: Em caso de dispositivos com mesmo ID em filiais diferentes, usar IP:porta para distinguir.

---

## Configurações

### config_filial.json (Filial)

```json
{
  "name": "Filial Centro",
  "filial_id": "filial_centro",
  "port": 51000,
  "admin_user": "admin",
  "admin_pass": "admin",
  "devices": [
    {"id": "actuator_light_sala", "pin": 2},
    {"id": "sensor_light_sala", "pin": 4}
  ]
}
```

### config_wifi.json (Matriz e Filial)

```json
{
  "mode": "station",
  "ssid": "minha_rede",
  "password": "minha_senha",
  "ap_ssid": "ESP32-MATRIZ",
  "ap_password": "12345678"
}
```

### Interface Web (GUI)

- **Framework**: React 19 + Vite
- **UI Library**: shadcn/ui
- **Tema**: Dark-mode (com opção de alternar)

---

## Build e Deploy

### Estrutura de Diretórios

```
UDP-IOT-Redes-AV3-3/
├── Makefile
├── matriz-esp32/
│   ├── platformio.ini
│   ├── data/           # LittleFS
│   └── src/
├── filial-esp32/
│   ├── platformio.ini
│   ├── data/           # LittleFS
│   └── src/
└── gui/               # React + Vite
```

### Comandos Make

| Comando         | Descrição               |
| --------------- | ----------------------- |
| `make all`      | Build GUI + upload tudo |
| `make matriz`   | Build + upload matriz   |
| `make filial`   | Build + upload filial   |
| `make gui`      | Apenas build React      |
| `make uploadfs` | Upload LittleFS         |
| `make clean`    | Limpa builds            |

---

## Decisões de Design

| #              | Decisão       | Valor                               |
| -------------- | ------------- | ----------------------------------- |
| Polling        | Intervalo     | 5 segundos (configurável)           |
| Timeout        | Comportamento | "Sem resposta" na GUI               |
| Retry          | Automático    | Sim, 5s, ilimitado                  |
| Identificação  | Filiais       | Nome + IP:porta (tooltip)           |
| Identificação  | filial_id     | Opcional nas respostas              |
| Conflito IDs   | Disambiguate  | IP:porta para distinguir            |
| Payload        | Formato       | JSON puro                           |
| Comunicação    | Tipo          | Broadcast UDP                       |
| Múltiplas      | Filiais       | Simultâneas                         |
| GUI            | Atualização   | WebSocket push                      |
| Estados        | Valores       | Boolean                             |
| Persistência   | Storage       | LittleFS                            |
| WiFi           | Modos         | Station + AP                        |
| Auth matriz    | Validar?      | NÃO - responde a qualquer broadcast |
| set_req sensor | Comportamento | Ignorar                             |
| GUI UI         | Biblioteca    | shadcn/ui                           |
| GUI tema       | Theme         | Dark-mode + toggle                  |

---
