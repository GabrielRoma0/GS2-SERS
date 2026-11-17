import { describe, expect, it } from 'vitest';
import { analisar } from './analise.ts';
import { DADOS_EXEMPLO } from './exemplo.ts';
import { montarParametros } from './parametros.ts';
import { fontesDaResposta, identificarAssunto, responder } from './responder.ts';

const r = montarParametros(DADOS_EXEMPLO);
if (!r.ok) throw new Error('exemplo incompleto');
const a = analisar(r.p);

describe('identificarAssunto', () => {
  it.each([
    ['Quanto gasto para carregar a cadeira?', 'custo'],
    ['quanto custa por mês', 'custo'],
    ['Tenho direito à tarifa social?', 'tarifa-social'],
    ['recebo BPC, tem desconto na luz?', 'tarifa-social'],
    ['Energia solar compensa?', 'solar'],
    ['quanto economizo com placa solar', 'solar'],
    ['E se faltar luz?', 'falta-de-luz'],
    ['acabou a luz e a cadeira não carregou', 'falta-de-luz'],
    ['qual o impacto no meio ambiente', 'ambiente'],
    ['como economizar na conta', 'economizar'],
    ['APAGÃO', 'falta-de-luz']
  ])('"%s" → %s', (pergunta, assunto) => {
    expect(identificarAssunto(pergunta)).toBe(assunto);
  });

  it('assunto desconhecido devolve null', () => {
    expect(identificarAssunto('qual a capital da França?')).toBe(null);
    expect(responder('qual a capital da França?', a)).toBe(null);
  });
});

describe('responder', () => {
  it('usa os números da análise', () => {
    const resp = responder('quanto custa carregar?', a)!;
    expect(resp.paragrafos.join(' ')).toContain('R$ 446,76');
  });

  it('nenhuma resposta diz "você tem direito" e toda resposta tem limitação e dados usados', () => {
    for (const p of ['custo', 'tarifa social', 'solar', 'falta de luz', 'ambiente', 'economizar']) {
      const resp = responder(p, a)!;
      expect(JSON.stringify(resp)).not.toMatch(/tem direito/i);
      expect(resp.limitacao.length).toBeGreaterThan(0);
      expect(resp.dadosUsados.length).toBeGreaterThan(0);
    }
  });

  it('economizar lista as opções do menor para o maior investimento', () => {
    const resp = responder('dicas para economizar', a)!;
    const itens = resp.paragrafos.slice(1);
    expect(itens[itens.length - 1]).toMatch(/Kit solar/);
  });

  it('fontes sem repetição de link', () => {
    const resp = responder('quanto custa', a)!;
    expect(fontesDaResposta(resp, r.fontes)).toHaveLength(1);
  });
});
