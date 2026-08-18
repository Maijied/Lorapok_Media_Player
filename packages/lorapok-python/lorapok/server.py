"""
Simple Local Media Streaming Server for Lorapok
"""

import http.server
import socketserver
import os
import threading
from typing import Optional

class MediaStreamServer:
    def __init__(self, directory: str = ".", port: int = 8080):
        self.directory = os.path.abspath(directory)
        self.port = port
        self.httpd: Optional[socketserver.TCPServer] = None
        self._thread: Optional[threading.Thread] = None

    def start(self, block: bool = True):
        handler = lambda *args, **kwargs: http.server.SimpleHTTPRequestHandler(
            *args, directory=self.directory, **kwargs
        )
        
        # Enable Range requests & CORS
        class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
            def end_headers(self):
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
                self.send_header("Access-Control-Allow-Headers", "Range, Content-Type")
                super().end_headers()

        self.httpd = socketserver.TCPServer(("", self.port), CORSRequestHandler)
        print(f"📡 Lorapok Media Server running at http://localhost:{self.port}/ from '{self.directory}'")

        if block:
            try:
                self.httpd.serve_forever()
            except KeyboardInterrupt:
                self.stop()
        else:
            self._thread = threading.Thread(target=self.httpd.serve_forever, daemon=True)
            self._thread.start()

    def stop(self):
        if self.httpd:
            self.httpd.shutdown()
            self.httpd.server_close()
            print("🛑 Server stopped.")
