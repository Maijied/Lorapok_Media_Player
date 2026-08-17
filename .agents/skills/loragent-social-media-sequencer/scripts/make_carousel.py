#!/usr/bin/env python3
"""
Generate animated LinkedIn/Social Media slideshow with text transitions and synthesized ambient music.
Derived from Lorapok Labs social media automation tools.
"""

from __future__ import annotations

import math
import subprocess
from pathlib import Path

import imageio.v3 as iio
import numpy as np
from PIL import Image, ImageDraw, ImageFont

SIZE = 1080
FPS = 30
SLIDE_SECONDS = 4.0
TRANSITION_SECONDS = 0.8


def ease_out_cubic(t: float) -> float:
    return 1 - (1 - t) ** 3


def ease_in_out_cubic(t: float) -> float:
    return 4 * t * t * t if t < 0.5 else 1 - ((-2 * t + 2) ** 3) / 2


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def fit_cover(img: Image.Image, size: int) -> Image.Image:
    img = img.convert("RGB")
    scale = max(size / img.width, size / img.height)
    resized = img.resize((int(img.width * scale), int(img.height * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - size) // 2
    top = (resized.height - size) // 2
    return resized.crop((left, top, left + size, top + size))


def ken_burns_frame(base: Image.Image, progress: float) -> Image.Image:
    zoom = 1.0 + 0.06 * ease_in_out_cubic(progress)
    w, h = base.size
    crop_w = int(w / zoom)
    crop_h = int(h / zoom)
    pan_x = int((w - crop_w) * 0.15 * math.sin(progress * math.pi))
    pan_y = int((h - crop_h) * 0.08 * math.cos(progress * math.pi))
    left = (w - crop_w) // 2 + pan_x
    top = (h - crop_h) // 2 + pan_y
    cropped = base.crop((left, top, left + crop_w, top + crop_h))
    return cropped.resize((w, h), Image.Resampling.LANCZOS)


def draw_text_panel(
    canvas: Image.Image,
    title: str,
    subtitle: str,
    accent: str,
    title_progress: float,
    subtitle_progress: float,
) -> Image.Image:
    frame = canvas.copy()
    overlay = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    panel_h = 220
    panel = Image.new("RGBA", (SIZE, panel_h), (8, 12, 20, 0))
    panel_draw = ImageDraw.Draw(panel)
    for y in range(panel_h):
        alpha = int(185 * (y / panel_h))
        panel_draw.line([(0, y), (SIZE, y)], fill=(8, 12, 20, alpha))
    overlay.alpha_composite(panel, (0, SIZE - panel_h))

    title_font = load_font(52, bold=True)
    subtitle_font = load_font(28, bold=False)

    title_y = SIZE - 165 + int((1 - ease_out_cubic(title_progress)) * 40)
    subtitle_y = SIZE - 95 + int((1 - ease_out_cubic(subtitle_progress)) * 30)

    title_alpha = int(255 * ease_out_cubic(title_progress))
    subtitle_alpha = int(255 * ease_out_cubic(subtitle_progress))

    accent_rgb = tuple(int(accent.lstrip("#")[i : i + 2], 16) for i in (0, 2, 4))

    draw.text((54, title_y), title, font=title_font, fill=(*accent_rgb, title_alpha))
    draw.text((54, subtitle_y), subtitle, font=subtitle_font, fill=(235, 240, 255, subtitle_alpha))

    line_w = int(220 * ease_out_cubic(title_progress))
    if line_w > 0:
        draw.rectangle((54, title_y + 58, 54 + line_w, title_y + 64), fill=(*accent_rgb, title_alpha))

    frame = Image.alpha_composite(frame.convert("RGBA"), overlay)
    return frame.convert("RGB")


def blend_frames(a: np.ndarray, b: np.ndarray, t: float) -> np.ndarray:
    t = ease_in_out_cubic(t)
    return (a.astype(np.float32) * (1 - t) + b.astype(np.float32) * t).astype(np.uint8)


def render_carousel(slides: list[dict], output_mp4: Path, output_gif: Path) -> None:
    all_frames: list[np.ndarray] = []
    slide_frames = []

    for slide in slides:
        base = fit_cover(Image.open(slide["image"]), SIZE)
        frames = []
        total = int(SLIDE_SECONDS * FPS)

        for i in range(total):
            progress = i / max(total - 1, 1)
            kb = ken_burns_frame(base, progress)
            canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 255))
            canvas.paste(kb, (0, 0))

            title_t = min(1.0, max(0.0, (progress - 0.05) / 0.25))
            subtitle_t = min(1.0, max(0.0, (progress - 0.18) / 0.25))
            composed = draw_text_panel(canvas, slide.get("title", ""), slide.get("subtitle", ""), slide.get("accent", "#00f0ff"), title_t, subtitle_t)
            frames.append(np.array(composed))
        slide_frames.append(frames)

    transition_frames = int(TRANSITION_SECONDS * FPS)
    for idx, frames in enumerate(slide_frames):
        all_frames.extend(frames)
        if idx < len(slide_frames) - 1:
            next_frames = slide_frames[idx + 1]
            for t in range(transition_frames):
                mix = (t + 1) / transition_frames
                all_frames.append(blend_frames(frames[-1], next_frames[0], mix))

    print(f"Rendering {len(all_frames)} video frames...")
    iio.imwrite(output_mp4, all_frames, fps=FPS, codec="libx264", pixelformat="yuv420p", quality=8)
    
    gif_frames = all_frames[::2]
    iio.imwrite(output_gif, gif_frames, duration=1 / (FPS / 2), loop=0)
    print(f"Video saved: {output_mp4}")
    print(f"GIF saved: {output_gif}")


if __name__ == "__main__":
    print("Carousel Generator ready.")
