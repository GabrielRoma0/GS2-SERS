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

  const lerNumero = (t: string) => {
    const v = Number(t.replace(',', '.'));
    return Number.isFinite(v) && v > 0 ? v : null;
  };
  const tensaoV = lerNumero(tensao);
  const capacidadeAh = lerNumero(capacidade);
  const recargasDia = lerNumero(recargas);
  const valido = tensaoV !== null && capacidadeAh !== null && recargasDia !== null && tensaoV <= 100 && capacidadeAh <= 500 && recargasDia <= 5;
  const a = useMemo(
    () => (valido ? analisar(p, { tensaoV: tensaoV!, capacidadeAh: capacidadeAh!, recargasPorDia: recargasDia! }) : analisar(p)),
    [p, valido, tensaoV, capacidadeAh, recargasDia]
  );

  return (
    <>
      <section id="calculadora" aria-labelledby="t-calc">
        <h2 id="t-calc">Quanto gasto para carregar a cadeira?</h2>
        <p>Os valores já preenchidos são do modelo de referência. Troque pelos da sua cadeira (estão no manual ou na etiqueta da bateria).</p>
        <div className="campos">
          <Campo id="tensao" rotulo="Tensão da bateria" unidade="V (volts)" valor={tensao} mudar={setTensao} />
          <Campo id="capacidade" rotulo="Capacidade da bateria" unidade="Ah (ampère-hora)" valor={capacidade} mudar={setCapacidade} />
          <Campo id="recargas" rotulo="Recargas completas por dia" unidade="por dia" valor={recargas} mudar={setRecargas} />
        </div>
        {!valido && (
          <p className="erro" role="alert">
            Confira os números: use valores maiores que zero (tensão até 100 V, capacidade até 500 Ah, até 5 recargas por dia). Mostrando o modelo de referência.
          </p>
        )}
        <div className="resultado" aria-live="polite">
          <p className="destaque">
            Cerca de <strong>{reais(a.custoMesReais)}</strong> por mês
          </p>
          <p>
            {kWh(a.kWhMes)} por mês · {reais(a.custoAnoReais)} por ano · {kg(a.co2KgAno)} por ano
          </p>
          <p className="nota">Estimativa, não valor garantido. Com a tarifa comum da Enel SP, sem Tarifa Social.</p>
        </div>
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
      <p>
        Comparação para 12 meses, contra o que a família gasta hoje: <strong>{reais(a.custoAnoReais)} por ano</strong>. Da opção mais barata para começar à mais cara:
      </p>
      <ol className="cartoes">
        {ordem.map((o) => (
          <li key={o.id} className="cartao">
            <h3>
              {o.nome} <span className="selo">{o.tipo}</span>
            </h3>
            <p>{o.destaque}</p>
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
                <dt>Se paga em</dt>
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
      <h3>Vale para todas</h3>
      <ul>
        {a.limitacoesGerais.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
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
