const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'ecorisbanque.sqlite');
const SQL_FILE = path.join(DATA_DIR, 'ecorisbanque.sql');
const SEED_FILE = path.join(ROOT, 'accounts.json');

class AccountStoreError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

let db;

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
  if (!Array.isArray(accounts)) {
    throw new AccountStoreError('Données invalides');
  }

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
    if (!Array.isArray(account.movements)) {
      throw new AccountStoreError(`Mouvements invalides pour ${username}`);
    }

    const amounts = account.movements.map(amount => {
      const numeric = Number(amount);
      if (!Number.isFinite(numeric)) {
        throw new AccountStoreError(`Montant invalide pour ${owner}`);
      }
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

function readSeedAccounts() {
  const parsed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
  if (!Array.isArray(parsed) || !parsed.length) {
    throw new Error('accounts.json invalide');
  }
  return parsed;
}

function openDatabase() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  db = new DatabaseSync(DB_FILE);
  db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS accounts (
      username TEXT PRIMARY KEY COLLATE NOCASE,
      owner TEXT NOT NULL,
      pin TEXT NOT NULL,
      balance REAL NOT NULL,
      statement_balance REAL NOT NULL,
      document TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS movements (
      username TEXT NOT NULL COLLATE NOCASE,
      position INTEGER NOT NULL,
      amount REAL NOT NULL,
      label TEXT NOT NULL DEFAULT '',
      occurred_at TEXT NOT NULL DEFAULT '',
      PRIMARY KEY (username, position),
      FOREIGN KEY (username) REFERENCES accounts(username) ON DELETE CASCADE
    );
  `);
}

function isSeeded() {
  return Boolean(db.prepare(`SELECT 1 AS ok FROM meta WHERE key = 'seeded'`).get());
}

function canonicalAccount(account) {
  const movements = account.movements.map(amount => roundAmount(amount));
  const labels = Array.isArray(account.movementLabels) ? account.movementLabels : [];
  const dates = Array.isArray(account.movementDates) ? account.movementDates : [];
  const sum = movementSum(movements);

  return {
    ...account,
    username: String(account.username).trim(),
    owner: String(account.owner).trim(),
    pin: String(account.pin),
    movements,
    movementLabels: movements.map((_, index) => String(labels[index] ?? '')),
    movementDates: movements.map((_, index) => String(dates[index] ?? '')),
    balance: sum,
    statementBalance: sum,
  };
}

function loadAccounts() {
  const accountRows = db.prepare(`
    SELECT username, owner, pin, document
    FROM accounts
    ORDER BY rowid
  `).all();
  const movementRows = db.prepare(`
    SELECT username, position, amount, label, occurred_at
    FROM movements
    ORDER BY position
  `).all();

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
    document.movements[row.position] = row.amount;
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

function writeAccounts(accounts) {
  assertCoherent(accounts);
  const normalized = accounts.map(canonicalAccount);

  db.exec('BEGIN IMMEDIATE');
  try {
    db.exec('DELETE FROM movements');
    db.exec('DELETE FROM accounts');

    const insertAccount = db.prepare(`
      INSERT INTO accounts (username, owner, pin, balance, statement_balance, document, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    `);
    const insertMovement = db.prepare(`
      INSERT INTO movements (username, position, amount, label, occurred_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const account of normalized) {
      insertAccount.run(
        account.username,
        account.owner,
        account.pin,
        account.balance,
        account.statementBalance,
        JSON.stringify(account)
      );
      account.movements.forEach((amount, position) => {
        insertMovement.run(
          account.username,
          position,
          amount,
          account.movementLabels[position],
          account.movementDates[position]
        );
      });
    }

    const stored = loadAccounts();
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

    db.exec('COMMIT');
  } catch (error) {
    try {
      db.exec('ROLLBACK');
    } catch {
      /* transaction already closed */
    }
    throw error;
  }

  return loadAccounts();
}

function rebuildDatabaseFromSql() {
  const script = fs.readFileSync(SQL_FILE, 'utf8');
  const temporary = `${DB_FILE}.restoring`;
  fs.rmSync(temporary, { force: true });
  fs.rmSync(`${temporary}-wal`, { force: true });
  fs.rmSync(`${temporary}-shm`, { force: true });

  const created = new DatabaseSync(temporary);
  try {
    created.exec(script);
  } catch (error) {
    created.close();
    fs.rmSync(temporary, { force: true });
    fs.rmSync(`${temporary}-wal`, { force: true });
    fs.rmSync(`${temporary}-shm`, { force: true });
    throw error;
  }
  created.close();
  fs.renameSync(temporary, DB_FILE);
  console.log(`Base SQLite reconstruite depuis ${SQL_FILE}`);
}

function initStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  if (!fs.existsSync(DB_FILE) && fs.existsSync(SQL_FILE)) {
    rebuildDatabaseFromSql();
  }

  openDatabase();
  if (isSeeded()) return;

  const seed = readSeedAccounts();
  writeAccounts(seed);
  db.prepare(`INSERT INTO meta (key, value) VALUES ('seeded', ?)`).run(new Date().toISOString());
  console.log(`Base SQLite initialisée avec accounts.json (${DB_FILE})`);
}

module.exports = {
  DB_FILE,
  SQL_FILE,
  AccountStoreError,
  initStore,
  loadAccounts,
  writeAccounts,
};
