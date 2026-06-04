const http = require('http');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const PORT = Number(process.env.PORT) || 8765;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;
const ACCOUNTS_FILE = path.join(ROOT, 'accounts.json');
const USE_DATABASE = Boolean(process.env.DATABASE_URL);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

let pool = null;

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
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

function readSeedAccounts() {
  const raw = fs.readFileSync(ACCOUNTS_FILE, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.length) {
    throw new Error('accounts.json invalide');
  }
  return parsed;
}

async function initDatabase() {
  if (!USE_DATABASE) return;

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounts_store (
      id INT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const existing = await pool.query('SELECT 1 FROM accounts_store WHERE id = 1');
  if (!existing.rowCount) {
    await pool.query('INSERT INTO accounts_store (id, data) VALUES (1, $1)', [
      JSON.stringify(readSeedAccounts()),
    ]);
    console.log('Base PostgreSQL initialisée avec accounts.json');
  }
}

async function loadAccounts() {
  if (!USE_DATABASE) {
    return readSeedAccounts();
  }

  const result = await pool.query('SELECT data FROM accounts_store WHERE id = 1');
  if (!result.rowCount) {
    const seed = readSeedAccounts();
    await saveAccounts(seed);
    return seed;
  }

  return result.rows[0].data;
}

async function saveAccounts(accounts) {
  if (!USE_DATABASE) {
    fs.writeFileSync(ACCOUNTS_FILE, `${JSON.stringify(accounts, null, 2)}\n`, 'utf8');
    return;
  }

  await pool.query(
    'INSERT INTO accounts_store (id, data, updated_at) VALUES (1, $1, NOW()) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()',
    [JSON.stringify(accounts)]
  );
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const basename = path.basename(urlPath);

  if (basename === 'accounts.json' || basename === 'server.js' || basename === 'render.yaml') {
    sendJson(res, 404, { error: 'Fichier introuvable' });
    return;
  }

  const filePath = path.normalize(path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath));

  if (!filePath.startsWith(ROOT)) {
    sendJson(res, 403, { error: 'Accès refusé' });
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(err.code === 'ENOENT' ? 404 : 500);
      res.end(err.code === 'ENOENT' ? 'Fichier introuvable' : 'Erreur serveur');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const pathname = (req.url || '').split('?')[0];

  if (pathname === '/api/health' && req.method === 'GET') {
    sendJson(res, 200, { ok: true, storage: USE_DATABASE ? 'postgres' : 'file' });
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
    sendJson(res, 200, { country_code: code });
    return;
  }

  if (pathname === '/api/accounts' && req.method === 'GET') {
    try {
      const accounts = await loadAccounts();
      sendJson(res, 200, accounts);
    } catch (error) {
      sendJson(res, 500, { error: error.message || 'Erreur serveur' });
    }
    return;
  }

  if (pathname === '/api/accounts' && req.method === 'PUT') {
    try {
      const body = await readBody(req);
      const parsed = JSON.parse(body);
      if (!Array.isArray(parsed) || !parsed.length) {
        sendJson(res, 400, { error: 'Données invalides' });
        return;
      }
      await saveAccounts(parsed);
      sendJson(res, 200, { ok: true });
    } catch (error) {
      sendJson(res, 500, { error: error.message || 'Erreur serveur' });
    }
    return;
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    serveStatic(req, res);
    return;
  }

  sendJson(res, 405, { error: 'Méthode non autorisée' });
});

async function start() {
  try {
    await initDatabase();
  } catch (error) {
    console.error('Impossible d’initialiser la base de données :', error);
    process.exit(1);
  }

  server.listen(PORT, HOST, () => {
    console.log(`Ecorise Banque : http://${HOST}:${PORT}`);
    console.log(`Stockage : ${USE_DATABASE ? 'PostgreSQL (Render)' : 'accounts.json (local)'}`);
  });
}

start();
