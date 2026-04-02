# PRD: Refatoração da Documentação Docusaurus

## Introduction

A documentação do projeto UDP IoT Monitor sofre de **19+ grupos de duplicação**, **8 inconsistências terminológicas** e **5+ áreas fragmentadas** espalhadas por 25 arquivos `.md` em `docusaurus/docs/`. O conteúdo foi escrito em paralelo sem referências cruzadas, fazendo com que vários arquivos repitam as mesmas tabelas, definições, fluxos e configurações.

Este PRD descreve a refatoração completa para eliminar duplicações, corrigir inconsistências, enriquecer arquivos canônicos com links e garantir que a documentação seja **única fonte de verdade** por tema.

## Goals

- Eliminar todas as 19+ duplicações identificadas no audit
- Corrigir todas as 8 inconsistências terminológicas
- Garantir que cada tema tenha exatamente **um arquivo canônico**
- Converter repetições em links para o arquivo canônico correspondente
- Adicionar seções "Veja Também" nos arquivos canônicos
- Manter todos os arquivos top-level como visão geral com links (não excluí-los)
- Verificar build Docusaurus (`pnpm build`) ao final

## User Stories

---

### US-001: Padronizar nome das GUIs

**Description:** Como leitor da documentação, quero encontrar os mesmos nomes para as interfaces gráficas em todos os arquivos, para não confundir "Interface local" com "Portal Local" etc.

**Group:** A

**Arquivos afetados:**
- `docusaurus/docs/intro.md`
- `docusaurus/docs/definicoes.md`

**Acceptance Criteria:**

- [ ] Substituir "Interface local" por **"Portal Local da Filial"** onde aparecer referindo-se ao portal servido pelo ESP32
- [ ] Garantir que "GUI da Matriz" seja usado consistentemente para o app React
- [ ] `definicoes.md` usa "GUI da Matriz" e "Portal Local da Filial" corretamente
- [ ] `intro.md` menciona ambas as interfaces com os nomes padronizados

---

### US-002: Padronizar justificativa de autenticação UDP

**Description:** Como leitor da documentação, quero que a justificativa para ignorar comandos não autenticados seja consistente em todos os arquivos, para entender o comportamento de segurança.

**Group:** A

**Arquivos afetados:**
- `docusaurus/docs/filial.md`
- `docusaurus/docs/protocol/udp.md`
- `docusaurus/docs/firmware/filial/overview.md`

**Acceptance Criteria:**

- [ ] Todos os arquivos que mencionam autenticação UDP usam a justificativa **"(por segurança)"**
- [ ] Remover menções a "ignorado silenciosamente" sem contexto de segurança
- [ ] A justificativa aparece tanto na descrição do comportamento quanto nos exemplos de fluxo

---

### US-003: Esclarecer porta UDP entre Matriz e Filial

**Description:** Como leitor da documentação, quero saber explicitamente se Matriz e Filial podem usar portas UDP diferentes, para configurar corretamente.

**Group:** A

**Arquivos afetados:**
- `docusaurus/docs/protocol/udp.md`
- `docusaurus/docs/infrastructure/network.md`

**Acceptance Criteria:**

- [ ] `protocol/udp.md` afirma explicitamente: **"Ambas devem usar a mesma porta (padrão 51000)"**
- [ ] `infrastructure/network.md` reforça a mesma informação na seção de portas
- [ ] Não há menção ambígua que sugira portas diferentes

---

### US-004: Documentar diferença de SSID no Captive Portal

**Description:** Como leitor da documentação, quero entender por que o SSID do captive portal é diferente entre Matriz e Filial, para identificar corretamente cada dispositivo em modo AP.

**Group:** A

**Arquivos afetados:**
- `docusaurus/docs/infrastructure/wifi.md`

**Acceptance Criteria:**

