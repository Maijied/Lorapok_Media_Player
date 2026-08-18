<?php

namespace Lorapok;

/**
 * Utility to generate and serve HLS (.m3u8) Playlists in PHP
 */
class HlsGenerator
{
    /**
     * Generate Master M3U8 Playlist
     */
    public static function createMasterPlaylist(array $streams): string
    {
        $out = "#EXTM3U\n#EXT-X-VERSION:3\n";
        foreach ($streams as $stream) {
            $bandwidth = $stream['bandwidth'] ?? 2000000;
            $resolution = $stream['resolution'] ?? '1920x1080';
            $url = $stream['url'];
            $out .= "#EXT-X-STREAM-INF:BANDWIDTH={$bandwidth},RESOLUTION={$resolution}\n";
            $out .= "{$url}\n";
        }
        return $out;
    }

    /**
     * Generate Media Segment Playlist
     */
    public static function createMediaPlaylist(array $segments, float $targetDuration = 6.0): string
    {
        $out = "#EXTM3U\n";
        $out .= "#EXT-X-VERSION:3\n";
        $out .= "#EXT-X-TARGETDURATION:" . ceil($targetDuration) . "\n";
        $out .= "#EXT-X-MEDIA-SEQUENCE:0\n";

        foreach ($segments as $seg) {
            $dur = $seg['duration'] ?? $targetDuration;
            $url = $seg['url'];
            $out .= "#EXTINF:{$dur},\n";
            $out .= "{$url}\n";
        }

        $out .= "#EXT-X-ENDLIST\n";
        return $out;
    }
}
