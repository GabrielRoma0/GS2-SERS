# Mapiii · Energia

**Contribuição da disciplina Soluções em Energias Renováveis e Sustentáveis (SERS) ao Mapiii**, o assistente do desafio Citizen Assist AI (FIAP, Global Solution 2026.2, Ciência da Computação).

> Sou um protótipo de estudo, não um canal oficial. Confirme nas fontes indicadas. Toda economia, geração ou custo mostrado aqui é **estimativa**, não resultado garantido.

## Integrantes

| Nome completo | RM |
|---|---|
| Gabriel Botelho Romao | RM 570589 |
| Thor Ferreira Camargo | RM 569543 |

## Público e problema

- **Público:** famílias de pessoas que usam **cadeira de rodas motorizada** na cidade de São Paulo (o mesmo público do Mapiii).
- **Necessidade energética:** a cadeira precisa ser **recarregada todo dia**. Isso pesa na conta de luz e, numa falta de energia, a pessoa pode ficar sem se locomover.
- **Pergunta respondida:** quanto custa por mês e por ano carregar a cadeira, e qual a melhor forma de pagar menos ou garantir a recarga?

## Alternativas comparadas (mesma necessidade, período de 12 meses)

| | Alternativa | Tipo |
|---|---|---|
| Base | Recarregar na tomada com a tarifa residencial comum (B1, Enel SP) | referência |
| A | Tarifa Social de Energia Elétrica + hábitos de recarga | economia |
| B | Energia solar fotovoltaica: B1 sistema ligado à rede (Lei 14.300/2022); B2 kit com bateria | renovável |

Resultado e recomendação: [analise/resultados.md](analise/resultados.md) e [analise/justificativas.md](analise/justificativas.md) *(em construção)*.

## Funcionalidades de energia no assistente

*(em construção, Passo 5 do [plano](docs/plano.md))*

1. Calculadora "quanto gasto para carregar a cadeira?"
2. Comparação das alternativas, com a recomendação e o porquê
3. Perguntas livres sobre energia, respondidas só com fichas que têm fonte, data de conferência e limitação

## Como executar

Precisa de Node 20.19+ ou 22.12+.

```bash
npm install
npm run dev          # app em http://localhost:5173
npm test             # testes das contas
npm run validar-dados  # confere se todo número de dados/ tem fonte
npm run verificar    # tipos + testes + dados
```

## Organização

| Pasta | O que tem |
|---|---|
| `dados/` | Números usados nas contas, cada um com origem, unidade, período e premissa ([formato](dados/README.md)) |
| `src/energia/calculos.ts` | Todas as fórmulas (energia, custo, solar, payback, CO₂), usadas pelo app e pela análise |
| `src/app/` | Telas do assistente |
| `analise/` | Comparação das alternativas e justificativas |
| `testes-usuarios/` | Roteiro e registro dos testes com pessoas e dos ajustes |
| `referencias.md` | Todas as fontes |
| `video/` | Roteiro do vídeo técnico |
| `docs/plano.md` | Plano de trabalho da dupla |

## Limitações

*(completar com a análise)* Os valores dependem do modelo da cadeira, do uso, da tarifa vigente, das bandeiras e do clima. O app não vê a conta de luz de ninguém e não decide se a pessoa pode receber a Tarifa Social: quem decide é a distribuidora.