- [ ] `infrastructure/wifi.md` documenta explicitamente: Matriz usa `Matriz-Setup`, Filial usa `ESP32-<ip>-Setup`
- [ ] Explica o motivo da diferença (Matriz é única e conhecida; Filial precisa do IP para desambiguar)
- [ ] A diferença aparece na tabela de configuração ou em seção dedicada

---

### US-005: Padronizar terminologia de valores AC

**Description:** Como leitor da documentação, quero encontrar "duty cycle PWM (0-1023)" de forma consistente, para não confundir com "intensidade de refrigeração" ou outras descrições vagas.

**Group:** A

**Arquivos afetados:**
- `docusaurus/docs/requisitos.md`
- `docusaurus/docs/protocol/udp.md`
- `docusaurus/docs/firmware/filial/overview.md`

**Acceptance Criteria:**

- [ ] Todas as ocorrências de "intensidade de refrigeração", "PWM duty cycle" sem faixa, ou descrições vagas são substituídas por **"duty cycle PWM (0-1023)"**
- [ ] A faixa 0-1023 aparece junto ao termo em todas as menções

---

### US-006: Esclarecer comportamento do polling

**Description:** Como leitor da documentação, quero saber se o polling é sequencial ou em paralelo, para entender o desempenho do sistema.

**Group:** A

**Arquivos afetados:**
- `docusaurus/docs/firmware/matriz/overview.md`
- `docusaurus/docs/matriz.md`

**Acceptance Criteria:**

- [ ] `firmware/matriz/overview.md` afirma: **"Polling sequencial por filial, executado via task dedicada"**
- [ ] `matriz.md` não contém descrição conflitante (em paralelo) — ou foi substituída por link

---

### US-007: Padronizar prioridades FreeRTOS com valores numéricos

**Description:** Como leitor da documentação, quero encontrar prioridades FreeRTOS sempre com valores numéricos, para comparar prioridades entre tasks sem ambiguidade.

**Group:** A

**Arquivos afetados:**
- `docusaurus/docs/firmware/matriz/overview.md`
- `docusaurus/docs/firmware/filial/overview.md`
- `docusaurus/docs/architecture/matriz.md`
- `docusaurus/docs/architecture/filial.md`

**Acceptance Criteria:**

- [ ] Todas as menções a prioridades FreeRTOS incluem valores numéricos (ex: "Alta (2)", "Média (1)")
- [ ] Não há menções a prioridades apenas por nome sem número
- [ ] Os valores são consistentes entre Matriz e Filial (Alta=2, Média=1, ou os valores que estiverem em uso)

---

### US-008: Adicionar limite WebSocket em protocol doc

**Description:** Como leitor da documentação, quero encontrar o limite de clientes WebSocket (`MAX_WS_CLIENTS = 4`) no documento de protocolo, não apenas na documentação da GUI.

**Group:** A

**Arquivos afetados:**
- `docusaurus/docs/protocol/websocket.md`

**Acceptance Criteria:**

- [ ] `protocol/websocket.md` inclui o limite `MAX_WS_CLIENTS = 4`
- [ ] O limite aparece na seção de visão geral ou em uma nota dedicada
- [ ] Explica brevemente o que acontece quando o limite é atingido (conexão mais antiga é fechada)

---

### US-009: Remover duplicação — Arquitetura geral (Dup #1, #19)

**Description:** Como mantenedor da documentação, quero que a visão geral da arquitetura exista em um único lugar, para evitar divergências quando atualizar diagramas.

**Group:** B

**Arquivo canônico:** `docusaurus/docs/architecture/overview.md`

**Arquivos a refatorar:**
- `docusaurus/docs/definicoes.md` — §2.2 (flowchart completo) → substituir por link
- `docusaurus/docs/fluxos.md` — §2.2 (flowchart idêntico) → substituir por link
- `docusaurus/docs/intro.md` — descrição de componentes (manter resumo breve, adicionar link)

**Acceptance Criteria:**

