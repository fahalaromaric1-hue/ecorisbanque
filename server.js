const http = require('http');
const fs = require('fs');
const path = require('path');
const store = require('./db');

const PORT = Number(process.env.PORT) || 8765;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function sendJson(req, res, status, payload, extraHeaders) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...corsHeaders(req),
  };
  if (extraHeaders) Object.assign(headers, extraHeaders);
  res.writeHead(status, headers);
  res.end(JSON.stringify(payload));
}

function corsHeaders(req) {
  const origin = req.headers.origin;
  if (!origin) return {};
  const allowed =
    origin === 'https://fahalaromaric1-hue.github.io' ||
    origin.startsWith('http://127.0.0.1:') ||
    origin.startsWith('http://localhost:');
  if (!allowed) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, If-Match',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Expose-Headers': 'X-Accounts-Revision',
    Vary: 'Origin',
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 5_000_000) {
        reject(new Error('Corps de requête trop volumineux'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const basename = path.basename(urlPath);

  const blocked =
    basename === 'accounts.json' ||
    basename === 'server.js' ||
    basename === 'db.js' ||
    basename === 'render.yaml' ||
    urlPath === '/data' ||
    urlPath.startsWith('/data/') ||
    basename.endsWith('.sqlite') ||
    basename.endsWith('.sqlite-wal') ||
    basename.endsWith('.sqlite-shm');
  if (blocked) {
    sendJson(req, res, 404, { error: 'Fichier introuvable' });
    return;
  }

  const filePath = path.normalize(path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath));

  if (!filePath.startsWith(ROOT)) {
    sendJson(req, res, 403, { error: 'Accès refusé' });
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(err.code === 'ENOENT' ? 404 : 500);
      res.end(err.code === 'ENOENT' ? 'Fichier introuvable' : 'Erreur serveur');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const headers = { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' };
    if (ext === '.html' || ext === '.js' || ext === '.css') headers['Cache-Control'] = 'no-store';
    res.writeHead(200, headers);
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const pathname = (req.url || '').split('?')[0];

  if (req.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    res.writeHead(204, corsHeaders(req));
    res.end();
    return;
  }

  if (pathname === '/api/health' && req.method === 'GET') {
    sendJson(req, res, 200, { ok: true, storage: store.STORAGE || 'sqlite' });
    return;
  }

  if (pathname === '/api/geo' && req.method === 'GET') {
    const raw =
      req.headers['cf-ipcountry'] ||
      req.headers['x-vercel-ip-country'] ||
      req.headers['x-country-code'] ||
      req.headers['cloudfront-viewer-country'] ||
      null;
    const code =
      raw && String(raw).trim() && String(raw).toUpperCase() !== 'XX'
        ? String(raw).trim().toUpperCase()
        : null;
    sendJson(req, res, 200, { country_code: code });
    return;
  }

  if (pathname === '/api/accounts' && req.method === 'GET') {
    try {
      const revision = await store.getRevision();
      sendJson(req, res, 200, await store.loadAccounts(), { 'X-Accounts-Revision': String(revision) });
    } catch (error) {
      sendJson(req, res, error.status || 500, { error: error.message || 'Erreur serveur' });
    }
    return;
  }

  if (pathname === '/api/accounts' && req.method === 'PUT') {
    try {
      const body = await readBody(req);
      const parsed = JSON.parse(body);
      if (!Array.isArray(parsed) || !parsed.length) {
        sendJson(req, res, 400, { error: 'Données invalides' });
        return;
      }
      const expectedRevision = revisionFromHeader(req.headers['if-match']);
      if (expectedRevision == null) {
        sendJson(req, res, 428, { error: 'Version des données manquante.' });
        return;
      }
      const result = await store.writeAccounts(parsed, {
        checkRevision: true,
        expectedRevision,
      });
      sendJson(req, res, 200, { ok: true, revision: result.revision, accounts: result.accounts }, {
        'X-Accounts-Revision': String(result.revision),
      });
    } catch (error) {
      const status = error instanceof SyntaxError ? 400 : error.status || 500;
      const message = error instanceof SyntaxError ? 'Données invalides' : error.message || 'Erreur serveur';
      const payload = { error: message };
      const headers = {};
      if (status === 409) {
        payload.revision = error.revision;
        payload.accounts = error.accounts;
        if (error.revision != null) headers['X-Accounts-Revision'] = String(error.revision);
      }
      sendJson(req, res, status, payload, headers);
    }
    return;
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    serveStatic(req, res);
    return;
  }

  sendJson(req, res, 405, { error: 'Méthode non autorisée' });
});

function revisionFromHeader(value) {
  if (value == null) return null;
  const normalized = String(value).trim().replace(/^"|"$/g, '');
  if (!/^\d+$/.test(normalized)) return null;
  return Number(normalized);
}

function start() {
  Promise.resolve()
    .then(() => store.initStore())
    .then(() => {
      server.listen(PORT, HOST, () => {
        console.log(`Ecorise Banque : http://${HOST}:${PORT}`);
        console.log(`Stockage : ${store.STORAGE || 'sqlite'} (${store.DB_FILE})`);
      });
    })
    .catch(error => {
      console.error('Impossible d’initialiser la base de données :', error);
      process.exit(1);
    });
}

start();
