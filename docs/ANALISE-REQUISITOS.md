# Análise de Requisitos - UDP IoT Monitoramento

> **Data:** 2026-04-01
> **Objetivo:** Identificar incongruências, conflitos e discrepâncias nos requisitos, além de itens pendentes de definição.

---

## PARTE 1: Incongruências, Conflitos e Discrepâncias

Ordenados por **prioridade** (🔴 Alta | 🟡 Média | 🟢 Baixa)

---

### 🔴 P1 - Estrutura do `config_filial.json` inconsistente

**Arquivos envolvidos:** `00-solicitação.md`, `01-requisitos.md`, `02-definições.md`, `06-filial.md`, `07-config-build.md`

**Conflito:**
- Em `00-solicitação.md` (linha 140-143) e `01-requisitos.md` (linha 207-215), o campo de dispositivos é `"id"` com array de strings:
  ```json
  { "id": ["actuator_light_sala", "sensor_light_sala"] }
  ```
- Em `06-filial.md` (linha 57-68) e `02-definições.md` (fim do arquivo), usa `"devices"` com array de objetos contendo `id` e `pin`:
  ```json
  { "devices": [{ "id": "actuator_light_sala", "pin": 2 }] }
  ```
- Em `07-config-build.md` (linha 123-145), mistura os dois: mostra `"id"` (array de strings) na tabela mas menciona `"devices"` (array de objetos) na descrição.

**Sugestão:**
Padronizar para `"devices"` com objetos `{id, pin}` pois é o formato mais completo e necessário para mapeamento GPIO. Atualizar `00-solicitação.md`, `01-requisitos.md` e `07-config-build.md`.

**Decisão**:


---

### 🔴 P2 - Valor de AC fora do range (0-100) em exemplo

**Arquivos envolvidos:** `01-requisitos.md`

**Conflito:**
- Em `01-requisitos.md` (linha 123-125), o exemplo mostra `"actuator_ac_escritorio": 720`, mas o range definido é `0-100`.

**Sugestão:**
Corrigir o exemplo para um valor válido como `72`.

#### **Decisão**:
Alterar range de 0 a 1023.
Alterar do arquivo 01 em diante;

---

### 🔴 P3 - Senha padrão de fallback inconsistente na Filial

**Arquivos envolvidos:** `01-requisitos.md`, `02-definições.md`, `06-filial.md`

**Conflito:**
- Em `01-requisitos.md` (linha 207-215): `"admin_pass": "test"`
- Em `06-filial.md` (linha 79-81): fallback `admin_pass="1234"`
- Em `02-definições.md`: exemplos usam `"pass": "1234"` e `"admin_pass": "admin"`

**Sugestão:**
Definir um único valor padrão. Recomendação: `"admin"` para consistência com a Matriz.
#### **Aceitar Sugestão**

---

### 🔴 P4 - Campos `user`/`pass` vs `admin_user`/`admin_pass`

**Arquivos envolvidos:** `00-solicitação.md`, `01-requisitos.md`, `04-matriz.md`, `06-filial.md`

**Conflito:**
- `00-solicitação.md` (linha 139-140): usa `admin_user` e `admin_pass`
- `01-requisitos.md` (linha 227-228): usa `user` e `pass` no config da Matriz
- `04-matriz.md` (linha 66-67): usa `user` e `pass`
- `06-filial.md` (linha 60-61): usa `admin_user` e `admin_pass`

**Sugestão:**
Padronizar:
- **Matriz config:** `user` e `pass`
- **Filial config:** `admin_user` e `admin_pass`
- **Protocolo UDP:** `user` e `pass` (em toda requisição)
#### **Aceitar Sugestão**

---

### 🔴 P5 - Nome do campo no `list_resp` inconsistente

**Arquivos envolvidos:** `00-solicitação.md`, `01-requisitos.md`, outros

**Conflito:**
- Em `00-solicitação.md` (linha 43-48): `"id": "[sensor_actuator_vector]"` (string)
- Em `01-requisitos.md` (linha 100-104): `"id": ["actuator_light_sala", ...]` (array)

**Sugestão:**
Padronizar para array: `"id": ["actuator_light_sala", "sensor_light_sala"]`. O formato com string `"[sensor_actuator_vector]"` parece ser placeholder mal formatado.
#### **Aceitar Sugestão**

---

### 🟡 P6 - Polling interval mínimo inconsistente

**Arquivos envolvidos:** `04-matriz.md`, `02-definições.md`

**Conflito:**
- Em `04-matriz.md` (linha 81): `polling_interval: inteiro >= 5 e <= 120`
- Em `02-definições.md` (seção 4.2): `POLLING_MIN = 5s`, `POLLING_MAX = 120s` ✓

