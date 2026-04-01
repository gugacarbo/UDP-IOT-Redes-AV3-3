---
title: DevOps — Build e Deploy
description: Processo de build, deploy e upload do firmware ESP32 e GUI React
---

# DevOps — Build e Deploy

## Visão Geral

O projeto usa um **Makefile** na raiz para orquestrar o build completo do sistema.

| Componente      | Build Tool  | Output                     |
| --------------- | ----------- | -------------------------- |
| Matriz Firmware | PlatformIO  | Firmware ESP32 (.bin)      |
| Matriz GUI      | Vite + pnpm | Arquivos estáticos (dist/) |
| Filial Firmware | PlatformIO  | Firmware ESP32 (.bin)      |
| Filial GUI      | —           | Portal HTML (data/)        |

---

## Makefile

O Makefile na raiz automatiza o build completo:

| Target               | Descrição                                 |
| -------------------- | ----------------------------------------- |
| `make all`           | Build completo (GUI + firmware)           |
| `make matriz`        | Build e upload da matriz (GUI + firmware) |
| `make filial`        | Build e upload da filial                  |
| `make gui`           | Build da GUI React                        |
| `make upload-matriz` | Upload firmware + filesystem da matriz    |
| `make upload-filial` | Upload firmware + filesystem da filial    |
| `make clean`         | Limpa artefatos de build                  |
| `make monitor`       | Serial monitor (PlatformIO)               |

---

## Build da Matriz

### 1. Build da GUI React

```bash
cd matriz-gui
pnpm install
pnpm build
```

**Output**: `matriz-gui/dist/`

### 2. Copiar GUI para LittleFS

```bash
cp -r matriz-gui/dist/* matriz-esp32/data/
```

### 3. Build e Upload do Firmware

```bash
cd matriz-esp32
pio run -t upload       # Firmware
pio run -t uploadfs     # Filesystem (GUI)
```

### Comando único

```bash
make matriz
```

---

## Build da Filial

### Build e Upload do Firmware

```bash
cd filial-esp32
pio run -t upload       # Firmware
pio run -t uploadfs     # Filesystem (portal)
```

### Comando único

```bash
make filial
```

---

## Estrutura de Diretórios de Build

```
.
├── Makefile                 # Orquestração
├── matriz-esp32/
│   ├── platformio.ini       # Config PlatformIO
│   ├── data/                # Arquivos estáticos (GUI compilada)
│   │   ├── index.html
│   │   └── assets/
│   ├── lib/                 # Bibliotecas C++
│   └── src/
│       └── main.cpp
├── matriz-gui/
│   ├── package.json         # Dependências Node
│   ├── vite.config.ts       # Config Vite
│   ├── src/                 # Código-fonte React
│   └── dist/                # Build output
├── filial-esp32/
│   ├── platformio.ini       # Config PlatformIO
│   ├── data/                # Portal HTML
│   ├── lib/                 # Bibliotecas C++
│   └── src/
│       └── main.cpp
└── filial-gui/              # (portal opcional)
```

---

## PlatformIO — Configuração

### `platformio.ini` (Matriz)

```ini
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
board_build.filesystem = littlefs
lib_deps =
    bblanchon/ArduinoJson@^7
    mathieucarbou/AsyncWebServer@^3
    mathieucarbou/AsyncTCP@^3
monitor_speed = 115200
```

### `platformio.ini` (Filial)

```ini
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
board_build.filesystem = littlefs
lib_deps =
    bblanchon/ArduinoJson@^7
monitor_speed = 115200
```

---

## Variáveis de Ambiente

| Variável       | Uso                      |
| -------------- | ------------------------ |
| `PORT`         | Porta serial para upload |
| `PIO_CORE_DIR` | Diretório do PlatformIO  |

---

## Ordem de Deploy Recomendada

1. **Build** da GUI React (`make gui`)
2. **Upload** da Matriz (`make upload-matriz`)
3. **Upload** da Filial (`make upload-filial`)
4. **Monitor** serial para verificar boot (`make monitor`)
5. **Configurar** Wi-Fi via captive portal (se necessário)
6. **Acessar** GUI via `http://matriz.local`
