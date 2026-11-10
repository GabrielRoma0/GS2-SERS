# Dados

Cada arquivo `.json` é uma lista de dados. **Todo número usado nas contas mora aqui, com origem.** O código não tem número real escrito dentro dele.

| Campo | O que é |
|---|---|
| `id` | Identificador (minúsculas e hífen) |
| `descricao` | O que o número representa |
| `valor` | O número. `null` = **pendente** (ainda vamos buscar) |
| `unidade` | Ex.: `V`, `Ah`, `R$/kWh`, `kWh/m²/dia` |
| `periodo` | Vigência ou período (ex.: "tarifa vigente em nov/2026", "média anual") |
| `tipo` | `real` (medido/conta real anonimizada), `publico` (fonte pública oficial) ou `estimado` |
| `fonte_nome` | Nome da fonte (órgão, documento, fabricante e modelo) |
| `fonte_url` | Link `https://` da fonte |
| `verificado_em` | Dia em que alguém abriu o link e conferiu (`AAAA-MM-DD`) |
| `premissa` | Hipótese assumida. **Obrigatória quando `tipo` = `estimado`** |

`npm run validar-dados` lista erros e pendências. Antes da entrega, rode `npm run validar-dados -- --estrito`: não pode sobrar pendência.

| Arquivo | Conteúdo | Onde buscar |
|---|---|---|
| `equipamento.json` | Bateria e carregador da cadeira | Manual do fabricante de 1 ou 2 modelos vendidos no Brasil |
| `tarifas.json` | Tarifa B1 Enel SP, bandeira, faixas da Tarifa Social | ANEEL (resolução homologatória da Enel SP, bandeiras, Tarifa Social), Lei 12.212/2010 e alterações |
| `solar.json` | Irradiação, perdas, custos, regra da compensação | CRESESB SunData, ficha de módulo, estudo de mercado de geração distribuída (Greener), orçamentos, Lei 14.300/2022 |
| `emissoes.json` | Fator de emissão da rede | MCTI, fatores de emissão do SIN |

Os ids das faixas da Tarifa Social (`ts-faixa-...`) podem mudar de quantidade conforme a regra vigente: crie ou apague faixas para seguir o texto oficial.
