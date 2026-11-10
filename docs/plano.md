# GS 2026.2 · SERS (Soluções em Energias Renováveis e Sustentáveis) · Plano de trabalho

Contribuição da disciplina ao Mapiii (Citizen Assist AI). Escrito em 09/11/2026 a partir do enunciado `GS2026.2_SERS(5).pdf`.

> **Regra desta pasta:** nada daqui vai para o repositório oficial (`mapiii-assistente`) e nada é mexido lá. O Mapiii serve só de **base** (público, tom, regras de fonte e de limitação). A entrega de SERS é um **repositório separado**.

---

## 0. O que o professor vai cobrar (resumo do enunciado)

| Peso | Critério | Em uma frase |
|---|---|---|
| **60** | Fundamentação e coerência técnica | Conceitos de energia/potência/eficiência certos, dados com origem, cálculos corretos, comparação justa das alternativas, e **o que o assistente responde bate com os cálculos**. |
| **30** | Aplicação e utilidade | A necessidade é real para o público e a parte de energia **funciona dentro do assistente**. |
| **10** | Usabilidade e comunicação | Texto claro, fontes e limitações visíveis, **evidência de teste com pessoas**. |

Entregáveis obrigatórios:

1. **Repositório no GitHub** com: README (integrantes, público, problema, funcionalidades de energia, como rodar), código, dados com origem e premissas, cálculos e comparação, justificativas (custo, viabilidade, impacto ambiental), referências, registro de testes com usuários e ajustes.
2. **Vídeo no YouTube, não listado, até 3 min**: público e necessidade → análise e comparação (com a renovável) → demonstração no assistente → recomendações e limitações.
3. **Um único `.txt`** no Portal: nome completo e RM dos dois, link do repo, link do vídeo.

Reprova automática de escopo: solução genérica, sem análise energética, ou sem integração ao assistente.

---

## 1. A ideia (recomendação)

**Público:** famílias de pessoas que usam **cadeira de rodas motorizada** na cidade de São Paulo (o mesmo público do Mapiii).

**Necessidade energética real:** a **recarga diária da bateria da cadeira** (todo dia, sem falta, senão a pessoa fica sem se mover). Isso gera duas dores:

- **custo** na conta de luz de famílias que muitas vezes são de baixa renda;
- **dependência da rede**: em falta de energia, a cadeira não carrega.

**Pergunta que a análise responde:** *"Quanto custa por mês e por ano carregar a cadeira, e qual é a melhor forma de reduzir esse custo ou garantir a recarga?"*

**Alternativas comparadas** (mesma necessidade, mesmo período de referência: **12 meses**):

| | Alternativa | Tipo | O que se calcula |
|---|---|---|---|
| **Base** | Recarregar na tomada, tarifa residencial comum (B1, Enel SP) | referência | kWh/mês, R$/mês, R$/ano, kg CO₂/ano |
| **A** | **Eficiência + Tarifa Social de Energia Elétrica** (desconto para quem está no CadÚnico/BPC) + bons hábitos de recarga (tirar o carregador da tomada ao terminar, não carregar além do manual) | economia | quanto cai a conta; custo de adoção ≈ zero; quem é elegível |
| **B** | **Energia solar fotovoltaica** (renovável). Duas formas: **B1** sistema pequeno na casa, ligado à rede (geração distribuída, Lei 14.300/2022); **B2** kit solar com bateria só para a cadeira (funciona também na falta de luz) | fornecimento renovável | kWh gerados/ano, investimento, economia/ano, **payback**, CO₂ evitado |
| *(opcional)* **C** | **Assinatura de energia solar / geração compartilhada** (para quem mora de aluguel ou em apartamento, sem telhado) | renovável sem obra | desconto típico na conta; condições |

**Por que esta escolha é boa para a nota:** é uma necessidade concreta e diária do público; envolve potência, energia, eficiência (perdas do carregador), tarifa e fonte renovável; e o resultado provável é **não óbvio** (o consumo de uma cadeira é pequeno, então o solar só para ela pode demorar muito para se pagar, e a Tarifa Social pode ser a recomendação mais útil, com o solar fazendo mais sentido pela **autonomia na falta de luz** ou somado ao consumo da casa toda). Uma conclusão honesta assim pontua muito em "coerência técnica".

> A conclusão **não pode ser escrita antes das contas**. Ela sai dos números.

---

## 2. Onde e como fica o repositório

**Decisão a tomar (dupla):** nome do repo. Sugestão: `mapiii-energia` (público, no GitHub do Gabriel ou do Thor).

