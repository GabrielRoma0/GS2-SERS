// Transforma a lista de dados (dados/*.json) nos parâmetros das contas.
// Se faltar algum dado obrigatório, devolve a lista do que falta: nenhuma conta roda com buraco.
import type { FaixaDesconto } from './calculos.ts';
import type { Dado } from './validar-dados.ts';

export interface Parametros {
  tensaoV: number;
  capacidadeAh: number;
  eficienciaCarregador: number;
  profundidadeDescarga: number;
  recargasPorDia: number;
  /** null quando a dupla não achou o consumo em espera: o hábito "tirar da tomada" fica fora da conta. */
  standbyW: number | null;
  horasOciosasDia: number | null;
  tarifaReaisKWh: number;
  bandeiraReaisKWh: number;
  consumoCasaKWhMes: number;
  faixasTarifaSocial: FaixaDesconto[];
  irradiacaoKWhM2Dia: number;
  performanceRatio: number;
  custoOnGridReaisWp: number;
  /** Menor sistema ligado à rede que se encontra no mercado (kWp). */
  kWpMinimoOnGrid: number;
  custoKitReais: number;
  kitEnergiaUtilKWh: number;
  kitPotenciaWp: number;
  /** null quando não preenchido: a economia do solar ligado à rede fica superestimada (vira limitação). */
  fioB: number | null;
  fatorEmissaoKgKWh: number;
}

const OBRIGATORIOS = {
  tensaoV: 'cadeira-tensao',
  capacidadeAh: 'cadeira-capacidade',
  eficienciaCarregador: 'carregador-eficiencia',
  profundidadeDescarga: 'profundidade-descarga',
  recargasPorDia: 'recargas-por-dia',
  tarifaReaisKWh: 'tarifa-b1-enel-sp',
  bandeiraReaisKWh: 'bandeira-cenario',
  consumoCasaKWhMes: 'consumo-casa-mes',
  irradiacaoKWhM2Dia: 'irradiacao-sp',
  performanceRatio: 'performance-ratio',
  custoOnGridReaisWp: 'custo-ongrid-wp',
  kWpMinimoOnGrid: 'ongrid-potencia-minima',
  custoKitReais: 'custo-kit-bateria',
  kitEnergiaUtilKWh: 'kit-energia-util',
  kitPotenciaWp: 'kit-potencia-painel',
  fatorEmissaoKgKWh: 'fator-emissao-sin'
} as const;

/** Dados que podem ser apagados do JSON se não houver fonte; a conta segue sem eles, com limitação. */
export const OPCIONAIS = ['carregador-standby', 'horas-ociosas-carregador', 'compensacao-fio-b'] as const;

export type ResultadoParametros =
  | { ok: true; p: Parametros; fontes: Map<string, Dado> }
  | { ok: false; faltando: string[] };

export function montarParametros(dados: Dado[]): ResultadoParametros {
  const porId = new Map(dados.map((d) => [d.id, d]));
  const faltando: string[] = [];
  const valor = (id: string): number | null => {
    const d = porId.get(id);
    return d && typeof d.valor === 'number' ? d.valor : null;
  };

  const obrig: Record<string, number> = {};
  for (const [campo, id] of Object.entries(OBRIGATORIOS)) {
    const v = valor(id);
    if (v === null) faltando.push(id);
    else obrig[campo] = v;
  }

  // Opcionais: se o item existe no JSON mas está null, ainda é pendência (a dupla não decidiu).
  for (const id of OPCIONAIS) {
    if (porId.has(id) && valor(id) === null) faltando.push(id);
  }

  // Faixas da Tarifa Social: ts-faixa-N-ate e ts-faixa-N-desconto, em qualquer quantidade.
  const faixas = new Map<number, { ate?: number | null; desconto?: number | null }>();
  for (const d of dados) {
    const m = /^ts-faixa-(\d+)-(ate|desconto)$/.exec(d.id);
    if (!m) continue;
    const n = Number(m[1]);
    const f = faixas.get(n) ?? {};
    f[m[2] as 'ate' | 'desconto'] = typeof d.valor === 'number' ? d.valor : null;
    if (d.valor === null) faltando.push(d.id);
    faixas.set(n, f);
  }
  const faixasTarifaSocial: FaixaDesconto[] = [];
  for (const n of [...faixas.keys()].sort((a, b) => a - b)) {
    const f = faixas.get(n)!;
    if (f.ate === undefined) faltando.push(`ts-faixa-${n}-ate`);
    if (f.desconto === undefined) faltando.push(`ts-faixa-${n}-desconto`);
    if (typeof f.ate === 'number' && typeof f.desconto === 'number') faixasTarifaSocial.push({ ateKWh: f.ate, desconto: f.desconto });
  }
  if (faixas.size === 0) faltando.push('ts-faixa-1-ate', 'ts-faixa-1-desconto');

  if (faltando.length > 0) return { ok: false, faltando: [...new Set(faltando)] };

  const standbyW = valor('carregador-standby');
  const horasOciosasDia = valor('horas-ociosas-carregador');
  const p: Parametros = {
    ...(obrig as Omit<Parametros, 'standbyW' | 'horasOciosasDia' | 'faixasTarifaSocial' | 'fioB'>),
    // O hábito só entra com os dois números.
    standbyW: standbyW !== null && horasOciosasDia !== null ? standbyW : null,
    horasOciosasDia: standbyW !== null && horasOciosasDia !== null ? horasOciosasDia : null,
    faixasTarifaSocial,
    fioB: valor('compensacao-fio-b')
  };
  return { ok: true, p, fontes: porId };
}
