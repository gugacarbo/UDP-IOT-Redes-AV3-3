---
title: UDP IoT Monitoramento
description: Definições gerais do sistema — entidades, protocolos, fluxos de comunicação e exemplos práticos
sidebar_position: 3
---

<!-- markdownlint-disable-file MD013 MD022 MD026 MD031 MD032 MD036 MD040 MD012 -->

# UDP IoT Monitoramento

## 1. Introdução

### 1.1 Contexto

Ema empresa com várias filiais espalhadas pela cidade está gastando muito dinheiro sendo desperdiçado com energia elétrica.

> Luzes ficam ligadas durante a noite (quando não tem ninguém trabalhando)
> Ar-condicionados continuam funcionando nos finais de semana
> Ninguém na matriz sabe o que está acontecendo em cada filial em tempo real
> Cada filial funciona de forma independente, sem controle centralizado

**Solução:** Um sistema IoT que permite monitorar e controlar tudo remotamente, direto de um computador na matriz.

### 1.2 Visão Geral

**1.2.1 Matriz**

- Um ESP32 rodando na matriz da empresa
- Serve um site (dashboard) para os Usuários
- Manda comandos para todas as filiais via WiFi
- Recebe os dados de todas as filiais em tempo real

**1.2.2 Filiais**
- Cada filial tem seu próprio ESP32
- Conectado a sensores (para ver o que está acontecendo)
- Conectado a atuadores (para ligar/desligar equipamentos)
- Recebe comandos da matriz e executa ações
- Também expõe um portal local de configuração e diagnóstico
- Esse portal é acessado apenas na rede da própria filial e não substitui o dashboard central

**1.2.3 Portal Local da Filial**
- Interface local simples, servida pelo ESP32 da filial
- Usada para configurar Wi-Fi, credenciais, IP e parâmetros básicos de operação
- Exibe o status dos sensores e atuadores daquela filial
- Serve para manutenção e testes locais, não para operação centralizada
- É carregada do LittleFS da filial e atendida via HTTP/REST na porta 80

**1.2.4 Interface Web**
- Um site moderno feito em React
- Mostra o status de todas as filiais em tempo real
- Permite ligar/desligar luzes e ar-condicionado com um clique
- Atualiza automaticamente sem precisar dar refresh
- A GUI final é servida pela Matriz via LittleFS

## 2. Estrutura

### 2.1 Entidades do Sistema

#### 2.1.1 Matriz

- Gerencia todas as filiais remotamente
- Serve o dashboard web para os Usuários
- Envia comandos via rede WiFi
- Recebe atualizações em tempo real

**Tecnologias:**

- Hardware: ESP32 (microcontrolador com WiFi)
- Software: AsyncWebServer (servidor web) + WebSocket (comunicação em tempo real)
- Função na rede: Cliente UDP (quem **faz** os pedidos)

#### 2.1.2 Filial

- Controla luzes e ar-condicionado localmente
- Lê sensores para saber o status atual
- Responde aos comandos da matriz
- Serve um portal local para configuração e diagnóstico

**Tecnologias:**
- Hardware: ESP32 com GPIOs conectados a sensores e atuadores
- Software: WiFiUDP (comunicação) + WebServer/AsyncWebServer + LittleFS
- Função na rede: Servidor UDP (quem **responde** aos pedidos) e servidor HTTP local da própria filial

#### 2.1.3 Dashboard Web

- Mostra todas as filiais em cards visuais
- Permite ligar/desligar dispositivos com um clique
- Atualiza status em tempo real (sem refresh)
- Permite adicionar/editar filiais

**Tecnologias:**
- React 19 (framework moderno)
- Vite (build rápido)
- shadcn/ui (componentes bonitos)
- WebSocket (para atualizações instantâneas)

### 2.2 Fluxo de Comunicação

