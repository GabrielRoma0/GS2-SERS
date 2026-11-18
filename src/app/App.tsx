import { useMemo, useState } from 'react';
import { analisar, type Analise } from '../energia/analise.ts';
import { DADOS } from '../energia/dados.ts';
import { DADOS_EXEMPLO } from '../energia/exemplo.ts';
import { anos, kg, kWh, numero, reais } from '../energia/formatar.ts';
import { montarParametros, type Parametros } from '../energia/parametros.ts';
import { fontesDaResposta, responder, type Resposta } from '../energia/responder.ts';
import type { Dado } from '../energia/validar-dados.ts';

type Base = { p: Parametros; fontes: Map<string, Dado>; exemplo: boolean } | { faltando: string[] };

function carregar(): Base {
  const reais = montarParametros(DADOS);
  if (reais.ok) return { p: reais.p, fontes: reais.fontes, exemplo: false };
  // Só no `npm run dev`: números fictícios para ver as telas enquanto os dados não chegam.
  if (import.meta.env.DEV) {
    const ex = montarParametros(DADOS_EXEMPLO);
    if (ex.ok) return { p: ex.p, fontes: ex.fontes, exemplo: true };
  }
  return { faltando: reais.faltando };
}

export function App() {
  const base = useMemo(carregar, []);
  return (
    <>
      <p className="aviso" role="note">
        Sou um protótipo de estudo, não um canal oficial. Confirme nas fontes indicadas.
      </p>
      {'p' in base && base.exemplo && (
        <p className="exemplo" role="alert">
          EXEMPLO: números fictícios, só para testar as telas. Não use estes valores.
        </p>
      )}
      <header className="topo">
        <h1>Mapiii · Energia</h1>
        <p>Quanto custa carregar a cadeira de rodas motorizada, e como pagar menos.</p>
        {'p' in base && (
          <nav aria-label="Seções">
            <a href="#calculadora">Calculadora</a>
            <a href="#comparacao">Comparação</a>
            <a href="#pergunte">Pergunte</a>
            <a href="#de-onde">De onde vêm os números</a>
          </nav>
        )}
      </header>
      <main>
        {'p' in base ? (
          <Conteudo p={base.p} fontes={base.fontes} />
        ) : (
          <section>
            <h2>Em preparação</h2>
            <p>Os números só aparecem quando todos os dados tiverem fonte. Ainda faltam {base.faltando.length}.</p>
          </section>
        )}
      </main>
      <footer>
        <p>
          Contribuição da disciplina Soluções em Energias Renováveis e Sustentáveis ao Mapiii (FIAP, Global Solution 2026.2).{' '}
          <a href="https://github.com/GabrielRoma0/GS2-SERS">Código, dados e fontes no GitHub</a>.
        </p>
      </footer>
    </>
  );
}

