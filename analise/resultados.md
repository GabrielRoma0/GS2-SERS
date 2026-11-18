# Resultados · comparação das alternativas

Gerado por `npm run analise` em 2026-11-18, com as funções de `src/energia/` (as mesmas do app). Não editar à mão.

**Necessidade:** recarregar a cadeira de rodas motorizada. **Período de referência:** 12 meses.

## 1. Consumo da cadeira

| Grandeza | Valor | Conta |
|---|---|---|
| Energia da bateria | 0,96 kWh | tensão × capacidade ÷ 1000 |
| Energia da tomada por recarga | 0,69 kWh | bateria × profundidade de descarga ÷ eficiência do carregador |
| Recarga no ano | 250,3 kWh | por recarga × recargas por dia × 365 |
| **Total no ano** | **250,3 kWh** | |
| Total no mês | 20,9 kWh | ano ÷ 12 |
| Tarifa usada (com bandeira) | R$ 0,79/kWh | tarifa + bandeira |
| **Custo no ano** | **R$ 197,57** | energia × tarifa |
| Custo no mês | R$ 16,46 | |
| Emissão no ano | 11,5 kg de CO₂ | energia × fator de emissão da rede |

## 2. Comparação (12 meses, mesma necessidade)

| Alternativa | Tipo | Energia da rede/ano | Custo/ano | Investimento | Economia/ano | Payback simples | CO₂ evitado/ano |
|---|---|---|---|---|---|---|---|
| Recarregar na tomada, tarifa comum | referência | 250,3 kWh | R$ 197,57 | R$ 0,00 | R$ 0,00 | — | 0,0 kg de CO₂ |
| Tarifa Social de Energia Elétrica | economia | 250,3 kWh | R$ 197,57 | R$ 0,00 | R$ 0,00 | imediato | 0,0 kg de CO₂ |
| Energia solar ligada à rede (geração distribuída) | renovável | 0,00 kWh | R$ 31,81 | R$ 7.240,00 | R$ 165,76 | cerca de 43,7 anos | 11,5 kg de CO₂ |
| Kit solar com bateria, só para a cadeira | renovável | 0,00 kWh | R$ 0,00 | R$ 10.098,00 | R$ 197,57 | cerca de 51,1 anos | 11,5 kg de CO₂ |

- **Solar ligado à rede:** a cadeira precisaria de 0,189 kWp; o investimento da tabela é o do menor sistema vendido (2,0 kWp). Se o sistema for dimensionado para a casa toda, a parte da cadeira custa R$ 684,39 e se paga em cerca de 4,1 anos.
- **Tarifa Social:** com a casa consumindo 181,8 kWh/mês sem a cadeira, a conta da casa cai cerca de R$ 63,15 por mês (R$ 757,80 por ano).
- **Kit com bateria:** guarda cerca de 1 recarga(s) completa(s) para usar sem luz.

## 3. Limitações de cada alternativa

**Tarifa Social de Energia Elétrica:** Não muda o custo da recarga quando a casa já passa da faixa com desconto, mas reduz a conta da casa em cerca de R$ 63,15 por mês.
- Só para famílias que se encaixam nas regras da Tarifa Social. Quem decide é a distribuidora.
- O desconto depende do consumo total da casa (aqui: 181,80 kWh/mês sem a cadeira).
- Reduz o custo, não o consumo: não diminui emissões.

**Energia solar ligada à rede (geração distribuída):** A cadeira precisaria de só 0,19 kWp, mas o menor sistema vendido tem 2,0 kWp. Se o sistema for feito para a casa toda, a parte da cadeira custa cerca de R$ 684,39.
- Exige telhado com sol e imóvel próprio (ou autorização).
- Considera que 16% da tarifa não é compensada (Fio B, Lei 14.300/2022).
- A economia conta só a energia da cadeira; um sistema maior também abateria o resto da conta da casa.
- A conta nunca fica abaixo da taxa mínima (custo de disponibilidade) da distribuidora.
- Não funciona na falta de luz (desliga junto com a rede, por segurança).

**Kit solar com bateria, só para a cadeira:** Guarda energia para cerca de 1 recarga(s) completa(s) mesmo sem luz.
- A bateria do kit perde capacidade com o tempo e precisa ser trocada; isso não entra no payback simples.
- Em dias nublados gera menos.
- Bateria e painel têm impacto ambiental na fabricação e no descarte.

**Gerais:**
- Tudo aqui é estimativa, não resultado garantido.
- Os números mudam com o modelo da cadeira, o jeito de usar, a tarifa e a bandeira do mês, e o clima.
- O payback é simples: não considera inflação, juros, aumento da tarifa nem manutenção.
- Cada alternativa é comparada sozinha com a referência; combinações (ex.: Tarifa Social + solar) mudam os valores.

## 4. Dados usados