```mermaid
flowchart LR
    subgraph NAVEGADOR["🖥️ Navegador — GUI React"]
        direction TB
        DASH[Dashboard]
        CTRL[Controle]
        CFG[Config. Filiais]
    end

    subgraph MATRIZ["📦 Matriz ESP32"]
        direction TB
        WEB_M[AsyncWebServer<br/>WebSocket + REST<br/>Porta 80]
        UDP_M[Módulo UDP<br/>Unicast Sender<br/>Porta 51000]
        FS_M[LittleFS<br/>config_matriz.json<br/>GUI build]
    end

    DASH <-->|WebSocket<br/>REST API| WEB_M
    CFG <-->|REST API| WEB_M
    CTRL <-->|WebSocket| WEB_M

    WEB_M <-->|Bridge| UDP_M
    FS_M -.->|Serve| WEB_M

    subgraph FILIAIS["🏭 Filiais ESP32"]
        direction TB
        subgraph FA["Filial A — 10.0.0.1:51000"]
          WEB_A[WebServer/AsyncWebServer<br/>Portal local de configuração<br/>Porta 80]
            UDP_A[UDP Server<br/>Porta 51000]
          FS_A[LittleFS<br/>Portal + config_filial.json]
            GPIO_A[GPIO<br/>Sensores + Atuadores]
        end

        subgraph FB["Filial B — 10.0.0.2:51000"]
          WEB_B[WebServer/AsyncWebServer<br/>Portal local de configuração<br/>Porta 80]
            UDP_B[UDP Server<br/>Porta 51000]
          FS_B[LittleFS<br/>Portal + config_filial.json]
            GPIO_B[GPIO<br/>Sensores + Atuadores]
        end
    end

    UDP_M <-->|UDP Unicast| UDP_A
    UDP_M <-->|UDP Unicast| UDP_B

    UDP_A <-->|Dispatch| GPIO_A
    FS_A -.->|Load| UDP_A

    UDP_B <-->|Dispatch| GPIO_B
    FS_B -.->|Load| UDP_B
```

> Cada filial é independente — gerencia seus próprios dispositivos e não
> depende das demais. A Matriz atua como _hub_ centralizador, mas cada
> filial também pode servir sua GUI local para configuração e diagnóstico
> sem interferir no dashboard central.

### 2.3 Protocolos de Comunicação

#### 2.3.1 UDP (Matriz ↔ Filial)

- **Muito rápido** não perde tempo criando conexão
- **Fire-and-forget** envia e esquece (sem garantia de entrega)
- **Unicast** envia para um endereço específico
- **Porta:** 51000
- **Formato:** JSON (texto puro)
- **Segurança:** `user` e `pass` em cada mensagem
- **Confiabilidade:** fire-and-forget, sem ACK obrigatório


#### 2.3.2 WebSocket (ESP32 ↔ Navegador)

- **Bidirecional** navegador E servidor podem enviar mensagens
- **Tempo real** atualiza instantaneamente
- **Porta:** 80 (mesma do HTTP)
- **Formato:** JSON
- **Reconexão automática** se cair, tenta reconectar sozinho
- **Uso principal:** atualização de estado e controle em tempo real da GUI da Matriz

#### 2.3.3 HTTP REST (ESP32 ↔ Navegador)

- **Request-Response** pergunta e resposta
- **CRUD** Create, Read, Update, Delete
- **Porta:** 80
- **Formato:** JSON
- **Sem autenticação** rede local confiável
- **Uso principal:** Portal Local da Filial para configuração e diagnóstico

**Quando usar cada um:**
- GET = Ler configuração
- POST = Criar nova filial
- PUT = Atualizar configuração
- DELETE = Remover filial

### 2.4 Visão Geral dos Protocolos

```mermaid
graph LR
    subgraph Protocols["🔌 PROTOCOLOS"]
        UDP["📡 UDP<br/>Matriz ↔ Filial<br/>Porta 51000<br/>Rápido e leve"]
        WS["🔌 WebSocket<br/>ESP32 ↔ Navegador<br/>Porta 80<br/>Tempo real"]
        HTTP["🌐 HTTP REST<br/>ESP32 ↔ Navegador<br/>Porta 80<br/>Configuração"]
    end

    Matriz["🏢 Matriz"] <-->|Comandos IoT| UDP
    UDP <-->|Respostas| Filial["🏭 Filial"]

    ESP32["📦 ESP32"] <-->|Updates em<br/>tempo real| WS
    WS <-->|Status<br/>devices| Browser["🌐 Navegador"]

    Browser2["🌐 Navegador"] -->|GET/POST<br/>PUT/DELETE| HTTP
    HTTP -->|JSON| ESP322["📦 ESP32"]

    style UDP fill:#f59e0b,color:#000
    style WS fill:#8b5cf6,color:#fff
    style HTTP fill:#3b82f6,color:#fff
```

### 2.5 Fluxo de Comunicação UDP

Comunicação entre Matriz e Filial:

