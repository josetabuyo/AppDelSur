import sys, json, mlx_whisper
src, out = sys.argv[1], sys.argv[2]
r = mlx_whisper.transcribe(src, path_or_hf_repo="mlx-community/whisper-large-v3-turbo", language="es", verbose=False)
with open(out + ".txt", "w") as f:
    for s in r["segments"]:
        f.write(f"[{int(s['start'])//60:02d}:{int(s['start'])%60:02d}] {s['text'].strip()}\n")
print("done", out)
