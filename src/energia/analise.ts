// Comparação das alternativas para a MESMA necessidade (recarregar a cadeira) no MESMO período (12 meses).
// Usada pelo app (calculadora e comparação) e pelo analise/gerar-analise.ts (tabela entregue).
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
import type { Parametros } from './parametros.ts';

export const DIAS_NO_ANO = 365;

/** O que a pessoa pode mudar na calculadora. O resto vem de dados/. */
export interface Ajustes {
  tensaoV?: number;
  capacidadeAh?: number;
  recargasPorDia?: number;
}

export type IdAlternativa = 'base' | 'habitos' | 'tarifa-social' | 'solar-rede' | 'kit-solar';

export interface Alternativa {
  id: IdAlternativa;
  nome: string;
  tipo: 'referência' | 'economia' | 'renovável';
  /** Energia da rede ainda usada pela cadeira no ano (kWh). */
  kWhAnoDaRede: number;
  /** Quanto a recarga passa a custar por ano (R$). */
  custoAnoReais: number;
  investimentoReais: number;
  economiaAnoReais: number;
  paybackAnos: number;
  co2EvitadoKgAno: number;
  /** Frase curta do que mais pesa nessa opção. */
  destaque: string;
  limitacoes: string[];
}

export interface Analise {
  kWhBateria: number;
  kWhPorRecarga: number;
  kWhRecargaAno: number;
  kWhStandbyAno: number | null;
  /** Consumo total ligado à cadeira (recarga + espera), por ano e por mês. */
  kWhAno: number;
  kWhMes: number;
  tarifaEfetivaReaisKWh: number;
  custoAnoReais: number;
  custoMesReais: number;
  co2KgAno: number;
  kWpNecessario: number;
  recargasAutonomiaKit: number;
  alternativas: Alternativa[];
  limitacoesGerais: string[];
}

