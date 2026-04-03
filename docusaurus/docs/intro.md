---
slug: /
title: Documentação
description: Sistema de Monitoramento IoT por UDP e WebSocket — ESP32
---

# Sistema de Monitoramento IoT

Sistema de monitoramento e controle de dispositivos IoT utilizando comunicação **UDP** entre ESP32s, com dashboard React via **WebSocket**.

```mermaid
flowchart LR
    GUI[GUI React] <-->|WebSocket| MATRIZ[Matriz ESP32]
    MATRIZ <-->|UDP :51000| F1[Filial 1]
    MATRIZ <-->|UDP :51000| F2[Filial 2]
    MATRIZ <-->|UDP :51000| FN[Filial N]
```

## Componentes

| Componente | Função                                                           |
| ---------- | ---------------------------------------------------------------- |
| **Matriz** | Hub centralizador — gerencia filiais, serve GUI da Matriz        |
| **Filial** | Servidor UDP — controla dispositivos locais e serve Portal Local |
| **GUI**    | Dashboard React — monitoramento em tempo real (GUI da Matriz)    |

## Navegação

import DocCardList from '@theme/DocCardList';

<DocCardList />
