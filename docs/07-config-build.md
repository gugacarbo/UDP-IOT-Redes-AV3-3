---
title: Configuração, Rede e Build
description: Configuração de WiFi, rede, GUI, build, deploy e debug
---

## Configuração, rede e build

> Status: 📄 Especificação. Reúne os itens que mudam ambiente, empacotamento e operação.

## GUI React

### Dependências confirmadas

```json
{
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "@tanstack/react-query": "^5.x",
    "lucide-react": "^0.x",
    "tailwindcss": "^3.x",
    "clsx": "^2.x"
  },
  "devDependencies": {
    "vite": "^8.0.3",
    "typescript": "~6.0.2",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^10.1.0",
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x",
    "@types/node": "^22.x"
  }
}
```

### shadcn/ui — Instalação e componentes

shadcn/ui **não é um package npm** — é um CLI que copia componentes para o projeto.

```bash
npx shadcn@latest init
npx shadcn@latest add card button toggle slider badge input dialog scroll-area
```
```

### shadcn/ui — Componentes confirmados

| Componente   | Uso                                   |
| ------------ | ------------------------------------- |
| `Card`       | Card de filial                        |
| `Button`     | Controles de dispositivos             |
| `Toggle`     | Liga/desliga luzes                    |
| `Slider`     | Controle de AC (0-1023)               |
| `Badge`      | Indicador offline                     |
| `Input`      | Input de IP manual                    |
| `Dialog`     | Modal de histórico / adição de filial |
| `ScrollArea` | Área de histórico de comandos         |

### Estrutura confirmada

```text
matriz-gui/src/
├── main.tsx
├── App.tsx
├── components/     # Componentes reutilizáveis (FilialCard, DeviceControl, etc.)
├── contexts/       # WebSocketContext, FiliaisContext
├── hooks/          # useWebSocket, useFiliais, useCommandLog
├── lib/            # api.ts, utils.ts
└── types/          # index.ts (tipos TypeScript)
```

## WebSocket

| Item          | Valor                                                    |
| ------------- | -------------------------------------------------------- |
| Endpoint      | `ws://<ip_matriz>:80`                                    |
| Multi-cliente | Broadcast para todas as abas                             |
| Eventos       | `status_update`, `set_resp`                              |
| Heartbeat     | `ping` / `pong`                                          |
| Reconexão     | Backoff exponencial de 1s a 30s, tentativas infinitas    |
| Indicador     | Banner visual "Reconectando..." durante perda de conexão |

`set_resp` é a confirmação de controle recebida após um `set_req` via UDP.
`status_update` é o broadcast de estado enviado para manter todas as abas sincronizadas.

## Configuração WiFi

### `config_wifi.json`

```json
{
  "mode": "sta",
  "ssid": "minha_rede",
  "password": "minha_senha",
  "ap_ssid": "Matriz-Setup",
  "ap_password": "12345678"
}
```

Na Matriz, esse arquivo é persistido no LittleFS.
Ele é recarregado no boot para manter o estado entre reinicializações.

## Configuração da matriz

### `config_matriz.json`

```json
{
  "user": "admin",
  "pass": "admin",
  "polling_interval": 30000,
  "discovery_every_cycles": 10,
  "filiais": [
    { "name": "Filial Centro", "ip": "192.168.1.100", "port": 51000 },
    { "name": "Filial Norte", "ip": "192.168.1.101", "port": 51000 }
  ]
}
```

`polling_interval` é inteiro em milissegundos, com mínimo `5000`, padrão `30000` e máximo `120000`.
`discovery_every_cycles` define a cada quantos ciclos de polling a matriz executa redescoberta (padrão `10`, mínimo `1`).

## Configuração da filial

### `config_filial.json`

```json
{
  "port": 51000,
  "admin_user": "admin",
  "admin_pass": "admin",
  "devices": [
    { "id": "actuator_light_sala", "pin": 2 },
    { "id": "sensor_light_sala", "pin": 34 },
    { "id": "actuator_ac_escritorio", "pin": 4 },
    { "id": "sensor_ac_escritorio", "pin": 35 }
  ]
}
```

| Campo        | Tipo   | Descrição                          |
| ------------ | ------ | ---------------------------------- |
| `port`       | int    | Porta UDP de escuta (padrão 51000) |
| `admin_user` | string | Usuário para autenticar a Matriz   |
| `admin_pass` | string | Senha para autenticar a Matriz     |
| `devices`    | array  | Array de objetos `{id, pin}`       |

## Rede

| Serviço               | Porta | Descrição             |
| --------------------- | ----- | --------------------- |
| HTTP/WS/REST (Matriz) | 80    | GUI e API             |
| HTTP/WS/REST (Filial) | 80    | GUI local e API       |
| UDP (Filial escuta)   | 51000 | Comandos da Matriz    |
| UDP (Matriz escuta)   | 51000 | Respostas das filiais |

## Captive Portal

O portal é ativado quando a conexão Station falha ou quando `config_wifi.json`
está ausente ou corrompido. Implementado pelo módulo `CaptivePortal` na Matriz.

### Rota do portal

| Método | Rota        | Descrição                          |
| ------ | ----------- | ---------------------------------- |
| GET    | `/`         | Página HTML com formulário de WiFi |
| POST   | `/api/wifi` | Salva SSID e senha e reinicia      |

### Fluxo de provisionamento

```text
1. Boot sem config_wifi.json → ativa AP "Matriz-Setup"
2. Usuário conecta no AP → abre navegador
3. Captive portal detecta e redireciona para página de setup
4. Usuário preenche SSID/senha e envia via POST /api/wifi
5. Matriz salva config_wifi.json e reinicia
6. Próximo boot: conecta na rede STA + mantém AP ativo
```

**Após conexão Station bem-sucedida:**
- Modo STA+AP permanece ativo
- AP continua com SSID "Matriz-Setup" para recovery/reconfiguração
- Portal serve página de status + permite reconfiguração WiFi
- GUI principal permanece acessível via STA (mDNS ou IP)

## Build e deploy

```makefile
gui:
  cd matriz-gui && pnpm install && pnpm run build

build:
  cp -r matriz-gui/dist/* matriz-esp32/data/
  # Filial usa portal HTML simples (não React) — ver architecture/filial.md

uploadfs-matriz:
  cd matriz-esp32 && pio run --target buildfs
  pio run --target uploadfs --upload-port $(UPLOAD_PORT)

uploadfs-filial:
  cd filial-esp32 && pio run --target buildfs
  pio run --target uploadfs --upload-port $(UPLOAD_PORT)
```

### Targets

| Target   | Descrição                   |
| -------- | --------------------------- |
| `all`    | Build da GUI, FS e firmware |
| `matriz` | Build e upload da matriz    |
| `filial` | Build e upload da filial    |
| `clean`  | Limpa os artefatos          |

## Debug e teste

| Item           | Valor                                     |
| -------------- | ----------------------------------------- |
| Baud rate      | 115200                                    |
| Logs           | WiFi, UDP, JSON e estado dos dispositivos |
| Formato        | `[LEVEL] [MODULE] message`                |
| Níveis         | DEBUG, INFO, WARN, ERROR                  |
| Produção       | Compilação condicional via `#ifdef DEBUG` |
| Cenário mínimo | 1 matriz + 2 filiais                      |

## Definition of Done

- Build completo (`make all`) executando sem erros.
- Deploy no ESP32 funcionando com WiFi, UDP e HTTP.
- Filiais descobertas automaticamente pela Matriz.
- Cobertura de testes mínima de **95%** em código non-frontend (ESP32 firmware e
  lógica de build).
