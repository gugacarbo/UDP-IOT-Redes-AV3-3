# Requisitos Detalhados - UDP IoT Sistema de Monitoramento - v1

## 1. Visão Geral do Sistema

### 1.1 Descrição

Sistema IoT para monitoramento e controle remoto de dispositivos (luzes e ar-condicionado) em filiais, gerenciado a partir de uma matriz central. O sistema permite que um operador na matriz visualize o estado dos dispositivos em todas as filiais e altere o estado dos atuadores remotamente.

### 1.2 Problema do Cliente

> "Temos diversas filiais e estamos tendo um gasto excessivo de energia elétrica por conta de luzes e aparelhos de ar-condicionado que se mantêm ligados em horários nos quais não há nenhum funcionário na empresa. Gostaria de uma solução que nos permitisse monitorá-los, desligá-los e ligá-los tudo remotamente."

### 1.3 Arquitetura do Sistema

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

---

## 2. Entidades do Sistema

| Entidade   | Componente         | Papel    | Função                                     |
| ---------- | ------------------ | -------- | ------------------------------------------ |
| **Matriz** | Cliente UDP        | CLIENTE  | Envia comandos para filial (broadcast)     |
| **Matriz** | Servidor UDP       | SERVIDOR | Recebe respostas das filiais (porta 51000) |
| **Matriz** | Servidor WebSocket | SERVIDOR | Interface com usuário (porta 80)           |
| **Filial** | Servidor UDP       | SERVIDOR | Recebe comandos da matriz, envia respostas |
| **Filial** | Device Manager     | -        | Controla sensores e atuadores locais       |

### 2.1 Fluxo de Comunicação

1. Usuário interage com GUI no navegador
2. GUI envia comando via WebSocket para servidor WebSocket na Matriz
3. Matriz (Cliente UDP) envia comando para filial via broadcast UDP
4. Filial processa comando e envia resposta via unicast UDP
5. Matriz (Servidor UDP) recebe resposta
6. Matriz (Servidor WebSocket) transmite resposta para GUI
7. GUI atualiza interface para usuário

---

## 3. Protocolo de Comunicação

### 3.1 Visão Geral

- **Transporte**: UDP
- **Formato**: JSON (UTF-8)
- **Payload**: JSON puro, sem delimitadores ou cabeçalhos adicionais
- **Autenticação**: Todas as requests devem incluir `user` e `pass`
- **Fluxo**: Best-effort (servidor ignora requisições com autenticação inválida)

### 3.2 Comandos (Cliente Matriz → Servidor Filial)

Todas as requisições devem incluir campos de autenticação:

```json
{
  "cmd": "<comando>",
  "user": "<usuario>",
  "pass": "<senha>"
}
```

| Comando      | Descrição                                     | Campos adicionais |
| ------------ | --------------------------------------------- | ----------------- |
| `list_req`   | Lista todos os dispositivos                   | -                 |
| `get_status` | Obtém valores atuais de todos os dispositivos | -                 |
| `set_req`    | Altera valor de um dispositivo                | `id`, `value`     |

#### 3.2.1 list_req - Listar Dispositivos

**Requisição:**
```json
{
  "cmd": "list_req",
  "user": "admin",
  "pass": "admin"
}
```

**Resposta:**
```json
{
  "cmd": "list_resp",
  "filial_id": "Filial Centro",
  "id": ["actuator_light_sala", "sensor_light_sala", "actuator_ac_escritorio", "sensor_ac_escritorio"]
}
```

> **Identificação**: A filial pode incluir `filial_id` opcionalmente. A matriz identifica a filial pelo IP:porta de origem UDP se o campo não estiver presente.

#### 3.2.2 get_status - Obter Estado Atual

**Requisição:**
```json
{
  "cmd": "get_status",
  "user": "admin",
  "pass": "admin"
}
```

**Resposta:**
```json
{
  "cmd": "get_resp",
  "filial_id": "Filial Centro",
  "actuator_light_sala": true,
  "sensor_light_sala": false,
  "actuator_ac_escritorio": true,
  "sensor_ac_escritorio": false
}
```

#### 3.2.3 set_req - Alterar Estado

**Requisição:**
```json
{
  "cmd": "set_req",
  "id": "actuator_light_sala",
  "value": true,
  "user": "admin",
  "pass": "admin"
}
```

**Resposta:**
```json
{
  "cmd": "set_resp",
  "filial_id": "Filial Centro",
  "id": "actuator_light_sala",
  "value": true
}
```

> **Nota**: Se `set_req` for enviado para um dispositivo do tipo `sensor_*`, a filial ignora a requisição.

### 3.3 Tipos de Dispositivos

