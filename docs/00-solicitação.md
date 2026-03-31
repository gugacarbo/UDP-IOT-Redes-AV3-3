# Requisitos do Projeto

> Imagine que você trabalha em uma empresa de desenvolvimento de software e que em uma
> reunião com um dos clientes da empresa, este relata o seguinte problema:
>
> “...Temos diversas filiais e estamos tendo um gasto excessivo de energia elétrica por conta de luzes e
> aparelhos de ar-condicionado que se mantém ligados em horários os quais não há nenhum
> funcionário na empresa. Gostaria de uma solução que nos permitisse monitorá-los, desligá-los e ligálos tudo remotamente...”
>
> Diante deste relato, a sua gerente de PD&I solicita que você desenvolva uma solução que resolva
> o problema do cliente. Ao planejá-la, você chega à conclusão de que precisará criar um software servidor
> que irá ser executado em cada filial e que terá sensores e atuadores ligados nele para a obtenção do
> estado e a realização de ações (a parte do sensoriamento e acionamento será abstraída do trabalho).
> Ademais, será necessário criar um software cliente, que irá ser executado na matriz da empresa,
> e enviará solicitações de estado (verificar qual o estado de alguns dispositivos) e comandos (liga, desliga,
> altera o valor dos dispositivos) para que seja possível a realização do monitoramento e controle de forma
> remota.
>
> Também se concluiu que por motivo de simplificação, o protocolo de transporte a ser utilizado
> deverá ser o UDP e que o layout dos dados contidos na camada de aplicação será baseado em JSON com
> codificação UTF-8.

## Comandos do Servidor

O servidor deve ser capaz de responder aos seguintes comandos do cliente:

- LIST – lista todos os ambientes e seus respectivos sensores e atuadores da filial;
- GET – obtém o estado/valor atual dos sensores e atuadores;
- SET – altera o estado/valor atual de um dispositivo;

## Lista de Pontos

Obtenção da lista de pontos de monitoramento/controle na filial:

- Cliente envia:

```json
{ "cmd":"list_req", }
```

- Servidor responde:

```json
{
 "cmd":"list_resp",
 "id":"[sensor_actuator_vector]",
}
```

sensor_actuator_vector – é uma lista com as chaves de sensores e atuadores contendo o seguinte layout:
`<type>_<device>_<place>` onde `<type>` é o tipo (sensor/actuator), `<device>` é o dispositivo (light/ac)
e `<place>` é o local (ex.: luz da sala de reuniões – actuator_light_meetroom).

## Estado Atual

Obtenção do estado atual dos sensores e atuadores da filial:

- Cliente envia:

```json
{ "cmd":"get_status", }
```

- Servidor responde:

```json
{
 "cmd":"get_resp",
 <id>:<value>,
}
```

`<id>` – é o identificador do sensor/atuador contendo o seguinte layout: `<type>_<device>_<place>` onde
`<type>` é o tipo (sensor/actuator), `<device>` é o dispositivo (light/ac) e `<place>` é o local.

No contexto desta aplicação haverão as seguintes combinações de tipo/dispositivo:

- sensor_light – obtém o estado atual do interruptor de luz (boolean);
- actuator_light – altera o estado do interrupto de luz (boolean);
- sensor_ac – obtém o estado atual do motor do ar condicionado (analógico 0-1023);
- actuator_ac – altera o estado atual do motor do ar condicionado (analógico 0-1023);

## Alteração de Estado

Alteração do estado atual dos sensores e atuadores da filial:

- Cliente envia:

```json
{
 "cmd":"set_req",
 "id":<id_name>,
"value":<id_value>,
}
```

- Servidor responde:

```json
{
 "cmd":"set_resp",
 "id":<id_name>,
 "value":<id_value>,
}
```

## Requisitos Técnicos

Os seguintes requisitos técnicos devem ser contemplados:

- serão desenvolvidas duas aplicações independentes (um servidor e um cliente);
- o para o ambiente de teste você deve assumir que existam ao menos 2 filiais (onde as aplicações
servidor irão ser executadas) e a matriz (onde a aplicação cliente será executada).
- a aplicação do cliente deve ter interface gráfica (GUI – Graphical User Interface);
- a comunicação entre o cliente e o servidor deve ser realizada obrigatoriamente via protocolo
UDP;
- a servidor deve autenticar o cliente através de uma tupla `<usuário|senha>`;
- os IDs do tipo actuator são somente escrita e os IDs do tipo sensor são de somente leitura;
- o cliente deve ser capaz de ser configurado para enviar solicitações periódicas (período
configurável pelo usuário) de valores para todos os IDs listados em uma filial;
- a interface gráfica do cliente deve:
permitir a definição do endereço IP e porta do servidor de cada filial;
o ter operação de conexão aos servidores listados;
o alterar o período de obtenção periódica de dados;
o apresentar o estado dos IDs obtidos identificando a filial ao qual este pertence;
o alterar o estado de IDs do tipo actuator;
- o payload (carga útil) da mensagem deve estar no formato JSON (codificação UTF-8) e seguir
rigorosamente o layout definido anteriormente;

## Configuração do Servidor

No caso da aplicação do servidor, a criação de uma interface gráfica é opcional. No entanto, este
deve carregar um arquivo de configuração (JSON) contendo informações de gerenciamento e a lista de
ambientes na filial, conforme o exemplo abaixo:

```json
{
 "port":51000,
 "admin_user":"test",
 "admin_pass":"test",
 "id":"[sensor_actuator_vector]",
}
```
