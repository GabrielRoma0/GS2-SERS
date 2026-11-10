// Contas de energia da contribuição SERS. Funções puras: o app e a análise (analise/)
// usam exatamente estas funções, para que o número da tela seja o mesmo do documento.
//
// Unidades: tensão em V, capacidade em Ah, energia em kWh, potência em W ou kWp,
// irradiação em kWh/m²/dia, dinheiro em R$, emissão em kg CO₂.
// Nenhum valor real mora aqui: os números vêm de dados/, cada um com fonte.

function positivo(nome: string, valor: number): void {
  if (!Number.isFinite(valor) || valor <= 0) {
    throw new RangeError(`${nome} precisa ser um número maior que zero (recebido: ${valor}).`);
  }
}

function naoNegativo(nome: string, valor: number): void {
  if (!Number.isFinite(valor) || valor < 0) {
    throw new RangeError(`${nome} não pode ser negativo (recebido: ${valor}).`);
  }
}

function fracao(nome: string, valor: number): void {
  if (!Number.isFinite(valor) || valor <= 0 || valor > 1) {
    throw new RangeError(`${nome} precisa estar entre 0 (exclusive) e 1 (recebido: ${valor}).`);
  }
}

/** Energia que cabe na bateria: E = V × Ah ÷ 1000 (kWh). */
export function energiaBateriaKWh(tensaoV: number, capacidadeAh: number): number {
  positivo('Tensão', tensaoV);
  positivo('Capacidade', capacidadeAh);
  return (tensaoV * capacidadeAh) / 1000;
}

export interface Recarga {
  tensaoV: number;
  capacidadeAh: number;
  /** Quanto da bateria é reposto a cada recarga (1 = de vazia a cheia). */
  profundidadeDescarga: number;
  /** Eficiência do carregador (energia que entra na bateria ÷ energia tirada da tomada). */
  eficienciaCarregador: number;
}

/** Energia tirada da tomada em uma recarga: E_bat × profundidade ÷ eficiência (kWh). */
export function energiaDaRedePorRecargaKWh(r: Recarga): number {
  fracao('Profundidade de descarga', r.profundidadeDescarga);
  fracao('Eficiência do carregador', r.eficienciaCarregador);
  return (energiaBateriaKWh(r.tensaoV, r.capacidadeAh) * r.profundidadeDescarga) / r.eficienciaCarregador;
}

/** Consumo num período: kWh por recarga × recargas por dia × dias. */
export function consumoNoPeriodoKWh(kWhPorRecarga: number, recargasPorDia: number, dias: number): number {
  naoNegativo('Energia por recarga', kWhPorRecarga);
  naoNegativo('Recargas por dia', recargasPorDia);
  naoNegativo('Dias', dias);
  return kWhPorRecarga * recargasPorDia * dias;
}

/** Energia de um aparelho ligado sem uso (ex.: carregador esquecido na tomada): P × h ÷ 1000 (kWh). */
export function energiaStandbyKWh(potenciaW: number, horas: number): number {
  naoNegativo('Potência em espera', potenciaW);
  naoNegativo('Horas', horas);
  return (potenciaW * horas) / 1000;
}

/** Custo com tarifa única: kWh × R$/kWh. */
export function custoReais(kWh: number, tarifaReaisPorKWh: number): number {
  naoNegativo('Energia', kWh);
  naoNegativo('Tarifa', tarifaReaisPorKWh);
  return kWh * tarifaReaisPorKWh;
}

/**
 * Faixa de desconto por consumo mensal (formato da Tarifa Social).
 * `ateKWh` é o limite superior da faixa; `null` na última faixa = sem limite.
 * `desconto` é a fração descontada da tarifa nessa faixa (0 a 1).
 * Os valores reais das faixas vêm de dados/tarifas.json, com a fonte oficial.
 */
export interface FaixaDesconto {
  ateKWh: number | null;
  desconto: number;
}

