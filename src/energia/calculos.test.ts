// Os números destes testes são ENTRADAS DE TESTE escolhidas para dar conta redonda,
// conferidas à mão. Não são dados reais de cadeira, tarifa ou sol (esses ficam em dados/).
import { describe, expect, it } from 'vitest';
import {
  consumoNoPeriodoKWh,
  custoMensalComFaixas,
  custoReais,
  emissaoKgCO2,
  energiaBateriaKWh,
  energiaDaRedePorRecargaKWh,
  energiaStandbyKWh,
  geracaoSolarAnualKWh,
  investimentoSolarReais,
  paybackSimplesAnos,
  potenciaPicoNecessariaKWp,
  recargasDeAutonomia
} from './calculos.ts';

describe('recarga da bateria', () => {
  it('energia da bateria: 24 V × 50 Ah = 1,2 kWh', () => {
    expect(energiaBateriaKWh(24, 50)).toBeCloseTo(1.2);
  });

  it('energia tirada da tomada considera profundidade e eficiência: 1,2 × 0,8 ÷ 0,8 = 1,2 kWh', () => {
    expect(
      energiaDaRedePorRecargaKWh({ tensaoV: 24, capacidadeAh: 50, profundidadeDescarga: 0.8, eficienciaCarregador: 0.8 })
    ).toBeCloseTo(1.2);
  });

  it('carregador menos eficiente tira mais da tomada', () => {
    const base = { tensaoV: 24, capacidadeAh: 50, profundidadeDescarga: 1 };
    expect(energiaDaRedePorRecargaKWh({ ...base, eficienciaCarregador: 0.5 })).toBeCloseTo(2.4);
    expect(energiaDaRedePorRecargaKWh({ ...base, eficienciaCarregador: 1 })).toBeCloseTo(1.2);
  });

  it('recusa eficiência fora de (0, 1] e tensão não positiva', () => {
    const base = { tensaoV: 24, capacidadeAh: 50, profundidadeDescarga: 1 };
    expect(() => energiaDaRedePorRecargaKWh({ ...base, eficienciaCarregador: 0 })).toThrow(RangeError);
    expect(() => energiaDaRedePorRecargaKWh({ ...base, eficienciaCarregador: 1.2 })).toThrow(RangeError);
    expect(() => energiaBateriaKWh(0, 50)).toThrow(RangeError);
    expect(() => energiaBateriaKWh(Number.NaN, 50)).toThrow(RangeError);
  });

  it('consumo no período: 1,5 kWh × 1 por dia × 30 dias = 45 kWh', () => {
    expect(consumoNoPeriodoKWh(1.5, 1, 30)).toBeCloseTo(45);
  });

  it('standby: 2 W por 20 h = 0,04 kWh', () => {
    expect(energiaStandbyKWh(2, 20)).toBeCloseTo(0.04);
  });
});

describe('custo', () => {
  it('tarifa única: 45 kWh × R$ 1,00 = R$ 45,00', () => {
    expect(custoReais(45, 1)).toBeCloseTo(45);
  });

  it('sem faixas, é a tarifa cheia', () => {
    expect(custoMensalComFaixas(45, 1, [])).toBeCloseTo(45);
  });

  it('aplica o desconto de cada faixa só na parte do consumo dentro dela', () => {
    const faixas = [
      { ateKWh: 30, desconto: 0.5 },
      { ateKWh: 100, desconto: 0.2 },
      { ateKWh: null, desconto: 0 }
    ];
    // 30 × 0,5 + 20 × 0,8 = 15 + 16 = 31
    expect(custoMensalComFaixas(50, 1, faixas)).toBeCloseTo(31);
    // 30 × 0,5 + 70 × 0,8 + 20 × 1 = 15 + 56 + 20 = 91
    expect(custoMensalComFaixas(120, 1, faixas)).toBeCloseTo(91);
    // Dentro da primeira faixa: 10 × 0,5 = 5
    expect(custoMensalComFaixas(10, 1, faixas)).toBeCloseTo(5);
  });

  it('consumo acima da última faixa com limite paga tarifa cheia no excedente', () => {
    // 30 × 0 + 10 × 1 = 10
    expect(custoMensalComFaixas(40, 1, [{ ateKWh: 30, desconto: 1 }])).toBeCloseTo(10);
  });

  it('isenção total numa faixa (desconto 1) zera aquela parte', () => {
    expect(custoMensalComFaixas(20, 1, [{ ateKWh: 30, desconto: 1 }])).toBeCloseTo(0);
  });

  it('recusa faixas fora de ordem, desconto inválido ou faixa sem limite no meio', () => {
    expect(() => custoMensalComFaixas(10, 1, [{ ateKWh: 50, desconto: 0.1 }, { ateKWh: 30, desconto: 0.1 }])).toThrow(RangeError);
    expect(() => custoMensalComFaixas(10, 1, [{ ateKWh: 30, desconto: 1.5 }])).toThrow(RangeError);
    expect(() => custoMensalComFaixas(10, 1, [{ ateKWh: null, desconto: 0.1 }, { ateKWh: 30, desconto: 0 }])).toThrow(RangeError);
  });
});

describe('solar', () => {
  it('geração: 1 kWp × 5 kWh/m²/dia × 365 × 0,8 = 1460 kWh/ano', () => {
    expect(geracaoSolarAnualKWh(1, 5, 0.8)).toBeCloseTo(1460);
  });

  it('potência necessária é o inverso da geração: 730 kWh/ano → 0,5 kWp', () => {
    expect(potenciaPicoNecessariaKWp(730, 5, 0.8)).toBeCloseTo(0.5);
  });

  it('investimento: 0,5 kWp × R$ 4,00/Wp = R$ 2000', () => {
    expect(investimentoSolarReais(0.5, 4)).toBeCloseTo(2000);
  });

  it('payback: R$ 2000 ÷ R$ 500/ano = 4 anos; sem economia, nunca', () => {
    expect(paybackSimplesAnos(2000, 500)).toBeCloseTo(4);
    expect(paybackSimplesAnos(2000, 0)).toBe(Infinity);
    expect(paybackSimplesAnos(2000, -10)).toBe(Infinity);
  });

  it('autonomia do kit: 3 kWh úteis ÷ 1,2 kWh por recarga = 2 recargas completas', () => {
    expect(recargasDeAutonomia(3, 1.2)).toBe(2);
  });
});

describe('ambiental', () => {
  it('emissão: 540 kWh × 0,1 kg/kWh = 54 kg CO₂', () => {
    expect(emissaoKgCO2(540, 0.1)).toBeCloseTo(54);
  });
});
