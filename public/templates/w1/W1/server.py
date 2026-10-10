import http.server
import socketserver
import os
import sys
import mimetypes
import re

PORT = 3000

mimetypes.init()
mimetypes.add_type('video/mp4', '.mp4')
mimetypes.add_type('image/png', '.png')
mimetypes.add_type('image/jpeg', '.jpeg')
mimetypes.add_type('image/jpeg', '.jpg')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/html', '.html')

class VideoRangeHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """
    HTTP Request Handler with support for byte-range requests (HTTP 206 Partial Content),
    critical for smooth HTML5 video streaming and seeking.
    """
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, must-revalidate')
        super().end_headers()

    def send_head(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path) or os.path.isdir(path):
            return super().send_head()
        
        range_header = self.headers.get('Range')
        if not range_header or not range_header.startswith('bytes='):
            return super().send_head()
        
        file_size = os.path.getsize(path)
        m = re.match(r'bytes=(\d+)-(\d*)', range_header)
        if not m:
            return super().send_head()
        
        start = int(m.group(1))
        end = int(m.group(2)) if m.group(2) else file_size - 1
        if start >= file_size or end >= file_size or start > end:
            self.send_error(416, 'Requested Range Not Satisfiable')
            return None
        
        length = end - start + 1
        self.send_response(206)
        ctype = self.guess_type(path)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Range', f'bytes {start}-{end}/{file_size}')
        self.send_header('Content-Length', str(length))
        self.send_header('Accept-Ranges', 'bytes')
        self.end_headers()
        
        f = open(path, 'rb')
        f.seek(start)
        
        class RangeWrapper:
            def __init__(self, fp, length):
                self.fp = fp
                self.remaining = length
            def read(self, size=-1):
                if self.remaining <= 0:
                    return b''
                if size < 0 or size > self.remaining:
                    size = self.remaining
                data = self.fp.read(size)
                self.remaining -= len(data)
                return data
            def close(self):
                self.fp.close()
                
        return RangeWrapper(f, length)

def run():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    socketserver.TCPServer.allow_reuse_address = True
    with http.server.ThreadingHTTPServer(('127.0.0.1', PORT), VideoRangeHTTPRequestHandler) as httpd:
        print(f"COCO POUR Server running at http://localhost:{PORT}")
        print("Supporting HTTP 206 Byte-Range streaming for videos.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

if __name__ == '__main__':
    run()
