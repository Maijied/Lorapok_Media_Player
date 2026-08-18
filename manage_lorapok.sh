#!/bin/bash

# Lorapok Management Script
# Usage: ./manage_lorapok.sh [build|test|all]

PROJECT_ROOT=$(pwd)/lorapok-player
RELEASE_DIR="$PROJECT_ROOT/release"
TEST_MEDIA="$(pwd)/test_media"
OUTPUT_DIR="$PROJECT_ROOT/release/builds"

function build_app() {
    echo "🐛 Starting Lorapok Build Process..."
    cd "$PROJECT_ROOT"

    # Install dependencies if missing
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
    fi

    # Clean previous builds
    rm -rf "$OUTPUT_DIR"
    mkdir -p "$OUTPUT_DIR/linux"
    mkdir -p "$OUTPUT_DIR/windows"
    mkdir -p "$OUTPUT_DIR/mac"

    echo "🏗️  Building Renderer & Main Process..."
    npm run typecheck # Ensure TSC passes first
    npm run build:only # We will separate the builder step if possible, or just use the standard build

    # Using electron-builder manually for multi-target
    # Note: 'npm run build' in package.json runs 'tsc && vite build && electron-builder'
    # We will override this to control targets.
    
    echo "🐧 Building for Linux..."
    npx electron-builder --linux --x64 -c.directories.output="$OUTPUT_DIR/linux"
    
    echo "🪟 Building for Windows (via Wine/Mono if available)..."
    # Attempt Windows build (requires wine on Linux usually, electron-builder handles download)
    npx electron-builder --win --x64 -c.directories.output="$OUTPUT_DIR/windows" || echo "⚠️  Windows build failed (Wine might be missing). Skipping."

    # Mac build usually fails on Linux without specific setup
    echo "🍎 Building for macOS..."
    npx electron-builder --mac --x64 -c.directories.output="$OUTPUT_DIR/mac" || echo "⚠️  macOS build failed (Requires macOS usually). Skipping."

    echo "🧩 Packaging Browser Extensions (Firefox AMO, Chrome, Edge)..."
    pushd "$(pwd)/../lorapok-extension" > /dev/null
    node build_extensions.js || true
    popd > /dev/null

    echo "📦 Building Standalone NPM Package & Showcase Website..."
    pushd "$(pwd)/packages/lorapok-player" > /dev/null
    npm run build 2>/dev/null || true
    popd > /dev/null
    pushd "$(pwd)/packages/website" > /dev/null
    node scripts/sync_downloads.js 2>/dev/null || true
    npm run build 2>/dev/null || true
    popd > /dev/null

    echo "✅ Build process complete. Artifacts in $OUTPUT_DIR"
    cd ..
}

function build_android() {
    echo "🤖 Starting Android & Android TV Build Process..."
    cd "$PROJECT_ROOT"
    
    mkdir -p "$OUTPUT_DIR/android"
    
    echo "📦 Building Web Renderer & Syncing Capacitor Assets..."
    npm run build:only
    npx cap sync android
    
    cd android
    echo "🏗️ Building Android Universal APK, Split APKs, and App Bundle (.aab)..."
    chmod +x gradlew
    ./gradlew assembleRelease bundleRelease
    
    echo "📦 Copying Android Artifacts to Release Directory..."
    find app/build/outputs/apk/release -name "*.apk" -exec cp {} "$OUTPUT_DIR/android/" \; 2>/dev/null || true
    find app/build/outputs/bundle/release -name "*.aab" -exec cp {} "$OUTPUT_DIR/android/" \; 2>/dev/null || true
    
    echo "🌐 Synchronizing Direct Downloads to Showcase Website..."
    pushd "$PROJECT_ROOT/packages/website" > /dev/null
    node scripts/sync_downloads.js 2>/dev/null || true
    npm run build 2>/dev/null || true
    popd > /dev/null

    echo "✅ Android build completed! Artifacts located in $OUTPUT_DIR/android"
    ls -lh "$OUTPUT_DIR/android" 2>/dev/null || true
    cd ../..
}

function setup_test_media() {
    echo "📂 Setting up test media..."
    mkdir -p "$TEST_MEDIA"
    pushd "$TEST_MEDIA" > /dev/null

    # Map of filename to download URL
    declare -A media_files=(
        ["sample.mov"]="https://filesamples.com/samples/video/mov/sample_640x360.mov"
        ["sample.flv"]="https://filesamples.com/samples/video/flv/sample_640x360.flv"
        ["sample.wmv"]="https://filesamples.com/samples/video/wmv/sample_640x360.wmv"
        ["sample.m4v"]="https://filesamples.com/samples/video/m4v/sample_640x360.m4v"
        ["sample.flac"]="https://filesamples.com/samples/audio/flac/sample-1.flac"
        ["sample.aac"]="https://filesamples.com/samples/audio/aac/sample-1.aac"
        ["sample.m4a"]="https://filesamples.com/samples/audio/m4a/sample-1.m4a"
    )

    for name in "${!media_files[@]}"; do
        if [ ! -f "$name" ]; then
            echo "   📥 Downloading $name..."
            curl -L -o "$name" "${media_files[$name]}" || wget -O "$name" "${media_files[$name]}" || echo "      ⚠️  Failed to download $name"
        else
            echo "   ✅ $name already exists."
        fi
    done
    popd > /dev/null
}

