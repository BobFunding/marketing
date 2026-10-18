import http from 'node:http';
import { readFile } from 'node:fs/promises';
const assets = new Map([['/', ['index.html', 'text/html; charset=utf-8']], ['/app.js', ['app.js', 'text/javascript; charset=utf-8']], ['/style.css', ['style.css', 'text/css; charset=utf-8']]]);
export const server = http.createServer(async (req, res) => {
  const asset = assets.get(new URL(req.url, 'http://localhost').pathname);
  if (!asset || !['GET', 'HEAD'].includes(req.method)) { res.writeHead(404); return res.end('Not found'); }
  try { const body = await readFile(new URL(`public/${asset[0]}`, import.meta.url)); res.writeHead(200, {'Content-Type': asset[1], 'X-Content-Type-Options': 'nosniff'}); res.end(req.method === 'HEAD' ? undefined : body); }
  catch { res.writeHead(500); res.end('Unable to load asset'); }
});
if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) server.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('GEO audit server ready'));
