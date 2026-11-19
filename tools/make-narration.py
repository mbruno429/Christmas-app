"""Record the app's read-aloud clips with the open Kokoro voice model (Apache 2.0).

    node tools/narration-list.js > lines.json
    python tools/make-narration.py lines.json audio/voice  [path/to/model/folder]

Needs `pip install kokoro-onnx soundfile numpy`, ffmpeg, and the model files
kokoro-v1.0.onnx and voices-v1.0.bin (from huggingface.co/fastrtc/kokoro-onnx).
"""
import json, os, re, subprocess, sys
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

VOICE = 'af_heart'
SPEED = 0.9
# Spellings that help the voice say names the way people do.
SAY = [
    (r'\bSt\.', 'Saint'),
    (r'Gaudete', 'Gow-day-tay'),
    (r'\bYES\b', 'yes'),          # capitals get spelled out letter by letter
    (r'means "', 'means, "'),
    (r'"', ''),                    # quotation marks trip the voice up
    (r'Fleece Navidad', 'Fleece Nah-vee-dahd'),
    (r'elf-abet', 'elf-a-bet'),
    (r'Horn-aments', 'horn-a-ments'),
    (r'[\U0001F000-\U0001FAFF☀-➿️‍]', ''),
]

def spoken(text):
    for pat, rep in SAY:
        text = re.sub(pat, rep, text)
    return text

def main():
    lines = json.load(open(sys.argv[1]))
    out = sys.argv[2]
    models = sys.argv[3] if len(sys.argv) > 3 else '.'
    os.makedirs(out, exist_ok=True)
    k = Kokoro(os.path.join(models, 'kokoro-v1.0.onnx'), os.path.join(models, 'voices-v1.0.bin'))
    for cid, text in lines.items():
        samples, sr = k.create(spoken(text), voice=VOICE, speed=SPEED, lang='en-us')
        pad = np.zeros(int(sr * 0.12), dtype=samples.dtype)
        wav = os.path.join(out, cid + '.wav')
        sf.write(wav, np.concatenate([pad, samples, pad]), sr)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-af', 'loudnorm=I=-17:TP=-1.5:LRA=11',
                        '-ar', '24000', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '56k',
                        os.path.join(out, cid + '.mp3')], check=True)
        os.remove(wav)
        print(cid, round(len(samples) / sr, 1), 's', flush=True)

if __name__ == '__main__':
    main()
