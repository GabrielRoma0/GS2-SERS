// Confere os arquivos de dados/: cada número precisa dizer de onde veio.
// Um dado com `valor: null` está PENDENTE (a dupla ainda vai buscar). No modo estrito,
// pendência vira erro: é o modo de antes da entrega.

export const TIPOS = ['real', 'publico', 'estimado'] as const;
export type TipoDado = (typeof TIPOS)[number];

export interface Dado {
  id: string;
  descricao: string;
  valor: number | null;
  unidade: string;
  periodo: string;
  tipo: TipoDado | '';
  fonte_nome: string;
  fonte_url: string;
  verificado_em: string;
  premissa: string;
}

const CAMPOS: (keyof Dado)[] = ['id', 'descricao', 'valor', 'unidade', 'periodo', 'tipo', 'fonte_nome', 'fonte_url', 'verificado_em', 'premissa'];

export interface Resultado {
  erros: string[];
  pendentes: string[];
}

function dataValida(texto: string, hoje: Date): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return 'verificado_em precisa ser AAAA-MM-DD';
  const d = new Date(`${texto}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== texto) return 'verificado_em não é uma data válida';
  const hojeUTC = new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()));
  if (d > hojeUTC) return 'verificado_em não pode ser uma data futura';
  return null;
}

/** Valida a lista de dados de um arquivo. `arquivo` só serve para as mensagens. */
export function validarDados(arquivo: string, conteudo: unknown, hoje = new Date()): Resultado {
  const erros: string[] = [];
  const pendentes: string[] = [];
  if (!Array.isArray(conteudo)) return { erros: [`${arquivo}: precisa ser uma lista ([...]).`], pendentes };

  const ids = new Set<string>();
  conteudo.forEach((item, i) => {
    const onde = `${arquivo}[${i}]`;
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      erros.push(`${onde}: precisa ser um objeto.`);
      return;
    }
    const d = item as Record<string, unknown>;
    for (const extra of Object.keys(d)) {
      if (!CAMPOS.includes(extra as keyof Dado)) erros.push(`${onde}: campo desconhecido "${extra}".`);
    }
    for (const campo of CAMPOS) {
      if (campo === 'valor') continue;
      if (typeof d[campo] !== 'string') erros.push(`${onde}: "${campo}" precisa ser texto.`);
    }
    const id = typeof d.id === 'string' ? d.id : '';
    const nome = id ? `${arquivo}:${id}` : onde;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) erros.push(`${nome}: id precisa ter só minúsculas, números e hífen.`);
    if (ids.has(id)) erros.push(`${nome}: id repetido.`);
    ids.add(id);
    if (typeof d.descricao !== 'string' || d.descricao.trim() === '') erros.push(`${nome}: falta a descrição.`);
    if (typeof d.unidade !== 'string' || d.unidade.trim() === '') erros.push(`${nome}: falta a unidade.`);

    if (d.valor === null) {
      pendentes.push(`${nome}: ${String(d.descricao ?? '')}`);
      return;
    }
    if (typeof d.valor !== 'number' || !Number.isFinite(d.valor)) {
      erros.push(`${nome}: "valor" precisa ser número ou null (pendente).`);
      return;
    }
    // Daqui para baixo o dado está preenchido: precisa estar completo.
    if (!TIPOS.includes(d.tipo as TipoDado)) erros.push(`${nome}: "tipo" precisa ser ${TIPOS.join(', ')}.`);
    if (typeof d.periodo !== 'string' || d.periodo.trim() === '') erros.push(`${nome}: falta o período (ex.: "vigência 2026", "média anual").`);
    if (typeof d.fonte_nome !== 'string' || d.fonte_nome.trim() === '') erros.push(`${nome}: falta fonte_nome.`);
    if (typeof d.fonte_url !== 'string' || !/^https:\/\/[^\s]+$/.test(d.fonte_url)) erros.push(`${nome}: fonte_url precisa ser um link https.`);
    if (typeof d.verificado_em === 'string') {
      const problema = dataValida(d.verificado_em, hoje);
      if (problema) erros.push(`${nome}: ${problema}.`);
    }
    if (d.tipo === 'estimado' && (typeof d.premissa !== 'string' || d.premissa.trim() === '')) {
      erros.push(`${nome}: dado estimado precisa explicar a premissa.`);
    }
  });
  return { erros, pendentes };
}
