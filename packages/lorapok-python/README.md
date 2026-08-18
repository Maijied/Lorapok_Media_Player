# Lorapok Python SDK & CLI (`lorapok`)

Universal media streaming, transcoding, and player control toolkit for Python.

## Installation

```bash
pip install lorapok
```

## Quick Start

### 1. Launch Player via Python CLI

```bash
# Play local video or online stream in Lorapok Desktop or Web Player
lorapok play https://example.com/live/stream.m3u8

# Play local folder as playlist
lorapok play ./movies/

# Start local media streaming server
lorapok serve ./media/ --port 8080
```

### 2. Python API

```python
import lorapok

# Open stream in desktop or browser player
lorapok.play("https://example.com/stream.m3u8")

# Generate embeddable HTML player
html_snippet = lorapok.render_player(
    src="https://example.com/stream.m3u8",
    auto_play=True,
    ambient_glow=True
)

# Inspect media stream metadata
info = lorapok.inspect_media("https://example.com/stream.m3u8")
print(f"Format: {info.format}, Duration: {info.duration}")
```

## License
MIT License • Lorapok Labs (https://media.lorapok.tech)
