<?php

namespace Lorapok\Tests;

require_once __DIR__ . '/../src/LorapokPlayer.php';
require_once __DIR__ . '/../src/HlsGenerator.php';

use Lorapok\LorapokPlayer;
use Lorapok\HlsGenerator;

class StreamTest {
    public static function run() {
        echo "🧪 Testing Lorapok PHP SDK v2.0.0...\n";
        
        $player = new LorapokPlayer('https://media.lorapok.tech/demos/neon_waves.mp4', [
            'theme' => 'Midnight Core',
            'autoPlay' => false
        ]);
        
        $html = $player->render();
        assert(strpos($html, 'lorapok-player-wrapper') !== false, 'Player container must render');
        assert(strpos($html, 'neon_waves.mp4') !== false, 'Stream URL must be embedded');
        
        $manifest = HlsGenerator::createMasterPlaylist([
            ['resolution' => '1920x1080', 'bandwidth' => 5000000, 'url' => '1080p.m3u8'],
            ['resolution' => '1280x720', 'bandwidth' => 2500000, 'url' => '720p.m3u8']
        ]);
        assert(strpos($manifest, '#EXTM3U') !== false, 'Master playlist header must exist');
        assert(strpos($manifest, '1920x1080') !== false, 'Resolution metadata must be present');
        
        echo "✅ All Lorapok PHP unit checks passed successfully.\n";
    }
}

if (php_sapi_name() === 'cli' && realpath(__FILE__) === realpath($_SERVER['SCRIPT_FILENAME'])) {
    StreamTest::run();
}
