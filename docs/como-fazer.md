# Como fazer · guia prático da dupla

Este guia diz **exatamente** o que cada um faz agora, em ordem. O plano geral (o porquê de cada coisa) está em [plano.md](plano.md).

**Regra de ouro:** nenhum número entra sem link da fonte. Não usar número de IA, de memória ou de "vi em algum lugar".

---

## Parte 1 · Preparar o computador (uma vez só, 10 min)

**Gabriel** (já tem a pasta): nada a fazer.

**Thor:**

1. Gabriel adiciona o Thor no GitHub: abrir https://github.com/GabrielRoma0/GS2-SERS → **Settings** → **Collaborators** → **Add people** → digitar o usuário do Thor. O Thor aceita o convite no e-mail.
2. Thor baixa o projeto:

   ```bash
   git clone https://github.com/GabrielRoma0/GS2-SERS.git
   ```

   ```bash
   cd GS2-SERS
   ```

   ```bash
   npm install
   ```

3. Conferir que está tudo certo:

   ```bash
   npm run verificar
   ```

   Tem que terminar com `25 passed` e `0 erro(s)`. As "pendências" são normais agora.

**Sempre, antes de começar a mexer:** `git pull`. **Sempre, ao terminar:** `git add -A`, `git commit -m "o que fez"`, `git push`. Assim um não apaga o trabalho do outro.

---

## Parte 2 · Preencher os 19 números (a parte mais importante)

### Como preencher um número

Os números ficam nos arquivos da pasta `dados/`. Cada número é um bloco assim (este exemplo é **inventado**, só para mostrar o formato):

**Antes (pendente):**

```json
{
  "id": "cadeira-tensao",
  "descricao": "Tensão nominal do conjunto de baterias da cadeira motorizada ...",
  "valor": null,
  "unidade": "V",
  "periodo": "",
  "tipo": "",
  "fonte_nome": "",
  "fonte_url": "",
  "verificado_em": "",
  "premissa": ""
}
```

**Depois (preenchido):**

```json
{
  "id": "cadeira-tensao",
  "descricao": "Tensão nominal do conjunto de baterias da cadeira motorizada ...",
  "valor": 24,
  "unidade": "V",
  "periodo": "especificação do modelo",
  "tipo": "publico",
  "fonte_nome": "Fabricante X, manual da cadeira modelo Y, página 12",
  "fonte_url": "https://site-do-fabricante.com.br/manual-modelo-y.pdf",
  "verificado_em": "2026-11-10",
  "premissa": ""
}
```

O que vai em cada campo:

| Campo | Como preencher |
|---|---|
| `valor` | Só o número, com **ponto** como separador decimal (`0.85`, não `0,85`), sem aspas, sem unidade |
| `periodo` | De quando é o número: "tarifa vigente em nov/2026", "média anual", "especificação do modelo" |
| `tipo` | `publico` = tirado de fonte pública (lei, ANEEL, manual). `real` = medido por vocês ou tirado de uma conta de luz real (sem nome e endereço). `estimado` = vocês assumiram um valor com base em uma referência |
| `fonte_nome` | Quem publicou e qual documento. Se for PDF, a página |
| `fonte_url` | O link que abre a fonte, começando com `https://` |
| `verificado_em` | A data de hoje no formato `AAAA-MM-DD` (o dia em que vocês abriram o link e conferiram) |
| `premissa` | **Obrigatório se `tipo` for `estimado`**: explicar por que esse valor. Ex.: "manual não informa; usado o valor típico citado por [fonte]" |

Depois de cada número preenchido, rode:

```bash
npm run validar-dados
```

Se aparecer `✗`, a mensagem diz qual campo está errado. Se aparecer só `… pendente`, está certo e falta o resto.

Toda fonte usada também vai para o [referencias.md](../referencias.md) (Órgão. *Título*. Link. Acesso em DD/MM/AAAA).

### Lista do que buscar, em ordem

Sugestão de divisão: **Thor** faz o Bloco 1 e o Bloco 4; **Gabriel** faz o Bloco 2 e o Bloco 3.

#### Bloco 1 · A cadeira (arquivo `dados/equipamento.json`)

