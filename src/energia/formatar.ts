// Números no jeito brasileiro (vírgula decimal), iguais no app e na análise.

const num = (casas: number) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

export function reais(v: number): string {
  return `R$ ${num(2).format(v)}`;
}

export function kWh(v: number): string {
  return `${num(v < 10 ? 2 : 1).format(v)} kWh`;
}

export function kg(v: number): string {
  return `${num(1).format(v)} kg de CO₂`;
}

export function anos(v: number): string {
  if (!Number.isFinite(v)) return 'não se paga';
  if (v === 0) return 'imediato';
  return `cerca de ${num(1).format(v)} anos`;
}

export function numero(v: number, casas = 2): string {
  return num(casas).format(v);
}
