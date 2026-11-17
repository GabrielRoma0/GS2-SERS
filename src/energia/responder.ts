// "Pergunte ao Mapi sobre energia": responde só com a análise e cita os dados usados.
// Sem assunto conhecido, diz que não sabe. Nunca diz "você tem direito" nem promete economia.
import type { Analise, IdAlternativa } from './analise.ts';
import { anos, kg, kWh, reais } from './formatar.ts';
import type { Dado } from './validar-dados.ts';

export interface Resposta {
  assunto: Assunto;
  titulo: string;
  paragrafos: string[];
  /** ids de dados/ usados na resposta; a tela mostra fonte e data de cada um. */
  dadosUsados: string[];
  limitacao: string;
}

export type Assunto = 'custo' | 'tarifa-social' | 'solar' | 'falta-de-luz' | 'ambiente' | 'economizar';

const PALAVRAS: Record<Assunto, string[]> = {
  custo: ['quanto', 'custa', 'custo', 'gasto', 'gasta', 'gastar', 'conta', 'pago', 'pagar', 'consumo', 'consome', 'kwh', 'carregar', 'recarga'],
  'tarifa-social': ['tarifa social', 'desconto', 'baixa renda', 'cadunico', 'cadastro unico', 'bpc', 'beneficio'],
  solar: ['solar', 'painel', 'paineis', 'placa', 'placas', 'fotovoltaica', 'fotovoltaico', 'renovavel', 'compensa', 'vale a pena'],
  'falta-de-luz': ['falta de luz', 'faltar luz', 'falta luz', 'sem luz', 'sem energia', 'apagao', 'queda', 'acabou a luz', 'autonomia', 'kit', 'bateria extra'],
  ambiente: ['ambiente', 'ambiental', 'co2', 'carbono', 'emissao', 'emissoes', 'poluicao', 'polui', 'sustentavel', 'planeta'],
  economizar: ['economizar', 'economia', 'economizo', 'dica', 'dicas', 'menos', 'reduzir', 'diminuir', 'barato', 'mais barato']
};

// Peso maior para os assuntos específicos: "quanto economizo com solar?" é sobre solar, não custo.
const PESO: Record<Assunto, number> = { custo: 1, economizar: 1.5, 'tarifa-social': 3, solar: 3, 'falta-de-luz': 3, ambiente: 3 };

export function normalizar(t: string): string {
  return ` ${t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()} `;
}

export function identificarAssunto(pergunta: string): Assunto | null {
  const t = normalizar(pergunta);
  let melhor: Assunto | null = null;
  let maior = 0;
  for (const assunto of Object.keys(PALAVRAS) as Assunto[]) {
    const acertos = PALAVRAS[assunto].filter((p) => t.includes(` ${p} `)).length;
    const pontos = acertos * PESO[assunto];
    if (pontos > maior) {
      maior = pontos;
      melhor = assunto;
    }
  }
  return melhor;
}

const DADOS_CONSUMO = ['cadeira-tensao', 'cadeira-capacidade', 'carregador-eficiencia', 'profundidade-descarga', 'recargas-por-dia'];
const DADOS_TARIFA = ['tarifa-b1-enel-sp', 'bandeira-cenario'];