| Dado | Valor | Tipo | Fonte | Conferido em |
|---|---|---|---|---|
| Fator médio de emissão de CO₂ da rede elétrica brasileira (SIN), MCTI | 0,046 kg CO₂/kWh | publico | [MCTI, Fatores de emissão de CO₂ do SIN para inventários (planilha Inventário 2026, ano 2025: 0,0461 tCO₂/MWh)](https://www.gov.br/mcti/pt-br/acompanhe-o-mcti/sirene/dados-e-ferramentas/fatores-de-emissao) | 2026-11-17 |
| Tensão nominal do conjunto de baterias da cadeira motorizada (Freedom: 2 baterias de 12 V em série) | 24,000 V | publico | [Freedom, manual do proprietário das cadeiras motorizadas, p. 16 (motores de 24 V) e p. 23 (carregador de 24 V)](https://www.fwa.com.br/wp-content/uploads/2018/12/freedom_cm.pdf) | 2026-11-17 |
| Capacidade das baterias da cadeira (Freedom Lumina Motorizada 20, opção VRLA 40 Ah) | 40,000 Ah | publico | [Freedom, página da Cadeira de Rodas Lumina Motorizada 20 (baterias de 18 a 60 Ah)](https://freedom.ind.br/produtos/cadeira-de-rodas-freedom-lumina-motorizada-20/) | 2026-11-17 |
| Eficiência de energia de bateria chumbo-ácido com carregador (energia aproveitada ÷ energia da tomada) | 0,700 fração (0 a 1) | estimado | [Battery Design, Efficiency (eficiência típica de chumbo-ácido ~70%)](https://www.batterydesign.net/chemistry/efficiency/) | 2026-11-17 |
| Quanto da bateria é reposto por recarga num dia típico | 0,500 fração (0 a 1) | estimado | [Freedom, como carregar as baterias (recomenda não deixar a carga se esgotar)](https://freedom.ind.br/carregar-baterias/) | 2026-11-17 |
| Recargas por dia recomendadas pelo fabricante | 1,000 recargas/dia | publico | [Freedom, como carregar as baterias (recarga diária, de 6 a 8 horas)](https://freedom.ind.br/carregar-baterias/) | 2026-11-17 |
| Irradiação solar média diária em São Paulo, plano inclinado (CRESESB SunData) | 4,650 kWh/m²/dia | publico | [CRESESB/CEPEL, SunData v3.0: estação São Paulo (23,5° S; 46,649° O), plano inclinado com ângulo igual à latitude (24° N)](https://cresesb.cepel.br/index.php?section=sundata) | 2026-11-17 |
| Desempenho do sistema fotovoltaico (perdas de temperatura, cabos e inversor) | 0,780 fração (0 a 1) | estimado | [Solarprime, metodologia de cálculo (desempenho de 78%)](https://solarprime.com.br/quanto-custa-instalar-energia-solar-residencial-2026/) | 2026-11-17 |
| Preço médio de sistema fotovoltaico residencial completo de 2 kWp (kit + instalação) | 3,620 R$/Wp | publico | [Greener, Estudo SED 1º semestre de 2026 (via Solarprime)](https://solarprime.com.br/quanto-custa-instalar-energia-solar-residencial-2026/) | 2026-11-17 |
| Porte do menor sistema residencial de referência | 2,000 kWp | publico | [Greener, Estudo SED 1º semestre de 2026 (via Solarprime)](https://solarprime.com.br/quanto-custa-instalar-energia-solar-residencial-2026/) | 2026-11-17 |
| Preço do kit Bluetti AC70P (864 Wh, LiFePO4) + painel solar 200 W | 10.098,000 R$ | publico | [BLUETTI Brasil, AC70P + 200 W, kit solar](https://br.bluettipower.com/products/ac70p-estacao-de-energia-portatil) | 2026-11-17 |
| Capacidade da bateria do kit (AC70P) | 0,864 kWh | publico | [BLUETTI Brasil, AC70P 1.000 W 864 Wh](https://br.bluettipower.com/products/ac70p-estacao-de-energia-portatil) | 2026-11-17 |
| Potência do painel solar do kit | 200,000 Wp | publico | [BLUETTI Brasil, AC70P + 200 W](https://br.bluettipower.com/products/ac70p-estacao-de-energia-portatil) | 2026-11-17 |
| Parcela da tarifa não compensada em 2026: 60% do Fio B (R$ 0,2121/kWh) ÷ tarifa (R$ 0,78938/kWh) | 0,161 fração (0 a 1) | estimado | [Lei 14.300/2022, art. 27 (60% do Fio B em 2026)](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/lei/l14300.htm) | 2026-11-17 |
| Tarifa residencial B1 da Enel SP, TUSD R$ 472,42 + TE R$ 316,96 por MWh, sem impostos | 0,789 R$/kWh | publico | [Enel SP, Tarifa de Energia Elétrica (REH 3.596/2026)](https://www.enel.com.br/pt-saopaulo/Para_Voce/tarifa-energia-eletrica.html) | 2026-11-17 |
| Adicional da bandeira tarifária de novembro de 2026 (verde) | 0,000 R$/kWh | publico | [ANEEL, bandeira verde para novembro de 2026](https://www.gov.br/aneel/pt-br/assuntos/noticias/2026/aneel-anuncia-bandeira-verde-para-vigorar-em-novembro) | 2026-11-17 |
| Consumo residencial médio no Brasil (EPE), usado como consumo da casa sem a cadeira | 181,800 kWh/mês | publico | [EPE, Resenha Mensal do Mercado de Energia Elétrica, setembro de 2026 (base agosto)](https://www.epe.gov.br/sites-pt/publicacoes-dados-abertos/publicacoes/PublicacoesArquivos/publicacao-153/topico-803/Resenha%20Mensal%20-%20Setembro%202026%20(base%20Agosto).pdf) | 2026-11-17 |
| Tarifa Social (regra desde 05/07/2025): limite da faixa com desconto | 80,000 kWh/mês | publico | [ANEEL, Tarifa Social de Energia Elétrica](https://www.gov.br/aneel/pt-br/assuntos/tarifas/tarifa-social) | 2026-11-17 |
| Tarifa Social: desconto até 80 kWh/mês (acima disso, sem desconto) | 1,000 fração (0 a 1) | publico | [ANEEL, Tarifa Social de Energia Elétrica](https://www.gov.br/aneel/pt-br/assuntos/tarifas/tarifa-social) | 2026-11-17 |
