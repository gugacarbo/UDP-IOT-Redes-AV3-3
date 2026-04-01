---
title: DevOps — Debug e Testes
description: Ferramentas de debug, logging, testes e troubleshooting
---

# DevOps — Debug e Testes

## Debug Serial

### Monitor PlatformIO

```bash
cd matriz-esp32  # ou filial-esp32
pio device monitor
```

| Parâmetro | Valor       |
| --------- | ----------- |
| Baud rate | 115200      |
| Porta     | Auto-detect |

### Atalhos do Monitor

| Tecla    | Ação             |
| -------- | ---------------- |
| `Ctrl+]` | Encerrar monitor |
| `Ctrl+T` | Menu de comandos |

---

## Logging

### Níveis de Log

| Nível | Prefixo | Uso                |
| ----- | ------- | ------------------ |
| ERROR | `[E]`   | Erros críticos     |
| WARN  | `[W]`   | Avisos             |
| INFO  | `[I]`   | Informações gerais |
| DEBUG | `[D]`   | Debug detalhado    |

### Exemplo de Saída

```
[I] WiFi conectado: 192.168.1.100
[I] mDNS iniciado: matriz.local
[I] WebSocket server na porta 80
[I] UDP Response Handler na porta 51000
[I] Polling iniciado (intervalo: 30s)
[D] Enviando get_status para FIL001 (192.168.1.101)
[D] Resposta OK de FIL001 (2 dispositivos)
[D] status_update enviado via WS
[W] Timeout de FIL002 (missed: 2/3)
[E] Filial FIL002 offline (3 ciclos sem resposta)
```

---

## Testes Unitários

### PlatformIO Test

```bash
cd filial-esp32  # ou matriz-esp32
pio test
```

### Estrutura de Testes

```
test/
├── test_main/          # Testes do main
├── test_command/       # Testes de comandos
└── test_device/        # Testes de dispositivos
```

> **Nota**: Para testes que dependem de hardware, use mocks para GPIO e WiFi.

---

## Testes Manuais

### Teste de Conectividade UDP

Usando `netcat` para simular a Matriz enviando comandos para a Filial:

```bash
# Enviar list_req
echo '{"cmd":"list_req","user":"admin","pass":"1234"}' | nc -u -w1 192.168.1.101 51000

# Enviar get_status
echo '{"cmd":"get_status","user":"admin","pass":"1234"}' | nc -u -w1 192.168.1.101 51000

# Enviar set_req (desligar luz)
echo '{"cmd":"set_req","user":"admin","pass":"1234","filial_id":"FIL001","device_id":"luz_sala","value":0}' | nc -u -w1 192.168.1.101 51000
```

### Teste de WebSocket

Usando `wscat`:

```bash
# Instalar
npm install -g wscat

# Conectar
wscat -c ws://matriz.local/ws

# Enviar comandos
> {"cmd":"list_req"}
> {"cmd":"get_status"}
> {"cmd":"set_req","filial_id":"FIL001","device_id":"luz_sala","value":1}
```

### Teste de REST API

```bash
# Status da Matriz
curl http://matriz.local/api/status

# Listar filiais
curl http://matriz.local/api/filiais

# Status da Filial
curl http://192.168.1.101/api/status
```

---

## Troubleshooting

### Filial não responde

| Sintoma                    | Verificação                            |
| -------------------------- | -------------------------------------- |
| `TIMEOUT` no polling       | Verificar IP da filial no config       |
| Sem resposta UDP           | Verificar se filial está na mesma rede |
| `AUTH_ERROR`               | Verificar `user`/`pass` no config      |
| Filial offline persistente | Verificar conexão Wi-Fi da filial      |

### GUI não carrega

| Sintoma                   | Verificação                           |
| ------------------------- | ------------------------------------- |
| Página em branco          | Verificar se `uploadfs` foi executado |
| WebSocket não conecta     | Verificar mDNS (`matriz.local`)       |
| Dispositivos não aparecem | Verificar serial log da Matriz        |

### Wi-Fi não conecta

| Sintoma          | Verificação                            |
| ---------------- | -------------------------------------- |
| Não entra em STA | Verificar `config_wifi.json`           |
| AP não aparece   | Verificar serial log (boot)            |
| Portal não abre  | Verificar se captive portal está ativo |

---

## PlatformIO — Comandos Úteis

```bash
# Limpar build
pio run -t clean

# Verificar compilação sem upload
pio run

# Upload apenas do filesystem
pio run -t uploadfs

# Verificar dispositivos seriais
pio device list

# Verificar configuração
pio project config
```