Esses estão alinhados, mas falta especificar o que acontece se o usuário tentar definir um valor fora do range via GUI.

**Sugestão:**
Documentar comportamento: rejeitar com erro 400 ou fazer clamp automático? Recomendação: rejeitar com erro 400.
#### **Decisão**:
Clipar automaticamente para o range permitido (5-120s) e logar warning. Rejeitar pode ser frustrante para o usuário.

---

### 🟡 P7 - Porta local da Matriz para UDP não especificada claramente

**Arquivos envolvidos:** `04-matriz.md`, `02-definições.md`, `06-filial.md`

**Conflito:**
- Em `04-matriz.md` (linha 214): "Porta local: 51000 (fixa)"
- Mas a Matriz é **cliente** UDP, não servidor. Ela precisa escutar respostas?
- Em `06-filial.md` (linha 216): "Filial envia resposta para IP e porta de **origem** do comando"

**Sugestão:**
Clarificar que:
- Matriz **envia** comandos de qualquer porta efêmera
- Matriz **escuta** respostas na porta 51000 (fixa)
- Filial **escuta** comandos na porta 51000 (configurável)
- Filial **responde** para IP:porta de origem do comando
#### **Aceitar Sugestão**

---

### 🟡 P8 - Campo `discovery_every_cycles` ausente em alguns docs

**Arquivos envolvidos:** `04-matriz.md`, `07-config-build.md`

**Conflito:**
- Em `04-matriz.md` (linha 71): `discovery_every_cycles: 10`
- Em `07-config-build.md` (linha 105-119): não menciona `discovery_every_cycles`

**Sugestão:**
Adicionar `discovery_every_cycles` ao exemplo de `config_matriz.json` em `07-config-build.md`.
#### **Aceitar Sugestão**

---

### 🟡 P9 - Comportamento de autenticação falha não é claro

**Arquivos envolvidos:** `06-filial.md`, `04-matriz.md`

**Conflito:**
- Em `06-filial.md` (linha 129): "Falha de autenticação → resposta ignorada silenciosamente"
- Mas isso causa timeout na Matriz. O comportamento é intencional?

**Sugestão:**
Confirmar que este é o comportamento desejado (segurança por obscuridade). Alternativamente, a Filial poderia retornar `{"cmd":"error","code":"AUTH_FAILED"}`, mas isso expõe que o servidor existe.

**Decisão recomendada:** Manter silêncio (ignorar) - é o padrão em sistemas IoT por segurança.
#### **Aceitar Sugestão**

---

### 🟡 P10 - Formato de `set_resp` com `ok` e `code` não está no protocolo base

**Arquivos envolvidos:** `00-solicitação.md`, `01-requisitos.md`, `04-matriz.md`, `05-matriz-gui.md`

**Conflito:**
- Em `00-solicitação.md` e `01-requisitos.md`, `set_resp` só tem `cmd`, `id`, `value`
- Em `04-matriz.md` (linha 263-264) e `05-matriz-gui.md` (linha 86-118), `set_resp` inclui `ok`, `code`

**Sugestão:**
Esses campos extras (`ok`, `code`) são adicionados pela **Matriz** ao repassar para a GUI via WebSocket, não são parte do protocolo UDP Matriz↔Filial. Documentar claramente essa distinção:
- **UDP (Filial→Matriz):** `{ "cmd": "set_resp", "id": "...", "value": ... }`
- **WebSocket (Matriz→GUI):** `{ "cmd": "set_resp", "id": "...", "value": ..., "ok": true/false, "code": "..." }`
#### **Aceitar Sugestão**

---

### 🟡 P11 - `type` e `deviceType` redundantes na estrutura DeviceConfig

**Arquivos envolvidos:** `06-filial.md`

**Conflito:**
- Em `06-filial.md` (linha 46-52), `DeviceConfig` tem campos `type` e `deviceType`
- Mas o ID já contém essa informação: `<tipo>_<dispositivo>_<local>`

**Sugestão:**
Extrair `type` e `deviceType` do `id` em runtime em vez de armazenar redundantemente. Ou manter apenas `id` e `pin` no config (como já está no JSON de exemplo).
#### **Aceitar Sugestão**

---

### 🟢 P12 - Vírgulas trailing em exemplos JSON

**Arquivos envolvidos:** `00-solicitação.md`

**Problema:**
JSON inválido com vírgulas trailing:
```json
{ "cmd":"list_req", }  // vírgula extra inválida
```

**Sugestão:**
Remover vírgulas trailing dos exemplos para evitar confusão.
#### **Aceitar Sugestão**

---

### 🟢 P13 - Nomenclatura "Usuário" vs "Operador" vs "Admin"

**Arquivos envolvidos:** Todos

