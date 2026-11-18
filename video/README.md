# Vídeo técnico

O vídeo é montado por script: as telas são gravadas automaticamente e a voz entra por cima, com legenda gravada na imagem.

## Gravar os áudios (o que a dupla faz)

1. Abra o [roteiro](roteiro.md). Cada cena tem uma fala (as linhas que começam com `>`).
2. Grave **um áudio por cena**, lendo exatamente o texto, num lugar silencioso. O gravador do celular serve.
3. Deixe 1 segundo de silêncio antes de começar a falar e corte o silêncio do fim, se for longo.
4. Salve com estes nomes, na pasta `video/audios/`:

   ```
   cena1.m4a  cena2.m4a  cena3.m4a  cena4.m4a  cena5.m4a  cena6.m4a  cena7.m4a
   ```

   Pode ser `.mp3`, `.m4a`, `.wav`, `.ogg` ou `.opus`. Se um áudio sair errado, grave só ele de novo.

## Montar

```bash
npm run video
```

Cada cena passa a durar o tempo do seu áudio (mais meio segundo), e a legenda acompanha. O resultado sai em `video/saida/video-sers.mp4`, com o tempo total na tela. Se passar de 3:00, o script avisa: leia um pouco mais rápido a cena mais longa (a 4) e grave de novo.

## Regravar as telas

Só é preciso se o site ou os arquivos do GitHub mudarem:

```bash
npm run video:telas
```

Usa o Playwright para abrir o site e o GitHub e gravar cada cena (`video/gravar-telas.mjs`). As pastas `telas/`, `audios/` e `saida/` não vão para o repositório.