| Tipo         | Descrição           | Acesso          |
| ------------ | ------------------- | --------------- |
| `sensor_*`   | Sensores (leitura)  | Somente leitura |
| `actuator_*` | Atuadores (escrita) | Somente escrita |

> **Nota**: Tentativas de `set_req` em dispositivos do tipo `sensor_*` devem ser ignoradas pela filial.

#### 3.3.1 Dispositivos de Luz

| ID                       | Tipo    | Descrição                    | Valor   | Pino GPIO |
| ------------------------ | ------- | ---------------------------- | ------- | --------- |
| `sensor_light_<local>`   | Sensor  | Estado do interruptor de luz | boolean | especificado na config |
| `actuator_light_<local>` | Atuador | Controla interruptor de luz  | boolean | especificado na config |

#### 3.3.2 Dispositivos de Ar Condicionado

| ID                    | Tipo    | Descrição                          | Valor   | Pino GPIO |
| --------------------- | ------- | ---------------------------------- | ------- | --------- |
| `sensor_ac_<local>`   | Sensor  | Estado do motor do ar condicionado | boolean | especificado na config |
| `actuator_ac_<local>` | Atuador | Controla motor do ar condicionado  | boolean | especificado na config |

### 3.4 Formato do ID de Dispositivo

O formato dos IDs segue o padrão: `<type>_<device>_<place>`

| Campo      | Valores              | Descrição                                         |
| ---------- | -------------------- | ------------------------------------------------- |
| `<type>`   | `sensor`, `actuator` | Tipo do dispositivo                               |
| `<device>` | `light`, `ac`        | Tipo de equipamento                               |
| `<place>`  | string livre         | Localização (ex: `sala`, `escritorio`, `reuniao`) |

**Exemplos:**
- `actuator_light_sala` - Atuador de luz da sala
- `sensor_ac_escritorio` - Sensor de ar condicionado do escritório
- `actuator_light_reuniao` - Atuador de luz da sala de reunião

### 3.5 Identificação da Filial

A filial é identificada pelo IP:porta de origem UDP da resposta. Opcionalmente, pode incluir o campo `filial_id` nas respostas se configurado.

Em caso de conflito de IDs de dispositivos entre filiais (ex: duas filiais com `actuator_light_sala`), a matriz usa o IP:porta para distinguir.

---

## 4. Requisitos Técnicos

### 4.1 Hardware

- **Placa**: ESP32 (esp32doit-devkit-v1)
- **Armazenamento**: LittleFS (não SPIFFS)
- **Comunicação**: WiFi (Station + Access Point)

### 4.2 Software - Matriz

| Componente     | Descrição                                  |
| -------------- | ------------------------------------------ |
| Cliente UDP    | Envia comandos para filial (broadcast)     |
| Servidor UDP   | Recebe respostas das filiais (porta 51000) |
| AsyncWebServer | Serve interface web (porta 80)             |
| AsyncWebSocket | Comunicação bidirecional com browser       |
| LittleFS       | Armazena arquivos da GUI e configurações   |

### 4.3 Software - Filial

| Componente     | Descrição                                  |
| -------------- | ------------------------------------------ |
| Servidor UDP   | Recebe comandos da matriz (porta 51000)    |
| Device Manager | Gerencia sensores e atuadores              |
| LittleFS       | Armazena configuração (config_filial.json) |

### 4.4 Interface Web (GUI)

- **Framework**: React 19 + Vite
- **UI Library**: shadcn/ui
- **Tema**: Dark-mode (com opção de alternar)
- **Build**: Automático via Makefile
- **Entrega**: Arquivos servidos pelo AsyncWebServer do ESP32
- **Armazenamento**: LittleFS

### 4.5 Bibliotecas

#### Matriz (platformio.ini)
```ini
lib_deps =
    me-no-dev/ESP Async WebServer@^1.2
    me-no-dev/AsyncTCP@^1.1
    bblanchon/ArduinoJson@^6.21
```

#### Filial (platformio.ini)
```ini
lib_deps =
    bblanchon/ArduinoJson@^6.21
```

---

## 5. Configuração

### 5.1 Configuração da Filial (config_filial.json)

Arquivo armazenado no LittleFS da filial.

```json
{
  "name": "Filial Centro",
  "filial_id": "filial_centro",
  "port": 51000,
  "admin_user": "admin",
  "admin_pass": "admin",
  "devices": [
    {"id": "actuator_light_sala", "pin": 2},
    {"id": "sensor_light_sala", "pin": 4},
    {"id": "actuator_ac_escritorio", "pin": 5},
    {"id": "sensor_ac_escritorio", "pin": 18}
  ]
}
```

