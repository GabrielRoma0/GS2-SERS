"""Monta o vídeo final: telas gravadas + legenda gravada na imagem + áudio de cada cena.

Uso (na pasta do projeto):
    python3 video/montar_video.py

Entrada:
    video/telas/cenaN.webm      gravadas por `node video/gravar-telas.mjs`
    video/audios/cenaN.<ext>    opcional: um áudio por cena (mp3, m4a, wav, ogg, opus, aac, webm)
Saída:
    video/saida/video-sers.mp4  vídeo com legenda gravada na imagem
    video/saida/legendas.srt    a mesma legenda em arquivo, para subir no YouTube se quiser

Sem áudio de uma cena, ela usa a duração estimada (ritmo de leitura) e fica em silêncio.
Com áudio, a cena dura o áudio + meio segundo, e a legenda acompanha esse tempo.
"""

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cenas import ler_cenas  # noqa: E402

PASTA = Path(__file__).resolve().parent
TELAS = PASTA / "telas"
AUDIOS = PASTA / "audios"
SAIDA = PASTA / "saida"
TMP = SAIDA / "tmp"
EXTENSOES = ["mp3", "m4a", "wav", "ogg", "opus", "aac", "webm"]
FOLGA_FIM = 0.5  # segundos de respiro depois de cada fala
LIMITE_LINHA = 44  # caracteres por linha de legenda
LIMITE_BLOCO = 2 * LIMITE_LINHA


def rodar(*args: str) -> None:
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def duracao(arquivo: Path) -> float:
    saida = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(arquivo)],
        capture_output=True,
        text=True,
        check=True,
    ).stdout.strip()
    return float(saida)


def achar_audio(numero: int) -> Path | None:
    for ext in EXTENSOES:
        a = AUDIOS / f"cena{numero}.{ext}"
        if a.exists():
            return a
    return None


def intervalo_da_fala(audio: Path, total: float) -> tuple[float, float]:
    """Onde a voz começa e termina no áudio (ignora o silêncio da ponta), pelo silencedetect."""
    saida = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(audio), "-af", "silencedetect=noise=-35dB:d=0.3", "-f", "null", "-"],
        capture_output=True,
        text=True,
    ).stderr
    inicios = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", saida)]
    fins = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", saida)]
    ini, fim = 0.0, total
    if inicios and inicios[0] < 0.05 and fins:
        ini = fins[0]
    if inicios and (len(fins) < len(inicios) or (fins and fins[-1] >= total - 0.05)):
        fim = inicios[-1]
    if fim - ini < 1.0:  # detecção estranha: usa o áudio inteiro
        return 0.0, total
    return ini, fim


def blocos_de_legenda(fala: str) -> list[str]:
    """Divide a fala em blocos de até 2 linhas, cortando de preferência no fim de frase ou vírgula."""
    frases = re.split(r"(?<=[.!?;:])\s+", fala.strip())
    blocos: list[str] = []
    for frase in frases:
        while len(frase) > LIMITE_BLOCO:
            corte = max(frase.rfind(", ", 0, LIMITE_BLOCO), frase.rfind(" ", 0, LIMITE_BLOCO))
            if frase[corte : corte + 2] == ", ":
                corte += 1
            blocos.append(frase[:corte].strip())
            frase = frase[corte:].strip()
        if frase:
            blocos.append(frase)
    return blocos


def quebrar_linhas(bloco: str) -> str:
    if len(bloco) <= LIMITE_LINHA:
        return bloco
    meio = len(bloco) // 2
    esq, dir_ = bloco.rfind(" ", 0, meio + 1), bloco.find(" ", meio)
    corte = esq if dir_ == -1 or (esq != -1 and meio - esq <= dir_ - meio) else dir_
    return bloco[:corte] + "\n" + bloco[corte + 1 :]


