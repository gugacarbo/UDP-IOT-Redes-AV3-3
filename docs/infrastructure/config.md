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

Configuração Wi-Fi com suporte a modo STA, AP e AP simultâneo.

```json
{
    "mode": "sta",
    "ssid": "MinhaRede",
    "password": "senha123",
    "ap_ssid": "Matriz-Setup",
    "ap_password": "12345678"
}
```

| Campo         | Tipo   | Obrigatório | Descrição                         |
| ------------- | ------ | ----------- | --------------------------------- |
| `mode`        | string | Sim         | `"sta"`, `"ap"` ou `"sta+ap"`     |
| `ssid`        | string | Sim         | Nome da rede Wi-Fi (STA)          |
| `password`    | string | Sim         | Senha da rede (STA)               |
| `ap_ssid`     | string | Não         | SSID do AP (padrão: veja abaixo)  |
| `ap_password` | string | Não         | Senha do AP (mínimo 8 caracteres) |

> **AP SSID padrão**: Matriz usa `Matriz-Setup`; Filial usa `ESP32-<device_ip>-Setup`.
> Se este arquivo não existir ou for inválido, o ESP32 entra em modo AP para provisionamento.

---

## `config_matriz.json` — Matriz

Configuração completa da Matriz, incluindo lista de filiais e credenciais globais.

```json
{
    "filiais": [
        {
            "name": "Filial Centro",
            "ip": "192.168.1.101",
            "port": 51000
        },
        {
            "name": "Filial Norte",
            "ip": "192.168.1.102",
            "port": 51000
        }
    ],
    "polling_interval": 30000,
    "discovery_every_cycles": 10,
    "user": "admin",
    "pass": "admin"
}
```

### Campos de Filial

| Campo  | Tipo   | Obrigatório | Descrição                  |
| ------ | ------ | ----------- | -------------------------- |
| `name` | string | Sim         | Nome amigável              |
| `ip`   | string | Sim         | IP da filial na rede local |
| `port` | number | Não         | Porta UDP (padrão: 51000)  |

### Parâmetros Globais

| Campo                    | Tipo   | Padrão | Descrição                            |
| ------------------------ | ------ | ------ | ------------------------------------ |
| `polling_interval`       | number | 30000  | Intervalo de polling (ms)            |
| `discovery_every_cycles` | number | 10     | Ciclos entre descobertas automáticas |
| `user`                   | string | —      | Usuário global para autenticação UDP |
| `pass`                   | string | —      | Senha global para autenticação UDP   |

### Validação

| Regra                    | Erro                |
| ------------------------ | ------------------- |
| `ip` duplicado           | Rejeitado na adição |
| `ip` em formato inválido | Rejeitado           |
| `name` vazio ou ausente  | Rejeitado           |

---

## `config_filial.json` — Filial

Configuração completa da Filial, incluindo dispositivos e mapeamento GPIO.

```json
{
    "port": 51000,
    "admin_user": "admin",
    "admin_pass": "admin",
    "devices": [
        { "id": "actuator_light_sala", "pin": 22 },
        { "id": "sensor_light_sala", "pin": 23 },
        { "id": "actuator_ac_sala", "pin": 25 },
        { "id": "sensor_ac_sala", "pin": 34 }
    ]
}
```

### Campos de Dispositivo

| Campo | Tipo   | Obrigatório | Descrição                                                |
| ----- | ------ | ----------- | -------------------------------------------------------- |
| `id`  | string | Sim         | Identificador único no formato `<tipo>_<device>_<local>` |
| `pin` | number | Sim         | GPIO associado ao dispositivo                            |

> O prefixo do `id` define o comportamento: `sensor_*` → leitura, `actuator_*` → escrita.

### GPIO — Sensores (prefixo `sensor_`)

| Dispositivo          | ID                  | GPIO | Função          | Valores |
| -------------------- | ------------------- | ---- | --------------- | ------- |
| Sensor de Luz (Sala) | `sensor_light_sala` | 23   | `digitalRead()` | 0 ou 1  |
| Sensor de AC (Sala)  | `sensor_ac_sala`    | 34   | `analogRead()`  | 0–1023  |

### GPIO — Atuadores (prefixo `actuator_`)

| Dispositivo        | ID                    | GPIO | Função            | Valores |
| ------------------ | --------------------- | ---- | ----------------- | ------- |
| Atuador Luz (Sala) | `actuator_light_sala` | 22   | `digitalWrite()`  | 0 ou 1  |
| Atuador AC (Sala)  | `actuator_ac_sala`    | 25   | `ledcWrite()` PWM | 0–1023  |

---

## Fallbacks

| Arquivo              | Ausência                          |
| -------------------- | --------------------------------- |
| `config_wifi.json`   | Entra em modo AP (captive portal) |
| `config_matriz.json` | Cria com filiais=[] e defaults    |
| `config_filial.json` | Cria com valores mínimos          |