Escolher **um** modelo de cadeira de rodas motorizada vendido no Brasil (de preferência um modelo comum, de marca conhecida) e achar o **manual** ou a **ficha técnica** no site do fabricante ou da loja. Anotar marca e modelo em `fonte_nome`.

| id | O que procurar no manual | Dica |
|---|---|---|
| `cadeira-tensao` | Tensão das baterias (ex.: "24 V") | Geralmente são 2 baterias de 12 V em série = 24 V |
| `cadeira-capacidade` | Capacidade das baterias em **Ah** | Aparece como "bateria 12 V 40 Ah", por exemplo |
| `carregador-eficiencia` | Eficiência do carregador | Quase nunca está no manual. Se não estiver: `tipo` = `estimado`, procurar uma referência técnica sobre eficiência de carregadores de bateria e explicar em `premissa` |
| `carregador-standby` | Consumo do carregador sem carregar (W) | Se não achar, pode **apagar este item** e citar como limitação. Opcional |
| `profundidade-descarga` | Quanto da bateria se gasta num dia típico | É uma **premissa de uso**: `tipo` = `estimado`. Ex.: "assumido uso que gasta a bateria toda por dia, o pior caso". Conferir com quem usa cadeira no teste |
| `recargas-por-dia` | Recomendação de recarga do fabricante | Muitos manuais dizem "carregar todas as noites". Se for isso, `valor` = `1` |

#### Bloco 2 · A conta de luz (arquivo `dados/tarifas.json`)

| id | Onde buscar | Como |
|---|---|---|
| `tarifa-b1-enel-sp` | **Jeito mais fácil:** uma conta de luz real da Enel de alguém da família. Dividir o valor total da energia (R$) pelo consumo (kWh) = R$/kWh com impostos. `tipo` = `real`; em `fonte_nome` colocar "conta de luz Enel SP, mês/ano (dados pessoais omitidos)". Como `fonte_url` precisa de link, usar a página de tarifas da Enel SP ou da ANEEL que mostra a tarifa do mesmo período | **Nunca** colocar nome, endereço ou número do cliente no repositório |
| `bandeira-cenario` | Site da ANEEL, página de **bandeiras tarifárias** (buscar "ANEEL bandeiras tarifárias valores") | Escolher um cenário (ex.: bandeira verde = 0, ou a do mês atual) e dizer qual em `periodo` |
| `ts-faixa-1-ate`, `ts-faixa-1-desconto`, `ts-faixa-2-...` | Lei 12.212/2010 (https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2010/lei/l12212.htm) **e** a página da ANEEL sobre **Tarifa Social de Energia Elétrica** | **Atenção:** as regras mudaram em 2025. Usar o que a ANEEL diz que vale **hoje**. O número de faixas pode ser diferente de 2: criar ou apagar blocos para ficar igual à regra. Desconto em fração: 65% = `0.65`, isenção total = `1` |

Anotar também, para a ficha do assistente (não é número): **quem pode pedir a Tarifa Social** (CadÚnico, BPC…) e **como pedir**.

#### Bloco 3 · O sol (arquivo `dados/solar.json`)

| id | Onde buscar | Como |
|---|---|---|
| `irradiacao-sp` | **CRESESB, SunData** (buscar "CRESESB SunData"). Digitar as coordenadas de São Paulo (centro: latitude -23,55, longitude -46,63) | Usar a **média anual** no "plano inclinado com ângulo igual à latitude", em kWh/m²/dia. Fazer print da tela para o vídeo |
| `performance-ratio` | Referência técnica sobre "performance ratio sistema fotovoltaico" (manual do CRESESB/CEPEL de engenharia fotovoltaica, artigo ou material de fabricante) | `tipo` = `estimado`, explicar em `premissa` |
| `custo-ongrid-wp` | Estudo de mercado de geração distribuída da **Greener** (buscar "Greener estudo estratégico geração distribuída preço R$/Wp") ou 2 a 3 simuladores/orçamentos de empresas de energia solar | Em R$ por Wp (watt-pico). Se o estudo der por faixa de potência, usar a menor (residencial) |
| `custo-kit-bateria` | 2 ou 3 anúncios de "kit solar off grid com bateria" em lojas grandes | Fazer a **média** e listar cada loja em `premissa` com o preço e a data. `tipo` = `estimado` |
| `kit-energia-util` | Ficha técnica do kit escolhido: capacidade da bateria (V × Ah ÷ 1000 = kWh) | Se a bateria for de chumbo-ácido, a energia útil é menor que a total: explicar em `premissa` |
| `compensacao-fio-b` | **Lei 14.300/2022** (https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/lei/l14300.htm), artigo sobre a transição do pagamento do Fio B | Usar a porcentagem do ano de 2026. Pode deixar por último: se ficar difícil, o Claude simplifica a conta e isso vira limitação |