/** Custo mensal aplicando descontos por faixa de consumo, em ordem crescente de limite. */
export function custoMensalComFaixas(kWhMes: number, tarifaReaisPorKWh: number, faixas: FaixaDesconto[]): number {
  naoNegativo('Energia', kWhMes);
  naoNegativo('Tarifa', tarifaReaisPorKWh);
  if (faixas.length === 0) return custoReais(kWhMes, tarifaReaisPorKWh);
  // Confere todas as faixas antes de calcular: uma faixa errada é erro mesmo que o consumo não chegue nela.
  let limiteAnterior = 0;
  for (const [i, f] of faixas.entries()) {
    if (!(f.desconto >= 0 && f.desconto <= 1)) throw new RangeError(`Desconto da faixa ${i + 1} precisa estar entre 0 e 1.`);
    if (f.ateKWh === null && i !== faixas.length - 1) throw new RangeError('Só a última faixa pode ficar sem limite.');
    if (f.ateKWh !== null && !(f.ateKWh > limiteAnterior)) throw new RangeError('As faixas precisam estar em ordem crescente.');
    limiteAnterior = f.ateKWh ?? Infinity;
  }
  let anterior = 0;
  let total = 0;
  for (const f of faixas) {
    const limite = f.ateKWh ?? Infinity;
    const naFaixa = Math.max(0, Math.min(kWhMes, limite) - anterior);
    total += naFaixa * tarifaReaisPorKWh * (1 - f.desconto);
    if (kWhMes <= limite) return total;
    anterior = limite;
  }
  // Consumo acima da última faixa com limite: sem desconto.
  return total + (kWhMes - anterior) * tarifaReaisPorKWh;
}

/** Geração anual de um sistema solar: kWp × irradiação × 365 × PR (kWh/ano). */
export function geracaoSolarAnualKWh(potenciaPicoKWp: number, irradiacaoKWhM2Dia: number, performanceRatio: number): number {
  naoNegativo('Potência de pico', potenciaPicoKWp);
  positivo('Irradiação', irradiacaoKWhM2Dia);
  fracao('Performance ratio', performanceRatio);
  return potenciaPicoKWp * irradiacaoKWhM2Dia * 365 * performanceRatio;
}

/** Potência de pico necessária para gerar um consumo anual: kWh/ano ÷ (irradiação × 365 × PR) (kWp). */
export function potenciaPicoNecessariaKWp(consumoAnualKWh: number, irradiacaoKWhM2Dia: number, performanceRatio: number): number {
  naoNegativo('Consumo anual', consumoAnualKWh);
  return consumoAnualKWh / geracaoSolarAnualKWh(1, irradiacaoKWhM2Dia, performanceRatio);
}

/** Investimento de um sistema: kWp × 1000 × R$/Wp. */
export function investimentoSolarReais(potenciaPicoKWp: number, custoReaisPorWp: number): number {
  naoNegativo('Potência de pico', potenciaPicoKWp);
  naoNegativo('Custo por Wp', custoReaisPorWp);
  return potenciaPicoKWp * 1000 * custoReaisPorWp;
}

/** Payback simples (anos) = investimento ÷ economia anual. Sem economia, nunca se paga: Infinity. */
export function paybackSimplesAnos(investimentoReais: number, economiaAnualReais: number): number {
  naoNegativo('Investimento', investimentoReais);
  if (!Number.isFinite(economiaAnualReais)) throw new RangeError('Economia anual inválida.');
  if (economiaAnualReais <= 0) return Infinity;
  return investimentoReais / economiaAnualReais;
}

/** Emissão associada a uma energia da rede: kWh × fator (kg CO₂/kWh). */
export function emissaoKgCO2(kWh: number, fatorKgCO2PorKWh: number): number {
  naoNegativo('Energia', kWh);
  naoNegativo('Fator de emissão', fatorKgCO2PorKWh);
  return kWh * fatorKgCO2PorKWh;
}

/** Quantas recargas completas uma bateria externa (kit solar) guarda: energia útil ÷ energia por recarga. */
export function recargasDeAutonomia(energiaUtilKitKWh: number, kWhPorRecarga: number): number {
  naoNegativo('Energia útil do kit', energiaUtilKitKWh);
  positivo('Energia por recarga', kWhPorRecarga);
  return Math.floor(energiaUtilKitKWh / kWhPorRecarga);
}
