"""Yerel geliştirme sunucusu: siteyi sunar ve video kaydını /upload ile video/kayit.webm'e yazar.
Çalıştır (yetenek-vitrini klasöründen): python3 video/sunucu.py   →  http://localhost:8765/index.html?kayit=1
"""
import http.server, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "video" / "kayit.webm"


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(ROOT), **k)

    def do_PUT(self):
        if not self.path.startswith("/upload"):
            self.send_error(404)
            return
        n = int(self.headers.get("Content-Length", 0))
        OUT.write_bytes(self.rfile.read(n))
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"ok")
        print(f"kayit kaydedildi: {OUT} ({n/1e6:.1f} MB)")

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    print("http://localhost:8765/index.html?kayit=1")
    http.server.ThreadingHTTPServer(("127.0.0.1", 8765), Handler).serve_forever()
