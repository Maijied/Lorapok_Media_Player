#!/bin/bash
set -e

DEMO_DIR="public/demos"
mkdir -p "$DEMO_DIR"

FFMPEG_BIN="ffmpeg"
if ! command -v ffmpeg &> /dev/null; then
    if [ -f "../../node_modules/ffmpeg-static/ffmpeg" ]; then
        FFMPEG_BIN="../../node_modules/ffmpeg-static/ffmpeg"
    elif [ -f "../../../node_modules/ffmpeg-static/ffmpeg" ]; then
        FFMPEG_BIN="../../../node_modules/ffmpeg-static/ffmpeg"
    else
        echo "⚠️ ffmpeg not found in PATH or node_modules, skipping demo generation."
        exit 0
    fi
fi

echo "🎬 Generating Comprehensive Lorapok Test Media Suite..."

# 1. MP4 Video (Neon Waves - H.264 + AAC)
if [ ! -f "$DEMO_DIR/neon_waves.mp4" ]; then
    echo "   ▶️ Generating MP4 (Neon Waves)..."
    "$FFMPEG_BIN" -f lavfi -i "testsrc=size=854x480:rate=30:duration=15,hue=H=2*PI*t:s=sin(2*PI*t/10)" -f lavfi -i "sine=frequency=440:duration=15" -c:v libx264 -preset ultrafast -crf 28 -c:a aac -b:a 128k -pix_fmt yuv420p -y "$DEMO_DIR/neon_waves.mp4"
fi

# 2. WebM Video (Cyber Matrix - VP9 + Opus)
if [ ! -f "$DEMO_DIR/cyber_matrix.webm" ]; then
    echo "   ▶️ Generating WebM (Cyber Matrix)..."
    "$FFMPEG_BIN" -f lavfi -i "cellauto=s=854x480:r=30:rule=30,format=yuv420p" -f lavfi -i "anoisesrc=d=15:c=pink:r=48000:a=0.05" -c:v vp8 -b:v 1M -c:a libopus -b:a 96k -t 15 -y "$DEMO_DIR/cyber_matrix.webm" || true
fi

# 3. HLS Adaptive Stream (.m3u8)
if [ ! -f "$DEMO_DIR/hls/cyber_grid.m3u8" ]; then
    echo "   ▶️ Generating HLS (Cyber Grid)..."
    mkdir -p "$DEMO_DIR/hls"
    "$FFMPEG_BIN" -f lavfi -i "smptebars=size=854x480:rate=30:duration=15" -f lavfi -i "sine=frequency=330:duration=15" -c:v libx264 -preset ultrafast -crf 28 -c:a aac -b:a 128k -pix_fmt yuv420p -f hls -hls_time 3 -hls_list_size 0 -y "$DEMO_DIR/hls/cyber_grid.m3u8"
fi

# 4. MPEG-DASH Adaptive Stream (.mpd)
if [ ! -f "$DEMO_DIR/dash/fractal_dash.mpd" ]; then
    echo "   ▶️ Generating DASH (Fractal Engine)..."
    mkdir -p "$DEMO_DIR/dash"
    "$FFMPEG_BIN" -f lavfi -i "mandelbrot=size=854x480:rate=30" -f lavfi -i "sine=frequency=220:duration=15" -t 15 -c:v libx264 -preset ultrafast -crf 28 -c:a aac -b:a 128k -pix_fmt yuv420p -f dash -y "$DEMO_DIR/dash/fractal_dash.mpd"
fi

# 5. Lossless FLAC Audio
if [ ! -f "$DEMO_DIR/audio_lossless.flac" ]; then
    echo "   ▶️ Generating FLAC (Lossless 48kHz)..."
    "$FFMPEG_BIN" -f lavfi -i "sine=frequency=528:duration=20,volume=0.4" -c:a flac -sample_fmt s16 -y "$DEMO_DIR/audio_lossless.flac"
fi

# 6. MP3 High-Fidelity Audio
if [ ! -f "$DEMO_DIR/audio_synthwave.mp3" ]; then
    echo "   ▶️ Generating MP3 (High-Fidelity Stereo)..."
    "$FFMPEG_BIN" -f lavfi -i "sine=frequency=432:duration=20,volume=0.5" -c:a libmp3lame -b:a 320k -y "$DEMO_DIR/audio_synthwave.mp3" || \
    "$FFMPEG_BIN" -f lavfi -i "sine=frequency=432:duration=20,volume=0.5" -c:a mp2 -b:a 320k -y "$DEMO_DIR/audio_synthwave.mp3" || true
fi

# 7. PCM WAV Audio
if [ ! -f "$DEMO_DIR/audio_pulse.wav" ]; then
    echo "   ▶️ Generating WAV (48kHz Stereo Pulse)..."
    "$FFMPEG_BIN" -f lavfi -i "sine=frequency=396:duration=15,volume=0.5" -c:a pcm_s16le -y "$DEMO_DIR/audio_pulse.wav"
fi

echo "✅ All Test Media Assets Generated!"