- [ ] `definicoes.md` não contém diagrama de arquitetura duplicado — em seu lugar, há um parágrafo introdutório + link para `architecture/overview.md`
- [ ] `fluxos.md` não contém diagrama de arquitetura duplicado — em seu lugar, há um link para `architecture/overview.md`
- [ ] `architecture/overview.md` permanece intacto como fonte canônica

---

### US-010: Remover duplicação — Protocolo UDP (Dup #4)

**Description:** Como mantenedor da documentação, quero que a especificação de comandos UDP exista em um único lugar, para evitar descrições conflitantes de payloads.

**Group:** B

**Arquivo canônico:** `docusaurus/docs/protocol/udp.md`

**Arquivos a refatorar:**
- `docusaurus/docs/requisitos.md` — §5 (Protocolo UDP completo) → substituir por link

**Acceptance Criteria:**

- [ ] `requisitos.md` §5 não contém especificação detalhada de comandos/payloads — em seu lugar há link para `protocol/udp.md`
- [ ] `protocol/udp.md` permanece intacto como fonte canônica

---

### US-011: Remover duplicação — Protocolo WebSocket (Dup #5)

**Description:** Como mantenedor da documentação, quero que a especificação de mensagens WebSocket exista em um único lugar.

**Group:** B

**Arquivo canônico:** `docusaurus/docs/protocol/websocket.md`

**Arquivos a refatorar:**
- `docusaurus/docs/matriz-gui.md` — §3 (mensagens WebSocket) → substituir por link

**Acceptance Criteria:**

- [ ] `matriz-gui.md` §3 não contém especificação detalhada de mensagens WebSocket — em seu lugar há link para `protocol/websocket.md`
- [ ] `protocol/websocket.md` permanece intacto como fonte canônica

---

### US-012: Remover duplicação — Configuração WiFi (Dup #6)

**Description:** Como mantenedor da documentação, quero que a descrição de `config_wifi.json` exista em um único lugar.

**Group:** B

**Arquivo canônico:** `docusaurus/docs/infrastructure/config.md`

**Arquivos a refatorar:**
- `docusaurus/docs/config-build.md` — seção WiFi → substituir por link
- `docusaurus/docs/firmware/matriz/overview.md` — seção config_wifi → substituir por link
- `docusaurus/docs/firmware/filial/overview.md` — seção config_wifi → substituir por link

**Acceptance Criteria:**

- [ ] `config-build.md` não contém tabela/campos de `config_wifi.json` — em seu lugar há link para `infrastructure/config.md`
- [ ] `firmware/matriz/overview.md` não repete campos de `config_wifi.json` — em seu lugar há link
- [ ] `firmware/filial/overview.md` não repete campos de `config_wifi.json` — em seu lugar há link
- [ ] `infrastructure/config.md` permanece intacto como fonte canônica

---

### US-013: Remover duplicação — Configuração da Matriz (Dup #7)

**Description:** Como mantenedor da documentação, quero que a descrição de `config_matriz.json` exista em um único lugar.

**Group:** B

**Arquivo canônico:** `docusaurus/docs/infrastructure/config.md`

**Arquivos a refatorar:**
- `docusaurus/docs/matriz.md` — seção configuração → substituir por link
- `docusaurus/docs/firmware/matriz/overview.md` — seção config_matriz → substituir por link

**Acceptance Criteria:**

- [ ] `matriz.md` não repete campos de `config_matriz.json` — em seu lugar há link para `infrastructure/config.md`
- [ ] `firmware/matriz/overview.md` não repete campos de `config_matriz.json` — em seu lugar há link

---

### US-014: Remover duplicação — Configuração da Filial (Dup #8)

**Description:** Como mantenedor da documentação, quero que a descrição de `config_filial.json` exista em um único lugar.

**Group:** B

**Arquivo canônico:** `docusaurus/docs/infrastructure/config.md`