**Inconsistência:**
- Alguns lugares usam "Usuário", outros "Operador", outros "admin"
- Em `02-definições.md`: aparece "Usuárioes" (erro de digitação)

**Sugestão:**
Padronizar para "Usuário" (quem usa o dashboard) e "Admin" (credenciais de autenticação).
#### **Aceitar Sugestão**

---

### 🟢 P14 - mDNS nome do serviço

**Arquivos envolvidos:** `04-matriz.md`, `05-matriz-gui.md`

**Conflito menor:**
- `04-matriz.md` (linha 281): menciona `esp32-matriz.local`
- `05-matriz-gui.md` (linha 179-181): detalha serviço `_http._tcp` com nome `esp32-matriz`

Esses estão alinhados, mas falta especificar o fallback completo quando mDNS falha.

**Sugestão:**
Documentar fallback manual de IP em `05-matriz-gui.md`. OK.

---

## PARTE 2: Itens Pendentes de Definição (Arquivos 04+)

Ordenados por **prioridade para implementação**

---

### 🔴 D1 - Formato exato do ID de filial nos endpoints REST

**Arquivo:** `04-matriz.md`

**Pendência:**
- Usa `:id` como `ip:porta` (ex: `192.168.1.100:51000`)
- Mas como escapar `:` na URL? `/api/filiais/192.168.1.100:51000` pode dar problemas em alguns frameworks.

**Sugestão:**
- Usar URL encoding (`192.168.1.100%3A51000`)
#### **Aceitar Sugestão**


---

### 🔴 D2 - Comportamento quando `set_req` para dispositivo inexistente

**Arquivo:** `04-matriz.md`, `06-filial.md`

**Pendência:**
- `06-filial.md` (linha 331): "Dispositivos não encontrados em `setValue` → comando ignorado silenciosamente"
- Mas isso causa timeout. A GUI não sabe distinguir entre:
  - Filial offline
  - Dispositivo inexistente
  - Credenciais erradas

**Recomendação:** Manter silêncio por simplicidade. A GUI pode validar contra a lista de dispositivos conhecidos antes de enviar `set_req`.
#### **Aceitar Sugestão**

---

### 🔴 D3 - Máximo de clientes WebSocket simultâneos

**Arquivo:** `05-matriz-gui.md`

**Pendência:**
- Menciona fila máxima de 20 mensagens por cliente
- Mas não define máximo de clientes simultâneos (limite de RAM do ESP32)

**Decisão necessária:**
- [ ] Definir `MAX_WS_CLIENTS` (sugestão: 4-8)

**Recomendação:** `MAX_WS_CLIENTS = 4`, rejeitar novas conexões com HTTP 503.
#### **Aceitar Sugestão**

---

### 🟡 D4 - Reconexão WebSocket - detalhes de implementação

**Arquivo:** `05-matriz-gui.md`, `07-config-build.md`

**Pendência:**
- `07-config-build.md` menciona "Backoff exponencial de 1s a 30s"
- Falta definir:
  - Quantas tentativas antes de desistir?
  - Notificação visual para o usuário durante reconexão?
  - Reset do backoff após conexão bem-sucedida?

**Sugestão:**
- [ ] Tentativas infinitas vs máximo (sugestão: infinitas com indicador visual)
#### **Aceitar Sugestão**


---

### 🟡 D5 - Validação de GPIO válidos

**Arquivo:** `06-filial.md`

**Pendência:**
- Lista pinos permitidos e proibidos (GPIO 6-11 reservados)
- Mas não define o que acontece se config tiver pino inválido

**Decisão necessária:**
- [ ] Falhar boot inteiro (mais seguro)

**Recomendação:** Ignorar dispositivo com pino inválido, logar warning, continuar boot.
#### **Aceitar Sugestão**

---

### 🟡 D6 - Persistência de estado dos atuadores

**Arquivo:** `06-filial.md`

**Pendência:**
- Não está claro se o estado dos atuadores persiste após reboot da Filial
- `actuator_light_sala = true` → reboot → volta `true` ou `false`?

**Decisão necessária:**
- [ ] Estado volátil - atuadores iniciam desligados (mais seguro)
- [ ] Estado persistido em LittleFS (complexo)
- [ ] Estado configurável por dispositivo

**Recomendação:** Estado volátil - todos atuadores iniciam desligados (0 ou false).
#### **Aceitar Sugestão**

---

### 🟡 D7 - Formato de timestamp em `lastSeen`

**Arquivo:** `04-matriz.md`

**Pendência:**
- `GET /api/filiais` retorna `lastSeen: 1711861200`
- É Unix timestamp em segundos? Milissegundos? Local ou UTC?

**Decisão necessária:**
- [ ] Unix timestamp em **segundos** UTC (padrão)
- [ ] ISO 8601 string para legibilidade

