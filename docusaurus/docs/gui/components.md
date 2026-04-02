---
title: GUI — Componentes e Dependências
description: Componentes shadcn/ui, dependências e estrutura visual da GUI
---

# GUI — Componentes e Dependências

## Dependências

### Runtime

| Pacote                     | Versão | Uso                          |
| -------------------------- | ------ | ---------------------------- |
| `react`                    | ^19    | Framework UI                 |
| `react-dom`                | ^19    | Renderização DOM             |
| `lucide-react`             | latest | Ícones                       |
| `class-variance-authority` | latest | Variantes de componentes     |
| `clsx`                     | latest | Merge de classes condicional |
| `tailwind-merge`           | latest | Merge de classes Tailwind    |

### Dev Dependencies

| Pacote              | Versão | Uso                      |
| ------------------- | ------ | ------------------------ |
| `vite`              | latest | Build tool               |
| `typescript`        | latest | Compilador TS            |
| `@types/react`      | latest | Tipos React              |
| `@types/react-dom`  | latest | Tipos ReactDOM           |
| `tailwindcss`       | latest | Framework CSS            |
| `@tailwindcss/vite` | latest | Plugin Vite Tailwind     |
| `eslint`            | latest | Linter                   |
| `@eslint/js`        | latest | Config ESLint            |
| `typescript-eslint` | latest | ESLint para TS           |
| `globals`           | latest | Variáveis globais ESLint |

---

## Componentes shadcn/ui

Componentes utilizados do shadcn/ui:

| Componente  | Uso                                 |
| ----------- | ----------------------------------- |
| `Button`    | Ações, envio de comand              |
| `Card`      | Container de filial e dispositivo   |
| `Switch`    | Toggle de luz                       |
| `Slider`    | Controle de intensidade AC (0-1023) |
| `Badge`     | Status online/offline               |
| `Input`     | Formulários de configuração         |
| `Dialog`    | Modal de adicionar/editar filial    |
| `Toast`     | Notificações de erro/sucesso        |
| `Tooltip`   | Informações adicionais              |
| `Separator` | Divisão visual entre seções         |

---

## Estrutura Visual

### Layout Principal

```
┌─────────────────────────────────────────────┐
│  Header: "Monitoramento IoT"    [⚙ Settings] │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─── Filial Centro ──────────────┐         │
│  │ 🟢 Online  │ 192.168.1.101     │         │
│  │                                │         │
│  │ 💡 Luz da Sala      [  ON  ]  │         │
│  │ ❄️ Ar Sala     [====●====]    │         │
│  └────────────────────────────────┘         │
│                                             │
│  ┌─── Filial Norte ───────────────┐         │
│  │ 🔴 Offline │ 192.168.1.102     │         │
│  │                                │         │
│  │ 💡 Luz Sala       [ OFF  ]    │         │
│  │ ❄️ Ar Sala     [●=========]   │         │
│  └────────────────────────────────┘         │
│                                             │
└─────────────────────────────────────────────┘
```

### Indicadores de Status

| Estado           | Cor      | Ícone              |
| ---------------- | -------- | ------------------ |
| Online           | Verde    | `Wifi` (lucide)    |
| Offline          | Vermelho | `WifiOff` (lucide) |
| Enviando comando | Amarelo  | Spinner animado    |

---

## Configuração Tailwind

O tema usa as cores padrão do shadcn/ui com adaptações para status:

| Token         | Uso              |
| ------------- | ---------------- |
| `primary`     | Botões de ação   |
| `destructive` | Erros            |
| `success`     | Status online    |
| `warning`     | Enviando comando |
| `muted`       | Texto secundário |

---

## Responsividade

| Breakpoint | Layout             |
| ---------- | ------------------ |
| Mobile     | 1 coluna de cards  |
| Tablet     | 2 colunas de cards |
| Desktop    | 3 colunas de cards |
