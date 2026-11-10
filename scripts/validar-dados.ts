// npm run validar-dados            → erros fazem falhar; pendências só são listadas
// npm run validar-dados -- --estrito → pendências também fazem falhar (usar antes da entrega)
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validarDados } from '../src/energia/validar-dados.ts';

const estrito = process.argv.includes('--estrito');
const pasta = join(import.meta.dirname, '..', 'dados');
const arquivos = readdirSync(pasta).filter((a) => a.endsWith('.json')).sort();

let erros = 0;
let pendentes = 0;
for (const arquivo of arquivos) {
  let conteudo: unknown;
  try {
    conteudo = JSON.parse(readFileSync(join(pasta, arquivo), 'utf8'));
  } catch (e) {
    console.error(`✗ ${arquivo}: JSON inválido (${(e as Error).message})`);
    erros++;
    continue;
  }
  const r = validarDados(arquivo, conteudo);
  r.erros.forEach((m) => console.error(`✗ ${m}`));
  r.pendentes.forEach((m) => console.warn(`… pendente  ${m}`));
  erros += r.erros.length;
  pendentes += r.pendentes.length;
}

console.log(`\n${arquivos.length} arquivos · ${erros} erro(s) · ${pendentes} dado(s) pendente(s)`);
if (erros > 0 || (estrito && pendentes > 0)) process.exit(1);