function Conteudo({ p, fontes }: { p: Parametros; fontes: Map<string, Dado> }) {
  const [tensao, setTensao] = useState(String(p.tensaoV));
  const [capacidade, setCapacidade] = useState(String(p.capacidadeAh));
  const [recargas, setRecargas] = useState(String(p.recargasPorDia));
  const [casa, setCasa] = useState(String(p.consumoCasaKWhMes));

  const lerNumero = (t: string) => {
    const v = Number(t.replace(',', '.'));
    return Number.isFinite(v) && v > 0 ? v : null;
  };
  const tensaoV = lerNumero(tensao);
  const capacidadeAh = lerNumero(capacidade);
  const recargasDia = lerNumero(recargas);
  const casaKWh = lerNumero(casa);
  const valido =
    tensaoV !== null && capacidadeAh !== null && recargasDia !== null && casaKWh !== null && tensaoV <= 100 && capacidadeAh <= 500 && recargasDia <= 5 && casaKWh <= 5000;
  const a = useMemo(
    () =>
      valido
        ? analisar(p, { tensaoV: tensaoV!, capacidadeAh: capacidadeAh!, recargasPorDia: recargasDia!, consumoCasaKWhMes: casaKWh! })
        : analisar(p),
    [p, valido, tensaoV, capacidadeAh, recargasDia, casaKWh]
  );

  return (
    <>
      <section id="calculadora" aria-labelledby="t-calc">
        <h2 id="t-calc">Quanto gasto para carregar a cadeira?</h2>
        <div className="resultado principal" aria-live="polite">
          <p className="rotulo">Carregar a cadeira custa cerca de</p>
          <p className="valor-grande">
            {reais(a.custoMesReais)} <span>por mês</span>
          </p>
          <p>
            Isso dá {reais(a.custoAnoReais)} por ano. Na conta de luz, são {kWh(a.kWhMes)} por mês.
          </p>
          <p>
            Tarifa usada: <strong>{reais(a.tarifaEfetivaReaisKWh)} por kWh</strong> (Enel SP, sem impostos). É uma estimativa.
          </p>
          <p>
            <a className="botao-fontes" href="#de-onde">
              Ver de onde vêm esses números
            </a>
          </p>
        </div>
        <details className="explica">
          <summary>Por que é estimativa?</summary>
          <p>
            O valor muda com o modelo da cadeira, com quanto a pessoa anda por dia, com a tarifa e a bandeira do mês e com os impostos, que
            não estão na conta. Use os campos abaixo para chegar mais perto do seu caso.
          </p>
        </details>
        <details className="explica">
          <summary>O que é kWh?</summary>
          <p>
            kWh (quilowatt-hora) é a unidade de energia que aparece na sua conta de luz. A distribuidora cobra um valor por cada kWh usado
            no mês.
          </p>
        </details>
        <p>Troque pelos dados da sua cadeira (estão na etiqueta da bateria):</p>
        <div className="campos">
          <Campo id="tensao" rotulo="Tensão da bateria" unidade="V (volts)" valor={tensao} mudar={setTensao} />
          <Campo id="capacidade" rotulo="Capacidade da bateria" unidade="Ah (ampère-hora)" valor={capacidade} mudar={setCapacidade} />
          <Campo id="recargas" rotulo="Recargas completas por dia" unidade="por dia" valor={recargas} mudar={setRecargas} />
          <Campo id="casa" rotulo="Consumo da casa sem a cadeira" unidade="kWh por mês (na conta de luz)" valor={casa} mudar={setCasa} />
        </div>
        {!valido && (
          <p className="erro" role="alert">
            Confira os números: use valores maiores que zero (tensão até 100 V, capacidade até 500 Ah, até 5 recargas por dia, casa até 5.000 kWh). Mostrando o modelo de referência.
          </p>
        )}
        <p className="nota">A recarga também está ligada a cerca de {kg(a.co2KgAno)} por ano, pela energia da rede.</p>
        <details>
          <summary>Como chegamos nesse número</summary>
          <ol>
            <li>
              Energia da bateria: {numero(tensaoV ?? p.tensaoV, 0)} V × {numero(capacidadeAh ?? p.capacidadeAh, 0)} Ah ÷ 1000 = {kWh(a.kWhBateria)}.
            </li>
            <li>
              Cada recarga repõe {Math.round(p.profundidadeDescarga * 100)}% da bateria e o carregador aproveita {Math.round(p.eficienciaCarregador * 100)}% da
              energia: {kWh(a.kWhPorRecarga)} tirados da tomada por recarga.
            </li>
            <li>
              No ano: {kWh(a.kWhRecargaAno)} de recarga
              {a.kWhStandbyAno !== null && <> + {kWh(a.kWhStandbyAno)} do carregador esquecido na tomada</>} = {kWh(a.kWhAno)}.
            </li>
            <li>
              Custo: {kWh(a.kWhAno)} × {reais(a.tarifaEfetivaReaisKWh)} por kWh = {reais(a.custoAnoReais)} por ano.
            </li>
          </ol>
          <Fontes dados={['cadeira-tensao', 'cadeira-capacidade', 'carregador-eficiencia', 'profundidade-descarga', 'tarifa-b1-enel-sp', 'fator-emissao-sin']} fontes={fontes} />
        </details>
      </section>

      <Comparacao a={a} />
      <Pergunte a={a} fontes={fontes} />
      <DeOnde fontes={fontes} />
    </>
  );
}

