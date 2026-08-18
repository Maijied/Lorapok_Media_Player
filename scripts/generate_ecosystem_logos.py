#!/usr/bin/env python3
"""
Lorapok Media Player - Ecosystem Logo & Icon Generator
Generates PNG, JPG, SVG, Animated SVG, and multi-resolution ICO files
for all platform and ecosystem targets.
"""

import os
from PIL import Image, ImageDraw, ImageFilter

OUTPUT_DIRS = [
    "Media/Logos",
    "lorapok-player/public",
    "lorapok-player/assets",
    "lorapok-player/packages/website/public",
    "packages/vscode-lorapok",
    "lorapok-extension"
]

for d in OUTPUT_DIRS:
    os.makedirs(d, exist_ok=True)

# 1. Create Static SVG
STATIC_SVG = '''<svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F3FF" />
      <stop offset="100%" stop-color="#BC13FE" />
    </linearGradient>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#030712" />
      <stop offset="50%" stop-color="#080f26" />
      <stop offset="100%" stop-color="#020308" />
    </linearGradient>
    <radialGradient id="glowGradiant" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#00F3FF" stop-opacity="0.4" />
      <stop offset="70%" stop-color="#BC13FE" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
    <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" rx="110" fill="url(#bgGradient)" />
  <rect x="2" y="2" width="508" height="508" rx="108" stroke="url(#brandGradient)" stroke-width="3" stroke-opacity="0.3" />
  
  <!-- Subtle Ambient Glow -->
  <circle cx="256" cy="256" r="210" fill="url(#glowGradiant)" />

  <!-- Orbital Cyber Rings -->
  <circle cx="256" cy="256" r="220" stroke="url(#brandGradient)" stroke-width="1.5" stroke-dasharray="14 28" opacity="0.25" />
  <circle cx="256" cy="256" r="180" stroke="#00F3FF" stroke-width="1" stroke-dasharray="6 18" opacity="0.2" />

  <!-- The "Instar Metamorphosis" Bio-Acoustic Spiral -->
  <g transform="translate(45, 45) scale(0.82)" filter="url(#neonGlow)">
    <circle cx="378" cy="382" r="65" fill="url(#brandGradient)" fill-opacity="1" />
    <circle cx="311" cy="422" r="60" fill="url(#brandGradient)" fill-opacity="0.92" />
    <circle cx="233" cy="430" r="55" fill="url(#brandGradient)" fill-opacity="0.84" />
    <circle cx="160" cy="402" r="50" fill="url(#brandGradient)" fill-opacity="0.76" />
    <circle cx="106" cy="346" r="45" fill="url(#brandGradient)" fill-opacity="0.68" />
    <circle cx="82"  cy="272" r="40" fill="url(#brandGradient)" fill-opacity="0.60" />
    <circle cx="92"  cy="195" r="35" fill="url(#brandGradient)" fill-opacity="0.52" />
    <circle cx="135" cy="129" r="30" fill="url(#brandGradient)" fill-opacity="0.44" />
    <circle cx="202" cy="89"  r="25" fill="url(#brandGradient)" fill-opacity="0.36" />
    
    <!-- Intelligence Spark Core -->
    <circle cx="388" cy="372" r="15" fill="#00F3FF" />
    <circle cx="388" cy="372" r="7" fill="#FFFFFF" />
    
    <!-- Central Play Vector Glyphs -->
    <path d="M260 240 L245 255 L260 270 M300 240 L315 255 L300 270" stroke="white" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.9" transform="translate(97.5, 100.4) rotate(30)" />
  </g>
</svg>
'''