export function analisar(p: Parametros, ajustes: Ajustes = {}): Analise {
  const tensaoV = ajustes.tensaoV ?? p.tensaoV;
  const capacidadeAh = ajustes.capacidadeAh ?? p.capacidadeAh;
  const recargasPorDia = ajustes.recargasPorDia ?? p.recargasPorDia;

  const kWhBateria = energiaBateriaKWh(tensaoV, capacidadeAh);
  const kWhPorRecarga = energiaDaRedePorRecargaKWh({
    tensaoV,
    capacidadeAh,
    profundidadeDescarga: p.profundidadeDescarga,
    eficienciaCarregador: p.eficienciaCarregador
  });
  const kWhRecargaAno = consumoNoPeriodoKWh(kWhPorRecarga, recargasPorDia, DIAS_NO_ANO);
  const kWhStandbyAno =
    p.standbyW !== null && p.horasOciosasDia !== null ? energiaStandbyKWh(p.standbyW, p.horasOciosasDia * DIAS_NO_ANO) : null;
  const kWhAno = kWhRecargaAno + (kWhStandbyAno ?? 0);
  const kWhMes = kWhAno / 12;
  const tarifa = p.tarifaReaisKWh + p.bandeiraReaisKWh;
  const custoAnoReais = custoReais(kWhAno, tarifa);
  const co2KgAno = emissaoKgCO2(kWhAno, p.fatorEmissaoKgKWh);

  const alternativas: Alternativa[] = [
    {
      id: 'base',
      nome: 'Recarregar na tomada, tarifa comum',
      tipo: 'referência',
      kWhAnoDaRede: kWhAno,
      custoAnoReais,
      investimentoReais: 0,
      economiaAnoReais: 0,
      paybackAnos: 0,
      co2EvitadoKgAno: 0,
      destaque: 'É o ponto de comparação: o que a família gasta hoje.',
      limitacoes: []
    }
  ];

  // Hábito: tirar o carregador da tomada quando não está carregando.
  if (kWhStandbyAno !== null) {
    const economia = custoReais(kWhStandbyAno, tarifa);
    alternativas.push({
      id: 'habitos',
      nome: 'Tirar o carregador da tomada depois de carregar',
      tipo: 'economia',
      kWhAnoDaRede: kWhRecargaAno,
      custoAnoReais: custoAnoReais - economia,
      investimentoReais: 0,
      economiaAnoReais: economia,
      paybackAnos: 0,
      co2EvitadoKgAno: emissaoKgCO2(kWhStandbyAno, p.fatorEmissaoKgKWh),
      destaque: 'Não custa nada, mas a economia é pequena.',
      limitacoes: ['Depende do consumo em espera do carregador de cada modelo.']
    });
  }

  // Tarifa Social: o desconto depende da faixa em que a casa já está; a cadeira soma em cima do consumo da casa.
  const casa = p.consumoCasaKWhMes;
  const custoMesCadeiraTS =
    custoMensalComFaixas(casa + kWhMes, tarifa, p.faixasTarifaSocial) - custoMensalComFaixas(casa, tarifa, p.faixasTarifaSocial);
  const custoAnoTS = custoMesCadeiraTS * 12;
  alternativas.push({
    id: 'tarifa-social',
    nome: 'Tarifa Social de Energia Elétrica',
    tipo: 'economia',
    kWhAnoDaRede: kWhAno,
    custoAnoReais: custoAnoTS,
    investimentoReais: 0,
    economiaAnoReais: custoAnoReais - custoAnoTS,
    paybackAnos: 0,
    co2EvitadoKgAno: 0,
    destaque: 'Não tem custo para pedir, mas só vale para quem se encaixa nas regras.',
    limitacoes: [
      'Só para famílias que se encaixam nas regras da Tarifa Social. Quem decide é a distribuidora.',
      `O desconto depende do consumo total da casa (aqui: ${casa} kWh/mês sem a cadeira).`,
      'Reduz o custo, não o consumo: não diminui emissões.'
    ]
  });

  // Solar ligado à rede, dimensionado para gerar o consumo anual da cadeira.
  const kWpNecessario = potenciaPicoNecessariaKWp(kWhAno, p.irradiacaoKWhM2Dia, p.performanceRatio);
  const investimentoRede = investimentoSolarReais(kWpNecessario, p.custoOnGridReaisWp);
  const economiaRede = custoReais(kWhAno, tarifa) * (1 - (p.fioB ?? 0));
  alternativas.push({
    id: 'solar-rede',
    nome: 'Energia solar ligada à rede (geração distribuída)',
    tipo: 'renovável',
    kWhAnoDaRede: 0,
    custoAnoReais: custoAnoReais - economiaRede,
    investimentoReais: investimentoRede,
    economiaAnoReais: economiaRede,
    paybackAnos: paybackSimplesAnos(investimentoRede, economiaRede),
    co2EvitadoKgAno: co2KgAno,
    destaque: 'Gera energia limpa no ano, mas exige investimento e um telhado próprio.',
    limitacoes: [
      'Exige telhado com sol e imóvel próprio (ou autorização).',
      p.fioB === null
        ? 'Não considera a parcela da tarifa que não é compensada (Fio B): a economia real é menor.'
        : `Considera que ${Math.round(p.fioB * 100)}% da tarifa não é compensada (Fio B, Lei 14.300/2022).`,
      'Na prática, um sistema costuma ter tamanho mínimo maior que o da cadeira: o investimento real pode ser maior.',
      'Não funciona na falta de luz (desliga junto com a rede, por segurança).'
    ]
  });

  // Kit solar com bateria, só para a cadeira.
  const geracaoKit = geracaoSolarAnualKWh(p.kitPotenciaWp / 1000, p.irradiacaoKWhM2Dia, p.performanceRatio);
  const usadaKit = Math.min(geracaoKit, kWhRecargaAno);
  const economiaKit = custoReais(usadaKit, tarifa);
  const recargasAutonomiaKit = recargasDeAutonomia(p.kitEnergiaUtilKWh, kWhPorRecarga);
  alternativas.push({
    id: 'kit-solar',
    nome: 'Kit solar com bateria, só para a cadeira',
    tipo: 'renovável',
    kWhAnoDaRede: kWhAno - usadaKit,
    custoAnoReais: custoAnoReais - economiaKit,
    investimentoReais: p.custoKitReais,
    economiaAnoReais: economiaKit,
    paybackAnos: paybackSimplesAnos(p.custoKitReais, economiaKit),
    co2EvitadoKgAno: emissaoKgCO2(usadaKit, p.fatorEmissaoKgKWh),
    destaque: `Guarda energia para cerca de ${recargasAutonomiaKit} recarga(s) completa(s) mesmo sem luz.`,
    limitacoes: [
      'A bateria do kit perde capacidade com o tempo e precisa ser trocada; isso não entra no payback simples.',
      'Em dias nublados gera menos.',
      'Bateria e painel têm impacto ambiental na fabricação e no descarte.'
    ]
  });

  return {
    kWhBateria,
    kWhPorRecarga,
    kWhRecargaAno,
    kWhStandbyAno,
    kWhAno,
    kWhMes,
    tarifaEfetivaReaisKWh: tarifa,
    custoAnoReais,
    custoMesReais: custoAnoReais / 12,
    co2KgAno,
    kWpNecessario,
    recargasAutonomiaKit,
    alternativas,
    limitacoesGerais: [
      'Tudo aqui é estimativa, não resultado garantido.',
      'Os números mudam com o modelo da cadeira, o jeito de usar, a tarifa e a bandeira do mês, e o clima.',
      'O payback é simples: não considera inflação, juros, aumento da tarifa nem manutenção.',
      'Cada alternativa é comparada sozinha com a referência; combinações (ex.: Tarifa Social + solar) mudam os valores.'
    ]
  };
}
