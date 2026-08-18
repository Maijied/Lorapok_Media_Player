"""
Lorapok Player Control & Embedding API
"""

import os
import sys
import webbrowser
import subprocess
import json
from typing import Optional, List, Dict, Any

class MediaInfo:
    def __init__(self, url: str, format_type: str, duration: float = 0.0, is_stream: bool = False):
        self.url = url
        self.format = format_type
        self.duration = duration
        self.is_stream = is_stream

    def to_dict(self) -> Dict[str, Any]:
        return {
            "url": self.url,
            "format": self.format,
            "duration": self.duration,
            "is_stream": self.is_stream,
        }

def play(target: str, desktop: bool = True) -> bool:
    """
    Open media target (URL, file path, or folder) in Lorapok Desktop or Web Player.
    """
    target = str(target).strip()
    
    # Check if target is a protocol or URL
    if target.startswith("http://") or target.startswith("https://") or target.startswith("media://"):
        url = target
    else:
        abs_path = os.path.abspath(target)
        if not os.path.exists(abs_path):
            raise FileNotFoundError(f"Media file or folder not found: {abs_path}")
        url = f"file://{abs_path}"

    if desktop:
        # Try custom protocol lorapok://
        proto_url = f"lorapok://{url}"
        try:
            if sys.platform == "darwin":
                subprocess.run(["open", proto_url], check=True)
                return True
            elif sys.platform.startswith("linux"):
                subprocess.run(["xdg-open", proto_url], check=True)
                return True
            elif sys.platform == "win32":
                os.startfile(proto_url)
                return True
        except Exception:
            pass

    # Fallback to Web Player on media.lorapok.tech
    web_url = f"https://media.lorapok.tech/?stream={url}"
    webbrowser.open(web_url)
    return True

def render_player(src: str, auto_play: bool = True, ambient_glow: bool = True, width: str = "100%", height: str = "480px") -> str:
    """
    Generate self-contained HTML embed code for Lorapok Web Player.
    """
    return f"""
    <div style="width: {width}; height: {height}; background: #050510; border-radius: 16px; overflow: hidden; border: 1px solid rgba(0,243,255,0.2);">
        <iframe
            src="https://media.lorapok.tech/?embed=true&stream={src}&autoplay={str(auto_play).lower()}&ambient={str(ambient_glow).lower()}"
            width="100%"
            height="100%"
            frameborder="0"
            allow="autoplay; fullscreen; encrypted-media"
            style="border: none;"
        ></iframe>
    </div>
    """

def inspect_media(path_or_url: str) -> MediaInfo:
    """
    Determine format and stream characteristics of given media.
    """
    target = str(path_or_url).strip()
    ext = target.split("?")[0].split(".")[-1].lower()
    is_stream = target.startswith("http://") or target.startswith("https://")
    
    format_map = {
        "m3u8": "HLS Adaptive Stream",
        "mpd": "MPEG-DASH Stream",
        "mp4": "MPEG-4 Video",
        "webm": "WebM Video (VP9/AV1)",
        "mkv": "Matroska Multimedia",
        "flac": "Lossless FLAC Audio",
        "mp3": "MP3 Audio",
        "wav": "PCM WAV Audio",
        "aac": "Advanced Audio Coding",
    }
    format_type = format_map.get(ext, "Unknown / Dynamic Stream")
    return MediaInfo(url=target, format_type=format_type, is_stream=is_stream)

def create_playlist(media_files: List[str], output_m3u_path: Optional[str] = None) -> str:
    """
    Generate an M3U8 playlist from list of files/URLs.
    """
    lines = ["#EXTM3U", "#PLAYLIST:Lorapok Playlist"]
    for item in media_files:
        name = os.path.basename(item) if not item.startswith("http") else item
        lines.append(f"#EXTINF:-1,{name}")
        lines.append(item)
    
    content = "\n".join(lines) + "\n"
    if output_m3u_path:
        with open(output_m3u_path, "w", encoding="utf-8") as f:
            f.write(content)
    return content