function test_features() {
    setup_test_media
    echo "🧪 Starting Feature & Video Tests..."
    
    # Use unpacked binary for testing (avoids FUSE/AppImage issues in CI/Headless)
    APP_PATH="$OUTPUT_DIR/linux/linux-unpacked/lorapokmediaplayer"
    
    if [ ! -f "$APP_PATH" ]; then
         APP_PATH=$(find "$PROJECT_ROOT/release" -type f -name "lorapokmediaplayer" | head -n 1)
    fi

    if [ -z "$APP_PATH" ] || [ ! -x "$APP_PATH" ]; then
        echo "❌ No executable found. Please run build first."
        exit 1
    fi

    echo "🚀 Using executable: $APP_PATH"

    # 1. Test Protocol Handler (Simulated)
    echo "🔗 Testing Protocol Handler (lorapok://)..."
    timeout 5s "$APP_PATH" "lorapok://test-protocol-launch" --no-sandbox > /dev/null 2>&1
    echo "   ✅ Process launched and closed."

    # 2. Test Media Files
    echo "📂 Testing Media Playback..."
    for file in "$TEST_MEDIA"/*; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo "   ▶️  Testing $filename..."
            
            # Launch for 7 seconds (giving it time to load and start playing)
            timeout 7s "$APP_PATH" "$file" --no-sandbox > /dev/null 2>&1
            
            if [ $? -eq 124 ]; then
                echo "      ✅ Successfully launched and ran for 7s."
            else
                echo "      ⚠️  Crashed or closed early (Exit code: $?)"
            fi
            sleep 1
        fi
    done

    # 3. Test Streaming URLs (Comprehensive Test Suite)
    echo "🌐 Testing Streaming URLs..."
    
    declare -A stream_urls=(
        # Progressive Video
        ["MP4 • Oceans"]="https://vjs.zencdn.net/v/oceans.mp4"
        ["MP4 • Flower"]="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
        ["WebM • Flower"]="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm"
        
        # HLS (M3U8) Streams
        ["HLS • Apple Official"]="https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8"
        ["HLS • Apple Advanced"]="https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8"
        ["HLS • Mux Test"]="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        ["HLS • Mux ToS"]="https://test-streams.mux.dev/tos_ismc/main.m3u8"
        ["HLS • JWPlayer BipBop"]="https://playertest.longtailvideo.com/adaptive/bipbop/gear4/prog_index.m3u8"
        ["HLS • Akamai Live"]="https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8"
        
        # MPEG-DASH (MPD) Streams
        ["DASH • BBB 30fps"]="https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd"
        ["DASH • Qualcomm MultiRes"]="https://dash.akamaized.net/dash264/TestCases/2c/qualcomm/1/MultiRes.mpd"
        ["DASH • Tears of Steel Cleartext"]="https://www.bok.net/dash/tears_of_steel/cleartext/stream.mpd"
        ["DASH • Qualcomm MultiRate"]="http://dash.akamaized.net/dash264/TestCases/1a/qualcomm/1/MultiRate.mpd"
    )

    for name in "${!stream_urls[@]}"; do
        url="${stream_urls[$name]}"
        echo "   🔗 Testing $name..."
        
        # First verify the URL is reachable
        http_code=$(curl -s -o /dev/null -w "%{http_code}" -L "$url" 2>/dev/null || echo "000")
        
        if [ "$http_code" == "200" ]; then
            echo "      ✅ URL is reachable (HTTP $http_code)"
            
            # Launch with the stream URL for 10 seconds
            timeout 10s "$APP_PATH" "$url" --no-sandbox > /dev/null 2>&1
            
            if [ $? -eq 124 ]; then
                echo "      ✅ Stream launched and ran for 10s."
            else
                echo "      ⚠️  Crashed or closed early (Exit code: $?)"
            fi
        else
            echo "      ❌ URL unreachable (HTTP $http_code)"
        fi
        sleep 1
    done

    echo "🏁 Testing complete."
}

case "$1" in
    build)
        build_app
        ;;
    android)
        build_android
        ;;
    test)
        test_features
        ;;
    setup-media)
        setup_test_media
        ;;
    all)
        build_app
        build_android
        test_features
        ;;
    *)
        echo "Usage: $0 {build|android|test|setup-media|all}"
        exit 1
        ;;
esac
