---
title: Infraestrutura — Configuração
description: Arquivos de configuração JSON do sistema (LittleFS)
---

# Infraestrutura — Configuração

## Visão Geral

Cada ESP32 mantém seus arquivos de configuração no **LittleFS**. Todos são JSON.

| Arquivo              | Onde            | Descrição                       |
| -------------------- | --------------- | ------------------------------- |
| `config_wifi.json`   | Matriz + Filial | Credenciais Wi-Fi               |
| `config_matriz.json` | Matriz          | Filiais e parâmetros de polling |
| `config_filial.json` | Filial          | ID, dispositivos e GPIOs        |

---

## `config_wifi.json` — Matriz e Filial

Credenciais da rede Wi-Fi para conexão em modo STA.

```json
{
    "ssid": "MinhaRede",
    "pass": "senha123"
}
```

| Campo  | Tipo   | Obrigatório | Descrição          |
| ------ | ------ | ----------- | ------------------ |
| `ssid` | string | Sim         | Nome da rede Wi-Fi |
| `pass` | string | Sim         | Senha da rede      |

> Se este arquivo não existir ou for inválido, o ESP32 entra em modo AP para provisionamento.

---

## `config_matriz.json` — Matriz

Configuração completa da Matriz, incluindo lista de filiais.

```json
{
    "filiais": [
        {
            "filial_id": "FIL001",
            "label": "Filial Centro",
            "ip": "192.168.1.101",
            "port": 51000,
            "user": "admin",
            "pass": "1234"
        },
        {
            "filial_id": "FIL002",
            "label": "Filial Norte",
            "ip": "192.168.1.102",
            "port": 51000,
            "user": "admin",
            "pass": "5678"
        }
    ],
    "polling_interval": 30000,
    "max_filiais": 10
}
```

### Campos de Filial

| Campo       | Tipo   | Obrigatório | Descrição                        |
| ----------- | ------ | ----------- | -------------------------------- |
| `filial_id` | string | Sim         | Identificador único (ex: FIL001) |
| `label`     | string | Sim         | Nome amigável                    |
| `ip`        | string | Sim         | IP da filial na rede local       |
| `port`      | number | Não         | Porta UDP (padrão: 51000)        |
| `user`      | string | Sim         | Usuário para autenticação UDP    |
| `pass`      | string | Sim         | Senha para autenticação UDP      |

### Parâmetros Globais

| Campo              | Tipo   | Padrão | Descrição                    |
| ------------------ | ------ | ------ | ---------------------------- |
| `polling_interval` | number | 30000  | Intervalo de polling (ms)    |
| `max_filiais`      | number | 10     | Máximo de filiais suportadas |

### Validação

| Regra                          | Erro                |
| ------------------------------ | ------------------- |
| `filial_id` duplicado          | Rejeitado na adição |
| `filiais.length > max_filiais` | Rejeitado na adição |
| `filial_id` vazio ou ausente   | Rejeitado           |
| `ip` em formato inválido       | Rejeitado           |

---

## `config_filial.json` — Filial

Configuração completa da Filial, incluindo dispositivos e mapeamento GPIO.

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
        },
        {
            "id": "ar_sala",
            "label": "Ar-condicionado da Sala",
            "type": "ac",
            "role": "sensor_actuator",
            "gpio_read": 34,
            "gpio_write": 25
        }
    ]
}
```

### Campos de Dispositivo

| Campo        | Tipo   | Obrigatório | Descrição                          |
| ------------ | ------ | ----------- | ---------------------------------- |
| `id`         | string | Sim         | Identificador único do dispositivo |
| `label`      | string | Sim         | Nome amigável                      |
| `type`       | string | Sim         | `"light"` ou `"ac"`                |
| `role`       | string | Sim         | `"sensor_actuator"`                |
| `gpio_read`  | number | Sim         | GPIO para leitura do sensor        |
| `gpio_write` | number | Sim         | GPIO para escrita no atuador       |

### GPIO — Luz (`type: "light"`)

| GPIO         | Modo   | Função           | Valores |
| ------------ | ------ | ---------------- | ------- |
| `gpio_read`  | INPUT  | `digitalRead()`  | 0 ou 1  |
| `gpio_write` | OUTPUT | `digitalWrite()` | 0 ou 1  |

### GPIO — Ar-condicionado (`type: "ac"`)

| GPIO         | Modo   | Função            | Valores |
| ------------ | ------ | ----------------- | ------- |
| `gpio_read`  | ANALOG | `analogRead()`    | 0–1023  |
| `gpio_write` | OUTPUT | `ledcWrite()` PWM | 0–1023  |

---

## Fallbacks

| Arquivo              | Ausência                          |
| -------------------- | --------------------------------- |
| `config_wifi.json`   | Entra em modo AP (captive portal) |
| `config_matriz.json` | Cria com filiais=[] e defaults    |
| `config_filial.json` | Cria com valores mínimos          |
