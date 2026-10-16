const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const SEED_FILE = path.join(__dirname, 'accounts.json');

class AccountStoreError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function roundAmount(value) {
  return Math.round(Number(value) * 100) / 100;
}

function movementSum(movements) {
  return roundAmount(movements.reduce((sum, amount) => sum + Number(amount), 0));
}

function hasAmount(value) {
  return value !== undefined && value !== null && value !== '';
}

function assertCoherent(accounts) {
  if (!Array.isArray(accounts)) throw new AccountStoreError('Données invalides');
  const seen = new Set();
  for (const account of accounts) {
    if (!account || typeof account !== 'object' || Array.isArray(account)) {
      throw new AccountStoreError('Compte invalide');
    }
    const username = String(account.username ?? '').trim();
    if (!username) throw new AccountStoreError('Identifiant de compte manquant');
    const key = username.toLowerCase();
    if (seen.has(key)) throw new AccountStoreError(`Compte en double : ${username}`);
    seen.add(key);
    const owner = String(account.owner ?? '').trim();
    if (!owner) throw new AccountStoreError(`Nom manquant pour ${username}`);
    if (account.pin === undefined || account.pin === null || String(account.pin) === '') {
      throw new AccountStoreError(`Accès manquant pour ${username}`);
    }
    if (!Array.isArray(account.movements)) throw new AccountStoreError(`Mouvements invalides pour ${username}`);
    const amounts = account.movements.map(amount => {
      const numeric = Number(amount);
      if (!Number.isFinite(numeric)) throw new AccountStoreError(`Montant invalide pour ${owner}`);
      return roundAmount(numeric);
    });
    const sum = movementSum(amounts);
    if (hasAmount(account.balance) && roundAmount(account.balance) !== sum) {
      throw new AccountStoreError(`Le solde de ${owner} ne correspond pas à la somme des mouvements`);
    }
    if (hasAmount(account.statementBalance) && roundAmount(account.statementBalance) !== sum) {
      throw new AccountStoreError(`Le solde du relevé de ${owner} ne correspond pas à la somme des mouvements`);
    }
  }
}

function canonicalAccount(account) {
  const movements = account.movements.map(amount => roundAmount(amount));
  const labels = Array.isArray(account.movementLabels) ? account.movementLabels : [];
  const dates = Array.isArray(account.movementDates) ? account.movementDates : [];
  return {
    ...account,
    username: String(account.username).trim(),
    owner: String(account.owner).trim(),
    pin: String(account.pin),
    movements,
    movementLabels: movements.map((_, index) => String(labels[index] ?? '')),
    movementDates: movements.map((_, index) => String(dates[index] ?? '')),
    balance: movementSum(movements),
    statementBalance: movementSum(movements),
  };
}

function readSeedAccounts() {
  const parsed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
  if (!Array.isArray(parsed) || !parsed.length) throw new Error('accounts.json invalide');
  return parsed;
}

function poolConfig(connectionString) {
  const config = { connectionString };
  const local = /@(localhost|127\.0\.0\.1)([:/]|$)/.test(connectionString);
  if (!local) config.ssl = { rejectUnauthorized: false };
  return config;
}

const pool = new Pool(poolConfig(process.env.DATABASE_URL));

async function query(client, text, params) {
  const result = await (client || pool).query(text, params);
  return result;
}

async function isSeeded(client) {
  const result = await query(client, `SELECT 1 AS ok FROM meta WHERE key = 'seeded'`);
  return result.rowCount > 0;
}

async function getRevision(client) {
  const result = await query(client, `SELECT value FROM meta WHERE key = 'revision'`);
  const value = Number(result.rows[0]?.value);
  return Number.isInteger(value) && value >= 0 ? value : 0;
}