| Campo        | Tipo   | Descrição                                      |
| ------------ | ------ | --------------------------------------------- |
| `name`       | string | Nome da filial para exibição na GUI           |
| `filial_id`  | string | Identificador opcional nas respostas           |
| `port`       | int    | Porta UDP do servidor                          |
| `admin_user` | string | Usuário para autenticação                      |
| `admin_pass` | string | Senha para autenticação                        |
| `devices`    | array  | Lista de objetos com `id` e `pin` dos dispositivos |

#### Formato de Device

Cada device na lista deve ter:

| Campo | Tipo   | Descrição                    |
| ----- | ------ | ---------------------------- |
| `id`  | string | ID do dispositivo            |
| `pin` | int    | Número do pino GPIO (0-39)  |

### 5.2 Configuração WiFi (config_wifi.json)

Arquivo armazenado no LittleFS.

```json
{
  "mode": "station",
  "ssid": "minha_rede",
  "password": "minha_senha",
  "ap_ssid": "ESP32-MATRIZ",
  "ap_password": "12345678"
}
```

| Campo         | Tipo   | Descrição                         |
| ------------- | ------ | --------------------------------- |
| `mode`        | string | `station`, `ap` ou `both`         |
| `ssid`        | string | Nome da rede WiFi (Station mode)  |
| `password`    | string | Senha da rede WiFi (Station mode) |
| `ap_ssid`     | string | Nome do Access Point              |
| `ap_password` | string | Senha do Access Point             |

### 5.3 Acesso e Identificação

- **mDNS**: `esp32-matriz.local` / `esp32-filial.local`
- **Serial**: IP exibido no monitor serial na inicialização
- **GUI**: Nome da filial + IP:porta como tooltip

---

## 6. Interface Web (GUI)

### 6.1 Funcionalidades

A interface web deve permitir:

1. **Visualização de filiais**
   - Lista de filiais conectadas/descobertas
   - Status de conexão (online/offline)
   - Nome da filial + IP:porta

2. **Monitoramento**
   - Estado atual de todos os dispositivos por filial
   - Atualização em tempo real via WebSocket
   - Polling automático (configurável, padrão 5 segundos)

3. **Controle**
   - Alterar estado de atuadores
   - Feedback visual imediato

4. **Configuração**
   - Endereço IP e porta do servidor de cada filial (se manual)
   - Período de polling configurável

### 6.2 Comportamento de Conexão

| Situação            | Comportamento                               |
| ------------------- | ------------------------------------------- |
| Filial não responde | Mostra "sem resposta", mantém últimos dados |
| Retry               | Automático, a cada 5 segundos               |
| Filial offline      | Mantém na lista com status offline          |
| Reconexão           | Tenta automaticamente indefinidamente       |

---

## 7. Build e Deploy

### 7.1 Estrutura de Diretórios

```
UDP-IOT-Redes-AV3-3/
├── Makefile                    # Orquestra build e upload
├── matriz-esp32/
│   ├── platformio.ini
│   ├── data/                   # Arquivos para LittleFS
│   └── src/
├── filial-esp32/
│   ├── platformio.ini
│   ├── data/                   # Arquivos para LittleFS
│   └── src/
└── gui/                       # Projeto React
    ├── src/
    ├── dist/                   # Output do build
    ├── package.json
    └── vite.config.js
```

### 7.2 Makefile

```makefile
# Variáveis
ESPTOOL := python3 ~/.platformio/packages/tool-esptoolpy/esptool.py
UPLOAD_PORT := /dev/ttyUSB0

# Targets
.PHONY: all gui build uploadfs upload matriz filial clean

all: gui build uploadfs

gui:
	cd gui && npm install && npm run build

build:
	cp -r gui/dist/* matriz-esp32/data/
	cp -r gui/dist/* filial-esp32/data/

uploadfs-matriz:
	cd matriz-esp32 && pio run --target buildfs && \
		pio run --target uploadfs --upload-port $(UPLOAD_PORT)

uploadfs-filial:
	cd filial-esp32 && pio run --target buildfs && \
		pio run --target uploadfs --upload-port $(UPLOAD_PORT)

uploadfs: uploadfs-matriz uploadfs-filial

upload-matriz:
	cd matriz-esp32 && pio run --target upload --upload-port $(UPLOAD_PORT)

upload-filial:
	cd filial-esp32 && pio run --target upload --upload-port $(UPLOAD_PORT)

upload: upload-matriz upload-filial

matriz: gui build uploadfs-matriz upload-matriz

filial: gui build uploadfs-filial upload-filial

clean:
	cd gui && rm -rf dist
	cd matriz-esp32 && pio run --target clean
	cd filial-esp32 && pio run --target clean
```

### 7.3 Comandos de Build

