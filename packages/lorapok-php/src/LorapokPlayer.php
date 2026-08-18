<?php

namespace Lorapok;

/**
 * Lorapok PHP Media Player Component
 * Provides seamless embedding and player rendering for PHP web applications.
 */
class LorapokPlayer
{
    private string $src;
    private bool $autoPlay;
    private bool $ambientLighting;
    private string $theme;
    private string $width;
    private string $height;
    private array $customAttributes;

    public function __construct(string $src = "", array $options = [])
    {
        $this->src = $src;
        $this->autoPlay = $options['autoPlay'] ?? false;
        $this->ambientLighting = $options['ambientLighting'] ?? true;
        $this->theme = $options['theme'] ?? 'Midnight Core';
        $this->width = $options['width'] ?? '100%';
        $this->height = $options['height'] ?? '500px';
        $this->customAttributes = $options['attributes'] ?? [];
    }

    public static function create(string $src = "", array $options = []): self
    {
        return new self($src, $options);
    }

    public function setSrc(string $src): self
    {
        $this->src = $src;
        return $this;
    }

    public function render(): string
    {
        $params = http_build_query([
            'embed' => 'true',
            'stream' => $this->src,
            'autoplay' => $this->autoPlay ? 'true' : 'false',
            'ambient' => $this->ambientLighting ? 'true' : 'false',
            'theme' => $this->theme,
        ]);

        $iframeSrc = "https://media.lorapok.tech/?" . $params;

        return <<<HTML
<div class="lorapok-player-wrapper" style="position: relative; width: {$this->width}; height: {$this->height}; border-radius: 16px; overflow: hidden; background: #050510; border: 1px solid rgba(0, 243, 255, 0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
    <iframe
        src="{$iframeSrc}"
        width="100%"
        height="100%"
        frameborder="0"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowfullscreen
        style="border: none; width: 100%; height: 100%; display: block;"
    ></iframe>
</div>
HTML;
    }

    public function __toString(): string
    {
        return $this->render();
    }
}
