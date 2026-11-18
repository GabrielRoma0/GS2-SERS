"""Lê as falas de video/roteiro.md: uma lista de cenas com o texto falado de cada uma.

Usado por montar_video.py (legendas e tempos) e, via `python3 video/cenas.py`,
pelo gravar-telas.mjs (que só precisa da duração estimada de cada cena).
"""

import json
import re
import subprocess
import sys
from pathlib import Path

PASTA = Path(__file__).resolve().parent
PALAVRAS_POR_SEGUNDO = 2.5  # ritmo de leitura calmo, usado só quando ainda não há áudio


def ler_cenas(roteiro: Path = PASTA / "roteiro.md") -> list[dict]:
    texto = roteiro.read_text(encoding="utf-8")
    cenas = []
    for bloco in re.split(r"^### ", texto, flags=re.M)[1:]:
        m = re.match(r"Cena (\d+) · (.+)", bloco)
        if not m:
            continue
        fala = " ".join(l[2:].strip() for l in bloco.splitlines() if l.startswith("> "))
        palavras = len(fala.split())
        cenas.append(
            {
                "numero": int(m.group(1)),
                "titulo": m.group(2).strip(),
                "fala": fala,
                "palavras": palavras,
                "estimada_s": round(palavras / PALAVRAS_POR_SEGUNDO + 1.0, 1),
            }
        )
        # Se já existe o áudio da cena, a duração real manda (as telas são gravadas nesse ritmo).
        for ext in ("mp3", "m4a", "wav", "ogg", "opus", "aac", "webm"):
            audio = PASTA / "audios" / f"cena{cenas[-1]['numero']}.{ext}"
            if audio.exists():
                dur = subprocess.run(
                    ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(audio)],
                    capture_output=True, text=True, check=True,
                ).stdout.strip()
                cenas[-1]["estimada_s"] = round(float(dur) + 0.5, 1)
                cenas[-1]["tem_audio"] = True
                break
    return cenas


if __name__ == "__main__":
    json.dump(ler_cenas(), sys.stdout, ensure_ascii=False, indent=2)
