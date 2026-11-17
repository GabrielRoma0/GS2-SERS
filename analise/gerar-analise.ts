// npm run analise             → com dados/ completos, grava analise/resultados.md e analise/resultados.csv
// npm run analise -- --exemplo → mostra na tela a tabela com os números FICTÍCIOS (não grava nada)
// As contas são as mesmas do app (src/energia/analise.ts): o número do documento é o número da tela.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { analisar, type Analise } from '../src/energia/analise.ts';
import { DADOS_EXEMPLO } from '../src/energia/exemplo.ts';
import { anos, kg, kWh, numero, reais } from '../src/energia/formatar.ts';
import { montarParametros } from '../src/energia/parametros.ts';
import type { Dado } from '../src/energia/validar-dados.ts';

const exemplo = process.argv.includes('--exemplo');
const raiz = join(import.meta.dirname, '..');

function lerDados(): Dado[] {
  const pasta = join(raiz, 'dados');
  return readdirSync(pasta)
    .filter((a) => a.endsWith('.json'))
    .sort()
    .flatMap((a) => JSON.parse(readFileSync(join(pasta, a), 'utf8')) as Dado[]);
}

function markdown(a: Analise, dados: Dado[]): string {
  const linhas: string[] = [];
  const hoje = new Date().toISOString().slice(0, 10);
  linhas.push('# Resultados · comparação das alternativas');
  linhas.push('');
  if (exemplo) linhas.push('> **NÚMEROS DE EXEMPLO, FICTÍCIOS. NÃO ENTREGAR.**', '');
  linhas.push(`Gerado por \`npm run analise\` em ${hoje}, com as funções de \`src/energia/\` (as mesmas do app). Não editar à mão.`);
  linhas.push('');
  linhas.push('**Necessidade:** recarregar a cadeira de rodas motorizada. **Período de referência:** 12 meses.');
  linhas.push('');
  linhas.push('## 1. Consumo da cadeira');
  linhas.push('');
  linhas.push('| Grandeza | Valor | Conta |');
  linhas.push('|---|---|---|');
  linhas.push(`| Energia da bateria | ${kWh(a.kWhBateria)} | tensão × capacidade ÷ 1000 |`);
  linhas.push(`| Energia da tomada por recarga | ${kWh(a.kWhPorRecarga)} | bateria × profundidade de descarga ÷ eficiência do carregador |`);
  linhas.push(`| Recarga no ano | ${kWh(a.kWhRecargaAno)} | por recarga × recargas por dia × 365 |`);
  if (a.kWhStandbyAno !== null) linhas.push(`| Carregador em espera no ano | ${kWh(a.kWhStandbyAno)} | potência em espera × horas por dia × 365 ÷ 1000 |`);
  linhas.push(`| **Total no ano** | **${kWh(a.kWhAno)}** | |`);
  linhas.push(`| Total no mês | ${kWh(a.kWhMes)} | ano ÷ 12 |`);
  linhas.push(`| Tarifa usada (com bandeira) | ${reais(a.tarifaEfetivaReaisKWh)}/kWh | tarifa + bandeira |`);
  linhas.push(`| **Custo no ano** | **${reais(a.custoAnoReais)}** | energia × tarifa |`);
  linhas.push(`| Custo no mês | ${reais(a.custoMesReais)} | |`);
  linhas.push(`| Emissão no ano | ${kg(a.co2KgAno)} | energia × fator de emissão da rede |`);
  linhas.push('');
  linhas.push('## 2. Comparação (12 meses, mesma necessidade)');
  linhas.push('');
  linhas.push('| Alternativa | Tipo | Energia da rede/ano | Custo/ano | Investimento | Economia/ano | Payback simples | CO₂ evitado/ano |');
  linhas.push('|---|---|---|---|---|---|---|---|');
  for (const o of a.alternativas) {
    linhas.push(
      `| ${o.nome} | ${o.tipo} | ${kWh(o.kWhAnoDaRede)} | ${reais(o.custoAnoReais)} | ${reais(o.investimentoReais)} | ${reais(o.economiaAnoReais)} | ${o.id === 'base' ? '—' : anos(o.paybackAnos)} | ${kg(o.co2EvitadoKgAno)} |`
    );
  }
  linhas.push('');
  linhas.push(`- **Solar ligado à rede:** a cadeira precisaria de ${numero(a.kWpNecessario, 3)} kWp; o investimento da tabela é o do menor sistema vendido (${numero(a.kWpInstalado, 1)} kWp). Se o sistema for dimensionado para a casa toda, a parte da cadeira custa ${reais(a.investimentoProporcionalReais)} e se paga em ${anos(a.paybackProporcionalAnos)}.`);
  linhas.push(`- **Tarifa Social:** com a casa consumindo ${numero(a.consumoCasaKWhMes, 1)} kWh/mês sem a cadeira, a conta da casa cai cerca de ${reais(a.economiaCasaTarifaSocialMesReais)} por mês (${reais(a.economiaCasaTarifaSocialMesReais * 12)} por ano).`);
  linhas.push(`- **Kit com bateria:** guarda cerca de ${a.recargasAutonomiaKit} recarga(s) completa(s) para usar sem luz.`);
  linhas.push('');
  linhas.push('## 3. Limitações de cada alternativa');
  linhas.push('');
  for (const o of a.alternativas.filter((x) => x.limitacoes.length > 0)) {
    linhas.push(`**${o.nome}:** ${o.destaque}`);
    for (const l of o.limitacoes) linhas.push(`- ${l}`);
    linhas.push('');
  }
  linhas.push('**Gerais:**');
  for (const l of a.limitacoesGerais) linhas.push(`- ${l}`);
  linhas.push('');
  linhas.push('## 4. Dados usados');
  linhas.push('');
  linhas.push('| Dado | Valor | Tipo | Fonte | Conferido em |');
  linhas.push('|---|---|---|---|---|');
  for (const d of dados.filter((x) => x.valor !== null)) {
    linhas.push(`| ${d.descricao} | ${numero(d.valor!, 3)} ${d.unidade} | ${d.tipo} | [${d.fonte_nome}](${d.fonte_url}) | ${d.verificado_em} |`);
  }
  linhas.push('');
  return linhas.join('\n');
}

function csv(a: Analise): string {
  const cab = 'alternativa;tipo;kwh_rede_ano;custo_ano_reais;investimento_reais;economia_ano_reais;payback_anos;co2_evitado_kg_ano';
  const f = (v: number) => (Number.isFinite(v) ? v.toFixed(4).replace('.', ',') : 'nunca');
  return [cab, ...a.alternativas.map((o) => [o.nome, o.tipo, f(o.kWhAnoDaRede), f(o.custoAnoReais), f(o.investimentoReais), f(o.economiaAnoReais), f(o.paybackAnos), f(o.co2EvitadoKgAno)].join(';'))].join('\n') + '\n';
}

const dados = exemplo ? DADOS_EXEMPLO : lerDados();
const r = montarParametros(dados);
if (!r.ok) {
  console.error('Faltam dados para gerar a análise (preencha em dados/ e rode npm run validar-dados):');
  for (const id of r.faltando) console.error(`  - ${id}`);
  process.exit(1);
}
const a = analisar(r.p);
if (exemplo) {
  console.log(markdown(a, dados));
} else {
  writeFileSync(join(raiz, 'analise', 'resultados.md'), markdown(a, dados));
  writeFileSync(join(raiz, 'analise', 'resultados.csv'), csv(a));
  console.log('Gravados analise/resultados.md e analise/resultados.csv');
}
