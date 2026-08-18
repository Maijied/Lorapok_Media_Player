# Lorapok PHP / Composer Package (`lorapok/player`)

Lorapok Neural Media Engine & Web Player Integration for PHP, Laravel, and Symfony.

## Installation

```bash
composer require lorapok/player
```

## Quick Start

### 1. Render Player in PHP / Blade / Twig

```php
use Lorapok\LorapokPlayer;

// Render full interactive player with ambient lighting
echo LorapokPlayer::create("https://example.com/stream.m3u8", [
    'autoPlay' => true,
    'ambientLighting' => true,
    'width' => '100%',
    'height' => '540px'
]);
```

### 2. Generate Adaptive HLS Playlists

```php
use Lorapok\HlsGenerator;

$masterM3u8 = HlsGenerator::createMasterPlaylist([
    ['bandwidth' => 3000000, 'resolution' => '1920x1080', 'url' => '/hls/1080p.m3u8'],
    ['bandwidth' => 1500000, 'resolution' => '1280x720',  'url' => '/hls/720p.m3u8'],
    ['bandwidth' => 800000,  'resolution' => '854x480',   'url' => '/hls/480p.m3u8']
]);
```

## License
MIT License • Lorapok Labs (https://media.lorapok.tech)