1. **Descoberta:** Recebe a lista de dispositivos das filiais"
2. **Monitoramento:** A cada intervalo global configurado a Matriz atualiza o status de todos os dispositivos
3. **Controle:** Quando Usuário clica, matriz envia comando "altere para X"
```mermaid
sequenceDiagram
    participant M as 🏢 Matriz<br/>(Cliente UDP)
    participant FA as 🏭 Filial A<br/>(Servidor UDP)
    participant FB as 🏭 Filial B<br/>(Servidor UDP)

    Note over M,FB: PASSO 1: Descobrir dispositivos de cada filial
    M->>FA: 📡 list_req<br/>{"cmd":"list_req", "user":"admin", "pass":"admin"}
    M->>FB: 📡 list_req<br/>{"cmd":"list_req", "user":"admin", "pass":"admin"}

    FA-->>M: 📡 list_resp<br/>["actuator_light_sala", "sensor_ac_copa"]
    FB-->>M: 📡 list_resp<br/>["actuator_light_recep", "actuator_ac_sala"]

    Note over M,FB: PASSO 2: Polling automático (paralelo, timeout individual 800ms)
    loop A cada intervalo global configurado
      M->>FA: 📡 get_status<br/>{"cmd":"get_status", "user":"admin", "pass":"admin"}
      M->>FB: 📡 get_status<br/>{"cmd":"get_status", "user":"admin", "pass":"admin"}
      Note right of M: Envia para TODAS<br/>em paralelo

        FA-->>M: 📡 get_resp (via :51000)<br/>{"actuator_light_sala": true, "sensor_ac_copa": 512}
        FB-->>M: 📡 get_resp (via :51000)<br/>{"actuator_light_recep": false, "actuator_ac_sala": 0}
    end

    Note over M,FB: PASSO 3: Usuário liga a luz manualmente
    M->>FA: 📡 set_req<br/>{"cmd":"set_req", "id":"actuator_light_sala", "value":false}
    FA-->>M: 📡 set_resp<br/>{"cmd":"set_resp", "id":"actuator_light_sala", "value":false}
```

### 2.6 WebSocket

- **Reconexão automática:** Se WebSocket cair, tenta reconectar sozinho
- **Broadcast per-filial:** Cada atualização de filial é enviada individualmente para TODAS as abas abertas (incluindo offline com último estado conhecido)
- **Exponential backoff:** 1s → 2s → 4s → 8s → até 30s entre tentativas

```mermaid
sequenceDiagram
    participant Op as 👤 Usuário
    participant Nav as 🌐 Navegador
    participant WS as 🔌 WebSocket<br/>Bridge
    participant UDP as 📡 UDP Client
    participant Fil as 🏭 Filial

    Note over Op,Fil: FLUXO 1: Monitoramento Automático (intervalo global configurável)

    loop Timer global configurado
        UDP->>Fil: get_status (UDP)
        Fil-->>UDP: get_resp com dados
        UDP->>WS: Repassa resposta
        WS->>Nav: Broadcast para TODAS as abas abertas
        Nav->>Nav: Atualiza interface automaticamente
    end

    Note over Op,Fil: FLUXO 2: Controle Manual pelo Usuário

    Op->>Nav: Clica no botão "Ligar Luz"
    Nav->>WS: Envia comando via WebSocket<br/>{"cmd":"set_req", "id":"actuator_light_sala", "value":true}
    WS->>UDP: Converte e encaminha
    UDP->>Fil: set_req via UDP
    Fil->>Fil: Valida credenciais
    Fil->>Fil: Atualiza GPIO → HIGH
    Fil-->>UDP: set_resp (confirmação)
    UDP->>WS: Repassa confirmação
    WS->>Nav: Broadcast set_resp
    Nav->>Op: ✅ Botão muda para "Ligado"
```

### 2.7 Exemplo Prático: Ligando uma Luz

```mermaid
graph TD
    A["👤 1. Usuário clica<br/>'Ligar Luz Sala Filial A'"] --> B["🌐 2. React captura evento<br/>onClick"]
    B --> C["📤 3. Navegador envia via WebSocket<br/>{cmd:'set_req', id:'actuator_light_sala', value:true}"]
    C --> D["🔌 4. ESP32 Matriz recebe no WebSocket"]
    D --> E["🔀 5. Bridge converte para UDP"]
    E --> F["📡 6. Envia UDP para Filial A<br/>IP: 10.0.0.1:51000"]
    F --> G{"🔐 7. Filial valida<br/>user e pass"}
    G -->|❌ Inválido| H["🚫 Ignora comando<br/>sem resposta"]
    G -->|✅ Válido| I["⚡ 8. Atualiza GPIO<br/>digitalWrite(pin, HIGH)"]
    I --> J["📡 9. Filial envia resposta UDP<br/>{cmd:'set_resp', id:'...', value:true}"]
    J --> K["🔌 10. Matriz recebe UDP"]
    K --> L["📤 11. Bridge envia via WebSocket"]
    L --> M["🌐 12. Navegador recebe confirmação"]
    M --> N["✅ 13. Interface atualiza<br/>Botão mostra 'Ligado'"]

    style A fill:#3b82f6,color:#fff
