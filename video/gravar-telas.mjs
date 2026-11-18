// Grava as telas de cada cena do vídeo, navegando sozinho pelo site e pelo GitHub.
// Uso: node video/gravar-telas.mjs            (todas as cenas)
//      node video/gravar-telas.mjs 3 5        (só as cenas 3 e 5)
// Saída: video/telas/cenaN.webm (1280×720). Cada gravação dura um pouco mais que a
// fala estimada; o montar_video.py corta ou congela o fim para casar com o áudio.
import { execFileSync } from 'node:child_process';
import { mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const PASTA = dirname(fileURLToPath(import.meta.url));
const TELAS = join(PASTA, 'telas');
const SITE = 'https://gabrielroma0.github.io/GS2-SERS/';
const REPO = 'https://github.com/GabrielRoma0/GS2-SERS';
const LARGURA = 1280;
const ALTURA = 720;

const cenas = JSON.parse(execFileSync('python3', [join(PASTA, 'cenas.py')], { encoding: 'utf8' }));
const pedidas = process.argv.slice(2).map(Number);

const esperar = (page, ms) => page.waitForTimeout(Math.max(0, Math.round(ms)));

// Rola suavemente até o alvo ficar perto do topo, em `ms` milissegundos.
async function rolarAte(page, locator, ms = 1500, folga = 90) {
  const alvo = await locator.first().evaluate((el, f) => el.getBoundingClientRect().top + window.scrollY - f, folga);
  await page.evaluate(
    ({ alvo, ms }) =>
      new Promise((ok) => {
        const z = parseFloat(getComputedStyle(document.documentElement).zoom || '1') || 1;
        const de = window.scrollY;
        const ate = Math.max(0, alvo * (z === 1 ? 1 : 1));
        const t0 = performance.now();
        const passo = (t) => {
          const p = Math.min(1, (t - t0) / ms);
          const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          window.scrollTo(0, de + (ate - de) * e);
          if (p < 1) requestAnimationFrame(passo);
          else ok();
        };
        requestAnimationFrame(passo);
      }),
    { alvo, ms }
  );
}

async function rolarPor(page, px, ms) {
  await page.evaluate(
    ({ px, ms }) =>
      new Promise((ok) => {
        const de = window.scrollY;
        const t0 = performance.now();
        const passo = (t) => {
          const p = Math.min(1, (t - t0) / ms);
          window.scrollTo(0, de + px * p);
          if (p < 1) requestAnimationFrame(passo);
          else ok();
        };
        requestAnimationFrame(passo);
      }),
    { px, ms }
  );
}

async function abrirSite(page, pronto = () => {}) {
  await page.goto(SITE, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: 'html{zoom:1.35} html{scroll-behavior:auto!important}' });
  await esperar(page, 300);
  pronto();
}

async function abrirGitHub(page, arquivo, pronto = () => {}) {
  await page.goto(`${REPO}/blob/main/${arquivo}`, { waitUntil: 'load', timeout: 60000 });
  await page.locator('article.markdown-body h2').first().waitFor({ state: 'attached', timeout: 60000 });
  const fechar = page.locator('button[aria-label="Collapse file tree"]');
  if (await fechar.count()) await fechar.first().click().catch(() => {});
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important} article.markdown-body{zoom:1.3}' });
  await esperar(page, 800);
  pronto();
}

function slide(titulo, linhas, rodape = '') {
  return `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><body style="margin:0;width:${LARGURA}px;height:${ALTURA}px;
  display:flex;flex-direction:column;justify-content:center;padding:0 110px;box-sizing:border-box;
  background:#22223B;color:#F2E9E4;font-family:Ubuntu,'DejaVu Sans',sans-serif">
  <p style="margin:0 0 12px;font-size:26px;color:#C9ADA7;font-weight:600">GS 2026.2 · Soluções em Energias Renováveis e Sustentáveis</p>
  <h1 style="margin:0 0 28px;font-size:72px;line-height:1.1">${titulo}</h1>
  ${linhas.map((l) => `<p style="margin:6px 0;font-size:30px">${l}</p>`).join('')}
  <p style="margin:40px 0 0;font-size:22px;color:#C9ADA7">${rodape}</p></body></html>`;
}