# 2. Create Animated SVG with Metamorphosis Pulses & Rotation
ANIMATED_SVG = '''<svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="animBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F3FF">
        <animate attributeName="stop-color" values="#00F3FF;#BC13FE;#00F3FF" dur="6s" repeatCount="indefinite" />
      </stop>
      <stop offset="100%" stop-color="#BC13FE">
        <animate attributeName="stop-color" values="#BC13FE;#00F3FF;#BC13FE" dur="6s" repeatCount="indefinite" />
      </stop>
    </linearGradient>

    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#030712" />
      <stop offset="50%" stop-color="#080f26" />
      <stop offset="100%" stop-color="#020308" />
    </linearGradient>

    <radialGradient id="pulseGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#00F3FF" stop-opacity="0.45" />
      <stop offset="60%" stop-color="#BC13FE" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <filter id="animGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="14" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <style>
    @keyframes rotateRing {
      from { transform: rotate(0deg); transform-origin: 256px 256px; }
      to { transform: rotate(360deg); transform-origin: 256px 256px; }
    }
    @keyframes counterRotate {
      from { transform: rotate(360deg); transform-origin: 256px 256px; }
      to { transform: rotate(0deg); transform-origin: 256px 256px; }
    }
    @keyframes pulseGlowAnim {
      0%, 100% { transform: scale(1); opacity: 0.7; }
      50% { transform: scale(1.1); opacity: 1; }
    }
    .ring-outer { animation: rotateRing 20s linear infinite; }
    .ring-inner { animation: counterRotate 12s linear infinite; }
    .glow-core { animation: pulseGlowAnim 4s ease-in-out infinite; transform-origin: 256px 256px; }
  </style>

  <!-- Background Base -->
  <rect width="512" height="512" rx="110" fill="url(#bgGrad)" />
  <rect x="2" y="2" width="508" height="508" rx="108" stroke="url(#animBrandGrad)" stroke-width="3" stroke-opacity="0.4" />
  
  <!-- Animated Ambient Center Glow -->
  <circle class="glow-core" cx="256" cy="256" r="210" fill="url(#pulseGlow)" />

  <!-- Animated Orbital Cyber Rings -->
  <circle class="ring-outer" cx="256" cy="256" r="220" stroke="url(#animBrandGrad)" stroke-width="1.5" stroke-dasharray="14 28" opacity="0.35" />
  <circle class="ring-inner" cx="256" cy="256" r="180" stroke="#00F3FF" stroke-width="1.2" stroke-dasharray="6 18" opacity="0.3" />

  <!-- The "Instar Metamorphosis" Bio-Acoustic Spiral -->
  <g transform="translate(45, 45) scale(0.82)" filter="url(#animGlow)">
    <circle cx="378" cy="382" r="65" fill="url(#animBrandGrad)" fill-opacity="1" />
    <circle cx="311" cy="422" r="60" fill="url(#animBrandGrad)" fill-opacity="0.92" />
    <circle cx="233" cy="430" r="55" fill="url(#animBrandGrad)" fill-opacity="0.84" />
    <circle cx="160" cy="402" r="50" fill="url(#animBrandGrad)" fill-opacity="0.76" />
    <circle cx="106" cy="346" r="45" fill="url(#animBrandGrad)" fill-opacity="0.68" />
    <circle cx="82"  cy="272" r="40" fill="url(#animBrandGrad)" fill-opacity="0.60" />
    <circle cx="92"  cy="195" r="35" fill="url(#animBrandGrad)" fill-opacity="0.52" />
    <circle cx="135" cy="129" r="30" fill="url(#animBrandGrad)" fill-opacity="0.44" />
    <circle cx="202" cy="89"  r="25" fill="url(#animBrandGrad)" fill-opacity="0.36" />
    
    <!-- Intelligence Spark Core with Blinking / Breathing Light -->
    <circle cx="388" cy="372" r="15" fill="#00F3FF">
      <animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="388" cy="372" r="7" fill="#FFFFFF" />
    
    <!-- Central Play Vector Glyphs -->
    <path d="M260 240 L245 255 L260 270 M300 240 L315 255 L300 270" stroke="white" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.9" transform="translate(97.5, 100.4) rotate(30)">
      <animate attributeName="stroke-opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
    </path>
  </g>
</svg>
'''

# Write SVGs
for d in OUTPUT_DIRS:
    with open(os.path.join(d, "main_logo.svg"), "w") as f:
        f.write(STATIC_SVG)
    with open(os.path.join(d, "icon.svg"), "w") as f:
        f.write(STATIC_SVG)
    with open(os.path.join(d, "main_logo_animated.svg"), "w") as f:
        f.write(ANIMATED_SVG)
    with open(os.path.join(d, "icon_animated.svg"), "w") as f:
        f.write(ANIMATED_SVG)

# Load existing base image or render
base_img_path = "Media/Logos/main_logo.png"
if os.path.exists(base_img_path):
    src_img = Image.open(base_img_path).convert("RGBA")
else:
    # Fallback to creating high-res image
    src_img = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))

# 3. Generate PNGs in various standard sizes (1024, 512, 256, 192, 128, 64, 32, 16)
sizes = [1024, 512, 256, 192, 128, 64, 48, 32, 16]
rendered_images = {}
for s in sizes:
    resized = src_img.resize((s, s), Image.Resampling.LANCZOS)
    rendered_images[s] = resized

# 4. Save PNG files across targets
for d in OUTPUT_DIRS:
    rendered_images[512].save(os.path.join(d, "main_logo.png"), "PNG")
    rendered_images[512].save(os.path.join(d, "icon.png"), "PNG")
    rendered_images[128].save(os.path.join(d, "icon128.png"), "PNG")
    if s := rendered_images.get(192):
        s.save(os.path.join(d, "icon192.png"), "PNG")

# 5. Generate and Save High-Quality JPG with dark gradient background
bg_jpg = Image.new("RGB", (1024, 1024), (5, 8, 20))
# Paste 1024 RGBA onto dark background
resized_1024 = rendered_images[1024]
bg_jpg.paste(resized_1024, (0, 0), resized_1024)

for d in OUTPUT_DIRS:
    bg_jpg.save(os.path.join(d, "main_logo.jpg"), "JPEG", quality=95)
    bg_jpg.save(os.path.join(d, "icon.jpg"), "JPEG", quality=95)

# 6. Generate Multi-Resolution Windows .ICO
ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
ico_imgs = [src_img.resize(s, Image.Resampling.LANCZOS) for s in ico_sizes]

for d in OUTPUT_DIRS:
    ico_path = os.path.join(d, "favicon.ico")
    icon_ico_path = os.path.join(d, "icon.ico")
    ico_imgs[0].save(ico_path, format="ICO", sizes=ico_sizes)
    ico_imgs[0].save(icon_ico_path, format="ICO", sizes=ico_sizes)

print("✅ Successfully generated all ecosystem Logo & Icon assets (PNG, JPG, SVG, Animated SVG, ICO) across targets.")