#### Bloco 4 · O meio ambiente (arquivo `dados/emissoes.json`)

| id | Onde buscar | Como |
|---|---|---|
| `fator-emissao-sin` | **MCTI**, "fatores de emissão de CO₂ do Sistema Interligado Nacional" (buscar exatamente isso) | Usar a **média anual** do ano mais recente completo, em tCO₂/MWh. **Atenção:** tCO₂/MWh é igual a kg CO₂/kWh, então o número é o mesmo |

### Quando terminar a Parte 2

```bash
npm run validar-dados -- --estrito
```

Tem que dizer `0 erro(s) · 0 dado(s) pendente(s)`. Aí avisem o Claude: "dados preenchidos". Ele faz a Parte 3.

---

## Parte 3 · Contas e comparação (Claude faz, vocês conferem)

O Claude gera a tabela comparando as alternativas em `analise/resultados.md`. **Vocês:**

1. Pegam **um** cenário da tabela (ex.: custo por mês da Base).
2. Refazem na calculadora do celular usando as fórmulas que estão no começo de cada função em `src/energia/calculos.ts`.
3. Anotam a conta em `analise/conferencia-manual.md`. Se bater, está certo. Se não bater, avisem.

Isso serve para vocês **entenderem e conseguirem explicar** os números no vídeo. O professor cobra que vocês saibam explicar o que a IA ajudou a fazer.

## Parte 4 · Recomendação (juntos, com o Claude)

Ler a tabela e decidir, com base nos números, a **ordem** das recomendações. O Claude escreve `analise/justificativas.md` e vocês revisam: o texto tem que dizer o que vocês concordam.

## Parte 5 · Telas do assistente (Claude faz)

Calculadora, comparação e perguntas sobre energia, cada resposta com fonte, data e "estimativa, não garantia". Vocês abrem no celular e dizem o que ficou confuso.

## Parte 6 · Teste com pessoas (Thor e Gabriel)

1. Chamar **3 a 5 pessoas** (ideal: quem usa ou cuida de quem usa cadeira motorizada; senão, familiares e vizinhos).
2. Seguir o [roteiro](../testes-usuarios/roteiro.md): as 3 situações e as 4 perguntas.
3. Anotar no [registro](../testes-usuarios/registro.md): situação, o que a pessoa disse, e o que vocês mudaram por causa disso. **Sem nome**: P1, P2, P3.
4. Passar para o Claude o que precisa mudar. Depois de mudar, anotar "antes → depois" no registro.

## Parte 7 · Vídeo (até 3 min)

1. Seguir o [roteiro do vídeo](../video/roteiro.md).
2. Gravar a tela (OBS ou o gravador do celular) com a voz de um dos dois.
3. Subir no YouTube como **não listado**.
4. Abrir o link numa aba anônima para confirmar que abre sem login.

## Parte 8 · Entrega

1. Colar o link do vídeo no `entrega.txt` (está na pasta do Gabriel, fora do GitHub).
2. Abrir o link do GitHub numa aba anônima: tem que abrir.
3. Enviar **só** o `entrega.txt` no Portal, na entrega de SERS, até a data do Portal.

---

## Datas

| Até | O quê | Quem |
|---|---|---|
| 10/11 | Parte 1 (Thor entra no repositório) | Gabriel e Thor |
| 11/11 | Parte 2 (19 números com fonte) | Thor: blocos 1 e 4 · Gabriel: blocos 2 e 3 |
| 12/11 | Partes 3 e 4 | Claude + conferência da dupla |
| 13/11 | Parte 5 | Claude |
| 13–15/11 | Parte 6 | Thor e Gabriel |
| 16–17/11 | Parte 7 | Thor e Gabriel |
| 18/11 | Parte 8 | Gabriel |