export function responder(pergunta: string, a: Analise): Resposta | null {
  const assunto = identificarAssunto(pergunta);
  if (!assunto) return null;
  const alt = (id: IdAlternativa) => a.alternativas.find((x) => x.id === id);
  const limitacao = 'Estimativa, não resultado garantido. Muda com o modelo da cadeira, o uso, a tarifa do mês e o clima.';

  switch (assunto) {
    case 'custo':
      return {
        assunto,
        titulo: 'Quanto custa carregar a cadeira',
        paragrafos: [
          `Cada recarga completa tira da tomada cerca de ${kWh(a.kWhPorRecarga)}.`,
          `No mês, a cadeira usa cerca de ${kWh(a.kWhMes)}, o que dá cerca de ${reais(a.custoMesReais)} por mês e ${reais(a.custoAnoReais)} por ano, com a tarifa comum.`,
          'Use a calculadora para colocar as informações da sua cadeira.'
        ],
        dadosUsados: [...DADOS_CONSUMO, ...DADOS_TARIFA],
        limitacao
      };
    case 'tarifa-social': {
      const ts = alt('tarifa-social')!;
      return {
        assunto,
        titulo: 'Tarifa Social de Energia Elétrica',
        paragrafos: [
          'É um desconto na conta de luz para famílias de baixa renda que se encaixam nas regras, como as inscritas no Cadastro Único ou com alguém que recebe o BPC. Pode valer para a sua família: confira as regras na fonte.',
          `Com a Tarifa Social, a recarga da cadeira custaria cerca de ${reais(ts.custoAnoReais)} por ano, uma diferença de cerca de ${reais(ts.economiaAnoReais)} por ano. Não tem custo para pedir.`,
          'O pedido é feito na distribuidora de energia (em São Paulo, a Enel) ou pelo cadastro no CadÚnico.'
        ],
        dadosUsados: ['ts-faixa-1-ate', 'ts-faixa-1-desconto', 'consumo-casa-mes', ...DADOS_TARIFA],
        limitacao: 'Quem decide se a família recebe o desconto é a distribuidora. O desconto depende do consumo total da casa.'
      };
    }
    case 'solar': {
      const s = alt('solar-rede')!;
      const k = alt('kit-solar')!;
      return {
        assunto,
        titulo: 'Energia solar compensa?',
        paragrafos: [
          `Um sistema solar ligado à rede para gerar a energia da cadeira teria cerca de ${a.kWpNecessario.toFixed(2).replace('.', ',')} kWp, custaria cerca de ${reais(s.investimentoReais)} e se pagaria em ${anos(s.paybackAnos)}.`,
          `Um kit solar com bateria custa cerca de ${reais(k.investimentoReais)} e se pagaria em ${anos(k.paybackAnos)}, mas tem a vantagem de funcionar na falta de luz.`,
          'Compare na tela "Comparação" com a Tarifa Social, que não tem custo para pedir.'
        ],
        dadosUsados: ['irradiacao-sp', 'performance-ratio', 'custo-ongrid-wp', 'custo-kit-bateria', 'kit-potencia-painel', 'compensacao-fio-b', ...DADOS_TARIFA],
        limitacao: `${limitacao} Precisa de telhado com sol; o payback não inclui manutenção, troca de bateria nem aumento da tarifa.`
      };
    }
    case 'falta-de-luz':
      return {
        assunto,
        titulo: 'E se faltar luz?',
        paragrafos: [
          `Um kit solar com bateria guarda energia para cerca de ${a.recargasAutonomiaKit} recarga(s) completa(s) da cadeira, mesmo sem luz, e recarrega com o sol.`,
          'O sistema solar comum, ligado à rede, desliga junto quando falta luz, por segurança.',
          'Se alguém na casa depende de aparelho elétrico essencial à vida, a distribuidora tem regras próprias de aviso e prioridade: pergunte à Enel. Em emergência de saúde, ligue 192.'
        ],
        dadosUsados: ['kit-energia-util', 'custo-kit-bateria', ...DADOS_CONSUMO],
        limitacao: 'A autonomia diminui com o tempo de uso da bateria e em dias nublados.'
      };
    case 'ambiente': {
      const s = alt('solar-rede')!;
      return {
        assunto,
        titulo: 'Impacto no meio ambiente',
        paragrafos: [
          `A recarga da cadeira com energia da rede está ligada a cerca de ${kg(a.co2KgAno)} por ano.`,
          `Gerando essa energia com o sol, cerca de ${kg(s.co2EvitadoKgAno)} por ano deixariam de ser emitidos.`,
          'Painéis e baterias também têm impacto na fabricação e precisam de descarte correto no fim da vida útil.'
        ],
        dadosUsados: ['fator-emissao-sin', ...DADOS_CONSUMO],
        limitacao: 'O fator de emissão da rede muda a cada ano, conforme as usinas em uso.'
      };
    }
    case 'economizar': {
      const opcoes = a.alternativas.filter((x) => x.id !== 'base').sort((x, y) => x.investimentoReais - y.investimentoReais);
      return {
        assunto,
        titulo: 'Como pagar menos pela recarga',
        paragrafos: [
          'Do mais barato para começar ao mais caro:',
          ...opcoes.map(
            (o, i) =>
              `${i + 1}. ${o.nome}: economia de cerca de ${reais(o.economiaAnoReais)} por ano; investimento ${o.investimentoReais === 0 ? 'zero' : `de cerca de ${reais(o.investimentoReais)}`}.`
          )
        ],
        dadosUsados: [...DADOS_CONSUMO, ...DADOS_TARIFA, 'ts-faixa-1-desconto', 'custo-ongrid-wp', 'custo-kit-bateria'],
        limitacao
      };
    }
  }
}

/** Fontes únicas (por link) dos dados usados, para mostrar abaixo da resposta. */
export function fontesDaResposta(r: Resposta, fontes: Map<string, Dado>): Dado[] {
  const vistas = new Set<string>();
  const lista: Dado[] = [];
  for (const id of r.dadosUsados) {
    const d = fontes.get(id);
    if (!d || !d.fonte_url || vistas.has(d.fonte_url)) continue;
    vistas.add(d.fonte_url);
    lista.push(d);
  }
  return lista;
}
