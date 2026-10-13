from PIL import Image
import os

order = [
    ("01-landing.png", 1400),
    ("02-uploaded.png", 1400),
    ("03-filled.png", 1400),
    ("04-loading.png", 1600),
    ("05-result.png", 2400),
]

here = os.path.dirname(__file__)
frames = []
target_w = 900

for name, hold_ms in order:
    img = Image.open(os.path.join(here, name)).convert("RGB")
    w, h = img.size
    scale = target_w / w
    img = img.resize((target_w, int(h * scale)), Image.LANCZOS)
    frames.append((img, hold_ms))

max_h = max(f.size[1] for f, _ in frames)
padded = []
for img, hold_ms in frames:
    canvas = Image.new("RGB", (target_w, max_h), (11, 15, 26))
    canvas.paste(img, (0, 0))
    padded.append((canvas, hold_ms))

images = [f for f, _ in padded]
durations = [d for _, d in padded]

out_path = os.path.join(here, "demo.gif")
images[0].save(
    out_path,
    save_all=True,
    append_images=images[1:],
    duration=durations,
    loop=0,
    optimize=True,
)
print("saved", out_path)