**Arquivos a refatorar:**
- `docusaurus/docs/filial.md` — seção configuração → substituir por link
- `docusaurus/docs/firmware/filial/overview.md` — seção config_filial → substituir por link

**Acceptance Criteria:**

- [ ] `filial.md` não repete campos de `config_filial.json` — em seu lugar há link para `infrastructure/config.md`
- [ ] `firmware/filial/overview.md` não repete campos de `config_filial.json` — em seu lugar há link

---

### US-015: Remover duplicação — REST API da Matriz (Dup #9)

**Description:** Como mantenedor da documentação, quero que a descrição da REST API da Matriz exista em um único lugar.

**Group:** B

**Arquivo canônico:** `docusaurus/docs/firmware/matriz/rest-api.md`

**Arquivos a refatorar:**
- `docusaurus/docs/matriz-gui.md` — §4 (integração REST) → substituir por link

**Acceptance Criteria:**

- [ ] `matriz-gui.md` §4 não contém tabela de endpoints REST — em seu lugar há link para `firmware/matriz/rest-api.md`
- [ ] `firmware/matriz/rest-api.md` permanece intacto como fonte canônica

---

### US-016: Remover duplicação — Tasks FreeRTOS da Matriz (Dup #10)

**Description:** Como mantenedor da documentação, quero que a descrição de tasks FreeRTOS da Matriz exista em um único lugar.

**Group:** B

**Arquivo canônico:** `docusaurus/docs/firmware/matriz/overview.md`

**Arquivos a refatorar:**
- `docusaurus/docs/matriz.md` — seção tasks FreeRTOS → substituir por link
- `docusaurus/docs/architecture/matriz.md` — seção tasks → substituir por link

**Acceptance Criteria:**

- [ ] `matriz.md` não repete lista de tasks FreeRTOS — em seu lugar há link para `firmware/matriz/overview.md`
- [ ] `architecture/matriz.md` não repete lista de tasks FreeRTOS — em seu lugar há link para `firmware/matriz/overview.md`

---

### US-017: Remover duplicação — Tasks FreeRTOS da Filial (Dup #11)

**Description:** Como mantenedor da documentação, quero que a descrição de tasks FreeRTOS da Filial exista em um único lugar.

**Group:** B

**Arquivo canônico:** `docusaurus/docs/firmware/filial/overview.md`

**Arquivos a refatorar:**
- `docusaurus/docs/filial.md` — seção tasks FreeRTOS → substituir por link
- `docusaurus/docs/architecture/filial.md` — seção tasks → substituir por link

**Acceptance Criteria:**

- [ ] `filial.md` não repete lista de tasks FreeRTOS — em seu lugar há link para `firmware/filial/overview.md`
- [ ] `architecture/filial.md` não repete lista de tasks FreeRTOS — em seu lugar há link para `firmware/filial/overview.md`

---

### US-018: Remover duplicação — Mapeamento GPIO da Filial (Dup #12)

**Description:** Como mantenedor da documentação, quero que o mapeamento GPIO da Filial exista em um único lugar.

**Group:** B

**Arquivo canônico:** `docusaurus/docs/infrastructure/config.md`

**Arquivos a refatorar:**
- `docusaurus/docs/config-build.md` — seção GPIO → substituir por link
- `docusaurus/docs/firmware/filial/overview.md` — seção mapeamento GPIO → substituir por link

**Acceptance Criteria:**

- [ ] `config-build.md` não repete tabela GPIO — em seu lugar há link para `infrastructure/config.md`
- [ ] `firmware/filial/overview.md` não repete mapeamento GPIO detalhado — em seu lugar há link

---

### US-019: Remover duplicação — Formato de ID de Dispositivo (Dup #3, #13)

**Description:** Como mantenedor da documentação, quero que o formato de ID `<tipo>_<dispositivo>_<local>` e a definição de sensores vs atuadores existam em um único lugar.

**Group:** B

**Arquivo canônico (ID):** `docusaurus/docs/requisitos.md` §4.1