**Recomendação de estrutura:** um app web pequeno, **independente**, na mesma stack do Mapiii (Vite + React + TypeScript + Vitest), que mostra a "parte de energia" do assistente. Pode-se **copiar** do Mapiii o que ajudar (tokens de cor, componente de cartão com fonte/data/limitação, a busca simples por palavras-chave), mas é uma cópia: o repo oficial não muda.

```
mapiii-energia/
├── README.md                    ← integrantes, público, problema, funcionalidades, como rodar, "contribuição de SERS"
├── dados/
│   ├── README.md                ← origem, unidade, período e premissa de CADA número
│   ├── equipamento.json         ← cadeira(s): tensão, capacidade da bateria, potência/eficiência do carregador (manual do fabricante)
│   ├── tarifas.json             ← tarifa B1 Enel SP, bandeiras, impostos, faixas da Tarifa Social (com link e data)
│   ├── solar.json               ← irradiação de SP, potência do módulo, perdas, custo R$/Wp, custo do kit com bateria
│   └── emissoes.json            ← fator de emissão da rede (MCTI)
├── src/
│   ├── energia/calculos.ts      ← TODA conta fica aqui (funções puras)
│   ├── energia/calculos.test.ts ← testes com casos calculados à mão
│   ├── energia/fichas.json      ← respostas do assistente (mesmo formato de ficha do Mapiii: fonte, verificado_em, limitacao)
│   └── app/                     ← telas: calculadora de recarga + "pergunte ao Mapi sobre energia" + comparação
├── analise/
│   ├── gerar-analise.ts         ← roda os cálculos e escreve resultados.md e resultados.csv
│   ├── resultados.md            ← tabela comparativa gerada (não escrita à mão)
│   └── justificativas.md        ← custo, viabilidade e impacto ambiental de cada alternativa, e a recomendação
├── testes-usuarios/
│   ├── roteiro.md               ← as situações testadas
│   └── registro.md              ← comentários recebidos e ajustes feitos (sem nome, sem dado pessoal)
├── referencias.md
└── video/roteiro.md
```

**Ponto-chave de coerência (vale nota):** o app e o `analise/resultados.md` usam **as mesmas funções** de `calculos.ts`. Assim é impossível o assistente dizer um número e a análise dizer outro.

**Onde fica:** a pasta do trabalho é `/home/gabriel/SERS - GS2 - 2026`, fora do projeto principal (movida em 09/11/2026). O repositório de SERS é criado aqui, com git próprio.

---

## 3. Passo a passo (em ordem)

Cada passo diz **quem**, **o quê**, **como** e **como conferir**. "Dupla" = Thor e Gabriel (parte humana: pesquisar, decidir, testar). "Claude" = código e conferência.

### Passo 1 · Decidir o escopo (Dupla, 15 min) · hoje 09/11 ou 10/11

1. Confirmar público e necessidade (seção 1) ou trocar.
2. Confirmar as alternativas: Base + A + B (B1 e/ou B2). C só se sobrar tempo.
3. Escolher o nome do repo e em qual conta do GitHub fica.
4. Dividir: quem pesquisa dados (Passo 2) e quem testa com pessoas (Passo 6).

**Conferir:** as respostas estão anotadas no fim deste arquivo (seção 6).

### Passo 2 · Levantar os dados com fonte (Dupla, 2–3 h) · até 11/11

Para **cada** número: valor, unidade, link, data em que foi conferido, e se é **real/público** ou **estimado** (estimado precisa de justificativa). Nada de número "de cabeça" ou tirado de IA sem link.