// Cada cena recebe a duração total (ms) e distribui as ações por ela.
const ROTEIRO = {
  1: async (page, d, pronto) => {
    await page.setContent(
      slide(
        'Mapiii · Energia',
        ['Quanto custa carregar a cadeira de rodas motorizada, e como pagar menos', '&nbsp;', 'Gabriel Botelho Romão · RM 570589', 'Thor Ferreira Camargo · RM 569543'],
        'FIAP · Ciência da Computação · Citizen Assist AI'
      )
    );
    await esperar(page, 300);
    pronto();
    await esperar(page, d);
  },
  2: async (page, d, pronto) => {
    await abrirSite(page, pronto);
    await esperar(page, d * 0.4);
    await rolarAte(page, page.locator('.resultado.principal'), 1800);
    await esperar(page, d * 0.6 - 2100);
  },
  3: async (page, d, pronto) => {
    await abrirGitHub(page, 'analise/resultados.md', pronto);
    await rolarAte(page, page.locator('article.markdown-body h2:has-text("1. Consumo")'), 1500, 140);
    await esperar(page, d * 0.55);
    await rolarAte(page, page.locator('article.markdown-body h2:has-text("4. Dados usados")'), 1800, 140);
    await esperar(page, d * 0.45 - 4000);
  },
  4: async (page, d, pronto) => {
    await abrirGitHub(page, 'analise/resultados.md', pronto);
    await rolarAte(page, page.locator('article.markdown-body h2:has-text("2. Compara")'), 1500, 140);
    await esperar(page, d * 0.55);
    await rolarPor(page, 420, 2500);
    await esperar(page, d * 0.45 - 4500);
  },
  5: async (page, d, pronto) => {
    await abrirSite(page, pronto);
    // ~8 s de rolagens e digitação fixas; o resto da fala vira pausas proporcionais.
    const r = Math.max(5000, d - 8000);
    await rolarAte(page, page.locator('#casa'), 1000, 260);
    const casa = page.locator('#casa');
    await casa.click({ clickCount: 3 });
    await casa.pressSequentially('50', { delay: 200 });
    await esperar(page, r * 0.15);
    await page.locator('summary:has-text("Como chegamos")').click();
    await rolarAte(page, page.locator('summary:has-text("Como chegamos")'), 900, 120);
    await esperar(page, r * 0.2);
    await rolarAte(page, page.locator('.resumo'), 1100, 100);
    await esperar(page, r * 0.2);
    await rolarAte(page, page.locator('.grafico'), 900, 100);
    await esperar(page, r * 0.1);
    await rolarAte(page, page.locator('#pergunte'), 1100, 60);
    await page.locator('button:has-text("Como funciona a Tarifa Social?")').click();
    await rolarAte(page, page.locator('.resposta'), 900, 80);
    await esperar(page, r * 0.15);
    await rolarAte(page, page.locator('.resposta .fontes'), 900, 200);
    await esperar(page, r * 0.2);
  },
  6: async (page, d, pronto) => {
    await abrirGitHub(page, 'testes-usuarios/registro.md', pronto);
    await rolarAte(page, page.locator('article.markdown-body h2:has-text("Etapa 2")'), 1500, 140);
    await esperar(page, d * 0.3);
    await rolarAte(page, page.locator('article.markdown-body h3:has-text("O que o teste mostrou")'), 1500, 140);
    await esperar(page, d * 0.25);
    await abrirSite(page, pronto);
    await rolarAte(page, page.locator('.resumo'), 1500, 100);
    await esperar(page, d * 0.45 - 4000);
  },
  7: async (page, d, pronto) => {
    await page.setContent(
      slide('Obrigado', ['Código, dados e fontes:', 'github.com/GabrielRoma0/GS2-SERS', '&nbsp;', 'Site: gabrielroma0.github.io/GS2-SERS'], 'Protótipo de estudo, não é um canal oficial.')
    );
    await esperar(page, 300);
    pronto();
    await esperar(page, d);
  }
};

mkdirSync(TELAS, { recursive: true });
const navegador = await chromium.launch();
try {
  for (const cena of cenas) {
    if (pedidas.length && !pedidas.includes(cena.numero)) continue;
    const acao = ROTEIRO[cena.numero];
    if (!acao) continue;
    // As ações cabem na fala estimada; depois a tela fica parada mais um tempo de folga,
    // para o caso de o áudio real ser mais longo (o montador corta o que sobrar).
    const duracao = cena.estimada_s * 1000;
    const folga = cena.estimada_s * 400 + 3000;
    const tmp = join(TELAS, `tmp-${cena.numero}`);
    rmSync(tmp, { recursive: true, force: true });
    const contexto = await navegador.newContext({
      viewport: { width: LARGURA, height: ALTURA },
      recordVideo: { dir: tmp, size: { width: LARGURA, height: ALTURA } },
      locale: 'pt-BR',
      colorScheme: 'light'
    });
    const page = await contexto.newPage();
    const inicio = Date.now();
    let corte = null; // segundos do vídeo em que a página ficou pronta (corta o carregamento)
    const pronto = () => {
      if (corte === null) corte = (Date.now() - inicio) / 1000;
    };
    await acao(page, duracao, pronto);
    if (corte === null) corte = 0;
    const resto = duracao - (Date.now() - inicio - corte * 1000);
    if (resto > 0) await esperar(page, resto);
    await esperar(page, folga);
    const video = page.video();
    await contexto.close();
    const destino = join(TELAS, `cena${cena.numero}.webm`);
    renameSync(await video.path(), destino);
    writeFileSync(join(TELAS, `cena${cena.numero}.json`), JSON.stringify({ corte_inicio_s: corte }));
    rmSync(tmp, { recursive: true, force: true });
    console.log(`cena ${cena.numero}: ${((Date.now() - inicio) / 1000).toFixed(1)} s → ${destino}`);
  }
} finally {
  await navegador.close();
}