**Arquivo canônico (sensores vs atuadores):** `docusaurus/docs/definicoes.md`

**Arquivos a refatorar:**
- `docusaurus/docs/definicoes.md` — formato de ID → substituir por link para `requisitos.md` §4.1
- `docusaurus/docs/infrastructure/config.md` — formato de ID → substituir por link
- `docusaurus/docs/firmware/filial/overview.md` — formato de ID + conceito sensores/atuadores → substituir por links
- `docusaurus/docs/protocol/udp.md` — exemplos com formato de ID → manter exemplos, adicionar nota com link

**Acceptance Criteria:**

- [ ] `definicoes.md` não repete a definição detalhada do formato de ID — em seu lugar há link para `requisitos.md` §4.1
- [ ] `infrastructure/config.md` não repete formato de ID — em seu lugar há link
- [ ] `firmware/filial/overview.md` não repete formato de ID nem definição de sensores/atuadores — em seu lugar há links
- [ ] `protocol/udp.md` mantém exemplos mas inclui nota: "Para o formato completo, veja [Requisitos](../requisitos.md#41-formato-de-id)"

---

### US-020: Remover duplicação — Polling e Detecção Offline (Dup #2, #14, #16)

**Description:** Como mantenedor da documentação, quero que a descrição de polling e detecção offline da Matriz exista em um único lugar.

**Group:** B

**Arquivo canônico (polling + offline):** `docusaurus/docs/firmware/matriz/overview.md`

**Arquivo canônico (timeout):** `docusaurus/docs/protocol/udp.md`

**Arquivos a refatorar:**
- `docusaurus/docs/matriz.md` — seção polling → substituir por link
- `docusaurus/docs/matriz-gui.md` — seção "Robustez" + timeout 800ms → substituir por links
- `docusaurus/docs/architecture/overview.md` — menção a polling/offline/timeout → substituir por links
- `docusaurus/docs/protocol/websocket.md` — timeout 800ms → substituir por link

**Acceptance Criteria:**

- [ ] `matriz.md` não repete descrição de polling — em seu lugar há link para `firmware/matriz/overview.md`
- [ ] `matriz-gui.md` não repete descrição de robustez/deteção offline — em seu lugar há links
- [ ] `architecture/overview.md` não repete polling/offline/timeout — em seu lugar há links
- [ ] Timeout de 800ms centralizado em `protocol/udp.md` (já existe lá ou adicionado)
- [ ] `protocol/websocket.md` referencia o timeout via link em vez de repetir o valor

---

### US-021: Remover duplicação — Build & Deploy (Dup #15)

**Description:** Como mantenedor da documentação, quero que o processo de build exista em um único lugar.

**Group:** B

**Arquivo canônico:** `docusaurus/docs/devops/build-deploy.md`

**Arquivos a refatorar:**
- `docusaurus/docs/config-build.md` — seção build GUI → substituir por link

**Acceptance Criteria:**

- [ ] `config-build.md` não repete comandos/passo-a-passo de build — em seu lugar há link para `devops/build-deploy.md`
- [ ] `devops/build-deploy.md` permanece intacto como fonte canônica

---

### US-022: Remover duplicação — mDNS Hostname (Dup #17)

**Description:** Como mantenedor da documentação, quero que a descrição do hostname mDNS exista em um único lugar.

**Group:** B

**Arquivo canônico:** `docusaurus/docs/infrastructure/network.md`

**Arquivos a refatorar:**
- `docusaurus/docs/infrastructure/wifi.md` — menção a mDNS → substituir por link
- `docusaurus/docs/matriz-gui.md` — seção descoberta mDNS → manter resumo, adicionar link

**Acceptance Criteria:**

- [ ] `infrastructure/wifi.md` não repete configuração mDNS detalhada — em seu lugar há link para `infrastructure/network.md`
- [ ] `matriz-gui.md` mantém descrição de uso do mDNS na GUI mas adiciona link para `infrastructure/network.md` para detalhes técnicos

