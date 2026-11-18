# Registro dos testes e ajustes

Sem nome, idade exata, endereço ou qualquer dado pessoal. Participantes identificados só como P1, P2… e um perfil geral.

## Etapa 1 · Avaliação prévia simulada (17/11/2026)

**Não é teste com pessoas reais.** Antes do teste real, a dupla usou uma ferramenta de IA para simular cinco perfis de usuário fazendo as três tarefas do [roteiro](roteiro.md) no site. As reações são hipotéticas e serviram só para levantar problemas prováveis de clareza. O relatório completo da simulação fica com a dupla.

| Problema provável apontado | Ajuste feito (antes → depois) |
|---|---|
| Termos técnicos (kWh, payback, potência solar) difíceis de entender | Antes: termos sem explicação → depois: caixas "O que é kWh?", "O que é tempo para o dinheiro voltar (payback)?" e explicação de kWp; "Se paga em" virou "Tempo para o dinheiro voltar" |
| Custo mensal pouco destacado | Antes: resultado abaixo dos campos → depois: custo mensal em letra grande no topo da calculadora, com uma frase simples |
| Diferença entre solar só para a cadeira e para a casa toda pouco clara | Antes: só um texto → depois: dois quadros lado a lado ("Só para a cadeira" × "Como parte de um sistema da casa toda"), marcando qual volta mais rápido |
| Diferença entre solar ligado à rede e solar com bateria pouco clara | Antes: nenhuma explicação → depois: caixa "Qual a diferença entre solar ligado à rede e solar com bateria?" |
| Fontes difíceis de achar | Antes: fontes só dentro de "Como chegamos nesse número" → depois: botão "De onde vêm esses números?" e seção com todos os números, fonte, data e premissa |
| Não ficava claro por que o valor é estimativa | Antes: só a palavra "estimativa" → depois: caixa "Por que é estimativa?" explicando o que muda o valor |

### Etapa 1b · Segunda rodada simulada (17/11/2026)

**Também não é teste com pessoas reais:** dez perfis simulados por IA, avaliando a versão anterior aos ajustes acima. A maior parte dos pontos (kWh, payback, fontes, custo em destaque, rede × bateria) repete a primeira rodada e já estava corrigida. Pontos novos e o que foi feito:

| Problema provável apontado | Ajuste feito (antes → depois) |
|---|---|
| A tarifa usada no cálculo não aparecia (perfil comparador de preços) | Antes: tarifa só dentro do passo a passo → depois: "Tarifa usada: R$ 0,79 por kWh" no quadro do resultado |
| Poderia ser mais visual (perfil que prefere gráficos) | Antes: só números nos cartões → depois: gráfico de barras "Tempo para o dinheiro voltar" comparando as alternativas |
| Faltava dizer o que entra no investimento e o que fica de fora (perfil de planejamento financeiro) | Antes: só o valor → depois: nota no cartão do solar (inclui placas, inversor, projeto e instalação; não inclui manutenção nem troca do inversor) e no do kit (sem instalação; não inclui troca da bateria) |
| Resultados e fontes difíceis de achar rápido (perfil que busca praticidade) | Já atendido pelos ajustes da Etapa 1: custo no topo e botão "De onde vêm esses números?" |

## Etapa 2 · Teste com pessoas (17/11/2026, versão já com os ajustes das Etapas 1 e 1b)

Três pessoas usaram o site no celular, com as três tarefas do [roteiro](roteiro.md). Respostas anotadas pela dupla, resumidas sem alterar o sentido.

| Participante | Perfil | Tarefa 1 · custo por mês | Tarefa 2 · solar compensa? | Tarefa 3 · de onde vêm os números |
|---|---|---|---|---|
| P1 | Fonoaudióloga | Conseguiu; usou dados de pacientes como base | "Mais ou menos"; entendeu que "é possível economizar" com solar | Respondeu "pacientes" (falou da própria base, não achou as fontes do app) |
| P2 | Analista de sistemas | Conseguiu; pesquisou valores e se baseou neles | Conseguiu; entendeu que "compensa" | Respondeu "Google" (não achou as fontes do app) |
| P3 | Paciente de P1 | Conseguiu; usou dados da própria vida | Conseguiu; entendeu que "dá para economizar" | Respondeu "dados da vida" (não achou as fontes do app) |

| Participante | Ficou claro? | Foi útil? | O que confundiu? | Confiaria? |
|---|---|---|---|---|
| P1 | Sim | Sim | Por não ser cadeirante (falta de referência própria) | Sim |
| P2 | Sim | Sim | Nada | Sim |
| P3 | Sim | Sim | "Tela com muita letra" | Sim |

### O que o teste mostrou e o que mudou

| Achado | Ajuste feito (antes → depois) |
|---|---|
| As três pessoas saíram achando que solar "compensa", mas a análise mostra que só para a cadeira o dinheiro leva cerca de 44 anos para voltar. A conclusão principal não estava chegando | Antes: conclusão espalhada pelos cartões → depois: quadro **"Em resumo"** no topo da comparação, com uma linha por opção (Tarifa Social sem custo; solar só para a cadeira, 44 anos; solar para a casa toda, cerca de 4 anos; kit, 51 anos, só pela falta de luz) |
| Ninguém achou as fontes do app; todos responderam de onde tiraram os próprios números | Antes: botão de fontes abaixo da calculadora → depois: botão **"Ver de onde vêm esses números"** dentro do quadro do resultado, logo abaixo do valor |
| "Tela com muita letra" (P3) | Antes: textos longos e limitações abertas → depois: frase de instrução encurtada, aviso de estimativa junto da tarifa, e "Limitações que valem para todas" recolhidas numa caixa que abre ao tocar |
| Os três conseguiram achar o custo mensal (tarefa 1) | Mantido: custo em letra grande no topo funcionou |

**Limites deste teste:** só três pessoas, todas no mesmo dia; não registramos se alguma delas usa cadeira motorizada, então a premissa de "metade da bateria por dia" segue sem confirmação. Os ajustes acima ainda não foram testados de novo com pessoas.
