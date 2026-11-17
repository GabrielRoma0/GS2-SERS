# Roteiro do vídeo técnico · SERS (até 3 min, YouTube não listado)

Gravação de tela com voz, sem aparecer. Ler o texto em ritmo normal: são cerca de 400 palavras, o que dá aproximadamente 2 min 50 s.

**As telas do app já estão prontas** (site: https://gabrielroma0.github.io/GS2-SERS/). **Os trechos `[entre colchetes]` são números que saem de `analise/resultados.md`.** Não gravar com colchete: só depois que os dados estiverem preenchidos e a tabela gerada. Nunca falar um número que não esteja na tabela.

**Antes de gravar:** zoom do navegador em 125–150%, abas fechadas, notificações desligadas, o app aberto, a tabela e os links das fontes em abas na ordem do roteiro.

---

### Cena 1 · Abertura (0:00–0:10)

**Na tela:** slide com "Mapiii · Energia · GS 2026.2 · Soluções em Energias Renováveis e Sustentáveis", Gabriel Botelho Romão, RM 570589, Thor Ferreira Camargo, RM 569543.

> Olá. Este é o Mapiii Energia, a contribuição da disciplina de Energias Renováveis ao Mapiii, nosso assistente do Citizen Assist AI.

### Cena 2 · Público e necessidade (0:10–0:35)

**Na tela:** tela inicial do app; depois o README, seção "Público e problema".

> O Mapiii orienta famílias de pessoas com deficiência em São Paulo. Escolhemos quem usa cadeira de rodas motorizada. A cadeira precisa ser recarregada todos os dias. Isso pesa na conta de luz, muitas vezes de famílias de baixa renda, e, se falta energia, a pessoa pode ficar sem se locomover. Nossa pergunta foi: quanto custa carregar a cadeira e como pagar menos ou garantir a recarga?

### Cena 3 · Análise de consumo (0:35–1:05)

**Na tela:** `dados/equipamento.json` e o manual da cadeira (mostrar a página da bateria); depois a fórmula em `src/energia/calculos.ts`.

> Partimos do manual de uma cadeira real: baterias de [V] volts e [Ah] ampère-hora, ou seja, [kWh da bateria] quilowatt-hora. Como o carregador perde energia, com eficiência de [eficiência], cada recarga tira da tomada cerca de [kWh por recarga] quilowatt-hora. Com uma recarga por dia, são [kWh/mês] quilowatt-hora por mês e [kWh/ano] por ano. Com a tarifa da Enel SP, de [R$/kWh] reais por quilowatt-hora, isso dá cerca de [R$/mês] por mês e [R$/ano] por ano. Cada número tem fonte, unidade, período e premissa no repositório, e os estimados estão marcados.

### Cena 4 · Comparação das alternativas (1:05–1:45)

**Na tela:** `analise/resultados.md` (a tabela), apontando com o mouse cada linha.

> Comparamos as alternativas no mesmo período de 12 meses. A primeira é a Tarifa Social de Energia Elétrica, para famílias no Cadastro Único ou com BPC, junto com bons hábitos de recarga. Ela não custa nada para aderir e reduz o custo anual para cerca de [R$/ano com Tarifa Social]. A segunda é a energia solar, a fonte renovável. Um sistema ligado à rede, de [kWp] quilowatt-pico, custaria cerca de [R$ investimento] e se pagaria em cerca de [payback] anos. Um kit com bateria custa [R$ kit], mas garante [autonomia] recargas mesmo sem luz. No ambiental, a recarga emite cerca de [kg CO₂/ano] quilos de CO₂ por ano, que o solar evitaria, mas painel e bateria também têm impacto na fabricação e no descarte.

### Cena 5 · Demonstração no assistente (1:45–2:30)

**Na tela:** o app. Fazer, sem pressa: 1) a calculadora, mudando as recargas por dia; 2) a comparação; 3) uma pergunta livre, como "energia solar compensa?", e clicar na fonte.

> No assistente, a pessoa calcula quanto gasta para carregar a cadeira, vê a comparação das alternativas e pode perguntar, por exemplo, se a energia solar compensa. Toda resposta mostra a fonte, a data em que conferimos e a limitação. Os números da tela saem das mesmas funções da análise, então o assistente nunca diz um número diferente do estudo.

### Cena 6 · Recomendações e limitações (2:30–2:55)

**Na tela:** `analise/justificativas.md`, parte da recomendação; depois o aviso "Estimativa, não garantia" no app.

> Nossa recomendação, nesta ordem: [recomendação 1]; [recomendação 2]; [recomendação 3]. Tudo isso é estimativa, não resultado garantido: depende do modelo da cadeira, do uso, da tarifa do mês e do clima. Quem decide a Tarifa Social é a distribuidora, e o Mapiii é um protótipo de estudo, não um canal oficial. Testamos com [N] pessoas e ajustamos o que confundiu.

### Cena 7 · Fechamento (2:55–3:00)

**Na tela:** link do repositório.

> O código, os dados e as fontes estão no GitHub. Obrigado.

---

## Depois de gravar

1. Conferir a duração: **no máximo 3:00**.
2. YouTube → Criar → Enviar vídeo → visibilidade **Não listado**.
3. Abrir o link numa aba anônima.
4. Colar o link no `entrega.txt`.
