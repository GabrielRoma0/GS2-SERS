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
import { numero as formatarNumero, reais as formatarReais } from './formatar.ts';
import type { Parametros } from './parametros.ts';

export const DIAS_NO_ANO = 365;

/** O que a pessoa pode mudar na calculadora. O resto vem de dados/. */
export interface Ajustes {
  tensaoV?: number;
  capacidadeAh?: number;
  recargasPorDia?: number;
  /** Consumo da casa sem a cadeira (kWh/mês), da conta de luz. */
  consumoCasaKWhMes?: number;
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
  /** kWp do sistema realmente comprável (o maior entre o necessário e o mínimo do mercado). */
  kWpInstalado: number;
  /** Investimento proporcional, se a cadeira dividir um sistema dimensionado para a casa toda. */
  investimentoProporcionalReais: number;
  paybackProporcionalAnos: number;
  consumoCasaKWhMes: number;
  /** Quanto a Tarifa Social reduz a conta de energia da casa toda por mês (sem a cadeira). */
  economiaCasaTarifaSocialMesReais: number;
  /** Limite da primeira faixa da Tarifa Social (kWh/mês). */
  limiteFaixaTarifaSocialKWh: number | null;
  descontoFaixaTarifaSocial: number;
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
  const casa = ajustes.consumoCasaKWhMes ?? p.consumoCasaKWhMes;
  const custoMesCadeiraTS =
    custoMensalComFaixas(casa + kWhMes, tarifa, p.faixasTarifaSocial) - custoMensalComFaixas(casa, tarifa, p.faixasTarifaSocial);
  const custoAnoTS = custoMesCadeiraTS * 12;
  const economiaCasaTarifaSocialMesReais = custoReais(casa, tarifa) - custoMensalComFaixas(casa, tarifa, p.faixasTarifaSocial);
  const economiaTSCadeira = custoAnoReais - custoAnoTS;
  alternativas.push({
    id: 'tarifa-social',
    nome: 'Tarifa Social de Energia Elétrica',
    tipo: 'economia',
    kWhAnoDaRede: kWhAno,
    custoAnoReais: custoAnoTS,
    investimentoReais: 0,
    economiaAnoReais: economiaTSCadeira,
    paybackAnos: 0,
    co2EvitadoKgAno: 0,
    destaque:
      economiaTSCadeira < 0.01
        ? `Não muda o custo da recarga quando a casa já passa da faixa com desconto, mas reduz a conta da casa em cerca de ${formatarReais(economiaCasaTarifaSocialMesReais)} por mês.`
        : `Reduz o custo da recarga e a conta da casa (cerca de ${formatarReais(economiaCasaTarifaSocialMesReais)} por mês na casa). Não tem custo para pedir.`,
    limitacoes: [
      'Só para famílias que se encaixam nas regras da Tarifa Social. Quem decide é a distribuidora.',
      `O desconto depende do consumo total da casa (aqui: ${formatarNumero(casa)} kWh/mês sem a cadeira).`,
      'Reduz o custo, não o consumo: não diminui emissões.'
    ]
  });

  // Solar ligado à rede. O necessário para a cadeira é pequeno; o mercado só vende a partir de um tamanho mínimo.
  const kWpNecessario = potenciaPicoNecessariaKWp(kWhAno, p.irradiacaoKWhM2Dia, p.performanceRatio);
  const kWpInstalado = Math.max(kWpNecessario, p.kWpMinimoOnGrid);
  const investimentoRede = investimentoSolarReais(kWpInstalado, p.custoOnGridReaisWp);
  const economiaRede = custoReais(kWhAno, tarifa) * (1 - (p.fioB ?? 0));
  const investimentoProporcionalReais = investimentoSolarReais(kWpNecessario, p.custoOnGridReaisWp);
  const paybackProporcionalAnos = paybackSimplesAnos(investimentoProporcionalReais, economiaRede);
  const minimoManda = kWpInstalado > kWpNecessario;
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
    destaque: minimoManda
      ? `A cadeira precisaria de só ${formatarNumero(kWpNecessario, 2)} kWp, mas o menor sistema vendido tem ${formatarNumero(p.kWpMinimoOnGrid, 1)} kWp. Se o sistema for feito para a casa toda, a parte da cadeira custa cerca de ${formatarReais(investimentoProporcionalReais)}.`
      : 'Gera energia limpa no ano, mas exige investimento e um telhado próprio.',
    limitacoes: [
      'Exige telhado com sol e imóvel próprio (ou autorização).',
      p.fioB === null
        ? 'Não considera a parcela da tarifa que não é compensada (Fio B): a economia real é menor.'
        : `Considera que ${Math.round(p.fioB * 100)}% da tarifa não é compensada (Fio B, Lei 14.300/2022).`,
      'A economia conta só a energia da cadeira; um sistema maior também abateria o resto da conta da casa.',
      'A conta nunca fica abaixo da taxa mínima (custo de disponibilidade) da distribuidora.',
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
    kWpInstalado,
    investimentoProporcionalReais,
    paybackProporcionalAnos,
    consumoCasaKWhMes: casa,
    economiaCasaTarifaSocialMesReais,
    limiteFaixaTarifaSocialKWh: p.faixasTarifaSocial[0]?.ateKWh ?? null,
    descontoFaixaTarifaSocial: p.faixasTarifaSocial[0]?.desconto ?? 0,
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