---

### US-023: Remover duplicação — Endereços IP e Portas (Dup #18)

**Description:** Como mantenedor da documentação, quero que a tabela de endereços IP e portas exista em um único lugar.

**Group:** B

**Arquivo canônico:** `docusaurus/docs/infrastructure/network.md`

**Arquivos a refatorar:**
- `docusaurus/docs/config-build.md` — seção endereços/portas → substituir por link
- `docusaurus/docs/matriz.md` — menção a endereços/portas → substituir por link

**Acceptance Criteria:**

- [ ] `config-build.md` não repete tabela de IPs/portas — em seu lugar há link para `infrastructure/network.md`
- [ ] `matriz.md` não repete endereços/portas — em seu lugar há link

---

### US-024: Adicionar seção "Veja Também" nos arquivos canônicos

**Description:** Como leitor da documentação, quero encontrar links para páginas relacionadas no final de cada arquivo canônico, para navegar facilmente entre tópicos conexos.

**Group:** C

**Arquivos canônicos (adicionar seção `## Veja Também`):**

| Arquivo                       | Links sugeridos                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `architecture/overview.md`    | `protocol/udp.md`, `protocol/websocket.md`, `firmware/matriz/overview.md`, `firmware/filial/overview.md`            |
| `protocol/udp.md`             | `protocol/websocket.md`, `infrastructure/network.md`, `firmware/matriz/overview.md`, `requisitos.md`                |
| `protocol/websocket.md`       | `protocol/udp.md`, `gui/matriz-gui.md`, `infrastructure/network.md`                                                 |
| `infrastructure/config.md`    | `infrastructure/network.md`, `infrastructure/wifi.md`, `firmware/matriz/overview.md`, `firmware/filial/overview.md` |
| `infrastructure/network.md`   | `infrastructure/config.md`, `infrastructure/wifi.md`, `protocol/udp.md`                                             |
| `infrastructure/wifi.md`      | `infrastructure/config.md`, `infrastructure/network.md`                                                             |
| `firmware/matriz/overview.md` | `firmware/matriz/rest-api.md`, `protocol/udp.md`, `infrastructure/config.md`, `architecture/matriz.md`              |
| `firmware/matriz/rest-api.md` | `firmware/matriz/overview.md`, `gui/matriz-gui.md`                                                                  |
| `firmware/filial/overview.md` | `firmware/filial/rest-api.md`, `protocol/udp.md`, `infrastructure/config.md`, `architecture/filial.md`              |
| `firmware/filial/rest-api.md` | `firmware/filial/overview.md`                                                                                       |
| `gui/matriz-gui.md`           | `protocol/websocket.md`, `firmware/matriz/rest-api.md`, `gui/components.md`                                         |
| `gui/components.md`           | `gui/matriz-gui.md`                                                                                                 |
| `architecture/matriz.md`      | `architecture/overview.md`, `firmware/matriz/overview.md`                                                           |
| `architecture/filial.md`      | `architecture/overview.md`, `firmware/filial/overview.md`                                                           |
| `devops/build-deploy.md`      | `devops/debug-testing.md`                                                                                           |
| `devops/debug-testing.md`     | `devops/build-deploy.md`                                                                                            |

**Acceptance Criteria:**

- [ ] Cada arquivo canônico listado acima tem seção `## Veja Também` no final
- [ ] Os links usam caminhos relativos com extensão `.md`
- [ ] Cada link tem uma breve descrição do que o leitor encontrará na página destino
- [ ] Não há links quebrados (todos os destinos existem)

---

### US-025: Verificar build Docusaurus

**Description:** Como mantenedor da documentação, quero garantir que o build Docusaurus passe sem erros após todas as refatorações.

**Group:** D

**Acceptance Criteria:**

