// "Pergunte ao Mapi sobre energia": responde só com a análise e cita os dados usados.
// Sem assunto conhecido, diz que não sabe. Nunca diz "você tem direito" nem promete economia.
import type { Analise, IdAlternativa } from './analise.ts';
import { anos, kg, kWh, numero, reais } from './formatar.ts';
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
          'É um desconto na conta de luz. Segundo a ANEEL, pode valer para famílias no Cadastro Único com renda de até meio salário mínimo por pessoa, para quem recebe o BPC, e para famílias no Cadastro Único com renda de até 3 salários mínimos que tenham alguém com deficiência cujo tratamento use aparelho elétrico de forma contínua. Confira as regras na fonte.',
          `Pela regra atual, ${a.descontoFaixaTarifaSocial >= 1 ? 'a energia é gratuita' : `o desconto é de ${Math.round(a.descontoFaixaTarifaSocial * 100)}%`} até ${numero(a.limiteFaixaTarifaSocialKWh ?? 0, 0)} kWh por mês. Numa casa que gasta ${numero(a.consumoCasaKWhMes, 0)} kWh por mês, isso reduz a conta em cerca de ${reais(a.economiaCasaTarifaSocialMesReais)} por mês.`,
          ts.economiaAnoReais < 0.01
            ? `Como a casa já passa de ${numero(a.limiteFaixaTarifaSocialKWh ?? 0, 0)} kWh, a recarga da cadeira continua custando o mesmo: o ganho é na conta da casa.`
            : `A recarga da cadeira passaria a custar cerca de ${reais(ts.custoAnoReais)} por ano, cerca de ${reais(ts.economiaAnoReais)} a menos.`,
          'O desconto entra automaticamente para as famílias que se encaixam nas regras e são titulares da conta. Se não vier, procure a Enel ou atualize o Cadastro Único.'
        ],
        dadosUsados: ['ts-faixa-1-ate', 'ts-faixa-1-desconto', 'consumo-casa-mes', ...DADOS_TARIFA],
        limitacao: 'Quem decide se a família recebe o desconto é a distribuidora. Impostos e iluminação pública continuam sendo cobrados.'
      };
    }
    case 'solar': {
      const s = alt('solar-rede')!;
      const k = alt('kit-solar')!;
      return {
        assunto,
        titulo: 'Energia solar compensa?',
        paragrafos: [
          `A cadeira precisaria de cerca de ${numero(a.kWpNecessario, 2)} kWp de painéis. O menor sistema ligado à rede vendido tem ${numero(a.kWpInstalado, 1)} kWp e custa cerca de ${reais(s.investimentoReais)}; só com a economia da cadeira, se pagaria em ${anos(s.paybackAnos)}.`,
          `Se a família instalar um sistema para a casa toda, a parte da cadeira custaria cerca de ${reais(a.investimentoProporcionalReais)} e se pagaria em ${anos(a.paybackProporcionalAnos)}.`,
          `Um kit solar com bateria custa cerca de ${reais(k.investimentoReais)} e se pagaria em ${anos(k.paybackAnos)}, mas tem a vantagem de funcionar na falta de luz.`,
          'Compare na tela "Comparação" com a Tarifa Social, que não tem custo para pedir.'
        ],
        dadosUsados: ['irradiacao-sp', 'performance-ratio', 'custo-ongrid-wp', 'ongrid-potencia-minima', 'custo-kit-bateria', 'kit-potencia-painel', 'compensacao-fio-b', ...DADOS_TARIFA],
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