| Dado | Onde buscar | Observação |
|---|---|---|
| Capacidade da bateria (V, Ah → Wh) e potência/corrente do carregador | Manual de 1 ou 2 modelos de cadeira motorizada vendidos no Brasil (site do fabricante) | Se o manual não der a eficiência do carregador, usar faixa da literatura e marcar como **estimado** |
| Frequência de recarga | Manual (recomendação do fabricante) + perguntar a usuários no teste | Ex.: "1 recarga completa por dia" é premissa, declarar |
| Tarifa residencial B1 da Enel SP (TE + TUSD, R$/kWh) | ANEEL, resolução homologatória vigente da Enel SP; ou página de tarifas da Enel | Anotar a vigência |
| Bandeiras tarifárias | ANEEL (página de bandeiras) | Usar média ou cenário, declarar qual |
| Impostos (ICMS SP, PIS/COFINS) | Enel SP / Sefaz SP | Pode simplificar com "tarifa com impostos" de uma conta real anonimizada, declarando |
| Tarifa Social: quem tem direito e desconto por faixa de consumo | Lei 12.212/2010 e página da ANEEL sobre Tarifa Social; **conferir mudanças recentes (2025)** | Regra de elegibilidade igual ao Mapiii: "Pode ter direito", nunca "tem direito" |
| Unidade consumidora com equipamento essencial (aviso prévio de corte, prioridade) | ANEEL, REN 1.000/2021 | Útil como orientação extra; conferir artigo exato |
| Irradiação solar em São Paulo (kWh/m²/dia) | CRESESB, SunData (CEPEL) | Usar média anual no plano inclinado, anotar coordenada |
| Potência do módulo, perdas do sistema (performance ratio) | Ficha técnica de um módulo comercial; PR típico com referência | PR é **estimado**, citar a referência |
| Custo do sistema on-grid (R$/Wp) | Estudo estratégico de mercado da Greener (geração distribuída) ou orçamentos | Anotar data |
| Custo de kit solar com bateria (B2) | 2 ou 3 anúncios/orçamentos de lojas, com data | Média; marcar como **pesquisa de preço** |
| Regras da geração distribuída (compensação, Fio B) | Lei 14.300/2022 (Planalto) | Explica por que o retorno não é 100% da tarifa |
| Fator de emissão da rede elétrica (kg CO₂/kWh) | MCTI, fatores de emissão do SIN (média anual) | Para o impacto ambiental |
| Impacto ambiental do solar e da bateria (fabricação, descarte) | Fonte secundária confiável (EPE, artigo, IEA) | Vai na seção de limitações/impactos |

**Conferir:** `dados/README.md` tem uma linha por número com fonte, unidade, período e se é estimado. Claude revisa se falta algo.

### Passo 3 · Fazer as contas (Claude escreve, Dupla confere à mão) · 11/11

Fórmulas (todas em `calculos.ts`, com teste):

- Energia guardada na bateria: `E_bat (kWh) = V × Ah ÷ 1000`
- Energia tirada da tomada por recarga: `E_rede = E_bat × profundidade_de_descarga ÷ η_carregador`
- Consumo mensal e anual: `E_mês = E_rede × recargas_por_dia × 30` · `E_ano = E_mês × 12`
- Standby do carregador esquecido na tomada (se o manual ou medição der a potência): `E_standby = P_standby × horas ÷ 1000`
- Custo: `R$ = E × tarifa_com_impostos` (cenário com e sem Tarifa Social)
- Solar on-grid: `E_gerada/ano = P_pico (kWp) × irradiação × 365 × PR`; tamanho necessário para cobrir a cadeira; investimento = `P_pico × R$/Wp`; economia/ano; **payback simples = investimento ÷ economia_ano**
- Kit com bateria (B2): mesma geração, mais perdas da bateria; custo do kit; payback; **dias de autonomia** sem rede
- Ambiental: `CO₂ evitado (kg/ano) = E_substituída × fator_emissão`

Comparação final numa tabela única (gerada por `npm run analise`): para cada alternativa, **kWh/ano, R$/ano, investimento inicial, payback, CO₂/ano, viabilidade (quem consegue adotar), limitações**.

**Conferir:** a dupla refaz **um** cenário na calculadora do celular e bate com a tabela. Isso também prova "compreensão das decisões" (o enunciado cobra isso por causa da IA).

### Passo 4 · Escrever as justificativas e a recomendação (Dupla com Claude) · 12/11

`analise/justificativas.md`, uma seção por alternativa:

- **Custo:** investimento e economia (números da tabela).
- **Viabilidade:** quem consegue (casa própria com telhado? aluguel? CadÚnico?), burocracia, tempo.
- **Impacto ambiental:** CO₂ evitado e o custo ambiental de painel/bateria (fabricação, descarte).
- **Limitações:** "estimativa, não resultado garantido"; varia com o modelo da cadeira, o uso, o clima, a tarifa do mês.

Fechar com a **recomendação em ordem** (provavelmente algo como: 1º ver se pode ter Tarifa Social; 2º hábitos de recarga; 3º solar se fizer sentido para a casa toda ou para autonomia na falta de luz), **sempre condicionada aos números**.

### Passo 5 · Integrar ao assistente (Claude) · 12/11 a 13/11

O que a pessoa consegue fazer no app:

1. **"Quanto gasto para carregar a cadeira?"**: escolhe o modelo (ou digita V e Ah), quantas recargas por dia → vê kWh/mês, R$/mês, R$/ano, e "como chegamos nesse número" (expansível).
2. **"Como pagar menos?"**: compara Base × A × B lado a lado, com a recomendação e o porquê.
3. **"Pergunte ao Mapi sobre energia"**: perguntas livres ("tarifa social", "energia solar compensa?", "faltou luz e a cadeira não carregou") respondidas **só com as fichas de energia**, cada uma com **fonte, data de conferência e limitação**, no padrão Mapiii (sem "você tem direito"; aviso fixo de protótipo).
4. Toda tela de número mostra: **"Estimativa. Não é valor garantido."** e as premissas.