| Comando         | Descrição                                                         |
| --------------- | ----------------------------------------------------------------- |
| `make all`      | Build GUI + upload filesystem + upload firmware (matriz e filial) |
| `make matriz`   | Build GUI + upload filesystem + upload firmware (matriz)          |
| `make filial`   | Build GUI + upload filesystem + upload firmware (filial)          |
| `make gui`      | Apenas build da interface React                                   |
| `make uploadfs` | Upload filesystem para ESP32                                      |
| `make upload`   | Upload firmware para ESP32                                        |
| `make clean`    | Limpa builds                                                      |

### 7.4 Fluxo de Deploy

1. `make matriz` executa:
   - `npm install && npm run build` na pasta `gui/`
   - Copia `gui/dist/*` para `matriz-esp32/data/`
   - `pio run --target buildfs` (prepara LittleFS)
   - `pio run --target uploadfs` (envia para ESP32)
   - `pio run --target upload` (envia firmware)

---

## 8. Decisões de Design

| #   | Decisão              | Valor                  | Descrição                                   |
| --- | -------------------- | ---------------------- | ------------------------------------------ |
| 1   | Polling              | 5 segundos             | Intervalo de polling configurável          |
| 2   | Timeout resposta     | "Sem resposta"         | Mostra na GUI quando filial não responde   |
| 3   | Retry                | Automático             | Cliente reenvia automaticamente             |
| 4   | Retry intervalo      | 5 segundos             | Mesmo intervalo do polling                  |
| 5   | Max retries          | Ilimitado              | Tenta indefinidamente                        |
| 6   | Identificação filial| IP:porta ou filial_id | Identifica por IP ou campo opcional         |
| 7   | Conflito IDs         | IP:porta para discernir| Distingue dispositivos com mesmo ID         |
| 8   | Payload              | JSON puro              | Sem delimitadores ou cabeçalhos             |
| 9   | Comunicação          | Broadcast              | UDP broadcast para comandos                 |
| 10  | Múltiplas filiais    | Simultâneas            | Cliente gerencia todas simultaneamente      |
| 11  | Atualização GUI     | WebSocket push         | Servidor empurra para cliente               |
| 12  | Estados              | Boolean                | Todos os valores são true/false             |
| 13  | Persistência         | LittleFS               | Matriz e Filial salvam configurações        |
| 14  | WiFi                 | Station + AP           | Ambos modos configuráveis                   |
| 15  | IP acesso            | Serial + mDNS          | Exibido no serial ou via nome.local         |
| 16  | Autenticação matriz  | Não validar            | Filial responde a qualquer broadcast        |
| 17  | set_req em sensor   | Ignorar                | Filial ignora comandos para sensores        |
| 18  | GUI UI               | shadcn/ui              | Biblioteca de componentes                     |
| 19  | GUI tema             | Dark-mode + toggle     | Suporte a tema escuro com alternância       |
| 20  | Pino GPIO            | Na config              | Cada device especifica seu pino            |

---

## 9. Ambientes de Teste

Para ambiente de teste, deve-se assumir:

- **Mínimo 2 filiais** executando o software servidor
- **1 matriz** executando o software cliente
- Cada filial com configuração própria em `config_filial.json`
- Matriz conecta em todas as filiais simultaneamente

---

## 10. Debug e Logging

### 10.1 Saída Serial

- **Baud rate**: 115200
- **Informações logging**:
  - Conexão WiFi (SSID, IP obtido)
  - Recebimento/envio de comandos UDP
  - Erros de parsing JSON
  - Estado dos dispositivos

---

## 11. Glossário

| Termo            | Descrição                                          |
| ---------------- | -------------------------------------------------- |
| **Matriz**       | Sistema central (HQ) que gerencia todas as filiais |
| **Filial**       | Sistema remoto em cada unidade da empresa          |
| **Cliente UDP**  | Componente que envia comandos                      |
| **Servidor UDP** | Componente que recebe comandos                     |
| **Sensor**       | Dispositivo de leitura (boolean ou analógico 0-1023) |
| **Atuador**      | Dispositivo de controle (boolean)                  |
| **LittleFS**     | Sistema de arquivos para ESP32                     |
| **Broadcast**    | Envio para todos os dispositivos na rede           |
| **Unicast**      | Envio para um dispositivo específico               |
| **Polling**      | Requisição periódica automática                    |
| **WebSocket**    | Comunicação bidirecional em tempo real             |

---

## 11. Histórico de Versões

| Versão | Data       | Descrição                                                                      |
| ------ | ---------- | ------------------------------------------------------------------------------ |
| v1     | 2026-03-29 | Versão inicial com requisitos detalhados                                      |
| v2     | 2026-03-29 | Adicionado: campo filial_id opcional, formato devices com pino GPIO, shadcn/ui + dark-mode, decisões sobre autenticação e sensores |
| v3     | 2026-03-29 | Adicionado: tipo de sensor analógico, seção de debug via serial, decisões sobre limite dispositivos, retry, modo AP |
