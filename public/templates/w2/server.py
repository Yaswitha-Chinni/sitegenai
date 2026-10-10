import os
import sys
import mimetypes
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import unquote, urlparse

PORT = 8000

class RangeHTTPRequestHandler(BaseHTTPRequestHandler):
    def translate_path(self, path):
        path = urlparse(path).path
        path = unquote(path)
        path = path.lstrip('/')
        if not path:
            path = 'index.html'
        return os.path.abspath(path)

    def do_GET(self):
        filepath = self.translate_path(self.path)
        if not os.path.exists(filepath) or os.path.isdir(filepath):
            self.send_error(404, "File not found")
            return

        file_size = os.path.getsize(filepath)
        content_type, _ = mimetypes.guess_type(filepath)
        if content_type is None:
            content_type = 'application/octet-stream'

        range_header = self.headers.get('Range')

        if range_header:
            # Handle Range: bytes=start-end
            try:
                ranges = range_header.replace('bytes=', '').split('-')
                start = int(ranges[0]) if ranges[0] else 0
                end = int(ranges[1]) if ranges[1] else file_size - 1
                if start >= file_size or end >= file_size or start > end:
                    self.send_error(416, "Requested Range Not Satisfiable")
                    return

                length = end - start + 1
                self.send_response(206)
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Range', f'bytes {start}-{end}/{file_size}')
                self.send_header('Content-Length', str(length))
                self.send_header('Accept-Ranges', 'bytes')
                self.send_header('Cache-Control', 'no-cache')
                self.end_headers()

                with open(filepath, 'rb') as f:
                    f.seek(start)
                    chunk_size = 64 * 1024
                    remaining = length
                    while remaining > 0:
                        read_size = min(chunk_size, remaining)
                        data = f.read(read_size)
                        if not data:
                            break
                        self.wfile.write(data)
                        remaining -= len(data)
            except Exception as e:
                # Client closed connection early or error
                pass
        else:
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(file_size))
            self.send_header('Accept-Ranges', 'bytes')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()

            try:
                with open(filepath, 'rb') as f:
                    chunk_size = 64 * 1024
                    while True:
                        data = f.read(chunk_size)
                        if not data:
                            break
                        self.wfile.write(data)
            except Exception:
                pass

    def do_HEAD(self):
        filepath = self.translate_path(self.path)
        if not os.path.exists(filepath) or os.path.isdir(filepath):
            self.send_error(404, "File not found")
            return

        file_size = os.path.getsize(filepath)
        content_type, _ = mimetypes.guess_type(filepath)
        self.send_response(200)
        self.send_header('Content-Type', content_type or 'application/octet-stream')
        self.send_header('Content-Length', str(file_size))
        self.send_header('Accept-Ranges', 'bytes')
        self.end_headers()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    server = HTTPServer(('127.0.0.1', port), RangeHTTPRequestHandler)
    print(f"BRUVA Coffee Server listening on http://127.0.0.1:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