Regras herdadas do Mapiii: sem login, sem dado pessoal (não pedir endereço, renda exata, CPF), acessibilidade (teclado, contraste, 16 px, sem rolagem lateral em 320 px).

**Conferir:** `npm test` passa; os números da tela batem com `analise/resultados.md`; publicar no GitHub Pages para o professor abrir sem instalar nada.

### Passo 6 · Testar com pessoas (Dupla) · 13/11 a 15/11

- 3 a 5 pessoas (ideal: alguém que usa ou cuida de quem usa cadeira motorizada; plano B: familiares/vizinhos).
- `testes-usuarios/roteiro.md` com 3 situações, por exemplo: (1) "descubra quanto custa carregar por mês"; (2) "descubra se a energia solar compensa para você"; (3) "entenda de onde vem o número e o que pode mudar".
- Perguntar: entendeu? achou útil? o que confundiu? confiaria?
- `testes-usuarios/registro.md`: situação, comentário, ajuste feito. **Sem nome, sem idade exata, sem endereço** (ex.: "P1, familiar de usuário").
- Fazer os ajustes e anotar "antes → depois".

### Passo 7 · README e referências (Claude escreve, Dupla revisa) · 15/11

README com: integrantes (nome e RM), "Contribuição da disciplina SERS ao Mapiii", público e problema, funcionalidades de energia, como rodar (`npm install`, `npm run dev`, `npm test`, `npm run analise`) e link do site publicado, mapa das pastas, resumo da comparação e da recomendação, limitações. `referencias.md` com todas as fontes (título, órgão, link, data de acesso).

### Passo 8 · Vídeo técnico (Dupla grava) · 16/11 a 17/11

Até **3 min**, não listado. Roteiro sugerido (em `video/roteiro.md`):

| Tempo | Conteúdo |
|---|---|
| 0:00–0:25 | Público e necessidade: a cadeira que precisa carregar todo dia, o custo e a falta de luz |
| 0:25–1:15 | Análise: dados (com fonte na tela), conta da recarga, tabela comparando Base × Tarifa Social/eficiência × Solar |
| 1:15–2:15 | Demonstração no app: calculadora, comparação, pergunta livre com fonte e limitação |
| 2:15–3:00 | Recomendações em ordem e limitações ("estimativa, não garantia") |

### Passo 9 · Entrega (Dupla) · até 18/11 (confirmar prazo no Portal)

- Conferir: repo **público** e abrindo em aba anônima; vídeo **não listado** abrindo deslogado.
- `.txt` com nome completo e RM dos dois, link do repo, link do vídeo. **Só o .txt.**

---

## 4. Cronograma resumido

| Dia | O quê |
|---|---|
| 09–10/11 | Passo 1 (decidir) e criar o repo |
| 10–11/11 | Passo 2 (dados com fonte) |
| 11/11 | Passo 3 (contas + testes) |
| 12/11 | Passo 4 (justificativas) e início do Passo 5 |
| 13/11 | Passo 5 (app) pronto e publicado |
| 13–15/11 | Passo 6 (teste com pessoas e ajustes) |
| 15/11 | Passo 7 (README e referências) |
| 16–17/11 | Passo 8 (vídeo) |
| 18/11 | Passo 9 (entrega) |

## 5. Checklist final (antes de enviar)

- [ ] Toda conta tem número com fonte, unidade, período e premissa; estimados marcados
- [ ] Pelo menos 2 alternativas + 1 renovável, no mesmo período (12 meses), com custo, viabilidade e impacto ambiental
- [ ] Números do app = números da análise (mesmas funções)
- [ ] Toda resposta do assistente mostra fonte, data e limitação; nenhuma promete economia
- [ ] Registro de testes com usuários com ajustes, sem dado pessoal
- [ ] README completo, com "contribuição de SERS" e como rodar
- [ ] `npm test` passando
- [ ] Vídeo ≤ 3 min, não listado
- [ ] `.txt` com nomes, RMs e os 2 links

## 6. Decisões da dupla (preencher)

- Público e necessidade confirmados? 
- Alternativas: Base + A + B1 / B2 / C? 
- Nome e conta do repo: 
- Quem pesquisa dados: 
- Quem faz os testes com pessoas: 
- Prazo exato no Portal: 