def tempo_ass(s: float) -> str:
    h, resto = divmod(s, 3600)
    m, s = divmod(resto, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def tempo_srt(s: float) -> str:
    ms = int(round(s * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    seg, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{seg:02d},{ms:03d}"


def main() -> None:
    if not shutil.which("ffmpeg"):
        sys.exit("Precisa do ffmpeg instalado.")
    cenas = ler_cenas()
    TMP.mkdir(parents=True, exist_ok=True)

    segmentos: list[Path] = []
    legendas: list[tuple[float, float, str]] = []
    inicio = 0.0
    for c in cenas:
        n = c["numero"]
        tela = TELAS / f"cena{n}.webm"
        if not tela.exists():
            sys.exit(f"Falta {tela}. Rode antes: node video/gravar-telas.mjs")
        audio = achar_audio(n)
        dur = (duracao(audio) + FOLGA_FIM) if audio else c["estimada_s"]
        seg = TMP / f"seg{n}.mp4"
        meta = TELAS / f"cena{n}.json"
        corte = json.loads(meta.read_text())["corte_inicio_s"] if meta.exists() else 0.0
        filtro_v = f"tpad=stop_mode=clone:stop_duration=600,trim=duration={dur:.3f},setpts=PTS-STARTPTS,fps=30,scale=1280:720,format=yuv420p"
        if audio:
            entrada_a = ["-i", str(audio)]
            filtro_a = f"[1:a]aresample=48000,aformat=channel_layouts=stereo,apad,atrim=duration={dur:.3f}[a]"
        else:
            entrada_a = ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo"]
            filtro_a = f"[1:a]atrim=duration={dur:.3f}[a]"
        rodar(
            "-ss", f"{corte:.3f}", "-i", str(tela), *entrada_a,
            "-filter_complex", f"[0:v]{filtro_v}[v];{filtro_a}",
            "-map", "[v]", "-map", "[a]",
            "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-c:a", "aac", "-b:a", "160k",
            "-t", f"{dur:.3f}", str(seg),
        )
        segmentos.append(seg)

        # Legenda: cada bloco fica na tela um tempo proporcional ao seu tamanho.
        blocos = blocos_de_legenda(c["fala"])
        if audio:
            fala_ini, fala_fim = intervalo_da_fala(audio, dur - FOLGA_FIM)
            util_ini, util_fim = inicio + max(0.0, fala_ini - 0.1), inicio + min(dur, fala_fim + 0.3)
        else:
            util_ini, util_fim = inicio + 0.15, inicio + dur - 0.3
        total = sum(len(b) for b in blocos) or 1
        t = util_ini
        for b in blocos:
            fim = t + (util_fim - util_ini) * len(b) / total
            legendas.append((t, fim - 0.05, quebrar_linhas(b)))
            t = fim
        print(f"cena {n}: {dur:5.1f} s {'com áudio ' + audio.name if audio else 'sem áudio (duração estimada)'}")
        inicio += dur

    lista = TMP / "lista.txt"
    lista.write_text("".join(f"file '{s.name}'\n" for s in segmentos), encoding="utf-8")
    junto = TMP / "junto.mp4"
    rodar("-f", "concat", "-safe", "0", "-i", str(lista), "-c", "copy", str(junto))

    ass = TMP / "legendas.ass"
    cabecalho = """[Script Info]
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 720
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Padrao,DejaVu Sans,34,&H00FFFFFF,&H00FFFFFF,&H00000000,&HB4000000,1,0,0,0,100,100,0,0,3,10,0,2,60,60,36,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    linhas = [
        f"Dialogue: 0,{tempo_ass(a)},{tempo_ass(b)},Padrao,,0,0,0,,{texto.replace(chr(10), chr(92) + 'N')}"
        for a, b, texto in legendas
    ]
    ass.write_text(cabecalho + "\n".join(linhas) + "\n", encoding="utf-8")

    srt = SAIDA / "legendas.srt"
    srt.write_text(
        "\n".join(f"{i}\n{tempo_srt(a)} --> {tempo_srt(b)}\n{texto}\n" for i, (a, b, texto) in enumerate(legendas, 1)),
        encoding="utf-8",
    )

    final = SAIDA / "video-sers.mp4"
    tem_audio = any(achar_audio(c["numero"]) for c in cenas)
    filtro_audio = ["-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "160k"] if tem_audio else ["-c:a", "copy"]
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", junto.name, "-vf", "ass=legendas.ass",
         "-c:v", "libx264", "-preset", "medium", "-crf", "20", *filtro_audio, "-movflags", "+faststart", str(final)],
        cwd=TMP,
        check=True,
    )
    total_s = duracao(final)
    aviso = "  ATENÇÃO: passa de 3 minutos!" if total_s > 180 else ""
    print(f"\nPronto: {final}  ({int(total_s // 60)}:{total_s % 60:04.1f}){aviso}")
    print(f"Legenda em arquivo: {srt}")


if __name__ == "__main__":
    main()
