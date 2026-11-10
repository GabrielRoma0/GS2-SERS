import { describe, expect, it } from 'vitest';
import { validarDados } from './validar-dados.ts';

const hoje = new Date(2026, 10, 9);

const completo = {
  id: 'tarifa-b1',
  descricao: 'Tarifa residencial',
  valor: 1,
  unidade: 'R$/kWh',
  periodo: 'vigência de teste',
  tipo: 'publico',
  fonte_nome: 'Fonte de teste',
  fonte_url: 'https://exemplo.gov.br/tarifa',
  verificado_em: '2026-11-08',
  premissa: ''
};

describe('validarDados', () => {
  it('aceita um dado completo', () => {
    expect(validarDados('t.json', [completo], hoje)).toEqual({ erros: [], pendentes: [] });
  });

  it('valor null é pendente, não erro', () => {
    const r = validarDados('t.json', [{ ...completo, valor: null, fonte_url: '', verificado_em: '', tipo: '' }], hoje);
    expect(r.erros).toEqual([]);
    expect(r.pendentes).toHaveLength(1);
  });

  it('dado preenchido sem link https é erro', () => {
    const r = validarDados('t.json', [{ ...completo, fonte_url: 'http://exemplo.gov.br' }], hoje);
    expect(r.erros.join()).toMatch(/https/);
  });

  it('estimado sem premissa é erro', () => {
    const r = validarDados('t.json', [{ ...completo, tipo: 'estimado' }], hoje);
    expect(r.erros.join()).toMatch(/premissa/);
  });

  it('data futura ou inválida é erro', () => {
    expect(validarDados('t.json', [{ ...completo, verificado_em: '2026-12-01' }], hoje).erros.join()).toMatch(/futura/);
    expect(validarDados('t.json', [{ ...completo, verificado_em: '2026-02-30' }], hoje).erros.join()).toMatch(/válida/);
  });

  it('campo desconhecido, id repetido e tipo inválido são erros', () => {
    const r = validarDados('t.json', [{ ...completo, fonte: 'x' }, { ...completo, tipo: 'chute' }], hoje);
    expect(r.erros.join()).toMatch(/desconhecido/);
    expect(r.erros.join()).toMatch(/repetido/);
    expect(r.erros.join()).toMatch(/tipo/);
  });

  it('arquivo que não é lista é erro', () => {
    expect(validarDados('t.json', { a: 1 }, hoje).erros).toHaveLength(1);
  });
});
