"""
Lorapok CLI Command Runner
"""

import click
import sys
import os
from .player import play, inspect_media, create_playlist
from .server import MediaStreamServer

@click.group()
@click.version_option(version="2.0.0", prog_name="lorapok")
def main():
    """Lorapok Media Engine & Universal Streaming CLI"""
    pass

@main.command()
@click.argument("target", required=True)
@click.option("--web", is_flag=True, help="Force opening in web player instead of desktop")
def play_cmd(target: str, web: bool):
    """Play a media file, folder, or stream URL."""
    try:
        play(target, desktop=not web)
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)

@main.command()
@click.argument("target", required=True)
def inspect(target: str):
    """Inspect media format and stream properties."""
    info = inspect_media(target)
    click.echo("--- Lorapok Media Inspection ---")
    click.echo(f"URL/Path: {info.url}")
    click.echo(f"Format:   {info.format}")
    click.echo(f"Stream:   {'Yes' if info.is_stream else 'No'}")

@main.command()
@click.argument("directory", default=".", type=click.Path(exists=True, file_okay=False, dir_okay=True))
@click.option("--port", default=8080, help="Port to bind server")
def serve(directory: str, port: int):
    """Serve media files locally for streaming to Lorapok Player."""
    server = MediaStreamServer(directory=directory, port=port)
    server.start(block=True)

@main.command()
@click.argument("files", nargs=-1, required=True)
@click.option("-o", "--output", default="playlist.m3u8", help="Output playlist file")
def playlist(files, output):
    """Generate an M3U8 playlist from media files."""
    create_playlist(list(files), output_m3u_path=output)
    click.echo(f"Playlist generated at: {output}")

if __name__ == "__main__":
    main()