async function loadAccounts(client) {
  const accountRows = (await query(
    client,
    `SELECT username, owner, pin, document FROM accounts ORDER BY id`
  )).rows;
  const movementRows = (await query(
    client,
    `SELECT username, position, amount, label, occurred_at FROM movements ORDER BY position`
  )).rows;
  const byUser = new Map();
  for (const row of accountRows) {
    const document = JSON.parse(row.document);
    document.username = row.username;
    document.owner = row.owner;
    document.pin = row.pin;
    document.movements = [];
    document.movementLabels = [];
    document.movementDates = [];
    byUser.set(String(row.username).toLowerCase(), document);
  }
  for (const row of movementRows) {
    const document = byUser.get(String(row.username).toLowerCase());
    if (!document) continue;
    document.movements[row.position] = Number(row.amount);
    document.movementLabels[row.position] = row.label || '';
    document.movementDates[row.position] = row.occurred_at || '';
  }
  const accounts = accountRows.map(row => byUser.get(String(row.username).toLowerCase()));
  for (const account of accounts) {
    const sum = movementSum(account.movements);
    account.balance = sum;
    account.statementBalance = sum;
  }
  return accounts;
}

async function writeAccounts(accounts, options = {}) {
  assertCoherent(accounts);
  const normalized = accounts.map(canonicalAccount);
  const client = await pool.connect();
  let nextRevision = 0;
  try {
    await client.query('BEGIN');
    const currentRevision = await getRevision(client);
    if (options.checkRevision) {
      const expected = Number(options.expectedRevision);
      if (!Number.isInteger(expected) || expected !== currentRevision) {
        const conflict = new AccountStoreError(
          'Ces données ont été modifiées depuis un autre navigateur. L’affichage a été mis à jour.',
          409
        );
        conflict.revision = currentRevision;
        conflict.accounts = await loadAccounts(client);
        await client.query('ROLLBACK');
        throw conflict;
      }
    }
    nextRevision = currentRevision + 1;
    await client.query('DELETE FROM movements');
    await client.query('DELETE FROM accounts');
    for (const account of normalized) {
      await client.query(
        `INSERT INTO accounts (username, owner, pin, balance, statement_balance, document, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          account.username,
          account.owner,
          account.pin,
          account.balance,
          account.statementBalance,
          JSON.stringify(account),
        ]
      );
      for (let position = 0; position < account.movements.length; position += 1) {
        await client.query(
          `INSERT INTO movements (username, position, amount, label, occurred_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            account.username,
            position,
            account.movements[position],
            account.movementLabels[position],
            account.movementDates[position],
          ]
        );
      }
    }
    const stored = await loadAccounts(client);
    assertCoherent(stored);
    if (stored.length !== normalized.length) {
      throw new AccountStoreError('Cohérence rompue lors de l’enregistrement');
    }
    for (let index = 0; index < stored.length; index += 1) {
      if (
        stored[index].username !== normalized[index].username ||
        stored[index].balance !== normalized[index].balance ||
        stored[index].movements.length !== normalized[index].movements.length
      ) {
        throw new AccountStoreError(`Cohérence rompue pour ${normalized[index].owner}`);
      }
    }
    await client.query(
      `INSERT INTO meta (key, value) VALUES ('revision', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [String(nextRevision)]
    );
    await client.query('COMMIT');
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      /* transaction already closed */
    }
    throw error;
  } finally {
    client.release();
  }
  return { accounts: await loadAccounts(), revision: nextRevision };
}

async function initStore() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS accounts (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      owner TEXT NOT NULL,
      pin TEXT NOT NULL,
      balance DOUBLE PRECISION NOT NULL,
      statement_balance DOUBLE PRECISION NOT NULL,
      document TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS movements (
      username TEXT NOT NULL REFERENCES accounts(username) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      label TEXT NOT NULL DEFAULT '',
      occurred_at TEXT NOT NULL DEFAULT '',
      PRIMARY KEY (username, position)
    );
  `);
  if (await isSeeded()) return;
  const seed = readSeedAccounts();
  await writeAccounts(seed);
  await pool.query(
    `INSERT INTO meta (key, value) VALUES ('seeded', $1) ON CONFLICT (key) DO NOTHING`,
    [new Date().toISOString()]
  );
  console.log('Base Postgres initialisée avec accounts.json');
}

module.exports = {
  STORAGE: 'postgres',
  DB_FILE: 'postgres',
  SQL_FILE: null,
  AccountStoreError,
  initStore,
  getRevision,
  loadAccounts,
  writeAccounts,
};
