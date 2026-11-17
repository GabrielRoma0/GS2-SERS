// Junta os arquivos de dados/ para o app. Os mesmos arquivos que a análise lê.
import emissoes from '../../dados/emissoes.json';
import equipamento from '../../dados/equipamento.json';
import solar from '../../dados/solar.json';
import tarifas from '../../dados/tarifas.json';
import type { Dado } from './validar-dados.ts';

export const DADOS: Dado[] = [...equipamento, ...tarifas, ...solar, ...emissoes] as unknown as Dado[];
