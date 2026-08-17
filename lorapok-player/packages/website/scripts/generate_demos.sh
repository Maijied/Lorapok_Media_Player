#!/bin/bash
set -e

DEMO_DIR="public/demos"
mkdir -p "$DEMO_DIR"

if [ -f "$DEMO_DIR/neon_waves.mp4" ]; then
    echo "Demos already generated. Skipping."
    exit 0
fi

echo "Generating MP4 (Neon Waves)..."
ffmpeg -f lavfi -i "testsrc=size=854x480:rate=30:duration=15,hue=H=2*PI*t:s=sin(2*PI*t/10)" -f lavfi -i "sine=frequency=440:duration=15" -c:v libx264 -preset ultrafast -crf 28 -c:a aac -b:a 128k -pix_fmt yuv420p -y "$DEMO_DIR/neon_waves.mp4"

echo "Generating HLS (Cyber Grid)..."
mkdir -p "$DEMO_DIR/hls"
ffmpeg -f lavfi -i "smptebars=size=854x480:rate=30:duration=15" -f lavfi -i "sine=frequency=330:duration=15" -c:v libx264 -preset ultrafast -crf 28 -c:a aac -b:a 128k -pix_fmt yuv420p -f hls -hls_time 3 -hls_list_size 0 -y "$DEMO_DIR/hls/cyber_grid.m3u8"

echo "Generating DASH (Fractal)..."
mkdir -p "$DEMO_DIR/dash"
ffmpeg -f lavfi -i "mandelbrot=size=854x480:rate=30" -f lavfi -i "sine=frequency=220:duration=15" -t 15 -c:v libx264 -preset ultrafast -crf 28 -c:a aac -b:a 128k -pix_fmt yuv420p -f dash -y "$DEMO_DIR/dash/fractal_dash.mpd"

echo "Done generating demo videos!"