**Recomendação:** Unix timestamp em segundos UTC.
#### **Aceitar Sugestão**

---

### 🟡 D8 - Comportamento do Captive Portal após conexão Station bem-sucedida

**Arquivo:** `04-matriz.md`, `06-filial.md`, `07-config-build.md`

**Pendência:**
- Após provisioning WiFi, o modo é STA+AP
- O AP continua acessível? Com qual SSID?
- O Captive Portal ainda funciona no AP após conexão STA?

**Decisão necessária:**
- [ ] AP permanece ativo (para recovery) - qual SSID?

**Recomendação:** AP permanece ativo com mesmo SSID, portal serve página de status + permite reconfiguração WiFi.
#### **Aceitar Sugestão**

---

### 🟢 D9 - Limites de tamanho de strings

**Arquivo:** `04-matriz.md`, `06-filial.md`

**Pendência:**
- Qual o tamanho máximo de:
  - `name` de filial
  - `id` de dispositivo
  - `user`/`pass`

**Decisão necessária:**
Definir limites para evitar overflow:
- [ ] `name`: 32 caracteres
- [ ] `id`: 64 caracteres
- [ ] `user`/`pass`: 32 caracteres cada
#### **Aceitar Sugestão**

---

### 🟢 D10 - Tratamento de múltiplos `set_req` simultâneos

**Arquivo:** `06-filial.md`

**Pendência:**
- Se a Matriz enviar dois `set_req` rapidamente para o mesmo dispositivo, qual valor prevalece?

**Decisão necessária:**
- [ ] Último comando recebido prevalece (FIFO)
- [ ] Usar mutex/fila na Filial

**Recomendação:** Último comando prevalece, processamento síncrono no loop UDP.

---

### 🟢 D11 - Logs e diagnóstico

**Arquivo:** `07-config-build.md`

**Pendência:**
- Baud rate 115200 definido
- Mas falta definir:
  - Níveis de log (DEBUG, INFO, WARN, ERROR)
  - Formato das mensagens
  - Como habilitar/desabilitar em produção

**Decisão necessária:**
- [ ] Definir macro `DEBUG_LEVEL` em `platformio.ini`
- [ ] Formato: `[LEVEL] [MODULE] message`

---

### 🟢 D12 - GUI da Filial - escopo exato

**Arquivo:** `02-definições.md`, `06-filial.md`

**Pendência:**
- `02-definições.md` menciona "GUI local simples" para a Filial
- `06-filial.md` foca em REST API mas não especifica a interface HTML
- É necessário servir HTML ou apenas REST API é suficiente?

**Decisão necessária:**
- [ ] Apenas REST API (configuração via curl/Postman)
- [ ] HTML mínimo (formulário WiFi + status)
- [ ] GUI React similar à Matriz

**Recomendação:** HTML mínimo inline (sem build separado) para WiFi provisioning + status básico.

---

## PARTE 3: Resumo de Ações

### Correções Prioritárias (fazer antes de implementar)

| #   | Ação                                                                | Arquivos   |
| --- | ------------------------------------------------------------------- | ---------- |
| 1   | Padronizar `config_filial.json` para usar `devices` com `{id, pin}` | 00, 01, 07 |
| 2   | Corrigir exemplo de AC 720 → 72                                     | 01         |
| 3   | Padronizar senha fallback para `"admin"`                            | 01, 02, 06 |
| 4   | Documentar distinção `set_resp` UDP vs WebSocket                    | 04, 05     |
| 5   | Remover vírgulas trailing dos exemplos JSON                         | 00         |

### Decisões Necessárias (bloqueia implementação)

| #   | Decisão                                | Default sugerido              |
| --- | -------------------------------------- | ----------------------------- |
| D1  | ID de filial na URL                    | URL encoding ou separador `_` |
| D2  | `set_req` para dispositivo inexistente | Silêncio (timeout)            |
| D3  | Max clientes WebSocket                 | 4                             |
| D6  | Estado atuadores após reboot           | Desligados (volátil)          |
| D8  | AP após STA conectar                   | Permanece ativo               |

### Melhorias Opcionais (pós-MVP)

- D4: Detalhes reconexão WebSocket
- D9: Limites de tamanho de strings
- D11: Sistema de logs estruturado
- D12: GUI da Filial

---

## Checklist de Validação

Antes de iniciar implementação, validar:

- [ ] Todos os exemplos JSON são válidos (sem vírgulas trailing)
- [ ] `config_filial.json` usa formato `devices: [{id, pin}]`
- [ ] Valores de exemplo estão dentro dos ranges (AC 0-100)
- [ ] Senhas padrão consistentes em todos os docs
- [ ] Campos `user`/`pass` vs `admin_user`/`admin_pass` claros
- [ ] Decisões D1-D12 documentadas e aprovadas
