# UDP-IOT-Redes-AV3-3

Monorepo com dois projetos independentes em PlatformIO:

- `filial-esp32`: servidor UDP da filial
- `matriz-esp32`: cliente UDP da matriz

## Como abrir

Abra o arquivo `UDP-IOT-Redes-AV3-3.code-workspace` no VS Code para carregar os dois projetos no mesmo espaço de trabalho.

## Build

Compilar o servidor da filial:

```bash
pio run -d filial-esp32
```

Compilar o cliente da matriz:

```bash
pio run -d matriz-esp32
```

Os dois projetos continuam separados em nível de código, mas passam a viver no mesmo repositório e no mesmo workspace.