function Campo(props: { id: string; rotulo: string; unidade: string; valor: string; mudar: (v: string) => void }) {
  return (
    <div className="campo">
      <label htmlFor={props.id}>{props.rotulo}</label>
      <div className="entrada">
        <input id={props.id} inputMode="decimal" value={props.valor} onChange={(e) => props.mudar(e.target.value)} aria-describedby={`${props.id}-u`} />
        <span id={`${props.id}-u`}>{props.unidade}</span>
      </div>
    </div>
  );
}

function Comparacao({ a }: { a: Analise }) {
  const ordem = a.alternativas.filter((x) => x.id !== 'base').sort((x, y) => x.investimentoReais - y.investimentoReais);
  return (
    <section id="comparacao" aria-labelledby="t-comp">
      <h2 id="t-comp">Como pagar menos?</h2>
      <Resumo a={a} />
      <p>Detalhes de cada opção, em 12 meses, da mais barata para começar à mais cara:</p>
      <details className="explica">
        <summary>O que é "tempo para o dinheiro voltar" (payback)?</summary>
        <p>
          É quanto tempo a economia na conta leva para pagar o que foi gasto na compra. Exemplo: gastar R$ 1.000 e economizar R$ 100 por
          ano leva 10 anos para o dinheiro voltar.
        </p>
      </details>
      <details className="explica">
        <summary>Qual a diferença entre solar ligado à rede e solar com bateria?</summary>
        <p>
          <strong>Ligado à rede:</strong> placas no telhado, ligadas à rede da Enel. A energia que sobra vira desconto na conta. Desliga
          quando falta luz, por segurança.
        </p>
        <p>
          <strong>Com bateria (kit):</strong> placa e uma bateria portátil, sem ligação com a Enel. Guarda energia para usar quando falta
          luz.
        </p>
        <p>
          <strong>kWp (quilowatt-pico)</strong> é o tamanho do conjunto de placas: quanto maior, mais energia gera.
        </p>
      </details>
      <GraficoRetorno a={a} />
      <ol className="cartoes">
        {ordem.map((o) => (
          <li key={o.id} className="cartao">
            <h3>
              {o.nome} <span className="selo">{o.tipo}</span>
            </h3>
            <p>{o.destaque}</p>
            {o.id === 'solar-rede' && (
              <div className="duas-colunas" role="group" aria-label="Solar só para a cadeira ou para a casa toda">
                <div>
                  <p className="rotulo">Só para a cadeira</p>
                  <p>
                    <strong>{reais(o.investimentoReais)}</strong> de investimento
                  </p>
                  <p>dinheiro volta em {anos(o.paybackAnos)}</p>
                  {o.paybackAnos <= a.paybackProporcionalAnos && <p className="veredito">Volta mais rápido</p>}
                </div>
                <div>
                  <p className="rotulo">Como parte de um sistema da casa toda</p>
                  <p>
                    <strong>{reais(a.investimentoProporcionalReais)}</strong> é a parte da cadeira
                  </p>
                  <p>dinheiro volta em {anos(a.paybackProporcionalAnos)}</p>
                  {a.paybackProporcionalAnos < o.paybackAnos && <p className="veredito">Volta mais rápido</p>}
                </div>
              </div>
            )}
            {o.id === 'solar-rede' && (
              <p className="nota">
                O investimento é a média de mercado do sistema completo: placas, inversor, projeto e instalação. Não inclui manutenção, limpeza
                nem a troca do inversor ao longo dos anos.
              </p>
            )}
            {o.id === 'kit-solar' && (
              <p className="nota">
                O investimento é o preço do kit pronto (bateria portátil e placa dobrável), sem instalação. Não inclui a troca da bateria no fim
                da vida útil.
              </p>
            )}
            <dl>
              <div>
                <dt>Economia por ano</dt>
                <dd>{reais(o.economiaAnoReais)}</dd>
              </div>
              <div>
                <dt>Investimento</dt>
                <dd>{o.investimentoReais === 0 ? 'nenhum' : reais(o.investimentoReais)}</dd>
              </div>
              <div>
                <dt>Tempo para o dinheiro voltar</dt>
                <dd>{anos(o.paybackAnos)}</dd>
              </div>
              <div>
                <dt>CO₂ evitado por ano</dt>
                <dd>{kg(o.co2EvitadoKgAno)}</dd>
              </div>
            </dl>
            <details>
              <summary>Limitações</summary>
              <ul>
                {o.limitacoes.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ol>
      <details className="explica">
        <summary>Limitações que valem para todas</summary>
        <ul>
          {a.limitacoesGerais.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}

const SUGESTOES = ['Quanto custa carregar a cadeira?', 'Como funciona a Tarifa Social?', 'Energia solar compensa?', 'E se faltar luz?', 'Qual o impacto no meio ambiente?'];

function Pergunte({ a, fontes }: { a: Analise; fontes: Map<string, Dado> }) {
  const [texto, setTexto] = useState('');
  const [resposta, setResposta] = useState<Resposta | null | undefined>(undefined);
  const [perguntada, setPerguntada] = useState('');

  const perguntar = (q: string) => {
    const limpa = q.trim();
    if (!limpa) return;
    setPerguntada(limpa);
    setResposta(responder(limpa, a));
  };

  return (
    <section id="pergunte" aria-labelledby="t-perg">
      <h2 id="t-perg">Pergunte ao Mapi sobre energia</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          perguntar(texto);
        }}
      >
        <label htmlFor="pergunta">Sua pergunta</label>
        <div className="entrada">
          <input id="pergunta" value={texto} onChange={(e) => setTexto(e.target.value)} autoComplete="off" maxLength={200} />
          <button type="submit">Perguntar</button>
        </div>
      </form>
      <div className="sugestoes" aria-label="Sugestões de pergunta">
        {SUGESTOES.map((s) => (
          <button
            key={s}
            type="button"
            className="sugestao"
            onClick={() => {
              setTexto(s);
              perguntar(s);
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <div aria-live="polite">
        {resposta === null && (
          <div className="resposta">
            <p>
              Ainda não sei responder “{perguntada}”. Posso falar sobre o custo da recarga, a Tarifa Social, energia solar, falta de luz e meio ambiente.
            </p>
          </div>
        )}
        {resposta && (
          <article className="resposta">
            <h3>{resposta.titulo}</h3>
            {resposta.paragrafos.map((t) => (
              <p key={t}>{t}</p>
            ))}
            <p className="nota">
              <strong>Limitação:</strong> {resposta.limitacao}
            </p>
            <Fontes lista={fontesDaResposta(resposta, fontes)} />
          </article>
        )}
      </div>
    </section>
  );
}

function Resumo({ a }: { a: Analise }) {
  const solar = a.alternativas.find((x) => x.id === 'solar-rede')!;
  const kit = a.alternativas.find((x) => x.id === 'kit-solar')!;
  const ts = a.alternativas.find((x) => x.id === 'tarifa-social')!;
  return (
    <div className="resumo" role="note" aria-label="Resumo">
      <p className="rotulo">Em resumo</p>
      <ul>
        <li>
          <strong>Sem gastar nada:</strong> se a família se encaixa na Tarifa Social, a conta da casa cai cerca de{' '}
          {reais(a.economiaCasaTarifaSocialMesReais)} por mês
          {ts.economiaAnoReais < 0.01 ? ' (a recarga da cadeira continua igual).' : '.'}
        </li>
        <li>
          <strong>Energia solar só para a cadeira:</strong> custa {reais(solar.investimentoReais)} e o dinheiro leva {anos(solar.paybackAnos)} para
          voltar.
        </li>
        <li>
          <strong>Energia solar para a casa toda:</strong> a parte da cadeira volta em {anos(a.paybackProporcionalAnos)}.
        </li>
        <li>
          <strong>Kit com bateria:</strong> leva {anos(kit.paybackAnos)} para voltar; serve para ter energia quando falta luz.
        </li>
      </ul>
    </div>
  );
}

function GraficoRetorno({ a }: { a: Analise }) {
  const solar = a.alternativas.find((x) => x.id === 'solar-rede')!;
  const kit = a.alternativas.find((x) => x.id === 'kit-solar')!;
  const ts = a.alternativas.find((x) => x.id === 'tarifa-social')!;
  const itens = [
    { nome: 'Tarifa Social', anos: ts.paybackAnos, texto: 'sem investimento' },
    { nome: 'Solar como parte da casa toda', anos: a.paybackProporcionalAnos, texto: anos(a.paybackProporcionalAnos) },
    { nome: 'Solar só para a cadeira', anos: solar.paybackAnos, texto: anos(solar.paybackAnos) },
    { nome: 'Kit solar com bateria', anos: kit.paybackAnos, texto: anos(kit.paybackAnos) }
  ];
  const maior = Math.max(1, ...itens.map((i) => (Number.isFinite(i.anos) ? i.anos : 0)));
  return (
    <figure className="grafico">
      <figcaption>Tempo para o dinheiro voltar (quanto menor a barra, melhor)</figcaption>
      <ul>
        {itens.map((i) => (
          <li key={i.nome}>
            <span className="g-nome">{i.nome}</span>
            <span className="g-barra" aria-hidden="true">
              <span style={{ width: `${Number.isFinite(i.anos) ? Math.max(2, (i.anos / maior) * 100) : 100}%` }} />
            </span>
            <span className="g-valor">{i.texto}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

function DeOnde({ fontes }: { fontes: Map<string, Dado> }) {
  const dados = [...fontes.values()].filter((d) => d.valor !== null);
  const tipo = (t: string) => (t === 'estimado' ? 'estimado' : t === 'real' ? 'medido' : 'fonte pública');
  return (
    <section id="de-onde" aria-labelledby="t-onde">
      <h2 id="t-onde">De onde vêm esses números?</h2>
      <p>
        Cada número usado nas contas tem uma fonte, com a data em que conferimos. Os marcados como <strong>estimado</strong> são premissas
        nossas, explicadas abaixo.
      </p>
      <ul className="lista-dados">
        {dados.map((d) => (
          <li key={d.id}>
            <p>
              <strong>{d.descricao}</strong>: {numero(d.valor!, d.valor! % 1 === 0 ? 0 : d.valor! < 1 ? 3 : 2)} {d.unidade}{' '}
              <span className="selo">{tipo(d.tipo)}</span>
            </p>
            <p className="nota">
              <a href={d.fonte_url} target="_blank" rel="noopener noreferrer">
                {d.fonte_nome}
              </a>{' '}
              · conferido em {d.verificado_em.split('-').reverse().join('/')}
            </p>
            {d.premissa && <p className="nota">{d.premissa}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Fontes(props: { lista?: Dado[]; dados?: string[]; fontes?: Map<string, Dado> }) {
  let lista = props.lista ?? [];
  if (props.dados && props.fontes) {
    const vistos = new Set<string>();
    lista = [];
    for (const id of props.dados) {
      const d = props.fontes.get(id);
      if (!d || !d.fonte_url || vistos.has(d.fonte_url)) continue;
      vistos.add(d.fonte_url);
      lista.push(d);
    }
  }
  if (lista.length === 0) return null;
  return (
    <div className="fontes">
      <p>
        <strong>Fontes</strong>
      </p>
      <ul>
        {lista.map((d) => (
          <li key={d.fonte_url}>
            <a href={d.fonte_url} target="_blank" rel="noopener noreferrer">
              {d.fonte_nome}
            </a>{' '}
            · conferido em {d.verificado_em.split('-').reverse().join('/')}
            {d.tipo === 'estimado' && ' · estimado'}
          </li>
        ))}
      </ul>
    </div>
  );
}