- [ ] `pnpm --filter docusaurus build` executa sem erros
- [ ] Não há warnings de links quebrados no output do build
- [ ] Todos os arquivos `.md` são encontrados pelo Docusaurus (não há 404s)

---

## Resumo de Grupos e Execução

| Grupo | Stories         | Descrição                                             | Depende de                                         |
| ----- | --------------- | ----------------------------------------------------- | -------------------------------------------------- |
| **A** | US-001 a US-008 | Correções de inconsistência (8 stories independentes) | Nenhum                                             |
| **B** | US-009 a US-023 | Remoção de duplicações (15 stories independentes)     | Grupo A (para manter consistência)                 |
| **C** | US-024          | Referências cruzadas nos canônicos                    | Grupo B (para garantir que canônicos estão finais) |
| **D** | US-025          | Verificação de build                                  | Grupo C                                            |

**Ordem de execução:** A → B → C → D

---

## Functional Requirements

- FR-1: Cada tema técnico deve ter **exatamente um arquivo canônico** com a descrição completa
- FR-2: Arquivos que contêm conteúdo duplicado devem ter o conteúdo substituído por um parágrafo introdutório + link para o canônico
- FR-3: Todos os links devem usar caminhos relativos com extensão `.md`
- FR-4: Terminologia deve ser consistente: "GUI da Matriz", "Portal Local da Filial", "duty cycle PWM (0-1023)"
- FR-5: Prioridades FreeRTOS devem sempre incluir valores numéricos
- FR-6: Cada arquivo canônico deve ter seção `## Veja Também` com links para tópicos relacionados
- FR-7: O build Docusaurus deve passar sem erros ao final

## Non-Goals (Out of Scope)

- **Não criar novos arquivos de documentação** (ex: não criar `gui/filial-portal.md` nem `protocol/authentication.md`)
- **Não excluir arquivos top-level** — eles permanecem como visão geral com links
- **Não alterar arquivos canônicos** além de adicionar conteúdo faltante (ex: timeout 800ms em `protocol/udp.md`, `MAX_WS_CLIENTS` em `protocol/websocket.md`) e a seção "Veja Também"
- **Não reorganizar a estrutura de diretórios** ou `_category_.json`
- **Não modificar `sidebars.ts`** (usa modo autogerado)
- **Não modificar `docusaurus.config.ts`**

## Design Considerations

- Os arquivos top-level (`requisitos.md`, `definicoes.md`, `fluxos.md`, `matriz.md`, `filial.md`, `matriz-gui.md`, `config-build.md`) devem permanecer acessíveis e úteis como pontos de entrada — a transformação é substituir conteúdo duplicado por links, não esvaziar os arquivos
- Links devem ter contexto suficiente para o leitor decidir se vale a pena clicar (ex: "Para a especificação completa de comandos e payloads, veja [Protocolo UDP](./protocol/udp.md)")

## Technical Considerations

- **Sidebars:** Usa `type: "autogenerated"` — não precisa ser modificado ao alterar conteúdo de arquivos existentes
- **Mermaid:** Diagramas Mermaid estão habilitados globalmente — não há impacto na refatoração
- **Linguagem:** Toda documentação está em pt-BR — manter consistência
- **Frontmatter:** Todos os arquivos usam YAML frontmatter com `title`, `description`, `sidebar_position` — não modificar frontmatter
- **Cross-references existentes:** 6 links internos já existem — garantir que não sejam quebrados durante a refatoração
- **Convenções de markdown:** Seguir skill `docusaurus-conventions` (arquivos `.md`, não `.mdx`; links relativos com `.md`)

## Success Metrics

- Zero duplicações restantes entre os 25 arquivos de documentação
- Zero inconsistências terminológicas
- Build Docusaurus passa sem erros
- Cada arquivo canônico tem seção "Veja Também"
- Nenhum link quebrado no build

## Open Questions

- Nenhuma — todas as decisões foram tomadas nas rodadas de perguntas.
