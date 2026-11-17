// NÚMEROS DE EXEMPLO, FICTÍCIOS. Servem só para ver as telas e testar enquanto a dupla
// preenche dados/. O app só usa isto no `npm run dev` e mostra uma faixa "EXEMPLO" em todas as telas.
// Nunca aparecem no build publicado nem na análise entregue.
import type { Dado } from './validar-dados.ts';

const ex = (id: string, valor: number, unidade: string): Dado => ({
  id,
  descricao: 'Valor de exemplo (fictício)',
  valor,
  unidade,
  periodo: 'exemplo',
  tipo: 'estimado',
  fonte_nome: 'EXEMPLO FICTÍCIO, não é fonte',
  fonte_url: 'https://example.invalid/exemplo',
  verificado_em: '2026-01-01',
  premissa: 'Número redondo inventado para testar a tela.'
});

export const DADOS_EXEMPLO: Dado[] = [
  ex('cadeira-tensao', 24, 'V'),
  ex('cadeira-capacidade', 50, 'Ah'),
  ex('carregador-eficiencia', 0.8, 'fração'),
  ex('carregador-standby', 2, 'W'),
  ex('horas-ociosas-carregador', 12, 'h/dia'),
  ex('profundidade-descarga', 0.8, 'fração'),
  ex('recargas-por-dia', 1, 'recargas/dia'),
  ex('tarifa-b1-enel-sp', 1, 'R$/kWh'),
  ex('bandeira-cenario', 0, 'R$/kWh'),
  ex('consumo-casa-mes', 100, 'kWh/mês'),
  ex('ts-faixa-1-ate', 30, 'kWh/mês'),
  ex('ts-faixa-1-desconto', 0.5, 'fração'),
  ex('ts-faixa-2-ate', 150, 'kWh/mês'),
  ex('ts-faixa-2-desconto', 0.2, 'fração'),
  ex('irradiacao-sp', 5, 'kWh/m²/dia'),
  ex('performance-ratio', 0.8, 'fração'),
  ex('custo-ongrid-wp', 4, 'R$/Wp'),
  ex('ongrid-potencia-minima', 0.1, 'kWp'),
  ex('custo-kit-bateria', 3000, 'R$'),
  ex('kit-energia-util', 2, 'kWh'),
  ex('kit-potencia-painel', 300, 'Wp'),
  ex('compensacao-fio-b', 0.3, 'fração'),
  ex('fator-emissao-sin', 0.1, 'kg CO₂/kWh')
];
