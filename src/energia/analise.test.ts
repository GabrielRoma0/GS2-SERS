// Conferido à mão com os números de EXEMPLO (fictícios) de exemplo.ts:
// bateria 24 V × 50 Ah = 1,2 kWh; × 0,8 (profundidade) ÷ 0,8 (eficiência) = 1,2 kWh por recarga;
// × 1 por dia × 365 = 438 kWh/ano; espera 2 W × 12 h × 365 = 8,76 kWh/ano; total 446,76 kWh/ano; tarifa R$ 1,00.
import { describe, expect, it } from 'vitest';
import { analisar } from './analise.ts';
import { DADOS_EXEMPLO } from './exemplo.ts';
import { montarParametros, type Parametros } from './parametros.ts';

function params(): Parametros {
  const r = montarParametros(DADOS_EXEMPLO);
  if (!r.ok) throw new Error('exemplo incompleto');
  return r.p;
}

const alt = (a: ReturnType<typeof analisar>, id: string) => a.alternativas.find((x) => x.id === id)!;

describe('analisar', () => {
  const a = analisar(params());

  it('consumo e custo da referência', () => {
    expect(a.kWhPorRecarga).toBeCloseTo(1.2);
    expect(a.kWhRecargaAno).toBeCloseTo(438);
    expect(a.kWhStandbyAno).toBeCloseTo(8.76);
    expect(a.kWhAno).toBeCloseTo(446.76);
    expect(a.kWhMes).toBeCloseTo(37.23);
    expect(a.custoAnoReais).toBeCloseTo(446.76);
    expect(a.co2KgAno).toBeCloseTo(44.676);
  });

  it('hábito tira só o consumo em espera', () => {
    expect(alt(a, 'habitos').economiaAnoReais).toBeCloseTo(8.76);
    expect(alt(a, 'habitos').co2EvitadoKgAno).toBeCloseTo(0.876);
  });

  it('Tarifa Social cobra a cadeira pela faixa em que a casa já está', () => {
    // casa 100 kWh: 30 × 0,5 + 70 × 0,8 = 71; casa + cadeira 137,23: 15 + 107,23 × 0,8 = 100,784.
    // cadeira = 29,784/mês = 357,408/ano; economia = 446,76 − 357,408 = 89,352.
    const ts = alt(a, 'tarifa-social');
    expect(ts.custoAnoReais).toBeCloseTo(357.408);
    expect(ts.economiaAnoReais).toBeCloseTo(89.352);
    expect(ts.investimentoReais).toBe(0);
  });

  it('solar ligado à rede: tamanho, investimento, Fio B e payback', () => {
    // 446,76 ÷ (5 × 365 × 0,8 = 1460) = 0,306 kWp; × R$ 4000/kWp = R$ 1224; economia 446,76 × 0,7 = 312,732.
    const s = alt(a, 'solar-rede');
    expect(a.kWpNecessario).toBeCloseTo(0.306, 3);
    expect(s.investimentoReais).toBeCloseTo(1224);
    expect(s.economiaAnoReais).toBeCloseTo(312.732);
    expect(s.paybackAnos).toBeCloseTo(1224 / 312.732);
    expect(s.co2EvitadoKgAno).toBeCloseTo(44.676);
  });

  it('kit com bateria: só cobre a recarga, nunca mais do que ela', () => {
    // 0,3 kWp × 1460 = 438 kWh gerados = exatamente a recarga do ano.
    const k = alt(a, 'kit-solar');
    expect(k.economiaAnoReais).toBeCloseTo(438);
    expect(k.paybackAnos).toBeCloseTo(3000 / 438);
    expect(a.recargasAutonomiaKit).toBe(1);
    const grande = analisar({ ...params(), kitPotenciaWp: 1000 });
    expect(alt(grande, 'kit-solar').economiaAnoReais).toBeCloseTo(438);
  });

  it('ajustes da calculadora mudam o resultado', () => {
    const duas = analisar(params(), { recargasPorDia: 2 });
    expect(duas.kWhRecargaAno).toBeCloseTo(876);
  });

  it('sem dados de espera, o hábito some e a referência é só a recarga', () => {
    const semEspera = analisar({ ...params(), standbyW: null, horasOciosasDia: null });
    expect(semEspera.alternativas.some((x) => x.id === 'habitos')).toBe(false);
    expect(semEspera.kWhAno).toBeCloseTo(438);
  });

  it('sem Fio B, avisa que a economia está superestimada', () => {
    const s = alt(analisar({ ...params(), fioB: null }), 'solar-rede');
    expect(s.economiaAnoReais).toBeCloseTo(446.76);
    expect(s.limitacoes.join()).toMatch(/Não considera/);
  });

  it('sistema na rede respeita o tamanho mínimo do mercado e mostra a parte proporcional', () => {
    // necessário 0,306 kWp; mínimo 2 kWp → investimento 2 × 4000 = 8000; proporcional continua 1224.
    const b = analisar({ ...params(), kWpMinimoOnGrid: 2 });
    const s = alt(b, 'solar-rede');
    expect(b.kWpInstalado).toBe(2);
    expect(s.investimentoReais).toBeCloseTo(8000);
    expect(s.paybackAnos).toBeCloseTo(8000 / 312.732);
    expect(b.investimentoProporcionalReais).toBeCloseTo(1224);
    expect(s.destaque).toMatch(/menor sistema/);
  });

  it('Tarifa Social com gratuidade até 80 kWh: casa acima da faixa não muda a recarga, mas reduz a conta da casa', () => {
    const regra = { ...params(), faixasTarifaSocial: [{ ateKWh: 80, desconto: 1 }], consumoCasaKWhMes: 180 };
    const b = analisar(regra);
    const ts = alt(b, 'tarifa-social');
    expect(ts.economiaAnoReais).toBeCloseTo(0);
    expect(b.economiaCasaTarifaSocialMesReais).toBeCloseTo(80);
    expect(ts.destaque).toMatch(/Não muda o custo da recarga/);
    // Casa que gasta 50 kWh: os primeiros 30 kWh da cadeira caem na faixa grátis (37,23 − 30 = 7,23 pagos/mês).
    const pequena = analisar(regra, { consumoCasaKWhMes: 50 });
    expect(alt(pequena, 'tarifa-social').custoAnoReais).toBeCloseTo(7.23 * 12);
  });

  it('nenhum texto promete direito', () => {
    expect(JSON.stringify(a)).not.toMatch(/tem direito/i);
  });
});
