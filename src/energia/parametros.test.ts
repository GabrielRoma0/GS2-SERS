import { describe, expect, it } from 'vitest';
import { DADOS_EXEMPLO } from './exemplo.ts';
import { montarParametros } from './parametros.ts';

describe('montarParametros', () => {
  it('monta tudo com os dados de exemplo completos', () => {
    const r = montarParametros(DADOS_EXEMPLO);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.p.tensaoV).toBe(24);
    expect(r.p.faixasTarifaSocial).toEqual([
      { ateKWh: 30, desconto: 0.5 },
      { ateKWh: 150, desconto: 0.2 }
    ]);
    expect(r.p.standbyW).toBe(2);
    expect(r.p.fioB).toBe(0.3);
  });

  it('lista o que falta quando um obrigatório está null', () => {
    const dados = DADOS_EXEMPLO.map((d) => (d.id === 'tarifa-b1-enel-sp' ? { ...d, valor: null } : d));
    const r = montarParametros(dados);
    expect(r).toEqual({ ok: false, faltando: ['tarifa-b1-enel-sp'] });
  });

  it('opcional apagado do JSON não é pendência; opcional null é', () => {
    const semFioB = DADOS_EXEMPLO.filter((d) => d.id !== 'compensacao-fio-b');
    const r1 = montarParametros(semFioB);
    expect(r1.ok && r1.p.fioB).toBe(null);
    const fioBNull = DADOS_EXEMPLO.map((d) => (d.id === 'compensacao-fio-b' ? { ...d, valor: null } : d));
    expect(montarParametros(fioBNull)).toEqual({ ok: false, faltando: ['compensacao-fio-b'] });
  });

  it('hábito do standby só entra com os dois números', () => {
    const r = montarParametros(DADOS_EXEMPLO.filter((d) => d.id !== 'horas-ociosas-carregador'));
    expect(r.ok && r.p.standbyW).toBe(null);
  });

  it('aceita qualquer quantidade de faixas e acusa faixa incompleta', () => {
    const umaFaixa = DADOS_EXEMPLO.filter((d) => !d.id.startsWith('ts-faixa-2'));
    const r = montarParametros(umaFaixa);
    expect(r.ok && r.p.faixasTarifaSocial).toEqual([{ ateKWh: 30, desconto: 0.5 }]);
    const incompleta = DADOS_EXEMPLO.filter((d) => d.id !== 'ts-faixa-2-desconto');
    expect(montarParametros(incompleta)).toEqual({ ok: false, faltando: ['ts-faixa-2-desconto'] });
  });

  it('sem nenhuma faixa da Tarifa Social é pendência', () => {
    const r = montarParametros(DADOS_EXEMPLO.filter((d) => !d.id.startsWith('ts-faixa')));
    expect(r.ok).toBe(false);
  });
});
